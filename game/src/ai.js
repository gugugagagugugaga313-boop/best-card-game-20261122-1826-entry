// Tideforge Duel — the Storm Herald's brain.
// The opponent is readable: she announces her intent, then plays to it.
// She strikes when ahead, shields when hurt, and chases her own surges.

import { SUITS } from './cards.js';

// Decide what the Herald will do next turn, from the state she can see.
export function planHeraldIntent(state) {
  const { foe, you } = state;
  if (foe.life <= 10) return { kind: 'desperate', text: '⚠ The Herald will throw EVERYTHING at you — big strike coming!' };
  if (you.life <= 8) return { kind: 'finishing', text: '⚠ The Herald smells blood — she will finish you if you let her.' };
  if (foe.life < you.life - 6) return { kind: 'defensive', text: '🛡 The Herald will raise stone shields and weather your storm.' };
  return { kind: 'balanced', text: '🌊 The Herald will strike with flame and wave — brace for damage.' };
}

// Choose which cards the Herald plays this turn.
// Heuristic: spend ember greedily on the biggest affordable damage,
// prefer Stone when low on life, and complete a same-suit pair for Surge.
export function chooseHeraldPlays(state) {
  const plays = [];
  let ember = state.foe.ember;
  const hand = state.foeHand.slice();
  const playedSuits = [];
  const scoreCard = (card) => {
    let score = card.power * 2 - card.cost;
    if (card.suit === 'stone' && state.foe.life <= 12) score += 6;
    if (card.suit === 'wave' && state.foe.life <= 16) score += 3;
    if (playedSuits.includes(card.suit)) score += 5; // chase the Surge
    if (card.suit === 'leaf') score += 1; // draw keeps her hand full
    return score;
  };
  while (true) {
    const affordable = hand.filter((c) => c.cost <= ember);
    if (affordable.length === 0) break;
    affordable.sort((a, b) => scoreCard(b) - scoreCard(a));
    const pick = affordable[0];
    plays.push(pick);
    ember -= pick.cost;
    playedSuits.push(pick.suit);
    hand.splice(hand.indexOf(pick), 1);
    if (plays.length >= 3) break;
  }
  return { plays, remainingEmber: ember };
}

// Estimate the damage the Herald's planned plays would deal, for the intent line.
export function estimateHeraldDamage(plays) {
  let total = 0;
  const suitsSeen = [];
  for (const card of plays) {
    let power = card.power;
    if (suitsSeen.includes(card.suit)) power += 3; // Surge
    suitsSeen.push(card.suit);
    if (card.suit !== 'stone') total += power;
  }
  return total;
}

export { SUITS };
