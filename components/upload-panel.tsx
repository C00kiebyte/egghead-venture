import { parseModule } from "@/lib/parse";
import { SAMPLE_APP_DEV, SAMPLE_AUTOMATA, SAMPLE_CS, SAMPLE_CYBERSEC } from "@/lib/sample";
import Module from "module";
import { useEffect, useMemo, useState } from "react";
import Scene from "./scene";
import { ArtSet } from "@/lib/types";
import Sprite from "./sprite";

interface Props {
  onStart: (m: Module) => void;
  art: ArtSet;
  onArt: (id: string) => void;
}

export default function UploadPanel({ onStart, art, onArt }: Props) {
  const [selectedModule, setSelectedModule] = useState("computer science");
  const [moduleContent, setModuleContent] = useState(SAMPLE_CS);
  const gameTerms = useMemo(() => parseModule(moduleContent), [moduleContent]);

  const onModuleSelect = (val: string) => {
    setSelectedModule(val);
  };

  useEffect(() => {
    switch (selectedModule) {
      case "application development":
        setModuleContent(SAMPLE_APP_DEV);
        break;
      case "cybersecurity":
        setModuleContent(SAMPLE_CYBERSEC);
        break;
      case "automata":
        setModuleContent(SAMPLE_AUTOMATA);
        break;
      default:
        setModuleContent(SAMPLE_CS);
    }
  }, [selectedModule]);

  return (
    <main className="game">
      <div className="frame">
        <Scene tall>
          <div className="cover-hero">
            <div className="logo-title">Egghead Venture!</div>
            <p className="tagline">Turn your course keywords into spell tiles and chain them to defeat enemies.</p>

            <div className="parade" aria-hidden>
              {[art.hero, ...art.enemies.slice(0, 3)].map((c) => (
                <span key={c.name}>
                  <Sprite art={c.art} />
                </span>
              ))}
            </div>
          </div>
        </Scene>

        <div className="lower wood cover-lower">
          <section className="scroll">
            <h2>How to play</h2>
            <ol>
              <li>Tap two or more terms that belong to one concept, like Stack, Queue and Array.</li>
              <li>Every enemy is weak to one concept. Matching it deals double damage.</li>
              <li>A wrong chain costs an action, then shows where each term belongs.</li>
            </ol>
          </section>

          <section className="scroll upload" aria-label="Module Content">
            <div className="upload-head">
              <h2>Your Module</h2>
            </div>
            <textarea id="module-text" value={moduleContent} spellCheck={false} />
            <div className="modules">
              <button
                className={selectedModule === "computer science" ? "selected" : ""}
                onClick={() => onModuleSelect("computer science")}
              >
                Computer Science Basics
              </button>
              <button
                className={selectedModule === "application development" ? "selected" : ""}
                onClick={() => onModuleSelect("application development")}
              >
                Application Development
              </button>
              <button
                className={selectedModule === "cybersecurity" ? "selected" : ""}
                onClick={() => onModuleSelect("cybersecurity")}
              >
                Cybersecurity
              </button>
              <button
                className={selectedModule === "automata" ? "selected" : ""}
                onClick={() => onModuleSelect("automata")}
              >
                Theory of Computations with Automata
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
