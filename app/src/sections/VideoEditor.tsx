import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Scissors,
  Type,
  Music,
  Ratio,
  Wand2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Save,
  Sparkles,
  Hash,
  AlignLeft,
  Check,
  Loader2,
  Calendar,
} from 'lucide-react';
import { viralHashtags } from '@/data/mock';

const aspectRatios = [
  { id: '9:16', name: 'Shorts/Reels (9:16)', icon: Ratio },
  { id: '1:1', name: 'Square (1:1)', icon: Ratio },
  { id: '16:9', name: 'Landscape (16:9)', icon: Ratio },
];

const musicTracks = [
  { id: 'none', name: 'No Music' },
  { id: 'upbeat', name: 'Upbeat Corporate - YouTube Audio Library' },
  { id: 'inspirational', name: 'Inspirational Background - YouTube Audio Library' },
  { id: 'tropical', name: 'Tropical House - YouTube Audio Library' },
  { id: 'electronic', name: 'Electronic Pop - YouTube Audio Library' },
];

export function VideoEditor() {
  const { editedVideos, updateEditedVideo, addSchedule, setActiveTab } = useStore();
  const [selectedVideo, setSelectedVideo] = useState(editedVideos[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Editing settings
  const [settings, setSettings] = useState({
    ratio: '9:16',
    addSubtitles: true,
    musicTrack: 'upbeat',
    startTime: 0,
    endTime: 60,
    volume: 80,
  });

  // Generated content
  const [generated, setGenerated] = useState({
    title: '',
    description: '',
    hashtags: [] as string[],
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const randomHashtags = viralHashtags
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
    
    setGenerated({
      title: selectedVideo?.title || 'Viral Content Short',
      description: selectedVideo?.description || 'Check out this amazing content! 🚀',
      hashtags: randomHashtags,
    });
    
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (selectedVideo) {
      updateEditedVideo(selectedVideo.id, {
        ratio: settings.ratio as '9:16' | '1:1' | '16:9',
        hasSubtitles: settings.addSubtitles,
        musicSource: settings.musicTrack,
        title: generated.title || selectedVideo.title,
        description: generated.description || selectedVideo.description,
        hashtags: generated.hashtags,
        status: 'ready',
      });
    }
  };

  const handleSchedule = () => {
    if (selectedVideo && scheduleDate && scheduleTime) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      
      const schedule = {
        id: `s${Date.now()}`,
        videoId: selectedVideo.id,
        platforms: selectedPlatforms,
        scheduledTime: scheduledDateTime,
        status: 'pending' as const,
        createdAt: new Date(),
      };
      
      addSchedule(schedule);
      updateEditedVideo(selectedVideo.id, { status: 'scheduled' });
      setShowScheduleDialog(false);
      setActiveTab('schedule');
    }
  };

  const toggleHashtag = (hashtag: string) => {
    setGenerated(prev => ({
      ...prev,
      hashtags: prev.hashtags.includes(hashtag)
        ? prev.hashtags.filter(h => h !== hashtag)
        : [...prev.hashtags, hashtag],
    }));
  };

  if (editedVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <Scissors className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Videos to Edit</h2>
        <p className="text-gray-400 mb-6">Download videos from the discovery page first</p>
        <Button
          className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
          onClick={() => setActiveTab('videos')}
        >
          Go to Video Discovery
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Video Editor</h1>
          <p className="text-gray-400 mt-1">
            Edit and optimize your videos for viral success
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
            onClick={() => setShowScheduleDialog(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Upload
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              {/* Video Player */}
              <div className={cn(
                'relative bg-black flex items-center justify-center',
                settings.ratio === '9:16' ? 'aspect-[9/16] max-h-[500px]' :
                settings.ratio === '1:1' ? 'aspect-square' :
                'aspect-video'
              )}>
                {selectedVideo ? (
                  <img
                    src={selectedVideo.thumbnail}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500">No video selected</div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="icon"
                    className="w-16 h-16 bg-[#5869fc]/90 hover:bg-[#5869fc] rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                </div>

                {/* Subtitle Preview */}
                {settings.addSubtitles && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded">
                    <p className="text-white text-center">Subtitle preview text</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={selectedVideo?.duration || 100}
                    step={1}
                    onValueChange={(value) => setCurrentTime(value[0])}
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                    <span>{Math.floor((selectedVideo?.duration || 0) / 60)}:{((selectedVideo?.duration || 0) % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video List */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Your Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {editedVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={cn(
                      'relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all',
                      selectedVideo?.id === video.id
                        ? 'border-[#5869fc]'
                        : 'border-transparent hover:border-gray-600'
                    )}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                      <p className="text-white text-xs truncate">{video.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editing Panel */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#5869fc]" />
                AI Auto-Edit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-gradient-to-r from-[#5869fc] to-[#8b5cf6] hover:from-[#4558e6] hover:to-[#7c3aed] text-white"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Everything
                  </>
                )}
              </Button>
              <p className="text-gray-400 text-xs mt-2 text-center">
                Auto-generate title, description, and hashtags
              </p>
            </CardContent>
          </Card>

          {/* Aspect Ratio */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Ratio className="w-5 h-5" />
                Aspect Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSettings(prev => ({ ...prev, ratio: ratio.id }))}
                    className={cn(
                      'p-3 rounded-lg border text-center transition-all',
                      settings.ratio === ratio.id
                        ? 'border-[#5869fc] bg-[#5869fc]/10 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    )}
                  >
                    <div className={cn(
                      'w-6 h-6 mx-auto mb-1 border-2 rounded',
                      ratio.id === '9:16' ? 'border-current' :
                      ratio.id === '1:1' ? 'border-current aspect-square' :
                      'border-current aspect-video'
                    )} />
                    <span className="text-xs">{ratio.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subtitles */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Type className="w-5 h-5" />
                Subtitles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="subtitles" className="text-gray-300">
                  Auto-generate subtitles
                </Label>
                <Switch
                  id="subtitles"
                  checked={settings.addSubtitles}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, addSubtitles: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Music */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Music className="w-5 h-5" />
                Background Music
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={settings.musicTrack}
                onValueChange={(value) =>
                  setSettings(prev => ({ ...prev, musicTrack: value }))
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select music" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {musicTracks.map((track) => (
                    <SelectItem
                      key={track.id}
                      value={track.id}
                      className="text-white hover:bg-gray-700"
                    >
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Volume
                  </span>
                  <span className="text-white">{settings.volume}%</span>
                </div>
                <Slider
                  value={[settings.volume]}
                  max={100}
                  step={5}
                  onValueChange={(value) =>
                    setSettings(prev => ({ ...prev, volume: value[0] }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Generated Content */}
          {(generated.title || isGenerating) && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <AlignLeft className="w-5 h-5" />
                  Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-400 text-sm">Title</Label>
                  <Input
                    value={generated.title}
                    onChange={(e) =>
                      setGenerated(prev => ({ ...prev, title: e.target.value }))
                    }
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Description</Label>
                  <Textarea
                    value={generated.description}
                    onChange={(e) =>
                      setGenerated(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-gray-400 text-sm flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Hashtags
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {generated.hashtags.map((hashtag) => (
                      <Badge
                        key={hashtag}
                        variant="secondary"
                        className="bg-[#5869fc]/20 text-[#5869fc] cursor-pointer hover:bg-[#5869fc]/30"
                        onClick={() => toggleHashtag(hashtag)}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Upload</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose when and where to upload your video
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Platforms */}
            <div>
              <Label className="text-gray-300 mb-2 block">Select Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {['YouTube', 'TikTok', 'Instagram', 'Facebook'].map((platform) => (
                  <Button
                    key={platform}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPlatforms(prev =>
                        prev.includes(platform)
                          ? prev.filter(p => p !== platform)
                          : [...prev, platform]
                      );
                    }}
                    className={cn(
                      'border-gray-700',
                      selectedPlatforms.includes(platform)
                        ? 'bg-[#5869fc] text-white border-[#5869fc]'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    {selectedPlatforms.includes(platform) && (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    {platform}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Date</Label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Time</Label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Upload Summary</h4>
              <p className="text-gray-400 text-sm">{selectedVideo?.title}</p>
              <p className="text-gray-500 text-sm mt-1">
                {selectedPlatforms.length} platforms • {settings.ratio} ratio
                {settings.addSubtitles && ' • With subtitles'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowScheduleDialog(false)}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={selectedPlatforms.length === 0 || !scheduleDate || !scheduleTime}
              className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
