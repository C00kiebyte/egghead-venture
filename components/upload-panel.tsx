import { parseModule } from "@/lib/parse";
import { SAMPLE_CS } from "@/lib/sample";
import Module from "module";
import { useMemo, useState } from "react";
import Scene from "./scene";
import { ArtSet } from "@/lib/types";
import Sprite from "./sprite";

interface Props {
  onStart: (m: Module) => void;
  art: ArtSet;
  onArt: (id: string) => void;
}

export default function UploadPanel({ onStart, art, onArt }: Props) {
  const [moduleContent, setModuleContent] = useState(SAMPLE_CS);
  const gameTerms = useMemo(() => parseModule(moduleContent), [moduleContent]);

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
        </div>
      </div>
    </main>
  );
}
