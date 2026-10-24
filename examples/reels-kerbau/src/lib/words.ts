import script from "../script.json";
import voWords from "../vo-words.json";

export type SceneId = (typeof script)[number]["id"];

export type Word = {
  text: string; // as written in the script, punctuation included
  start: number; // seconds from the start of the scene audio
  end: number;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");

const build = (id: string, text: string): Word[] => {
  const tokens = text.split(/\s+/);
  const timed = (voWords as Record<string, { start: number; end: number }[]>)[id];
  if (!timed || timed.length !== tokens.length) {
    throw new Error(
      `Scene ${id}: ${tokens.length} words in script.json but ${timed?.length} in vo-words.json. Re-run scripts/tts.py.`,
    );
  }
  return tokens.map((t, i) => ({ text: t, start: timed[i].start, end: timed[i].end }));
};

export const SCENES = script.map((s) => ({ id: s.id as SceneId, words: build(s.id, s.text) }));

export const wordsOf = (id: SceneId) => SCENES.find((s) => s.id === id)!.words;

/** Seconds at which `word` (nth occurrence) starts in the scene's voice over. */
export const at = (id: SceneId, word: string, nth = 0): number => {
  const hits = wordsOf(id).filter((w) => norm(w.text) === norm(word));
  if (!hits[nth]) throw new Error(`Word "${word}" #${nth} not in scene ${id}`);
  return hits[nth].start;
};

export const endOf = (id: SceneId): number => {
  const w = wordsOf(id);
  return w[w.length - 1].end;
};

/** Caption lines: split after sentence punctuation. */
export const captionChunks = (id: SceneId): Word[][] => {
  const chunks: Word[][] = [[]];
  for (const w of wordsOf(id)) {
    chunks[chunks.length - 1].push(w);
    if (/[.:!?]$/.test(w.text)) chunks.push([]);
  }
  return chunks.filter((c) => c.length > 0);
};
