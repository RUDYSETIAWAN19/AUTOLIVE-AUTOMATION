import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bell,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  Check,
  ExternalLink,
  Youtube,
  Music,
  Instagram,
  Facebook,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';

const platformIcons: Record<string, React.ElementType> = {
  youtube: Youtube,
  tiktok: Music,
  instagram: Instagram,
  facebook: Facebook,
};

const typeConfig = {
  upload_success: {
    color: 'text-green-400 bg-green-400/10 border-green-400/30',
    icon: CheckCircle,
    label: 'Upload Success',
  },
  upload_failed: {
    color: 'text-red-400 bg-red-400/10 border-red-400/30',
    icon: XCircle,
    label: 'Upload Failed',
  },
  schedule_reminder: {
    color: 'text-[#5869fc] bg-[#5869fc]/10 border-[#5869fc]/30',
    icon: Clock,
    label: 'Schedule Reminder',
  },
  system: {
    color: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
    icon: AlertCircle,
    label: 'System',
  },
};

export function Notifications() {
  const { notifications, markNotificationAsRead, deleteNotification, user } = useStore();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || (filter === 'unread' && !n.read)
  );

  const unreadCount = notifications.filter(n => !n.read).length;
  const emailNotifications = notifications.filter(n => n.sentToEmail);
  const whatsappNotifications = notifications.filter(n => n.sentToWhatsApp);

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setShowDetailDialog(true);
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
  };

  const renderNotificationCard = (notification: any) => {
    const type = typeConfig[notification.type as keyof typeof typeConfig];
    const TypeIcon = type.icon;

    return (
      <div
        key={notification.id}
        onClick={() => handleNotificationClick(notification)}
        className={cn(
          'p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]',
          type.color,
          !notification.read && 'ring-2 ring-[#5869fc]/50',
          notification.read && 'opacity-70'
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', type.color)}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium truncate">{notification.title}</h4>
              <div className="flex items-center gap-2">
                {notification.sentToEmail && (
                  <Mail className="w-4 h-4 text-gray-400" />
                )}
                {notification.sentToWhatsApp && (
                  <MessageCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{notification.message}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-500 text-xs">
                {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
              </span>
              {!notification.read && (
                <Badge className="bg-[#5869fc] text-white text-xs">New</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 mt-1">
            Stay updated on your content uploads and schedules
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={cn(
              'border-gray-700',
              filter === 'unread' && 'bg-[#5869fc]/20 border-[#5869fc]'
            )}
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          >
            <Filter className="w-4 h-4 mr-2" />
            {filter === 'all' ? 'Show Unread' : 'Show All'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300"
              onClick={() => notifications.filter(n => !n.read).forEach(n => markNotificationAsRead(n.id))}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#5869fc]/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#5869fc]" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-white text-xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#5869fc]/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#5869fc]" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email Sent</p>
                <p className="text-white text-xl font-bold">{emailNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">WhatsApp Sent</p>
                <p className="text-white text-xl font-bold">{whatsappNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Unread</p>
                <p className="text-white text-xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#5869fc]">
            All Notifications
          </TabsTrigger>
          <TabsTrigger value="uploads" className="data-[state=active]:bg-[#5869fc]">
            Uploads
          </TabsTrigger>
          <TabsTrigger value="reminders" className="data-[state=active]:bg-[#5869fc]">
            Reminders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No notifications yet</p>
              </div>
            ) : (
              filteredNotifications.map(renderNotificationCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="uploads" className="mt-4">
          <div className="grid gap-3">
            {filteredNotifications
              .filter(n => n.type === 'upload_success' || n.type === 'upload_failed')
              .map(renderNotificationCard)}
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="mt-4">
          <div className="grid gap-3">
            {filteredNotifications
              .filter(n => n.type === 'schedule_reminder')
              .map(renderNotificationCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Notification Settings */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#5869fc]" />
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">WhatsApp Notifications</p>
                    <p className="text-gray-400 text-sm">{user?.whatsapp}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm mb-3">You will receive notifications for:</p>
              <div className="space-y-2">
                {[
                  'Upload success with platform links',
                  'Upload failures with detailed error reasons',
                  'Schedule reminders (1 hour before)',
                  'Automation status updates',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const type = typeConfig[selectedNotification.type as keyof typeof typeConfig];
                    const TypeIcon = type.icon;
                    return (
                      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', type.color)}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                    );
                  })()}
                  <div>
                    <DialogTitle>{selectedNotification.title}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {format(new Date(selectedNotification.createdAt), 'MMMM d, yyyy h:mm a')}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <p className="text-gray-300">{selectedNotification.message}</p>

                {selectedNotification.details && (
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    {selectedNotification.details.videoTitle && (
                      <div>
                        <span className="text-gray-400 text-sm">Video Title</span>
                        <p className="text-white">{selectedNotification.details.videoTitle}</p>
                      </div>
                    )}

                    {selectedNotification.details.platforms && (
                      <div>
                        <span className="text-gray-400 text-sm">Platforms</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedNotification.details.platforms.map((platform: string) => (
                            <Badge key={platform} className="bg-gray-700 text-white">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedNotification.details.urls && (
                      <div>
                        <span className="text-gray-400 text-sm">Links</span>
                        <div className="space-y-1 mt-1">
                          {Object.entries(selectedNotification.details.urls).map(([platform, url]: [string, any]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#5869fc] hover:underline text-sm"
                            >
                              {(() => {
                                const Icon = platformIcons[platform];
                                return Icon ? <Icon className="w-4 h-4" /> : null;
                              })()}
                              View on {platform.charAt(0).toUpperCase() + platform.slice(1)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedNotification.details.reason && (
                      <div>
                        <span className="text-gray-400 text-sm">Reason</span>
                        <p className="text-red-400 text-sm mt-1">{selectedNotification.details.reason}</p>
                      </div>
                    )}

                    {selectedNotification.details.errorCode && (
                      <div>
                        <span className="text-gray-400 text-sm">Error Code</span>
                        <code className="text-red-400 text-sm bg-red-500/10 px-2 py-1 rounded mt-1 block">
                          {selectedNotification.details.errorCode}
                        </code>
                      </div>
                    )}

                    {selectedNotification.details.scheduledTime && (
                      <div>
                        <span className="text-gray-400 text-sm">Scheduled Time</span>
                        <p className="text-white">
                          {format(new Date(selectedNotification.details.scheduledTime), 'MMMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className={selectedNotification.sentToEmail ? 'text-green-400' : 'text-gray-500'}>
                      {selectedNotification.sentToEmail ? 'Sent to email' : 'Not sent to email'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className={selectedNotification.sentToWhatsApp ? 'text-green-400' : 'text-gray-500'}>
                      {selectedNotification.sentToWhatsApp ? 'Sent to WhatsApp' : 'Not sent to WhatsApp'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => deleteNotification(selectedNotification.id)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  onClick={() => setShowDetailDialog(false)}
                  className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
