export const convertToAudioBuffer = async (file: File): Promise<AudioBuffer> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const audioContext = new AudioContext();

      audioContext.decodeAudioData(
        arrayBuffer,
        (audioBuffer) => {
          resolve(audioBuffer);
        },
        reject
      );
    };

    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });
};

export const audiobufferToWaveBlob = (audioBuffer: AudioBuffer) => {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];

  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this demo)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  // create Blob
  return new Blob([buffer], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
};

export const convertAudioBufferToWav = async (data: AudioBuffer) => {
  return URL.createObjectURL(audiobufferToWaveBlob(data));
};

export const convertWavToMp3ByFFmpeg = async (wavFile: string, onProgress?: (ratio: number | undefined) => void) => {
  onProgress?.(Math.floor(0));
  const { createFFmpeg, fetchFile } = (await import("@ffmpeg/ffmpeg")).default;

  const ffmpeg = createFFmpeg({
    mainName: "main",
    log: true,
    corePath: "https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js",
  });
  await ffmpeg.load();

  ffmpeg.setProgress(({ ratio }) => {
    if (ratio * 100 > 99) {
      onProgress?.(100);
      return;
    }
    onProgress?.(Math.floor(ratio * 100));
  });
  ffmpeg.FS("writeFile", "test.wav", await fetchFile(wavFile));
  await ffmpeg.run("-i", "test.wav", "test.mp3");

  const mp3Data = ffmpeg.FS("readFile", "test.mp3");

  return new Blob([mp3Data.buffer], { type: "audio/mp3" });
};
