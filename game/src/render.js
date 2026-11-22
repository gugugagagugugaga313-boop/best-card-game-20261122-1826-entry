// Tideforge Duel — DOM rendering: cards, fighters, log, overlays.
// Cards slide in on deal and lift on hover (see styles.css animations).

import { suitOf } from './cards.js';

export function cardElement(card, options = {}) {
  const suit = suitOf(card);
  const el = document.createElement('div');
  el.className = `card ${card.suit}`;
  el.dataset.cardId = String(card.id);
  if (options.surged) el.classList.add('card-surged');
  if (options.playable) el.classList.add('playable');
  if (options.unaffordable) el.classList.add('unaffordable');
  el.innerHTML =
    `<span class="card-cost">${card.cost}</span>` +
    `<span class="card-suit">${suit.glyph}</span>` +
    `<div class="card-name">${card.name}</div>` +
    `<div class="card-power">${card.power}<small> DMG</small></div>` +
    `<div class="card-effect">${suit.label} · ${suit.effect}</div>`;
  if (options.onClick) el.addEventListener('click', () => options.onClick(card));
  return el;
}

export function cardBackElement() {
  const el = document.createElement('div');
  el.className = 'card card-back';
  el.innerHTML = '<div class="card-face">🌊</div>';
  return el;
}

function fillHand(container, cards, renderCard) {
  container.replaceChildren();
  for (const card of cards) container.appendChild(renderCard(card));
}

export function renderAll(state, handlers) {
  document.getElementById('turnLabel').textContent = `Turn ${state.turn}`;
  const you = state.you, foe = state.foe;

  document.getElementById('youLifeFill').style.width = `${(you.life / 30) * 100}%`;
  document.getElementById('foeLifeFill').style.width = `${(foe.life / 30) * 100}%`;
  document.getElementById('youLifeText').textContent = `${you.life} / 30`;
  document.getElementById('foeLifeText').textContent = `${foe.life} / 30`;
  document.getElementById('youBlock').textContent = `🛡 ${you.block}`;
  document.getElementById('foeBlock').textContent = `🛡 ${foe.block}`;
  document.getElementById('youEmber').textContent = String(you.ember);
  document.getElementById('foeEmber').textContent = String(foe.ember);
  document.getElementById('foeIntent').textContent = state.intent.text;
  document.getElementById('deckCount').textContent = String(state.youDeck.length);

  fillHand(document.getElementById('youHand'), state.youHand, (card) =>
    cardElement(card, {
      playable: card.cost <= you.ember && state.phase === 'playing',
      unaffordable: card.cost > you.ember,
      onClick: () => handlers.onPlayCard(card),
    }));
  fillHand(document.getElementById('foeHand'), state.foeHand, () => cardBackElement());
  fillHand(document.getElementById('playerPlayed'), state.youPlayed, (card) => cardElement(card, {}));
  fillHand(document.getElementById('foePlayed'), state.foePlayed, (card) => cardElement(card, {}));

  const log = document.getElementById('log');
  log.innerHTML = state.log.map((line) => `<div>${line}</div>`).join('') ||
    '<div>The tide is calm… for now.</div>';

  document.getElementById('titleScreen').classList.toggle('hidden', state.phase !== 'title');
  const end = document.getElementById('endScreen');
  if (state.phase === 'won' || state.phase === 'lost') {
    const won = state.phase === 'won';
    document.getElementById('endKicker').textContent = won ? '★ VICTORY ★' : '☠ DEFEAT ☠';
    document.getElementById('endKicker').classList.toggle('lost', !won);
    document.getElementById('endTitle').textContent = won ? 'THE STORM BREAKS' : 'THE LIGHT GOES OUT';
    document.getElementById('endText').textContent = won
      ? 'The Herald bows to the keeper of the flame. The lighthouse burns bright again — you won the duel!'
      : 'The Herald’s storm swallows the lighthouse flame… this time. Shuffle the deck and duel again!';
    document.getElementById('endStats').innerHTML =
      `<span>Turns <b>${state.turn}</b></span><span>Cards played <b>${state.cardsPlayed}</b></span>` +
      `<span>Surges <b>${state.surges}</b></span><span>Your life <b>${you.life}</b></span>`;
    end.classList.remove('hidden');
  } else {
    end.classList.add('hidden');
  }
}

export function flashSurge() {
  const banner = document.getElementById('comboBanner');
  banner.classList.remove('hidden');
  banner.textContent = '⚡ SURGE! +3 ⚡';
  window.setTimeout(() => banner.classList.add('hidden'), 1400);
}
