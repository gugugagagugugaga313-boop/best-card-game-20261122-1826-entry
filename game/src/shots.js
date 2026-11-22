// Tideforge Duel — deterministic screenshot states.
// ?shot=title | play | win | loss builds a fixed table so the screenshots
// are real renders of the game's own code, with the same seed every run.
import { newGame, startDuel, playPlayerCard, endPlayerTurn } from './game.js';
import { buildDeck } from './cards.js';

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// A fixed, readable mid-game hand for the play screenshot.
function fixedPlayState() {
  const state = newGame(seededRandom(20261122));
  startDuel(state);
  // Hand-craft a showcase hand: two flames (surge pair), a wave, a leaf, a stone.
  const deck = buildDeck();
  const pick = (suit, power) => deck.find((c) => c.suit === suit && c.power === power);
  state.youHand = [
    pick('flame', 7), pick('flame', 5), pick('wave', 6), pick('leaf', 4), pick('stone', 8),
  ];
  state.you.ember = 7;
  state.you.life = 24; state.you.block = 4;
  state.foe.life = 19; state.foe.block = 2; state.foe.ember = 5;
  state.turn = 4;
  state.youPlayed = [pick('flame', 6)];
  state.foePlayed = [pick('wave', 5), pick('stone', 6)];
  state.log = [
    '<b>Turn 4.</b> You draw 2 cards and gain 3 ember.',
    'The Herald plays <b>Brine Crash</b> ● — <b>5 damage</b>, 2 blocked.',
    'You play <b>Wildfire Roar</b> ▲ — <b>6 damage</b>.',
    'The Herald raises <b>Granite Fist</b> ■ — <b>+6 shield</b>.',
  ];
  state.intent = { kind: 'balanced', text: '⚠ The Herald will strike for 9 and raise 4 shield — answer with a Surge!' };
  return state;
}

export function stateForShot(shot) {
  if (shot === 'play') return fixedPlayState();
  if (shot === 'win') {
    const state = fixedPlayState();
    state.phase = 'won';
    state.foe.life = 0;
    state.cardsPlayed = 14;
    state.surges = 3;
    return state;
  }
  if (shot === 'loss') {
    const state = fixedPlayState();
    state.phase = 'lost';
    state.you.life = 0;
    state.foe.life = 11;
    state.cardsPlayed = 12;
    state.surges = 2;
    return state;
  }
  return newGame(seededRandom(20261122)); // title
}

export { playPlayerCard, endPlayerTurn };
