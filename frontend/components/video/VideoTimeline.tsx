import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface VideoTimelineProps {
  duration: number;
  segments: Array<{ start: number; end: number; label?: string }>;
  onSegmentSelect?: (segment: { start: number; end: number }) => void;
}

const VideoTimeline: React.FC<VideoTimelineProps> = ({
  duration,
  segments,
  onSegmentSelect,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const getSegmentWidth = (start: number, end: number) => {
    return ((end - start) / duration) * 100;
  };

  const getSegmentPosition = (start: number) => {
    return (start / duration) * 100;
  };

  return (
    <div className="relative w-full h-16 bg-gray-200 rounded-lg overflow-hidden cursor-pointer">
      {/* Timeline background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100" />

      {/* Segments */}
      {segments.map((segment, index) => (
        <motion.div
          key={index}
          className="absolute h-full bg-blue-500 bg-opacity-50 border-r-2 border-blue-600"
          style={{
            left: `${getSegmentPosition(segment.start)}%`,
            width: `${getSegmentWidth(segment.start, segment.end)}%`,
          }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onSegmentSelect?.(segment)}
          onMouseEnter={() => setHoveredSegment(index)}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          {hoveredSegment === index && segment.label && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {segment.label}
            </div>
          )}
        </motion.div>
      ))}

      {/* Playhead indicator */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" />
    </div>
  );
};

export default VideoTimeline;
