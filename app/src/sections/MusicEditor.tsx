import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Music,
  Play,
  Pause,
  Volume2,
  Wand2,
  Sparkles,
  Download,
  Plus,
  Type,
  TrendingUp,
  Clock,
  Check,
  Loader2,
  Save,
  Scissors,
} from 'lucide-react';
import { mockMusicTracks } from '@/data/mock';

export function MusicEditor() {
  const { setActiveTab } = useStore();
  const [selectedTrack] = useState(mockMusicTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Editing settings
  const [settings, setSettings] = useState({
    startTime: 0,
    endTime: 30,
    fadeIn: true,
    fadeOut: true,
    volume: 80,
    addSubtitles: true,
    subtitleStyle: 'modern',
  });

  // Viral segments detected by AI
  const [viralSegments, setViralSegments] = useState([
    { id: 1, startTime: 15, endTime: 30, score: 95, reason: 'Catchy chorus section' },
    { id: 2, startTime: 45, endTime: 60, score: 88, reason: 'High energy drop' },
    { id: 3, startTime: 90, endTime: 105, score: 82, reason: 'Emotional peak' },
  ]);

  const [selectedSegments, setSelectedSegments] = useState<number[]>([1]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  const toggleSegment = (segmentId: number) => {
    setSelectedSegments(prev =>
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const getWaveformHeight = (index: number) => {
    // Simulate waveform visualization
    return Math.sin(index * 0.5) * 20 + 30 + Math.random() * 20;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Music Editor</h1>
          <p className="text-gray-400 mt-1">
            Extract viral segments and create music shorts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>
          <Button
            className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Waveform Visualization */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              {/* Track Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#5869fc] to-purple-600 flex items-center justify-center">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{selectedTrack.title}</h3>
                    <p className="text-gray-400">{selectedTrack.artist}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-gray-800 text-gray-300">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor(selectedTrack.duration / 60)}:{(selectedTrack.duration % 60).toString().padStart(2, '0')}
                      </Badge>
                      <Badge className="bg-gray-800 text-gray-300">
                        {selectedTrack.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  size="icon"
                  className="w-12 h-12 rounded-full bg-[#5869fc] hover:bg-[#4558e6]"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
              </div>

              {/* Waveform */}
              <div className="relative h-32 bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1 rounded-full transition-all duration-300',
                        i >= (settings.startTime / selectedTrack.duration) * 100 &&
                        i <= (settings.endTime / selectedTrack.duration) * 100
                          ? 'bg-[#5869fc]'
                          : 'bg-gray-600'
                      )}
                      style={{
                        height: `${getWaveformHeight(i)}%`,
                      }}
                    />
                  ))}
                </div>

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                  style={{ left: `${(currentTime / selectedTrack.duration) * 100}%` }}
                />
              </div>

              {/* Time Display */}
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{Math.floor(settings.startTime / 60)}:{(settings.startTime % 60).toString().padStart(2, '0')}</span>
                <span className="text-white">
                  {Math.floor((settings.endTime - settings.startTime) / 60)}:
                  {((settings.endTime - settings.startTime) % 60).toString().padStart(2, '0')} selected
                </span>
                <span>{Math.floor(settings.endTime / 60)}:{(settings.endTime % 60).toString().padStart(2, '0')}</span>
              </div>

              {/* Trim Controls */}
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label className="text-gray-300">Start Time</Label>
                    <span className="text-white">{settings.startTime}s</span>
                  </div>
                  <Slider
                    value={[settings.startTime]}
                    max={selectedTrack.duration}
                    step={1}
                    onValueChange={(value) =>
                      setSettings(prev => ({ ...prev, startTime: value[0] }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label className="text-gray-300">End Time</Label>
                    <span className="text-white">{settings.endTime}s</span>
                  </div>
                  <Slider
                    value={[settings.endTime]}
                    max={selectedTrack.duration}
                    step={1}
                    onValueChange={(value) =>
                      setSettings(prev => ({ ...prev, endTime: value[0] }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Playback Controls */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-6">
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <Scissors className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                <div className="flex items-center gap-2 w-32">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <Slider
                    value={[settings.volume]}
                    max={100}
                    step={5}
                    onValueChange={(value) =>
                      setSettings(prev => ({ ...prev, volume: value[0] }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Analysis */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#5869fc]" />
                AI Viral Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-gradient-to-r from-[#5869fc] to-[#8b5cf6] hover:from-[#4558e6] hover:to-[#7c3aed] text-white"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Detect Viral Segments
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Viral Segments */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Viral Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {viralSegments.map((segment) => (
                  <div
                    key={segment.id}
                    onClick={() => toggleSegment(segment.id)}
                    className={cn(
                      'p-3 rounded-xl border cursor-pointer transition-all',
                      selectedSegments.includes(segment.id)
                        ? 'border-[#5869fc] bg-[#5869fc]/10'
                        : 'border-gray-700 hover:border-gray-600'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          selectedSegments.includes(segment.id)
                            ? 'bg-[#5869fc]'
                            : 'bg-gray-800'
                        )}>
                          {selectedSegments.includes(segment.id) ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-gray-400 text-sm">{segment.id}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {Math.floor(segment.startTime / 60)}:{(segment.startTime % 60).toString().padStart(2, '0')} - 
                            {Math.floor(segment.endTime / 60)}:{(segment.endTime % 60).toString().padStart(2, '0')}
                          </p>
                          <p className="text-gray-400 text-xs">{segment.reason}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">
                        {segment.score}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 border-gray-700 text-gray-300"
                onClick={() => {
                  const newSegment = {
                    id: viralSegments.length + 1,
                    startTime: 0,
                    endTime: 15,
                    score: 75,
                    reason: 'Custom segment',
                  };
                  setViralSegments([...viralSegments, newSegment]);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Segment
              </Button>
            </CardContent>
          </Card>

          {/* Subtitle Options */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Type className="w-5 h-5" />
                Subtitles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="subtitles" className="text-gray-300">
                  Add lyrics/subtitles
                </Label>
                <Switch
                  id="subtitles"
                  checked={settings.addSubtitles}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, addSubtitles: checked }))
                  }
                />
              </div>

              {settings.addSubtitles && (
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['modern', 'classic', 'minimal'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setSettings(prev => ({ ...prev, subtitleStyle: style }))}
                        className={cn(
                          'p-2 rounded-lg border text-xs capitalize transition-all',
                          settings.subtitleStyle === style
                            ? 'border-[#5869fc] bg-[#5869fc]/10 text-white'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audio Effects */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Audio Effects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="fadeIn" className="text-gray-300">
                  Fade In
                </Label>
                <Switch
                  id="fadeIn"
                  checked={settings.fadeIn}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, fadeIn: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="fadeOut" className="text-gray-300">
                  Fade Out
                </Label>
                <Switch
                  id="fadeOut"
                  checked={settings.fadeOut}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, fadeOut: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Export Music Short</DialogTitle>
            <DialogDescription className="text-gray-400">
              Export your edited music clip
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Export Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Track</span>
                  <span className="text-white">{selectedTrack.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">
                    {settings.endTime - settings.startTime}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Segments</span>
                  <span className="text-white">{selectedSegments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtitles</span>
                  <span className="text-white">{settings.addSubtitles ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
              onClick={() => {
                setShowExportDialog(false);
                setActiveTab('editor');
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export & Use in Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
