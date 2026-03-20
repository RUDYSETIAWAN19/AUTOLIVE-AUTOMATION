import React, { useState, useRef } from 'react';
import { ScissorsIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface VideoTrimProps {
  duration: number;
  onTrim: (start: number, end: number) => void;
}

const VideoTrim: React.FC<VideoTrimProps> = ({ duration, onTrim }) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPosition = (time: number) => {
    return (time / duration) * 100;
  };

  const handleTrim = () => {
    onTrim(startTime, endTime);
  };

  const handleReset = () => {
    setStartTime(0);
    setEndTime(duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(1, Math.max(0, x / rect.width));
    const newTime = percentage * duration;

    if (isDragging === 'start') {
      setStartTime(Math.min(newTime, endTime - 1));
    } else if (isDragging === 'end') {
      setEndTime(Math.max(newTime, startTime + 1));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Start: {formatTime(startTime)}</span>
        <span>Duration: {formatTime(endTime - startTime)}</span>
        <span>End: {formatTime(endTime)}</span>
      </div>

      <div
        className="relative h-12 bg-gray-200 rounded-lg cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(null)}
      >
        {/* Trimmed region */}
        <div
          className="absolute h-full bg-blue-500 bg-opacity-30"
          style={{
            left: `${getPosition(startTime)}%`,
            width: `${getPosition(endTime) - getPosition(startTime)}%`,
          }}
        />

        {/* Start handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize hover:bg-blue-700"
          style={{ left: `${getPosition(startTime)}%` }}
          onMouseDown={() => setIsDragging('start')}
        />

        {/* End handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize hover:bg-blue-700"
          style={{ left: `${getPosition(endTime)}%` }}
          onMouseDown={() => setIsDragging('end')}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleTrim}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ScissorsIcon className="h-5 w-5" />
          Apply Trim
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default VideoTrim;
