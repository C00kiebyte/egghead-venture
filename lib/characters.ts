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
      name: "Gluttonous Ogre",
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
      name: "Ghost of Envy",
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
      name: "Sea Warden",
      art: {
        kind: "image",
        src: "/sprites/sea-warden.png",
        width: 22,
        height: 25,
        frames: 3,
        fps: 5,
        scale: 1.2,
        flip: true,
      },
    },
    {
      name: "Bandit Brothers",
      art: {
        kind: "image",
        src: "/sprites/bandit-brothers.png",
        width: 12,
        height: 28,
        frames: 3,
        fps: 5,
        scale: 1.2,
        flip: true,
      },
    },
    {
      name: "Soul Guardian",
      art: {
        kind: "image",
        src: "/sprites/golem.png",
        width: 25,
        height: 26,
        frames: 3,
        fps: 5,
        scale: 1.2,
        flip: true,
      },
    },
  ],
};

export const ART_SETS: ArtSet[] = [EMOJI_SET, PIXEL_SET];
