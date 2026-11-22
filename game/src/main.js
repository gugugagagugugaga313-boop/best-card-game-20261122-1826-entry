// Tideforge Duel — boot and input wiring.
// Keyboard: 1-5 plays a hand card, Enter ends the turn, R restarts.

import { newGame, startDuel, playPlayerCard, endPlayerTurn, checkEnd } from './game.js';
import { renderAll, flashSurge } from './render.js';
import { stateForShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

let state = shot ? stateForShot(shot) : newGame();

function refresh() {
  renderAll(state, { onPlayCard: handlePlayCard });
}

function handlePlayCard(card) {
  if (state.phase !== 'playing') return;
  const index = state.youHand.indexOf(card);
  if (index < 0) return;
  const surgesBefore = state.surges;
  if (playPlayerCard(state, index)) {
    if (state.surges > surgesBefore) flashSurge();
    refresh();
  }
}

function handleEndTurn() {
  if (state.phase !== 'playing') return;
  endPlayerTurn(state);
  refresh();
}

function restart() {
  state = newGame();
  refresh();
}

document.getElementById('startBtn').addEventListener('click', () => {
  startDuel(state);
  refresh();
});
document.getElementById('againBtn').addEventListener('click', restart);
document.getElementById('endTurnBtn').addEventListener('click', handleEndTurn);
document.getElementById('helpBtn').addEventListener('click', () => {
  document.getElementById('helpScreen').classList.remove('hidden');
});
document.getElementById('closeHelpBtn').addEventListener('click', () => {
  document.getElementById('helpScreen').classList.add('hidden');
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (state.phase === 'title') { startDuel(state); refresh(); }
    else handleEndTurn();
  } else if (event.key >= '1' && event.key <= '5') {
    const card = state.youHand[Number(event.key) - 1];
    if (card) handlePlayCard(card);
  } else if (event.key === 'r' || event.key === 'R') {
    restart();
  }
});

refresh();
