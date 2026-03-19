import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Phone,
  Bell,
  CreditCard,
  Youtube,
  Music,
  Instagram,
  Facebook,
  Twitter,
  Check,
  Link,
  Unlink,
  Crown,
  Zap,
  Save,
  Loader2,
} from 'lucide-react';

const platformConfigs = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', description: 'Connect your YouTube channel' },
  { id: 'tiktok', name: 'TikTok', icon: Music, color: '#000000', description: 'Connect your TikTok account' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', description: 'Connect your Instagram account' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', description: 'Connect your Facebook page' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2', description: 'Connect your Twitter account' },
];

export function Settings() {
  const { user, platforms, connectPlatform, disconnectPlatform, updateUser } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: user?.settings.notifications.email ?? true,
    whatsapp: user?.settings.notifications.whatsapp ?? true,
    uploadSuccess: user?.settings.notifications.uploadSuccess ?? true,
    uploadFailed: user?.settings.notifications.uploadFailed ?? true,
    scheduleReminder: user?.settings.notifications.scheduleReminder ?? true,
  });

  const [automationSettings, setAutomationSettings] = useState({
    autoCleanup: user?.settings.autoCleanup ?? true,
    preferredVideoRatio: user?.settings.preferredVideoRatio || '9:16',
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateUser({
      name: profileForm.name,
      email: profileForm.email,
      whatsapp: profileForm.whatsapp,
    });
    setIsSaving(false);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateUser({
      settings: {
        ...user!.settings,
        notifications: notificationSettings,
      },
    });
    setIsSaving(false);
  };

  const handleSaveAutomation = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateUser({
      settings: {
        ...user!.settings,
        ...automationSettings,
      },
    });
    setIsSaving(false);
  };

  const handleDisconnect = () => {
    if (selectedPlatform) {
      disconnectPlatform(selectedPlatform.id);
      setShowDisconnectDialog(false);
      setSelectedPlatform(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">
          Manage your account, notifications, and connected platforms
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800 flex-wrap h-auto gap-2 p-2">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#5869fc]">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="platforms" className="data-[state=active]:bg-[#5869fc]">
            <Link className="w-4 h-4 mr-2" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#5869fc]">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-[#5869fc]">
            <Zap className="w-4 h-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-[#5869fc]">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5869fc] to-[#8b5cf6] flex items-center justify-center text-2xl font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    Change Avatar
                  </Button>
                  <p className="text-gray-500 text-sm mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-800" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Full Name</Label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email Address</Label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">WhatsApp Number</Label>
                  <Input
                    value={profileForm.whatsapp}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="+6281234567890"
                  />
                  <p className="text-gray-500 text-xs">
                    Used for WhatsApp notifications
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Connected Platforms</CardTitle>
              <CardDescription className="text-gray-400">
                Connect your social media accounts for automatic uploads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {platformConfigs.map((platform) => {
                const connectedPlatform = platforms.find(p => p.name === platform.name);
                const isConnected = connectedPlatform?.connected;
                const Icon = platform.icon;

                return (
                  <div
                    key={platform.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border transition-all',
                      isConnected
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-gray-700 bg-gray-800/50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${platform.color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: platform.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{platform.name}</h4>
                          {isConnected && (
                            <Badge className="bg-green-500/20 text-green-400">
                              <Check className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{platform.description}</p>
                        {isConnected && connectedPlatform?.username && (
                          <p className="text-gray-500 text-xs mt-1">
                            @{connectedPlatform.username} • {connectedPlatform.followers?.toLocaleString()} followers
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={isConnected ? 'outline' : 'default'}
                      onClick={() => {
                        if (isConnected) {
                          setSelectedPlatform(connectedPlatform);
                          setShowDisconnectDialog(true);
                        } else {
                          connectPlatform(platform.id);
                        }
                      }}
                      className={cn(
                        isConnected
                          ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                          : 'bg-[#5869fc] hover:bg-[#4558e6] text-white'
                      )}
                    >
                      {isConnected ? (
                        <>
                          <Unlink className="w-4 h-4 mr-2" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-gray-400">
                Choose how you want to be notified about your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#5869fc]" />
                  Email Notifications
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Upload Success</p>
                      <p className="text-gray-400 text-sm">Get notified when your video is uploaded successfully</p>
                    </div>
                    <Switch
                      checked={notificationSettings.uploadSuccess}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, uploadSuccess: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Upload Failed</p>
                      <p className="text-gray-400 text-sm">Get notified when an upload fails with error details</p>
                    </div>
                    <Switch
                      checked={notificationSettings.uploadFailed}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, uploadFailed: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Schedule Reminders</p>
                      <p className="text-gray-400 text-sm">Get reminded before scheduled uploads</p>
                    </div>
                    <Switch
                      checked={notificationSettings.scheduleReminder}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, scheduleReminder: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-800" />

              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  WhatsApp Notifications
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Enable WhatsApp</p>
                      <p className="text-gray-400 text-sm">Receive notifications via WhatsApp</p>
                    </div>
                    <Switch
                      checked={notificationSettings.whatsapp}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, whatsapp: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Automation Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Configure default settings for automated workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Auto Cleanup</p>
                  <p className="text-gray-400 text-sm">
                    Automatically delete downloaded and edited files after successful upload
                  </p>
                </div>
                <Switch
                  checked={automationSettings.autoCleanup}
                  onCheckedChange={(checked) =>
                    setAutomationSettings(prev => ({ ...prev, autoCleanup: checked }))
                  }
                />
              </div>

              <Separator className="bg-gray-800" />

              <div className="space-y-2">
                <Label className="text-gray-300">Default Video Ratio</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['9:16', '1:1', '16:9'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAutomationSettings(prev => ({ ...prev, preferredVideoRatio: ratio as any }))}
                      className={cn(
                        'p-3 rounded-lg border text-center transition-all',
                        automationSettings.preferredVideoRatio === ratio
                          ? 'border-[#5869fc] bg-[#5869fc]/10 text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      )}
                    >
                      <div className={cn(
                        'w-6 h-6 mx-auto mb-1 border-2 rounded',
                        ratio === '9:16' ? 'border-current' :
                        ratio === '1:1' ? 'border-current aspect-square' :
                        'border-current aspect-video'
                      )} />
                      <span className="text-sm">{ratio}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAutomation}
                  disabled={isSaving}
                  className="bg-[#5869fc] hover:bg-[#4558e6] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Subscription Plan</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={cn(
                'p-6 rounded-xl border-2',
                user?.plan === 'pro'
                  ? 'border-[#5869fc] bg-[#5869fc]/5'
                  : 'border-gray-700 bg-gray-800/50'
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white text-xl font-bold capitalize">{user?.plan} Plan</h4>
                      {user?.plan === 'pro' && (
                        <Badge className="bg-[#5869fc] text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 mt-1">
                      {user?.plan === 'free' ? 'Basic features for getting started' :
                       user?.plan === 'pro' ? 'Advanced features for serious creators' :
                       'Enterprise-grade features for teams'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">
                      {user?.plan === 'free' ? '$0' :
                       user?.plan === 'pro' ? '$29' :
                       '$99'}
                      <span className="text-gray-400 text-lg">/mo</span>
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-700 my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Unlimited video downloads',
                    'AI-powered editing',
                    'Multi-platform uploads',
                    'Advanced analytics',
                    'Priority support',
                    'Custom branding',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {user?.plan === 'free' && (
                  <Button className="w-full mt-6 bg-[#5869fc] hover:bg-[#4558e6] text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disconnect Dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Disconnect Platform</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to disconnect {selectedPlatform?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisconnectDialog(false)}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Unlink className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
