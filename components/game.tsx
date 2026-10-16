import { ATTACK_EVERY, calcDamage, newGame, sharedTopics, submitChain, tileValue, toggleTile } from "@/lib/engine";
import { ArtSet, GameState, Module, Tile } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import Sprite from "./sprite";
import Scene from "./scene";
import { sfx } from "@/lib/sfx";

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
  const [resultReady, setResultReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const fightRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const actRef = useRef<(fn: (p: GameState) => GameState) => void>(() => {});

  const targetIdx = state.defeated && state.phase !== "won" ? state.enemyIdx - 1 : state.enemyIdx;
  const swapping = shownIdx !== state.enemyIdx;
  const enemyShownHp = swapping ? 0 : state.enemyHp;
  const fxOnEnemy = shownIdx === targetIdx && state.turn > 0;

  const showResult = state.phase !== "play" && resultReady;
  const attacked = state.event !== "none";
  const hit = state.event === "hit" && state.feedback.kind === "hit" && fxOnEnemy ? state.feedback : null;
  const enemyAt = attacked ? ENEMY_AT : ENEMY_AT_QUICK;
  const selectedTiles: Tile[] = state.selected.map((id) => state.board.find((t) => t.id === id)!).filter(Boolean);
  const dmg = selectedTiles.reduce((n, t) => n + tileValue(t.term.word), 0);

  const shownEnemy = state.enemies[shownIdx];
  const enemyDead = enemyShownHp === 0;
  const enemyActs = state.struck && !swapping;
  const enemyHpShown = useLagged(enemyShownHp, hit ? HIT_AT : 0);
  const enemyDefeatedUi = enemyHpShown === 0;

  const playerDead = state.phase === "lost";
  const playerDelayMs = state.struck ? enemyAt + HIT_AT : hit && hit.healed > 0 ? HIT_AT : 0;
  const playerHpShown = useLagged(state.playerHp, playerDelayMs);

  function pick(id: string, e?: React.MouseEvent<HTMLButtonElement>) {
    if (state.selected.includes(id)) sfx.drop();
    else sfx.pick(state.selected.length);
    setState((p) => toggleTile(p, id));

    if (e && e.detail > 0) e.currentTarget.blur();
  }

  function measureDash() {
    const el = fightRef.current;
    if (!el) return;
    const a = el.querySelector<HTMLElement>(".side:first-child .sprite");
    const b = el.querySelector<HTMLElement>(".side:last-child .sprite");
    if (!a || !b) return;
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const dash = rb.left + rb.width / 2 - (ra.left + ra.width / 2) - ra.width * 0.75;
    el.style.setProperty("--dash", `${Math.round(Math.max(40, dash))}px`);
  }

  function act(fn: (p: GameState) => GameState) {
    if (busyRef.current) return;
    measureDash();
    setState(fn);
  }
  actRef.current = act;

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

            {/* PLAYER */}
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

            {/* ENEMY */}
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

        <div className="lower wood">
          <section className="play">
            {!showResult ? (
              <>
                <div className="wordbar">
                  <div className="wordtray" aria-label="Current chain">
                    <div className="chips-row" ref={chipsRef}>
                      {selectedTiles.length === 0 ? (
                        <span className="tray-empty">Tap related terms</span>
                      ) : (
                        selectedTiles.map((t) => (
                          <button
                            type="button"
                            className="mini"
                            key={t.id}
                            aria-label={`Remove ${t.term.word}`}
                            onClick={() => pick(t.id)}
                          >
                            {t.term.word}
                          </button>
                        ))
                      )}
                    </div>
                    {selectedTiles.length > 0 && (
                      <span className="dmg-total">
                        💥{" "}
                        {calcDamage(
                          selectedTiles,
                          sharedTopics(selectedTiles).includes(state.enemies[state.enemyIdx].weakness),
                        )}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn attack"
                    disabled={state.selected.length < 2 || busy || state.phase !== "play"}
                    onClick={() => act(submitChain)}
                  >
                    Attack!
                  </button>
                </div>
              </>
            ) : (
              <></>
            )}
          </section>
        </div>
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
