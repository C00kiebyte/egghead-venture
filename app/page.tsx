"use client";

import Game from "@/components/game";
import UploadPanel from "@/components/upload-panel";
import { ART_SETS } from "@/lib/characters";
import { Module } from "@/lib/types";
import { useEffect, useState } from "react";

export default function Home() {
  const [mod, setMod] = useState<Module | null>(null);
  const [artId, setArtId] = useState(ART_SETS[1].id);
  const art = ART_SETS.find((a) => a.id === artId) ?? ART_SETS[0];
  return mod ? (
    <Game mod={mod} art={art} onExit={() => setMod(null)} />
  ) : (
    <UploadPanel onStart={setMod} art={art} onArt={setArtId} />
  );
}
