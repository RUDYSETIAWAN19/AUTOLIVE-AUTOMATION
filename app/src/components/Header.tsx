import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Bell,
  Plus,
  Crown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const { user, isSidebarOpen, unreadCount, notifications, markNotificationAsRead, setActiveTab } = useStore();

  const recentNotifications = notifications.slice(0, 5);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-black/80 backdrop-blur-xl border-b border-gray-800 transition-all duration-300',
        isSidebarOpen ? 'left-64' : 'left-20'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search videos, schedules, or analytics..."
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#5869fc] focus:ring-[#5869fc]/20"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Upgrade Button */}
          {user?.plan === 'free' && (
            <Button
              className="bg-gradient-to-r from-[#5869fc] to-[#8b5cf6] hover:from-[#4558e6] hover:to-[#7c3aed] text-white gap-2"
              onClick={() => setActiveTab('settings')}
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </Button>
          )}

          {/* Create New */}
          <Button
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800 gap-2"
            onClick={() => setActiveTab('videos')}
          >
            <Plus className="w-4 h-4" />
            New Automation
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#5869fc] rounded-full text-xs flex items-center justify-center text-white font-medium">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-gray-900 border-gray-800">
              <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              {recentNotifications.length === 0 ? (
                <div className="py-4 text-center text-gray-400 text-sm">
                  No notifications
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      'flex flex-col items-start p-3 cursor-pointer hover:bg-gray-800',
                      !notification.read && 'bg-[#5869fc]/10'
                    )}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        notification.type === 'upload_success' ? 'bg-green-500' :
                        notification.type === 'upload_failed' ? 'bg-red-500' :
                        'bg-[#5869fc]'
                      )} />
                      <span className="font-medium text-white text-sm flex-1">
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <Badge className="bg-[#5869fc] text-white text-[10px]">New</Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-gray-500 text-xs mt-1">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                className="text-center text-[#5869fc] cursor-pointer hover:bg-gray-800"
                onClick={() => setActiveTab('notifications')}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 hover:bg-gray-800">
                <Avatar className="w-8 h-8 border border-gray-700">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gray-800 text-white text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
              <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                onClick={() => setActiveTab('settings')}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 cursor-pointer"
                onClick={() => useStore.getState().logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
