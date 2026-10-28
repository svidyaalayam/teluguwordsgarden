import { useEffect, useRef, useState } from "react";
import type { CharacterLesson } from "../types/character";

type PronunciationButtonProps = {
  lesson: CharacterLesson;
  requestKey?: number;
};

export function PronunciationButton({
  lesson,
  requestKey = 0,
}: PronunciationButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  // const playDummySound = () => {
  //   const AudioContextClass = window.AudioContext
  //   if (!AudioContextClass) return
  //   const context = new AudioContextClass()
  //   const oscillator = context.createOscillator()
  //   const gain = context.createGain()
  //   oscillator.type = 'sine'
  //   oscillator.frequency.value = 440
  //   gain.gain.setValueAtTime(0.08, context.currentTime)
  //   gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35)
  //   oscillator.connect(gain)
  //   gain.connect(context.destination)
  //   oscillator.start()
  //   oscillator.stop(context.currentTime + 0.35)
  //   window.setTimeout(() => void context.close(), 500)
  // }

  // const playFallbackFile = () => {
  //   const dummy = new Audio('/assets/audio/dummy.wav')
  //   dummy.play().catch(playDummySound)
  // }

  const play = () => {
    audioRef.current?.pause();
    const audio = new Audio(
      lesson.audioUrl ?? `/assets/audio/${lesson.id}.wav`,
    );
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    // audio.onerror = () => {
    //   setPlaying(false)
    //   playFallbackFile()
    // }
    setPlaying(true);
    void audio.play().catch(() => {
      setPlaying(false);
      //playFallbackFile()
    });
  };

  useEffect(() => {
    if (requestKey > 0) play();
    // The request key deliberately triggers playback for the newly selected lesson.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  return (
    <button
      className="pronunciation-button"
      type="button"
      onClick={play}
      aria-label={`Play pronunciation for ${lesson.glyph}`}
    >
      <span aria-hidden="true">🔊</span> {playing ? "Playing…" : "Listen"}
    </button>
  );
}
