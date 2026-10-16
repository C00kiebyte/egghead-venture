import {
  ATTACK_EVERY,
  calcDamage,
  clearSelection,
  newGame,
  sharedTopics,
  shuffleBoard,
  submitChain,
  tileValue,
  toggleTile,
  undoLast,
} from "@/lib/engine";
import { ArtSet, Feedback, GameState, Module, Tile } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import Sprite from "./sprite";
import Scene from "./scene";
import { setMuted, sfx } from "@/lib/sfx";

interface Props {
  mod: Module;
  art: ArtSet;
  onExit: () => void;
}

// Animation timeline (ms). Keep in sync with --hit-at / --enemy-at in attack.css.
const HIT_AT = 260;
const ENEMY_AT = 950;
const ENEMY_AT_QUICK = 250;

const COMPACT = "(max-width: 879px), (max-height: 599px)";

export default function Game({ mod, art, onExit }: Props) {
  const [state, setState] = useState<GameState>(newGame(mod, art.enemies));
  const [muted, setMutedState] = useState(false);
  const [shownIdx, setShownIdx] = useState(0);
  const [resultReady, setResultReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [seenTurn, setSeenTurn] = useState(0);

  const sheetOpenRef = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bookRef = useRef<HTMLButtonElement>(null);
  const turnRef = useRef(0);
  const fightRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const actRef = useRef<(fn: (p: GameState) => GameState) => void>(() => {});

  const review = state.mod.terms.filter((t) => state.struggled.includes(t.word));
  const targetIdx = state.defeated && state.phase !== "won" ? state.enemyIdx - 1 : state.enemyIdx;
  const swapping = shownIdx !== state.enemyIdx;
  const enemyShownHp = swapping ? 0 : state.enemyHp;
  const fxOnEnemy = shownIdx === targetIdx && state.turn > 0;
  const unread = state.turn > seenTurn && state.feedback.kind !== "info";

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

  function restart() {
    setState(newGame(mod, art.enemies));
    setShownIdx(0);
    setResultReady(false);
    setBusy(false);
    setSeenTurn(0);
  }

  function act(fn: (p: GameState) => GameState) {
    if (busyRef.current) return;
    measureDash();
    setState(fn);
  }
  actRef.current = act;

  // Sound, haptics and input lock follow the animation timeline of each action.
  useEffect(() => {
    if (state.turn === 0) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    const attacked = state.event !== "none";
    const enemyAt = attacked ? ENEMY_AT : ENEMY_AT_QUICK;

    if (attacked) sfx.whoosh(false);
    if (state.event === "hit" && state.feedback.kind === "hit") {
      const weak = state.feedback.weak;
      at(HIT_AT, () => sfx.hit(weak));
    } else if (state.event === "miss") at(HIT_AT, sfx.miss);
    else sfx.shuffle();

    if (state.struck) {
      at(enemyAt, () => sfx.whoosh(true));
      at(enemyAt + HIT_AT, sfx.hurt);
    }

    const end = state.struck ? enemyAt + 750 : state.defeated ? 1500 : attacked ? 800 : 300;
    setBusy(true);
    at(end, () => setBusy(false));

    if (state.phase === "won") at(1500, sfx.win);
    if (state.phase === "lost") at(enemyAt + 900, sfx.lose);

    if (state.event === "miss" && state.phase === "play" && window.matchMedia(COMPACT).matches) {
      at(end + 200, () => setSheetOpen(true));
    }
    return () => timers.forEach(clearTimeout);
  }, [state.turn]);

  // Bottom sheet: lock page scroll, move focus in and out, close on Escape.
  useEffect(() => {
    sheetOpenRef.current = sheetOpen;
    if (!sheetOpen) return;
    setSeenTurn(turnRef.current);
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      bookRef.current?.focus();
    };
  }, [sheetOpen]);

  // The sheet only exists on phones; close it if the window grows to the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia(COMPACT);
    const onChange = () => {
      if (!mq.matches) setSheetOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Swap enemies
  useEffect(() => {
    if (state.enemyIdx === shownIdx) return;
    const t = setTimeout(() => setShownIdx(state.enemyIdx), 1300);
    return () => clearTimeout(t);
  }, [state.enemyIdx, shownIdx]);

  // Show end screen
  useEffect(() => {
    if (state.phase === "play") {
      setResultReady(false);
      return;
    }
    const t = setTimeout(() => setResultReady(true), state.phase === "won" ? 1700 : 2100);
    return () => clearTimeout(t);
  }, [state.phase]);

  // Keyboard Event
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (sheetOpenRef.current) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Enter" && tag !== "BUTTON") actRef.current(submitChain);
      else if (e.key === "Backspace") setState((p) => undoLast(p));
      else if (e.key === "Escape") setState((p) => clearSelection(p));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep the newest word visible in the single-row chain tray on small screens.
  useEffect(() => {
    const el = chipsRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [state.selected.length]);

  useEffect(() => setMuted(muted), [muted]);

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
                    <div className={`sprite enemy ${enemyDead ? "is-dead" : hit ? "is-hit" : ""}`} aria-hidden="true">
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

                <div className="board" role="group" aria-label="Term tiles">
                  {state.board.map((t, i) => {
                    const order = state.selected.indexOf(t.id);
                    const on = order >= 0;
                    const v = tileValue(t.term.word);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`tile${on ? " on" : ""}`}
                        style={{ "--i": i, "--fs": tileFont(t.term.word) } as React.CSSProperties}
                        aria-pressed={on}
                        onClick={(e) => pick(t.id, e)}
                      >
                        {on && <span className="order">{order + 1}</span>}
                        <span className="word">{t.term.word}</span>
                        <span className={`dmg v${v}`} title={`Worth ${v} dmg${v > 1 ? "s" : ""}`}>
                          {v}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="toolbar">
                  <button
                    type="button"
                    className="btn small"
                    disabled={!state.selected.length}
                    onClick={() => setState(undoLast)}
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    disabled={!state.selected.length}
                    onClick={() => setState(clearSelection)}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    disabled={busy || state.phase !== "play"}
                    onClick={() => act(shuffleBoard)}
                    aria-label="Shuffle board, uses one action"
                  >
                    Shuffle −1
                  </button>
                  <button
                    type="button"
                    ref={bookRef}
                    className="btn small btn-book"
                    aria-haspopup="dialog"
                    aria-label={unread ? "Open spellbook, new entry" : "Open spellbook"}
                    onClick={() => setSheetOpen(true)}
                  >
                    <span aria-hidden="true">📖 Book</span>
                    {unread && <i className="dot" aria-hidden="true" />}
                  </button>
                </div>
                <p className="hint">Enter attacks · Backspace undoes · Esc clears · Shuffle uses one action</p>
              </>
            ) : (
              <div className="scroll">
                <h2>{state.phase === "won" ? "Victory!" : "Defeated!"}</h2>
                <p>
                  {state.phase === "won"
                    ? `Every enemy is down. You used ${state.learned.length} of ${mod.terms.length} terms.`
                    : `${state.enemies[state.enemyIdx].name} won this round. You used ${state.learned.length} of ${mod.terms.length} terms.`}
                </p>
                {review.length > 0 ? (
                  <>
                    <h3>Terms to review</h3>
                    <dl className="entries">
                      {review.map((t) => (
                        <div key={t.word}>
                          <dt>{t.word}</dt>
                          <dd>
                            {t.definition || "No definition provided."} <em>{t.topics.join(", ")}</em>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </>
                ) : (
                  <p>No missed chains this run.</p>
                )}
                <div className="toolbar">
                  <button type="button" className="btn attack" onClick={restart}>
                    Play again
                  </button>
                  <button type="button" className="btn" onClick={onExit}>
                    Change module
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="book" aria-live="polite" aria-label="Spellbook">
            <h2>Spellbook</h2>
            <SpellbookBody feedback={state.feedback} notice={state.notice} />
          </aside>
        </div>
      </div>

      {sheetOpen && (
        <div className="sheet-wrap">
          <button
            type="button"
            className="sheet-backdrop"
            aria-label="Close spellbook"
            tabIndex={-1}
            onClick={() => setSheetOpen(false)}
          />
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Spellbook">
            <div className="sheet-head">
              <h2>Spellbook</h2>
              <button type="button" ref={closeRef} className="btn small" onClick={() => setSheetOpen(false)}>
                Close
              </button>
            </div>
            <SpellbookBody feedback={state.feedback} notice={state.notice} />
          </div>
        </div>
      )}
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

function tileFont(word: string): string {
  const longest = Math.max(...word.split(" ").map((w) => w.length));
  let rem = longest <= 5 ? 1.15 : longest <= 7 ? 1 : longest <= 9 ? 0.88 : longest <= 11 ? 0.76 : 0.66;
  if (word.length > 14) rem = Math.min(rem, 0.8);
  return `${rem}rem`;
}

function SpellbookBody({ feedback, notice }: { feedback: Feedback; notice: string }) {
  return (
    <>
      {feedback.kind === "info" && <p>{feedback.text}</p>}

      {feedback.kind === "hit" && (
        <>
          <h3>
            {feedback.topic}: {feedback.damage} damage
            {feedback.weak ? ", weakness hit!" : ""}
            {feedback.healed > 0 ? ` Healed ${feedback.healed}.` : ""}
          </h3>
          <dl className="entries">
            {feedback.terms.map((t) => (
              <div key={t.word}>
                <dt>{t.word}</dt>
                <dd>{t.definition || "No definition provided."}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {feedback.kind === "miss" && (
        <>
          <h3>Those terms don&apos;t share a concept</h3>
          <dl className="entries">
            {feedback.rows.map((r) => (
              <div key={r.word}>
                <dt>{r.word}</dt>
                <dd>{r.topics.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {notice && <p className="notice">{notice}</p>}
    </>
  );
}
