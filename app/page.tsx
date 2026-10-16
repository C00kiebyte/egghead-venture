"use client";

import UploadPanel from "@/components/upload-panel";
import { ART_SETS } from "@/lib/characters";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/my-data", {
      cache: "no-store", // Tells Next.js/Browser never to cache this request
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  const [artId, setArtId] = useState(ART_SETS[0].id);
  const art = ART_SETS.find((a) => a.id === artId) ?? ART_SETS[0];
  return <UploadPanel onStart={() => {}} art={art} onArt={setArtId} />;
}
