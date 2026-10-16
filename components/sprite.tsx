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

  const frames = art.frames ?? 1;
  const style = {
    "--frames": frames,
    "--ratio": art.width / art.height,
    "--fps": art.fps ?? 6,
    fontSize: `${scale}em`,
    backgroundImage: `url(${art.src})`,
  } as React.CSSProperties;

  return (
    <span
      className={`sprite-img ${frames > 1 ? "animated" : ""} ${art.flip ? "flip" : ""}`}
      style={style}
      aria-hidden="true"
    />
  );
}
