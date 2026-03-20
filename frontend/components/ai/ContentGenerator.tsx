import React, { useState } from 'react';
import { SparklesIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ContentGeneratorProps {
  onGenerate: (content: any) => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const platforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
  ];

  const handleGenerate = async () => {
    if (!topic) return;

    setGenerating(true);
    // API call to generate content
    setTimeout(() => {
      const mockContent = {
        titles: [
          `${topic} - The Ultimate Guide for Beginners`,
          `How I Mastered ${topic} in Just 7 Days`,
          `${topic} Secrets That Will Change Your Life`,
          `10 ${topic} Tips You Need to Know`,
          `${topic} Explained: Everything You Need to Know`,
        ],
        description: `Discover the amazing world of ${topic} in this comprehensive guide! 🚀

In this video, you'll learn:
✓ The basics of ${topic}
✓ Advanced techniques
✓ Common mistakes to avoid
✓ Pro tips and tricks

⏱️ TIMESTAMPS:
0:00 - Introduction
0:30 - What is ${topic}?
1:30 - Key Concepts
3:00 - Tips & Tricks
4:30 - Common Mistakes
6:00 - Conclusion

🔔 Don't forget to SUBSCRIBE for more content like this!

#${topic.replace(/\s/g, '')} #Tutorial #Guide`,
        hashtags: [
          `#${topic.replace(/\s/g, '')}`,
          '#Tutorial',
          '#Guide',
          '#Tips',
          '#HowTo',
          '#Learn',
          '#Beginner',
        ],
      };

      setContent(mockContent);
      onGenerate(mockContent);
      setGenerating(false);
    }, 2000);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Topic / Title"
          placeholder="e.g., How to make money online"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {platforms.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
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
            Generate Content
          </Button>
        </div>
      </div>

      {content && (
        <div className="space-y-4">
          {/* Titles */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
              <span className="font-medium">Video Titles (Click to copy)</span>
            </div>
            <div className="divide-y">
              {content.titles.map((title: string, index: number) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => copyToClipboard(title, `title-${index}`)}
                >
                  <span>{title}</span>
                  {copied === `title-${index}` ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ClipboardIcon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
              <span className="font-medium">Description</span>
              <button
                onClick={() => copyToClipboard(content.description, 'description')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {copied === 'description' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              rows={8}
              className="w-full p-4 focus:outline-none font-mono text-sm"
            />
          </div>

          {/* Hashtags */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
              <span className="font-medium">Hashtags</span>
              <button
                onClick={() => copyToClipboard(content.hashtags.join(' '), 'hashtags')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {copied === 'hashtags' ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {content.hashtags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                  onClick={() => copyToClipboard(tag, `tag-${index}`)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
