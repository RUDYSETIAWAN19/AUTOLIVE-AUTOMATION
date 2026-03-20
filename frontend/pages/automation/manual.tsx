import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import ManualModeSteps from '../../components/automation/ManualModeSteps';
import VideoPlayer from '../../components/video/VideoPlayer';
import VideoTrim from '../../components/video/VideoTrim';
import ScriptGenerator from '../../components/ai/ScriptGenerator';
import ContentGenerator from '../../components/ai/ContentGenerator';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  VideoCameraIcon,
  PhotoIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function ManualMode() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState('youtube');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPath, setVideoPath] = useState('');
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [duration, setDuration] = useState(0);
  const [script, setScript] = useState('');
  const [content, setContent] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleDownload = async () => {
    if (!videoUrl) {
      toast.error('Please enter a video URL');
      return;
    }

    setProcessing(true);
    // Simulate download
    setTimeout(() => {
      setVideoPath('/sample-video.mp4');
      setDuration(120);
      setCurrentStep(3);
      setProcessing(false);
      toast.success('Video downloaded successfully');
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPath(url);
      setCurrentStep(3);
      toast.success('Video uploaded successfully');
    }
  };

  const handleTrim = (start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
    toast.success('Video trimmed successfully');
  };

  const handleScriptGenerated = (generatedScript: string) => {
    setScript(generatedScript);
    toast.success('Script generated');
  };

  const handleContentGenerated = (generatedContent: any) => {
    setContent(generatedContent);
    toast.success('Content generated');
  };

  const handleUpload = async () => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      toast.success('Video uploaded successfully to YouTube!');
      setCurrentStep(6);
    }, 3000);
  };

  const platforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'rednote', label: 'RedNote' },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Steps */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Manual Mode Steps</h2>
                <ManualModeSteps currentStep={currentStep} onStepChange={handleStepChange} />
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> In manual mode, you have full control over
                  each step of the video creation process. Take your time to perfect
                  each stage.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                {/* Step 1: Select Source */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Select Video Source</h2>
                    
                    <div className="space-y-4">
                      <Select
                        label="Platform"
                        options={platforms}
                        value={sourcePlatform}
                        onChange={(e) => setSourcePlatform(e.target.value)}
                      />

                      <Input
                        label="Video URL"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Video File
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileUpload}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          MP4, MOV, AVI up to 500MB
                        </p>
                      </div>

                      <Button
                        onClick={handleDownload}
                        loading={processing}
                        fullWidth
                        size="lg"
                        icon={<CloudArrowUpIcon className="h-5 w-5" />}
                      >
                        Download / Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Download & Process */}
                {currentStep === 2 && (
                  <div className="text-center py-12">
                    <ArrowPathIcon className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Downloading Video...</h2>
                    <p className="text-gray-600">
                      Please wait while we download and prepare your video.
                    </p>
                  </div>
                )}

                {/* Step 3: Edit Video */}
                {currentStep === 3 && videoPath && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Edit Video</h2>
                    
                    <VideoPlayer url={videoPath} />
                    
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">Trim Video</h3>
                      <VideoTrim duration={duration} onTrim={handleTrim} />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => setCurrentStep(4)} fullWidth>
                        Continue to Content Generation
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Generate Content */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Generate Content</h2>
                    
                    <div className="space-y-8">
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <SparklesIcon className="h-5 w-5 text-purple-500" />
                          Script Generator
                        </h3>
                        <ScriptGenerator onGenerate={handleScriptGenerated} />
                      </div>

                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <SparklesIcon className="h-5 w-5 text-purple-500" />
                          SEO Content Generator
                        </h3>
                        <ContentGenerator onGenerate={handleContentGenerated} />
                      </div>

                      <Button onClick={() => setCurrentStep(5)} fullWidth>
                        Continue to Thumbnail
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 5: Create Thumbnail */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Create Thumbnail</h2>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">Generate or upload a thumbnail</p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="secondary" icon={<SparklesIcon className="h-4 w-4" />}>
                          Generate from Video
                        </Button>
                        <Button variant="secondary" icon={<CloudArrowUpIcon className="h-4 w-4" />}>
                          Upload Image
                        </Button>
                      </div>
                    </div>

                    <Input
                      label="Thumbnail Text (Optional)"
                      placeholder="Add text overlay"
                    />

                    <Button onClick={() => setCurrentStep(6)} fullWidth>
                      Continue to Upload
                    </Button>
                  </div>
                )}

                {/* Step 6: Upload */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Upload Video</h2>
                    
                    <div className="space-y-4">
                      <Select
                        label="Platform"
                        options={[
                          { value: 'youtube', label: 'YouTube' },
                          { value: 'tiktok', label: 'TikTok' },
                          { value: 'instagram', label: 'Instagram' },
                          { value: 'facebook', label: 'Facebook' },
                        ]}
                      />

                      <Input
                        label="Title"
                        placeholder="Enter video title"
                        defaultValue={content?.titles?.[0]}
                      />

                      <Input
                        label="Description"
                        placeholder="Enter video description"
                        defaultValue={content?.description}
                        textarea
                      />

                      <Input
                        label="Tags / Hashtags"
                        placeholder="Enter tags separated by commas"
                        defaultValue={content?.hashtags?.join(', ')}
                      />

                      <Select
                        label="Privacy"
                        options={[
                          { value: 'public', label: 'Public' },
                          { value: 'unlisted', label: 'Unlisted' },
                          { value: 'private', label: 'Private' },
                        ]}
                      />

                      <Button
                        onClick={handleUpload}
                        loading={uploading}
                        fullWidth
                        size="lg"
                        icon={<CloudArrowUpIcon className="h-5 w-5" />}
                      >
                        Upload Video
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
