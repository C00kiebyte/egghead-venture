import { Character, Enemy, GameState, Module, Term, Tile } from "./types";

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
