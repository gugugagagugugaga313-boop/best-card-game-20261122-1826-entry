// Tideforge Duel — the rules engine: turns, ember, surges, damage, victory.
// Pure state transitions live here; rendering lives in render.js.

import { buildDeck, shuffleDeck, drawCards, suitOf } from './cards.js';
import { planHeraldIntent, chooseHeraldPlays } from './ai.js';

export const MAX_LIFE = 30;
export const MAX_EMBER = 10;
export const TURN_EMBER = 3;
export const SURGE_BONUS = 3;
export const HAND_SIZE = 5;

export function newGame(seedRandom) {
  const random = seedRandom || Math.random;
  const youDeck = shuffleDeck(buildDeck(), random);
  const foeDeck = shuffleDeck(buildDeck(), random);
  const state = {
    turn: 1,
    phase: 'title', // title | playing | won | lost
    you: { life: MAX_LIFE, block: 0, ember: TURN_EMBER },
    foe: { life: MAX_LIFE, block: 0, ember: TURN_EMBER },
    youDeck, foeDeck,
    youHand: [], foeHand: [],
    youPlayed: [], foePlayed: [],
    youPlayedSuits: [],
    log: [],
    surges: 0,
    cardsPlayed: 0,
    intent: planHeraldIntent({ foe: { life: MAX_LIFE }, you: { life: MAX_LIFE } }),
  };
  state.youHand = drawCards(state.youDeck, [], HAND_SIZE);
  state.foeHand = drawCards(state.foeDeck, [], HAND_SIZE);
  return state;
}

export function startDuel(state) {
  state.phase = 'playing';
  addLog(state, '<b>The duel begins.</b> The Herald bares her storm-cards.');
  return state;
}

// Damage first eats block, then life. Returns the life damage dealt.
export function dealDamage(state, target, amount) {
  const fighter = target === 'you' ? state.you : state.foe;
  const blocked = Math.min(fighter.block, amount);
  fighter.block -= blocked;
  const lifeDamage = amount - blocked;
  fighter.life = Math.max(0, fighter.life - lifeDamage);
  return { blocked, lifeDamage };
}

export function healFighter(state, target, amount) {
  const fighter = target === 'you' ? state.you : state.foe;
  fighter.life = Math.min(MAX_LIFE, fighter.life + amount);
}

// Apply one card's effect. Returns a human-readable description.
export function resolveCardPlay(state, side, card) {
  const actor = side === 'you' ? state.you : state.foe;
  const target = side === 'you' ? 'foe' : 'you';
  const playedSuits = side === 'you' ? state.youPlayedSuits : state.foePlayedSuits || [];
  let power = card.power;
  let surged = false;
  if (playedSuits.includes(card.suit)) {
    power += SURGE_BONUS;
    surged = true;
    state.surges += 1;
  }
  playedSuits.push(card.suit);
  if (side === 'you') state.youPlayedSuits = playedSuits;
  else state.foePlayedSuits = playedSuits;
  actor.ember -= card.cost;
  state.cardsPlayed += 1;
  const suit = suitOf(card);
  const who = side === 'you' ? 'You' : 'The Herald';
  if (card.suit === 'stone') {
    actor.block += power;
    return `${who} play <b>${card.name}</b> ${suit.glyph} — <b>+${power} shield</b>${surged ? ' (SURGE!)' : ''}.`;
  }
  const { blocked, lifeDamage } = dealDamage(state, target, power);
  let text = `${who} play <b>${card.name}</b> ${suit.glyph} — <b>${power} damage</b>${surged ? ' (SURGE!)' : ''}`;
  if (blocked > 0) text += `, ${blocked} blocked`;
  text += '.';
  if (card.suit === 'wave') {
    const heal = Math.floor(power / 2);
    healFighter(state, side, heal);
    text += ` ${who} heal ${heal}.`;
  }
  if (card.suit === 'leaf' && side === 'you') {
    state.youHand = drawCards(state.youDeck, state.youHand, 1);
    text += ' You draw a card.';
  }
  if (card.suit === 'leaf' && side === 'foe') {
    state.foeHand = drawCards(state.foeDeck, state.foeHand, 1);
  }
  return text;
}

export function canPlayCard(state, card) {
  return state.phase === 'playing' && card.cost <= state.you.ember;
}

// The player plays one card from hand (index). Returns false if illegal.
export function playPlayerCard(state, handIndex) {
  const card = state.youHand[handIndex];
  if (!card || !canPlayCard(state, card)) return false;
  state.youHand.splice(handIndex, 1);
  state.youPlayed.push(card);
  const text = resolveCardPlay(state, 'you', card);
  addLog(state, text);
  checkEnd(state);
  return true;
}

// End the player's turn: the Herald plays, then a new turn starts.
export function endPlayerTurn(state) {
  if (state.phase !== 'playing') return state;
  state.foePlayed = [];
  const { plays } = chooseHeraldPlays(state);
  for (const card of plays) {
    state.foeHand.splice(state.foeHand.indexOf(card), 1);
    state.foePlayed.push(card);
    const text = resolveCardPlay(state, 'foe', card);
    addLog(state, text);
    if (checkEnd(state)) return state;
  }
  if (plays.length === 0) addLog(state, 'The Herald holds her cards, watching.');
  startNewTurn(state);
  return state;
}

function startNewTurn(state) {
  state.turn += 1;
  state.youPlayed = [];
  state.youPlayedSuits = [];
  state.foePlayedSuits = [];
  state.you.ember = Math.min(MAX_EMBER, state.you.ember + TURN_EMBER);
  state.foe.ember = Math.min(MAX_EMBER, state.foe.ember + TURN_EMBER);
  state.youHand = drawCards(state.youDeck, state.youHand, 2);
  state.foeHand = drawCards(state.foeDeck, state.foeHand, 2);
  state.intent = planHeraldIntent(state);
  addLog(state, `<b>Turn ${state.turn}.</b> You draw 2 cards and gain ${TURN_EMBER} ember.`);
}

export function checkEnd(state) {
  if (state.foe.life <= 0) { state.phase = 'won'; return true; }
  if (state.you.life <= 0) { state.phase = 'lost'; return true; }
  return false;
}

export function addLog(state, text) {
  state.log.unshift(text);
  if (state.log.length > 30) state.log.length = 30;
}
