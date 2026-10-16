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
