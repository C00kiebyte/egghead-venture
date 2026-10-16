import { ATTACK_EVERY, newGame } from "@/lib/engine";
import { ArtSet, GameState, Module } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import Sprite from "./sprite";
import Scene from "./scene";

interface Props {
  mod: Module;
  art: ArtSet;
  onExit: () => void;
}

// Animation timeline (ms). Keep in sync with --hit-at / --enemy-at in attack.css.
const HIT_AT = 260;
const ENEMY_AT = 950;
const ENEMY_AT_QUICK = 250;

export default function Game({ mod, art, onExit }: Props) {
  const [state, setState] = useState<GameState>(newGame(mod, art.enemies));
  const [muted, setMutedState] = useState(false);
  const [shownIdx, setShownIdx] = useState(0);
  const fightRef = useRef<HTMLDivElement>(null);

  const targetIdx = state.defeated && state.phase !== "won" ? state.enemyIdx - 1 : state.enemyIdx;
  const swapping = shownIdx !== state.enemyIdx;
  const enemyShownHp = swapping ? 0 : state.enemyHp;
  const fxOnEnemy = shownIdx === targetIdx && state.turn > 0;

  const attacked = state.event !== "none";
  const hit = state.event === "hit" && state.feedback.kind === "hit" && fxOnEnemy ? state.feedback : null;
  const enemyAt = attacked ? ENEMY_AT : ENEMY_AT_QUICK;

  const shownEnemy = state.enemies[shownIdx];
  const enemyDead = enemyShownHp === 0;
  const enemyActs = state.struck && !swapping;
  const enemyHpShown = useLagged(enemyShownHp, hit ? HIT_AT : 0);
  const enemyDefeatedUi = enemyHpShown === 0;

  const playerDead = state.phase === "lost";
  const playerDelayMs = state.struck ? enemyAt + HIT_AT : hit && hit.healed > 0 ? HIT_AT : 0;
  const playerHpShown = useLagged(state.playerHp, playerDelayMs);

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
              <div className="plaque">
                <h2>You</h2>
                <Meter value={playerHpShown} max={state.playerMaxHp} tone="good" label="Your health" />
              </div>
            </div>

            <div className="side">
              <div className="actor">
                <div className="enter" key={`en ${shownIdx}`}>
                  <div key={`em ${state.turn}`} className={`mover ${enemyActs ? "atk-e" : ""}`}>
                    <div className={`sprite enemy ${enemyDead ? "is-dead" : hit ? " is-hit" : ""}`} aria-hidden="true">
                      <Sprite art={shownEnemy.art} />
                    </div>
                  </div>
                </div>
                <div className="shadow" />
                {hit && (
                  <>
                    <span key={`d${state.turn}`} className="float float-dmg">
                      -{hit.damage}
                      {hit.weak && <small>Weakness!</small>}
                    </span>
                    <span key={`i${state.turn}`} className={`impact ${hit.weak ? "big" : ""}`} aria-hidden="true" />
                  </>
                )}
                {state.event === "miss" && fxOnEnemy && (
                  <span key={`m${state.turn}`} className="float float-miss">
                    Blocked!
                  </span>
                )}
              </div>
              <div className="plaque">
                <h2>{shownEnemy.name}</h2>
                <Meter value={enemyHpShown} max={shownEnemy.maxHp} tone="bad" label={`${shownEnemy.name} health`} />
                <p className="flag">Weak to {shownEnemy.weakness}</p>
                {enemyDefeatedUi ? (
                  <p className="strike">Defeated!</p>
                ) : (
                  <p className="strike" aria-label={`Strikes in ${state.charge} actions for ${shownEnemy.damage}`}>
                    {Array.from({ length: ATTACK_EVERY }).map((_, i) => (
                      <span key={i} className={`pip${i < ATTACK_EVERY - state.charge ? " on" : ""}`} aria-hidden="true">
                        ⚔️
                      </span>
                    ))}
                    <span>
                      Strikes in {state.charge} for {shownEnemy.damage}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </Scene>
      </div>
    </main>
  );
}

function Meter({ value, max, tone, label }: { value: number; max: number; tone: "good" | "bad"; label: string }) {
  return (
    <div className={`meter ${tone}`}>
      <span className="meter-icon" aria-hidden="true">
        {tone === "good" ? "❤️" : "💀"}
      </span>
      <div
        className="meter-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className="meter-fill" style={{ width: `${(value / max) * 100}%` }} />
        <span className="meter-text">
          {value} / {max}
        </span>
      </div>
    </div>
  );
}

function useLagged<T>(value: T, delayMs: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    if (delayMs <= 0) {
      setV(value);
      return;
    }
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}
