import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { isMobile } from "react-device-detect";
import styled from "styled-components";

import { useInterval } from "usehooks-ts";

const StyledInput = styled.input`
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 15px;
    width: 25px;
    background: #444;
    border-radius: 7px;
    cursor: pointer;
  }

  &::-webkit-slider-runnable-track {
    background-color: #ddd;
    border-radius: 15px;
  }
`;

export default function App() {
  // Dynamic delay
  const [delay, setDelay] = useState<number>(15);
  // ON/OFF
  const [isPlaying, setPlaying] = useState<boolean>(false);

  const [focusedSeconds, setFocusedSeconds] = useState(0);

  const { startRecording, stopRecording, recordingBlob, isRecording } =
    useAudioRecorder();

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const [secondsInCycle, setSecondsInCycle] = useState(0);

  useEffect(() => {
    if (recordingBlob) {
      const url = URL.createObjectURL(recordingBlob);
      setAudioUrl(url);
      setPlaying(true);
    }
  }, [recordingBlob]);

  const delayMs = delay * 1000;
  useInterval(
    () => {
      playReminder();
    },
    // Delay in milliseconds or null to stop it
    isPlaying ? delayMs : null
  );
  useInterval(() => {
    if (isPlaying) {
      const updatedSecondsInCycle = (secondsInCycle + 1) % delay;
      setSecondsInCycle(updatedSecondsInCycle);

      incrementFocusedSeconds();
    }
  }, 1000);

  const incrementFocusedSeconds = () => {
    setFocusedSeconds(focusedSeconds + 1);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDelay(Number(event.target.value));
    setSecondsInCycle(0);
  };

  const playReminder = () => {
    audioRef?.current?.play();
  };

  const resetCycle = () => {
    setSecondsInCycle(0);
    if (audioRef?.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const progress = (secondsInCycle + (isPlaying ? 1 : 0)) / delay;
  const formattedFocusedTime = `${Math.round(focusedSeconds / 60)} minutes`;

  const buttonStyle = {
    fontSize: 24,
    height: 45,
    width: 45,
    borderRadius: 30,
    borderWidth: 0,
    cursor: "pointer",
  };

  if (isMobile) {
    return (
      <div
        style={{
          padding: 17,
        }}
      >
        <h1>
          sorry! this app doesn't currently support touch screens. try using a
          big computer instead 🧑‍💻
        </h1>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: 10,
          justifyContent: "space-evenly",
        }}
      >
        <button
          onMouseDown={() => {
            setPlaying(false);
            resetCycle();
            startRecording();
          }}
          onMouseUp={() => {
            stopRecording();
          }}
          style={{
            ...buttonStyle,
            ...(isRecording ? { backgroundColor: "tomato" } : {}),
          }}
        >
          🎤
        </button>

        {audioUrl && (
          <>
            <audio ref={audioRef} src={audioUrl} controls={false} />
            <div>
              <button
                style={buttonStyle}
                onClick={() => {
                  if (!isPlaying) {
                    playReminder();
                  } else {
                    resetCycle();
                  }
                  setPlaying(!isPlaying);
                }}
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>
            </div>
            <div
              style={{
                display: "flex",
              }}
            >
              <StyledInput
                type="range"
                name="delay"
                min={2}
                max={50}
                onChange={handleChange}
                value={delay}
              />
              <div
                style={{
                  width: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {delay} seconds
              </div>
            </div>
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          backgroundColor: "#ddd",
        }}
      >
        <div
          style={{
            transitionProperty: "flex",
            transitionDuration: "300ms",
            flex: progress,
            backgroundColor: "#444",
            height: 10,
          }}
        />
      </div>
      <h3 style={{ textAlign: "center" }}>
        {formattedFocusedTime} of focus time so far!
      </h3>
    </div>
  );
}
