import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Search,
  Filter,
  Download,
  Play,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Youtube,
  Music,
  Instagram,
  Facebook,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { Video } from '@/types';

const platforms = [
  { id: 'all', name: 'All Platforms', icon: Filter },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'tiktok', name: 'TikTok', icon: Music },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
];

export function VideoDiscovery() {
  const { videos, updateVideo, addEditedVideo, setActiveTab } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [viralThreshold, setViralThreshold] = useState([70]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || video.platform === selectedPlatform;
    const matchesThreshold = video.viralScore >= viralThreshold[0];
    return matchesSearch && matchesPlatform && matchesThreshold;
  });

  const handleDownload = async (video: Video) => {
    setSelectedVideo(video);
    setShowDownloadDialog(true);
    setIsDownloading(true);
    
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    updateVideo(video.id, { 
      downloaded: true, 
      localPath: `/downloads/${video.id}.mp4` 
    });
    
    setIsDownloading(false);
    setShowDownloadDialog(false);
  };

  const handleAutoEdit = (video: Video) => {
    // Create edited video entry
    const editedVideo = {
      id: `e${Date.now()}`,
      originalVideoId: video.id,
      title: `${video.title} (Short Version)`,
      description: video.description,
      thumbnail: video.thumbnail,
      localPath: video.localPath || `/downloads/${video.id}.mp4`,
      duration: Math.min(video.duration, 60),
      ratio: '9:16' as const,
      hasSubtitles: true,
      musicSource: 'YouTube Audio Library',
      viralSegments: [
        { startTime: 0, endTime: Math.min(video.duration, 60), score: video.viralScore, reason: 'High engagement' }
      ],
      hashtags: ['#viral', '#trending', '#contentcreator'],
      status: 'editing' as const,
      createdAt: new Date(),
    };
    
    addEditedVideo(editedVideo);
    setActiveTab('editor');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'tiktok': return <Music className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      default: return null;
    }
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-400/10';
    if (score >= 80) return 'text-[#5869fc] bg-[#5869fc]/10';
    if (score >= 70) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Video Discovery</h1>
          <p className="text-gray-400 mt-1">
            Discover viral videos from multiple platforms
          </p>
        </div>
        <Badge className="bg-[#5869fc]/20 text-[#5869fc] border-[#5869fc]/30">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Platform Filter */}
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <SelectItem
                      key={platform.id}
                      value={platform.id}
                      className="text-white hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {platform.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Viral Score Filter */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <span className="text-gray-400 text-sm whitespace-nowrap">
                Min Score: {viralThreshold[0]}
              </span>
              <Slider
                value={viralThreshold}
                onValueChange={setViralThreshold}
                max={100}
                step={5}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Found <span className="text-white font-medium">{filteredVideos.length}</span> videos
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <Card
            key={video.id}
            className="bg-gray-900 border-gray-800 overflow-hidden group hover:border-[#5869fc]/50 transition-all duration-300"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="icon" className="bg-[#5869fc] hover:bg-[#4558e6]">
                  <Play className="w-5 h-5" />
                </Button>
              </div>
              <div className="absolute top-2 right-2">
                <Badge className={cn('font-bold', getViralScoreColor(video.viralScore))}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {video.viralScore}
                </Badge>
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-black/70 text-white">
                  {getPlatformIcon(video.platform)}
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-black/70 text-white">
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-4">
              <h3 className="text-white font-medium line-clamp-2 group-hover:text-[#5869fc] transition-colors">
                {video.title}
              </h3>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {video.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {(video.views / 1000000).toFixed(1)}M
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {(video.likes / 1000).toFixed(0)}K
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  {(video.shares / 1000).toFixed(0)}K
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                {video.downloaded ? (
                  <Button
                    className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    onClick={() => handleAutoEdit(video)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Downloaded
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-[#5869fc] hover:bg-[#4558e6] text-white"
                    onClick={() => handleDownload(video)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                {video.downloaded && (
                  <Button
                    variant="outline"
                    className="border-[#5869fc] text-[#5869fc] hover:bg-[#5869fc]/10"
                    onClick={() => handleAutoEdit(video)}
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Download Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Downloading Video</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please wait while we download and process the video
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center">
            {isDownloading ? (
              <>
                <Loader2 className="w-12 h-12 text-[#5869fc] animate-spin" />
                <p className="mt-4 text-gray-300">Downloading video...</p>
                <p className="text-gray-500 text-sm">{selectedVideo?.title}</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <p className="mt-4 text-green-400">Download complete!</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
