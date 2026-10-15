import { parseModule } from "@/lib/parse";
import { SAMPLE_CS } from "@/lib/sample";
import Module from "module";
import { useMemo, useState } from "react";

interface Props {
  onStart: (m: Module) => void;
  artId: string;
  onArt: (id: string) => void;
}

export default function UploadPanel({ onStart, artId, onArt }: Props) {
  const [moduleContent, setModuleContent] = useState(SAMPLE_CS);
  const gameTerms = useMemo(() => parseModule(moduleContent), [moduleContent]);

  return <></>;
}
