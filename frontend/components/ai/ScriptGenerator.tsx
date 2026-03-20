import React, { useState } from 'react';
import { SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ScriptGeneratorProps {
  onGenerate: (script: string) => void;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('engaging');
  const [language, setLanguage] = useState('en');
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState('');

  const tones = [
    { value: 'engaging', label: 'Engaging & Energetic' },
    { value: 'professional', label: 'Professional & Formal' },
    { value: 'casual', label: 'Casual & Friendly' },
    { value: 'dramatic', label: 'Dramatic & Emotional' },
    { value: 'educational', label: 'Educational & Informative' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Indonesian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
  ];

  const handleGenerate = async () => {
    if (!topic) return;

    setGenerating(true);
    // API call to generate script
    setTimeout(() => {
      const mockScript = `[HOOK] Did you know that ${topic} can change your life in just 5 minutes?

[CONTENT] Welcome to this video! Today we're going to explore the amazing world of ${topic}. 
Many people don't realize how powerful ${topic} can be for their daily life.

Let me show you the three most important things about ${topic}:

First, it's incredibly easy to get started. You don't need any special skills or equipment.

Second, the results are almost immediate. You'll see improvements right away.

Third, it's completely free and accessible to everyone.

[CTA] So what are you waiting for? Start your ${topic} journey today by clicking that subscribe button and hitting the like button! Don't forget to comment below with your thoughts.`;
      
      setScript(mockScript);
      onGenerate(mockScript);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Video Topic"
          placeholder="e.g., How to make money online"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {tones.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleGenerate}
            loading={generating}
            icon={<SparklesIcon className="h-5 w-5" />}
            fullWidth
          >
            Generate Script
          </Button>
        </div>
      </div>

      {script && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
            <span className="font-medium">Generated Script</span>
          </div>
          <textarea
            value={script}
            onChange={(e) => {
              setScript(e.target.value);
              onGenerate(e.target.value);
            }}
            rows={12}
            className="w-full p-4 focus:outline-none font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default ScriptGenerator;
