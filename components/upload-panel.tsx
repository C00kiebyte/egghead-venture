import { parseModule } from "@/lib/parse";
import { SAMPLE_CS } from "@/lib/sample";
import Module from "module";
import { useMemo, useState } from "react";
import Scene from "./scene";

interface Props {
  onStart: (m: Module) => void;
  artId: string;
  onArt: (id: string) => void;
}

export default function UploadPanel({ onStart, artId, onArt }: Props) {
  const [moduleContent, setModuleContent] = useState(SAMPLE_CS);
  const gameTerms = useMemo(() => parseModule(moduleContent), [moduleContent]);

  return (
    <main className="game">
      <div className="frame">
        <Scene tall>
          <div className="cover-hero">
            <div className="logo-title">Egghead Venture!</div>
            <p className="tagline">Turn your course keywords into spell tiles and chain them to defeat enemies.</p>
          </div>
        </Scene>
      </div>
    </main>
  );
}
