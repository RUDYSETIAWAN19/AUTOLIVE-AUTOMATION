import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';

interface VideoPlayerProps {
  url: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onProgress, onEnded }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleProgress = (state: { played: number }) => {
    setPlayed(state.played);
    onProgress?.(state.played * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    setPlayed(seekTo);
    playerRef.current?.seekTo(seekTo);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onDuration={setDuration}
        onEnded={onEnded}
        width="100%"
        height="100%"
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
            },
          },
        }}
      />

      <div className="p-4 bg-gray-900 text-white">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={handlePlayPause} className="hover:text-blue-400">
            {playing ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={played}
            onChange={handleSeek}
            className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />

          <span className="text-sm">
            {formatTime(played * duration)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleMute} className="hover:text-blue-400">
            {muted ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />

          <button className="hover:text-blue-400 ml-auto">
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
