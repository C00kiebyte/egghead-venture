export interface Term {
  word: string;
  definition: string;
  topics: string[];
}

export interface Module {
  title: string;
  terms: Term[];
  topics: string[];
}

export interface Tile {
  id: string;
  term: Term;
}

export interface Character {
  name: string;
  art: SpriteArt;
}

export interface ArtSet {
  id: string;
  label: string;
  hero: Character;
  enemies: Character[];
}

export interface Enemy {
  name: string;
  art: SpriteArt;
  weakness: string;
  maxHp: number;
  damage: number;
}

export interface GameState {
  mod: Module;
  enemies: Enemy[];
  enemyIdx: number;
  enemyHp: number;
  charge: number;
  playerHp: number;
  playerMaxHp: number;
  board: Tile[];
  selected: string[];
  phase: "play" | "won" | "lost";
  feedback: Feedback;
  notice: string;
  learned: string[];
  struggled: string[];
  turn: number;
  event: "none" | "hit" | "miss";
  struck: boolean;
  defeated: boolean;
}

export type Feedback =
  | { kind: "hit"; topic: string; terms: Term[]; damage: number; weak: boolean; healed: number }
  | { kind: "miss"; rows: { word: string; topics: string[] }[] }
  | { kind: "info"; text: string };

export type SpriteArt =
  | {
      kind: "emoji";
      glyph: string;
      accessory?: string;
      scale?: number;
    }
  | {
      kind: "image";
      src: string;
      width: number;
      height: number;
      frames: number;
      fps: number;
      scale?: number;
      flip?: boolean;
    };
