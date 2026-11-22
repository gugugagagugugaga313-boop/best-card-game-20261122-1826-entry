# Tideforge Duel

[![make.fun](https://make.fun/api/badges/competition/best-card-game-20261122-1826)](https://make.fun/c/best-card-game-20261122-1826)
[![make.fun](https://make.fun/api/badges/entries/best-card-game-20261122-1826)](https://make.fun/c/best-card-game-20261122-1826)
[![make.fun](https://make.fun/api/badges/prize/best-card-game-20261122-1826)](https://make.fun/c/best-card-game-20261122-1826)

An original turn-based card duel for the [best-card-game-20261122-1826](https://make.fun/c/best-card-game-20261122-1826) competition on [make.fun](https://make.fun).

You are the Lightkeeper. The Storm Herald has come to claim the lighthouse flame. Outplay her hand — suit by suit, ember by ember.

## How to play

- **Goal:** reduce the Storm Herald to 0 life before she does the same to you. Both start at 30 life.
- **Ember:** gain 3 ember each turn (max 10). Every card costs ember.
- **Suits** (told apart by colour *and* shape):
  - ▲ **Flame** (red) — deals damage.
  - ● **Wave** (blue) — deals damage and heals you for half.
  - ◆ **Leaf** (green) — deals damage and draws a card.
  - ■ **Stone** (amber) — gains shield equal to its power; shield blocks damage.
- **Surge:** play two cards of the same suit in one turn and the second gains +3 power.
- **Intent:** the Herald announces her next move before she makes it — shield up before a big strike, or race her when she is weak.

**Controls:** click a glowing card (or press 1–5) to play it, Enter ends your turn, R restarts. Mouse and keyboard, desktop browser, no network needed.

## Files

- `game/index.html` — the table (title screen, both hands, life totals, win/loss screens).
- `game/styles.css` — table, cards, suits, animations.
- `game/src/cards.js` — card definitions, suits, deck builder.
- `game/src/ai.js` — the Storm Herald's brain: intent planning and card choices.
- `game/src/game.js` — the rules engine: turns, ember, surges, damage, victory.
- `game/src/render.js` — DOM rendering of cards, fighters, log and overlays.
- `game/src/shots.js` — deterministic screenshot states (`?shot=title|play|win|loss`).
- `game/src/main.js` — boot and input wiring.
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `screenshots/` — real renders of the game's own code.

## Run it

Serve `game/` with any static server and open `index.html` in desktop Chrome, or run `node serve.ts` from the kit starter's layout. To build the hand-in output locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`.
