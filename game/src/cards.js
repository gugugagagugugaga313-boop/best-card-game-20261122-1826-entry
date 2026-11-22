// Tideforge Duel — card definitions, suits, and the deck builder.
// Suits are told apart by colour AND shape: Flame ▲ red, Wave ● blue,
// Leaf ◆ green, Stone ■ amber. Every card has a cost (ember) and a power.

export const SUITS = {
  flame: { key: 'flame', glyph: '▲', label: 'Flame', verb: 'Strike', effect: 'Deals power damage.' },
  wave: { key: 'wave', glyph: '●', label: 'Wave', verb: 'Surge', effect: 'Damage, heals you half.' },
  leaf: { key: 'leaf', glyph: '◆', label: 'Leaf', verb: 'Bloom', effect: 'Damage, draws a card.' },
  stone: { key: 'stone', glyph: '■', label: 'Stone', verb: 'Bulwark', effect: 'Shield equal to power.' },
};

const CARD_NAMES = {
  flame: ['Ember Spark', 'Bonfire Lash', 'Wildfire Roar', 'Cinder Fang', 'Flare Burst'],
  wave: ['Tide Slap', 'Brine Crash', 'Undertow Pull', 'Foam Blade', 'Deep Current'],
  leaf: ['Thorn Vine', 'Seed Shot', 'Canopy Fall', 'Root Snare', 'Petal Storm'],
  stone: ['Pebble Wall', 'Granite Fist', 'Cliff Guard', 'Boulder Roll', 'Quartz Dome'],
};

// A 32-card deck: 8 of each suit, costs 1-4, power scales with cost.
export function buildDeck() {
  const deck = [];
  let id = 0;
  for (const suitKey of Object.keys(SUITS)) {
    const names = CARD_NAMES[suitKey];
    const specs = [
      { cost: 1, power: 2 }, { cost: 1, power: 3 },
      { cost: 2, power: 4 }, { cost: 2, power: 5 },
      { cost: 3, power: 6 }, { cost: 3, power: 7 },
      { cost: 4, power: 8 }, { cost: 4, power: 9 },
    ];
    specs.forEach((spec, i) => {
      deck.push({
        id: id++,
        name: names[i % names.length],
        suit: suitKey,
        cost: spec.cost,
        power: spec.power,
      });
    });
  }
  return deck;
}

export function shuffleDeck(deck, random) {
  const shuffled = deck.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(deck, hand, count) {
  const drawn = [];
  for (let i = 0; i < count && deck.length > 0; i++) drawn.push(deck.shift());
  return hand.concat(drawn);
}

export function suitOf(card) { return SUITS[card.suit]; }
