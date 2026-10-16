import { newGame } from "@/lib/engine";
import { ArtSet, GameState, Module } from "@/lib/types";
import { useState } from "react";
import Sprite from "./sprite";

interface Props {
  mod: Module;
  art: ArtSet;
  onExit: () => void;
}

export default function Game({ mod, art, onExit }: Props) {
  const [state, setState] = useState<GameState>(newGame(mod, art.enemies));
  const [muted, setMutedState] = useState(false);

  return (
    <main className="game">
      <div className="frame">
        <header className="hud wood">
          <h1 className="hud-title">{mod.title}</h1>
          <ol className="path">
            {state.enemies.map((e, i) => (
              <li key={i} className={`step ${i < state.enemyIdx ? "done" : ""}${i === state.enemyIdx ? "now" : ""}`}>
                <span aria-hidden="true">{i < state.enemyIdx ? "✔" : <Sprite art={e.art} />}</span>
              </li>
            ))}
          </ol>
          <span className="hud-count">
            {state.learned.length}/{mod.terms.length} terms used
          </span>
          <button
            type="button"
            className="round"
            aria-pressed={muted}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            onClick={() => setMutedState((m) => !m)}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button type="button" className="btn small" onClick={onExit} aria-label="Change module">
            <span className="long">Change module</span>
            <span className="short">Modules</span>
          </button>
        </header>
      </div>
    </main>
  );
}
