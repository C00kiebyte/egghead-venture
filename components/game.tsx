import { newGame } from "@/lib/engine";
import { ArtSet, GameState, Module } from "@/lib/types";
import { useRef, useState } from "react";
import Sprite from "./sprite";
import Scene from "./scene";

interface Props {
  mod: Module;
  art: ArtSet;
  onExit: () => void;
}

export default function Game({ mod, art, onExit }: Props) {
  const [state, setState] = useState<GameState>(newGame(mod, art.enemies));
  const [muted, setMutedState] = useState(false);
  const [shownIdx, setShownIdx] = useState(0);
  const fightRef = useRef<HTMLDivElement>(null);

  const attacked = state.event !== "none";
  const targetIdx = state.defeated && state.phase !== "won" ? state.enemyIdx - 1 : state.enemyIdx;
  const fxOnEnemy = shownIdx === targetIdx && state.turn > 0;
  const hit = state.event === "hit" && state.feedback.kind === "hit" && fxOnEnemy ? state.feedback : null;
  const playerDead = state.phase === "lost";

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
        <Scene>
          <div className={`fight ${attacked ? "" : "quick"}`} ref={fightRef}>
            {hit?.weak && <span key={`f${state.turn}`} className="flash" aria-hidden="true" />}
            {state.struck && <span key={`fh${state.turn}`} className="flash hurt" aria-hidden="true" />}

            <div className="side">
              <div className="actor">
                <div
                  key={`pm${state.turn}`}
                  className={`mover ${state.event === "hit" ? "atk" : state.event === "miss" ? "atk-block" : ""}`}
                >
                  <div
                    className={`sprite hero ${playerDead ? "is-dead" : state.struck ? "is-struck" : ""}`}
                    aria-hidden="true"
                  >
                    <Sprite art={art.hero.art} />
                  </div>
                </div>
                <div className="shadow" />
                {state.struck && (
                  <>
                    <span key={`h${state.turn}`} className="float float-hurt">
                      -{state.enemies[state.enemyIdx].damage}
                    </span>
                    <span key={`ih${state.turn}`} className="impact hurt" aria-hidden="true" />
                  </>
                )}
                {hit && hit.healed > 0 && (
                  <span key={`g${state.turn}`} className="float float-heal">
                    +{hit.healed}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Scene>
      </div>
    </main>
  );
}
