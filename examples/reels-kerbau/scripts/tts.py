"""Generate the voice over for every scene in src/script.json.

Writes public/vo/<id>.mp3 and src/vo-words.json (word timestamps in seconds),
which the scenes use to start each drawing on its spoken keyword.

    pip install edge-tts
    python3 scripts/tts.py
"""

import asyncio
import json
import os
import ssl
from pathlib import Path

import edge_tts
import edge_tts.communicate

VOICE = "id-ID-ArdiNeural"
RATE = "-8%"
ROOT = Path(__file__).resolve().parent.parent

# Honour a custom CA bundle (e.g. behind a TLS-inspecting proxy).
ca = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
if ca:
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=ca)


async def synth(scene_id: str, text: str) -> list[dict]:
    comm = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    words = []
    with open(ROOT / "public" / "vo" / f"{scene_id}.mp3", "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7
                words.append(
                    {
                        "text": chunk["text"],
                        "start": round(start, 3),
                        "end": round(start + chunk["duration"] / 1e7, 3),
                    }
                )
    return words


async def main() -> None:
    script = json.loads((ROOT / "src" / "script.json").read_text())
    (ROOT / "public" / "vo").mkdir(parents=True, exist_ok=True)
    out = {}
    for scene in script:
        out[scene["id"]] = await synth(scene["id"], scene["text"])
        print(scene["id"], len(out[scene["id"]]), "words", out[scene["id"]][-1]["end"], "s")
    (ROOT / "src" / "vo-words.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")


asyncio.run(main())
