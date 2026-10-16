import { Character, Enemy, Feedback, GameState, Module, Term, Tile } from "./types";

export const BOARD_COLS = 4;
export const ATTACK_EVERY = 2;
const WEAK_TILES_ON_BOARD = 4;
const PLAYER_MAX_HP = 60;

let uid = 0;
const mkTile = (term: Term): Tile => ({ id: `t${++uid}`, term });

export function boardSize(mod: Module): number {
  return Math.min(16, Math.floor(mod.terms.length / BOARD_COLS) * BOARD_COLS);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function fillBoard(mod: Module, slots: (Tile | null)[], weakness: string): Tile[] {
  const out = [...slots];
  const onBoard = new Set(out.filter((t): t is Tile => !!t).map((t) => t.term.word));
  const pool = shuffle(mod.terms.filter((t) => !onBoard.has(t.word)));
  const isWeak = (t: Term) => t.topics.includes(weakness);
  const need = Math.min(WEAK_TILES_ON_BOARD, mod.terms.filter(isWeak).length);
  const weakCount = () => out.filter((t) => t && isWeak(t.term)).length;

  const take = (preferWeak: boolean): Term => {
    if (preferWeak) {
      const i = pool.findIndex(isWeak);
      if (i >= 0) return pool.splice(i, 1)[0];
    }
    return pool.shift() as Term;
  };

  const empties = shuffle(out.map((t, i) => (t ? -1 : i)).filter((i) => i >= 0));
  for (const i of empties) out[i] = mkTile(take(weakCount() < need));

  while (weakCount() < need) {
    const wi = pool.findIndex(isWeak);
    const swap = out.findIndex((t) => t && !isWeak(t.term));
    if (wi < 0 || swap < 0) break;
    out[swap] = mkTile(pool.splice(wi, 1)[0]);
  }
  return out as Tile[];
}

export function newGame(mod: Module, roster: Character[]): GameState {
  const order = shuffle(roster);
  const enemies: Enemy[] = shuffle(mod.topics)
    .slice(0, 5)
    .map((topic, i) => ({
      name: order[i % order.length].name,
      art: order[i % order.length].art,
      weakness: topic,
      maxHp: 45 + i * 18,
      damage: 7 + i * 2,
    }));

  return {
    mod,
    enemies,
    enemyIdx: 0,
    enemyHp: enemies[0].maxHp,
    charge: ATTACK_EVERY,
    playerHp: PLAYER_MAX_HP,
    playerMaxHp: PLAYER_MAX_HP,
    board: fillBoard(mod, Array(boardSize(mod)).fill(null), enemies[0].weakness),
    selected: [],
    phase: "play",
    feedback: {
      kind: "info",
      text: `Chain terms from the same concept. ${enemies[0].name} is weak to ${enemies[0].weakness}. A wrong chain or a shuffle uses one action.`,
    },
    notice: "",
    learned: [],
    struggled: [],
    turn: 0,
    event: "none",
    struck: false,
    defeated: false,
  };
}

export function submitChain(s: GameState): GameState {
  if (s.phase !== "play") return s;
  const tiles = s.selected.map((id) => s.board.find((t) => t.id === id)).filter((t): t is Tile => !!t);
  if (tiles.length < 2) {
    return { ...s, feedback: { kind: "info", text: "Select at least two terms, then attack." } };
  }

  const enemy = s.enemies[s.enemyIdx];
  const base: GameState = { ...s, turn: s.turn + 1, notice: "", struck: false, defeated: false, selected: [] };
  const shared = sharedTopics(tiles);

  if (shared.length === 0) {
    const feedback: Feedback = {
      kind: "miss",
      rows: tiles.map((t) => ({ word: t.term.word, topics: t.term.topics })),
    };
    const struggled = [...new Set([...s.struggled, ...tiles.map((t) => t.term.word)])];
    return endAction({ ...base, feedback, struggled, event: "miss" });
  }

  const weak = shared.includes(enemy.weakness);
  const topic = weak ? enemy.weakness : shared[0];
  const damage = calcDamage(tiles, weak);
  const healed = tiles.length >= 4 ? Math.min(6, s.playerMaxHp - s.playerHp) : 0;
  const enemyHp = Math.max(0, s.enemyHp - damage);
  const learned = [...new Set([...s.learned, ...tiles.map((t) => t.term.word)])];
  const usedIds = new Set(tiles.map((t) => t.id));
  const slots = s.board.map((t) => (usedIds.has(t.id) ? null : t));

  const afterHit: GameState = {
    ...base,
    enemyHp,
    playerHp: s.playerHp + healed,
    learned,
    event: "hit",
    feedback: { kind: "hit", topic, terms: tiles.map((t) => t.term), damage, weak, healed },
  };

  if (enemyHp > 0) {
    return endAction({ ...afterHit, board: fillBoard(s.mod, slots, enemy.weakness) });
  }

  // Enemy defeated.
  if (s.enemyIdx === s.enemies.length - 1) {
    return {
      ...afterHit,
      defeated: true,
      board: fillBoard(s.mod, slots, enemy.weakness),
      phase: "won",
      notice: `${enemy.name} is defeated.`,
    };
  }
  const next = s.enemies[s.enemyIdx + 1];
  return {
    ...afterHit,
    defeated: true,
    enemyIdx: s.enemyIdx + 1,
    enemyHp: next.maxHp,
    charge: ATTACK_EVERY,
    board: fillBoard(s.mod, slots, next.weakness),
    notice: `${enemy.name} is defeated. ${next.name} appears and is weak to ${next.weakness}.`,
  };
}

function endAction(s: GameState): GameState {
  const enemy = s.enemies[s.enemyIdx];
  const charge = s.charge - 1;
  if (charge > 0) return { ...s, charge };
  const playerHp = Math.max(0, s.playerHp - enemy.damage);
  return {
    ...s,
    charge: ATTACK_EVERY,
    playerHp,
    struck: true,
    phase: playerHp === 0 ? "lost" : s.phase,
    notice: `${enemy.name} strikes for ${enemy.damage}.`,
  };
}

export function toggleTile(s: GameState, id: string): GameState {
  if (s.phase !== "play") return s;
  const selected = s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id];
  return { ...s, selected };
}

export function sharedTopics(tiles: Tile[]): string[] {
  if (tiles.length === 0) return [];
  return tiles.slice(1).reduce((acc, t) => acc.filter((tp) => t.term.topics.includes(tp)), tiles[0].term.topics);
}

export function calcDamage(tiles: Tile[], weak: boolean): number {
  const dmg = tiles.reduce((n, t) => n + tileValue(t.term.word), 0);
  const base = dmg * 3 + tiles.length * 2;
  const chain = tiles.length >= 5 ? 1.5 : tiles.length >= 4 ? 1.25 : 1;
  return Math.round(base * chain * (weak ? 2 : 1));
}

export function tileValue(word: string): number {
  const len = word.replace(/\s/g, "").length;
  return len <= 4 ? 1 : len <= 7 ? 2 : len <= 10 ? 3 : 4;
}
