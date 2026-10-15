import { Module, Term } from "./types";

export type ParseResult = { ok: true; module: Module } | { ok: false; error: string };

interface Entry {
  topic: string;
  word: string;
  definition: string;
}

const MIN_TOPIC_SIZE = 3;
const MIN_TOPICS = 2;
const MIN_TERMS = 8;
const MAX_WORD_LEN = 28;

const fail = (error: string): ParseResult => ({ ok: false, error });

function splitItem(text: string): { word: string; definition: string } {
  const m = text.match(/^(.+?)\s*(?::|—|–|\s-\s)\s*(.+)$/);
  return m ? { word: m[1], definition: m[2] } : { word: text, definition: "" };
}

function toEntry(topic: string, raw: unknown): Entry | null {
  if (typeof raw === "string") {
    const { word, definition } = splitItem(raw);
    return { topic, word, definition };
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const word = obj.word ?? obj.term;
    if (typeof word === "string") {
      return { topic, word, definition: typeof obj.definition === "string" ? obj.definition : "" };
    }
  }
  return null;
}

function build(title: string, entries: Entry[]): ParseResult {
  const map = new Map<string, Term>();

  for (const entry of entries) {
    const word = entry.word.trim().replace(/\s+/g, "");
    if (!word || word.length > MAX_WORD_LEN) continue;
    const key = word.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      if (!existing.topics.includes(entry.topic)) existing.topics.push(entry.topic);
      if (!existing.definition && entry.definition) existing.definition = entry.definition.trim();
    } else {
      map.set(key, { word, definition: entry.definition.trim(), topics: [entry.topic] });
    }
  }

  const terms = [...map.values()];
  const counts = new Map<string, number>();
  for (const term of terms) {
    for (const topic of term.topics) {
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }
  }

  const topics = [...counts.entries()].filter(([, c]) => c >= MIN_TOPIC_SIZE).map(([t]) => t);

  if (terms.length < MIN_TERMS) {
    return fail(
      `Found ${terms.length} term${terms.length === 1 ? "" : "s"}. Add at least ${MIN_TERMS} to fill a board.`,
    );
  }
  if (topics.length < MIN_TOPICS) {
    return fail(
      `Found ${topics.length} topic with ${MIN_TOPIC_SIZE}+ terms. Group your terms under at least ${MIN_TOPICS} or more terms each.`,
    );
  }

  return { ok: true, module: { title: title.trim() || "Untitled module", terms, topics } };
}

function parseMarkdown(raw: string): ParseResult {
  let title = "";
  let topic = "General";
  const entries: Entry[] = [];

  for (const l of raw.split(/\r?\n/)) {
    const line = l.trim();
    if (!line) continue;

    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      if (!title) title = h1[1];
      else topic = h1[1].trim();
      continue;
    }

    const h2 = line.match(/^#{2,6}\s+(.+)$/);
    if (h2) {
      topic = h2[1].trim();
      continue;
    }

    const item = line.replace(/^([-*+•]|\d+[.)])\s+/, "");
    const { word, definition } = splitItem(item);
    entries.push({ topic, word, definition });
  }
  return build(title, entries);
}

function parseJson(raw: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return fail("That JSON could not be read. Check for missing comma or quote.");
  }
  const obj = data as { title?: unknown; topics?: unknown };
  const title = typeof obj.title === "string" ? obj.title : "";
  const entries: Entry[] = [];

  if (Array.isArray(obj.topics)) {
    for (const topic of obj.topics as { name?: unknown; terms?: unknown }[]) {
      if (typeof topic?.name !== "string" || !Array.isArray(topic.terms)) {
        continue;
      }

      for (const term of topic.terms) {
        const entry = toEntry(topic.name, term);
        if (entry) entries.push(entry);
      }
    }
  } else if (obj?.topics && typeof obj.topics === "object") {
    for (const [name, list] of Object.entries(obj.topics as Record<string, unknown>)) {
      if (!Array.isArray(list)) continue;
      for (const term of list) {
        const entry = toEntry(name, term);
        if (entry) entries.push(entry);
      }
    }
  } else {
    return fail('JSON needs a "topics" object, e.g. { "topics": { "Networking": "DNS", "TCP" } } ');
  }
  return build(title, entries);
}

export function parseModule(raw: string): ParseResult {
  const text = raw.trim();
  if (!text) {
    return fail("Paste your module's keywords or upload a file to begin.");
  }
  return text.startsWith("{") ? parseJson(text) : parseMarkdown(text);
}
