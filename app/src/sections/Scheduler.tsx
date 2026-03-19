import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
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
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Plus,
  Youtube,
  Music,
  Instagram,
  Facebook,
  AlertCircle,
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

const platformIcons: Record<string, React.ElementType> = {
  YouTube: Youtube,
  TikTok: Music,
  Instagram: Instagram,
  Facebook: Facebook,
};

const statusConfig = {
  pending: { color: 'text-yellow-400 bg-yellow-400/10', icon: Clock, label: 'Pending' },
  processing: { color: 'text-[#5869fc] bg-[#5869fc]/10', icon: Loader2, label: 'Processing' },
  completed: { color: 'text-green-400 bg-green-400/10', icon: CheckCircle, label: 'Completed' },
  failed: { color: 'text-red-400 bg-red-400/10', icon: XCircle, label: 'Failed' },
};

export function Scheduler() {
  const { schedules, editedVideos, platforms, deleteSchedule } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // Create schedule form state
  const [newSchedule, setNewSchedule] = useState({
    videoId: '',
    platforms: [] as string[],
    date: '',
    time: '',
  });

  const scheduledDates = schedules.map(s => new Date(s.scheduledTime));

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.scheduledTime);
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleCreateSchedule = () => {
    if (newSchedule.videoId && newSchedule.platforms.length > 0 && newSchedule.date && newSchedule.time) {
      const scheduledDateTime = new Date(`${newSchedule.date}T${newSchedule.time}`);
      
      const schedule = {
        id: `s${Date.now()}`,
        videoId: newSchedule.videoId,
        platforms: newSchedule.platforms,
        scheduledTime: scheduledDateTime,
        status: 'pending' as const,
        createdAt: new Date(),
      };
      
      // Add schedule to store
      const { addSchedule } = useStore.getState();
      addSchedule(schedule);
      
      // Update video status
      const { updateEditedVideo } = useStore.getState();
      updateEditedVideo(newSchedule.videoId, { status: 'scheduled' });
      
      setShowCreateDialog(false);
      setNewSchedule({ videoId: '', platforms: [], date: '', time: '' });
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    deleteSchedule(scheduleId);
    setShowDetailDialog(false);
  };

  const togglePlatform = (platform: string) => {
    setNewSchedule(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const getVideoById = (videoId: string) => {
    return editedVideos.find(v => v.id === videoId);
  };

  const getRelativeDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const daySchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Scheduler</h1>
          <p className="text-gray-400 mt-1">
            Plan and schedule your content uploads
          </p>
        </div>
        <Button
          className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border-gray-800"
              modifiers={{
                scheduled: scheduledDates,
              }}
              modifiersStyles={{
                scheduled: {
                  backgroundColor: 'rgba(88, 105, 252, 0.2)',
                  color: '#5869fc',
                  fontWeight: 'bold',
                },
              }}
            />
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#5869fc]/20 border border-[#5869fc]" />
                <span className="text-gray-400">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500" />
                <span className="text-gray-400">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule List */}
        <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">
                {selectedDate ? (
                  <>
                    Schedules for{' '}
                    <span className="text-[#5869fc]">
                      {getRelativeDateLabel(selectedDate)}
                    </span>
                  </>
                ) : (
                  'All Schedules'
                )}
              </CardTitle>
              <Badge className="bg-gray-800 text-gray-300">
                {daySchedules.length} schedules
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {daySchedules.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No schedules for this date</p>
                <Button
                  variant="outline"
                  className="mt-4 border-gray-700 text-gray-300"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Schedule
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {daySchedules.map((schedule) => {
                  const video = getVideoById(schedule.videoId);
                  const status = statusConfig[schedule.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={schedule.id}
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setShowDetailDialog(true);
                      }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-all group"
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={video?.thumbnail}
                          alt={video?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate group-hover:text-[#5869fc] transition-colors">
                          {video?.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-400 text-sm">
                            {format(new Date(schedule.scheduledTime), 'h:mm a')}
                          </span>
                          <span className="text-gray-600">•</span>
                          <div className="flex gap-1">
                            {schedule.platforms.map((platform) => {
                              const Icon = platformIcons[platform];
                              return Icon ? (
                                <Icon key={platform} className="w-4 h-4 text-gray-400" />
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <Badge className={cn('flex items-center gap-1', status.color)}>
                        <StatusIcon className={cn('w-3 h-3', schedule.status === 'processing' && 'animate-spin')} />
                        {status.label}
                      </Badge>

                      {/* Actions */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchedule(schedule.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedules */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Upcoming Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {schedules
              .filter(s => s.status === 'pending')
              .slice(0, 4)
              .map((schedule) => {
                const video = getVideoById(schedule.videoId);
                return (
                  <Card key={schedule.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="aspect-video rounded-lg overflow-hidden mb-3">
                        <img
                          src={video?.thumbnail}
                          alt={video?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="text-white font-medium text-sm line-clamp-2">
                        {video?.title}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-xs">
                          {format(new Date(schedule.scheduledTime), 'MMM d, h:mm a')}
                        </span>
                        <div className="flex gap-1">
                          {schedule.platforms.slice(0, 3).map((platform) => {
                            const Icon = platformIcons[platform];
                            return Icon ? (
                              <Icon key={platform} className="w-3 h-3 text-gray-400" />
                            ) : null;
                          })}
                          {schedule.platforms.length > 3 && (
                            <span className="text-gray-400 text-xs">
                              +{schedule.platforms.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Create Schedule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription className="text-gray-400">
              Schedule your content for automatic upload
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Video Selection */}
            <div>
              <Label className="text-gray-300 mb-2 block">Select Video</Label>
              <Select
                value={newSchedule.videoId}
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, videoId: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Choose a video" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {editedVideos
                    .filter(v => v.status === 'ready' || v.status === 'editing')
                    .map((video) => (
                      <SelectItem
                        key={video.id}
                        value={video.id}
                        className="text-white hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          {video.title}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platforms */}
            <div>
              <Label className="text-gray-300 mb-2 block">Select Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {platforms.filter(p => p.connected).map((platform) => (
                  <Button
                    key={platform.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => togglePlatform(platform.name)}
                    className={cn(
                      'border-gray-700',
                      newSchedule.platforms.includes(platform.name)
                        ? 'bg-[#5869fc] text-white border-[#5869fc]'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    {newSchedule.platforms.includes(platform.name) && (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    {platform.name}
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
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Time</Label>
                <Input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSchedule}
              disabled={!newSchedule.videoId || newSchedule.platforms.length === 0 || !newSchedule.date || !newSchedule.time}
              className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
          {selectedSchedule && (
            <>
              <DialogHeader>
                <DialogTitle>Schedule Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {(() => {
                  const video = getVideoById(selectedSchedule.videoId);
                  const status = statusConfig[selectedSchedule.status as keyof typeof statusConfig];

                  return (
                    <>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={video?.thumbnail}
                          alt={video?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <h4 className="text-white font-medium text-lg">{video?.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{video?.description}</p>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status</span>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Scheduled Time</span>
                          <span className="text-white">
                            {format(new Date(selectedSchedule.scheduledTime), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platforms</span>
                          <div className="flex gap-1">
                            {selectedSchedule.platforms.map((platform: string) => (
                              <span key={platform} className="text-white">{platform}</span>
                            ))}
                          </div>
                        </div>
                        {selectedSchedule.errorMessage && (
                          <div className="flex items-start gap-2 mt-2 p-2 bg-red-500/10 rounded">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-red-400 text-sm">{selectedSchedule.errorMessage}</span>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailDialog(false)}
                  className="border-gray-700 text-gray-300"
                >
                  Close
                </Button>
                {selectedSchedule.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Schedule
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
