import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  VideoCameraIcon,
  PencilIcon,
  PhotoIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface ManualModeStepsProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

const ManualModeSteps: React.FC<ManualModeStepsProps> = ({
  currentStep,
  onStepChange,
}) => {
  const steps: Step[] = [
    {
      id: 1,
      title: 'Select Source',
      description: 'Choose video source (YouTube, TikTok, or Upload)',
      icon: <VideoCameraIcon className="h-6 w-6" />,
      completed: false,
      active: currentStep === 1,
    },
    {
      id: 2,
      title: 'Download & Process',
      description: 'Download and prepare video for editing',
      icon: <CloudArrowUpIcon className="h-6 w-6" />,
      completed: false,
      active: currentStep === 2,
    },
    {
      id: 3,
      title: 'Edit Video',
      description: 'Trim, crop, add subtitles and music',
      icon: <PencilIcon className="h-6 w-6" />,
      completed: false,
      active: currentStep === 3,
    },
    {
      id: 4,
      title: 'Generate Content',
      description: 'Create title, description, and hashtags',
      icon: <PencilIcon className="h-6 w-6" />,
      completed: false,
      active: currentStep === 4,
    },
    {
      id: 5,
      title: 'Create Thumbnail',
      description: 'Generate or upload thumbnail',
      icon: <PhotoIcon className="h-6 w-6" />,
      completed: false,
      active: currentStep === 5,
    },
    {
      id: 6,
      title: 'Upload',
      description: 'Upload to selected platforms',
      icon: <CloudArrowUpIcon className="h-6 w-6" />,
      completed: false,
      active: currentStep === 6,
    },
  ];

  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <motion.div
          key={step.id}
          className={`
            p-4 rounded-lg cursor-pointer transition-all
            ${step.active ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}
            ${step.completed ? 'opacity-75' : ''}
          `}
          onClick={() => onStepChange(step.id)}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${step.active ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}
              `}
            >
              {step.completed ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              ) : (
                step.icon
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Step {step.id}: {step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>

            {step.completed && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ManualModeSteps;
