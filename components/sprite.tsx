import { SpriteArt } from "@/lib/types";

export default function Sprite({ art }: { art: SpriteArt }) {
  const scale = art.scale ?? 1;

  if (art.kind === "emoji") {
    return (
      <span className="sprite-emoji" style={scale !== 1 ? { fontSize: `${scale}em` } : undefined}>
        {art.glyph}
        {art.accessory && <span className="sprite-accessory">{art.accessory}</span>}
      </span>
    );
  }

  return <></>;
}
