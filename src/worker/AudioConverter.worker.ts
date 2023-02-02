// Needed to declare this as a module. Also shows that imports

import { convertWavToMp3ByFFmpeg } from "../AudioUtil";

// function normally in workers.
const ctx: Worker = self as unknown as Worker;

async function start(data: string) {
  const mp3Blob = await convertWavToMp3ByFFmpeg(data, (ratio) => {
    ctx.postMessage({
      type: "convertWavToMp3Progress",
      data: ratio,
    });
  });
  ctx.postMessage({
    type: "convertWavToMp3Result",
    data: URL.createObjectURL(mp3Blob),
  });
}

ctx.addEventListener("message", (evt) => {
  switch (evt.data.type) {
    case "audioBufferToMp3":
      start(evt.data.wavFile);
      return;
  }
});

export {};
