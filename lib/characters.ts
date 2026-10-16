import { ArtSet } from "./types";

const EMOJI_SET: ArtSet = {
  id: "emoji",
  label: "Emoji",
  hero: { name: "Egghead", art: { kind: "emoji", glyph: "🐣" } },
  enemies: [
    { name: "Wacky the Ghost", art: { kind: "emoji", glyph: "👻" } },
    { name: "Stressed Zombie", art: { kind: "emoji", glyph: "🧟" } },
    { name: "Ogre Under the Influence", art: { kind: "emoji", glyph: "🧌" } },
    { name: "Vampire with Hepatitis", art: { kind: "emoji", glyph: "🧛" } },
    { name: "Brr Brr Patapim", art: { kind: "emoji", glyph: "🫈" } },
    { name: "Glock 9", art: { kind: "emoji", glyph: "🧜" } },
  ],
};

const PIXEL_SET: ArtSet = {
  id: "pixel",
  label: "Pixel art",
  hero: {
    name: "Egghead",
    art: { kind: "image", src: "/sprites/hero.png", width: 10, height: 24, frames: 3, fps: 5, scale: 1.2 },
  },
  enemies: [
    {
      name: "Ogre",
      art: {
        kind: "image",
        src: "/sprites/ogre.png",
        width: 25,
        height: 29,
        frames: 3,
        fps: 5,
        scale: 1.2,
        flip: true,
      },
    },
    {
      name: "Ghost",
      art: {
        kind: "image",
        src: "/sprites/ghost.png",
        width: 25,
        height: 29,
        frames: 3,
        fps: 5,
        scale: 1.2,
        flip: true,
      },
    },
    {
      name: "Slime",
      art: { kind: "image", src: "/sprites/slime.png", width: 24, height: 24, frames: 2, fps: 3 },
    },
    {
      name: "Bettle",
      art: { kind: "image", src: "/sprites/beetle.png", width: 24, height: 24, frames: 2, fps: 4 },
    },
  ],
};

export const ART_SETS: ArtSet[] = [EMOJI_SET, PIXEL_SET];
