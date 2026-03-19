import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Video,
  Calendar,
  Settings,
  Bell,
  Zap,
  Music,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'videos', label: 'Video Discovery', icon: Video },
  { id: 'editor', label: 'Video Editor', icon: Zap },
  { id: 'music', label: 'Music Editor', icon: Music },
  { id: 'schedule', label: 'Scheduler', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { user, isSidebarOpen, toggleSidebar, activeTab, setActiveTab, logout, unreadCount } = useStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-black border-r border-gray-800 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <div className={cn('flex items-center gap-3', !isSidebarOpen && 'justify-center w-full')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5869fc] to-[#8b5cf6] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && (
            <span className="text-lg font-bold text-white">ViralContent</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            'text-gray-400 hover:text-white hover:bg-gray-800',
            !isSidebarOpen && 'hidden'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Toggle Button when collapsed */}
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-[#5869fc] text-white hover:bg-[#4558e6]"
        >
          <ChevronRight className="w-3 h-3" />
        </Button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const hasBadge = item.id === 'notifications' && unreadCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-[#5869fc]/20 to-transparent text-[#5869fc] border-l-2 border-[#5869fc]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
                !isSidebarOpen && 'justify-center'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-[#5869fc]')} />
              {isSidebarOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {hasBadge && (
                <Badge
                  className={cn(
                    'bg-[#5869fc] text-white text-xs min-w-[20px] h-5 flex items-center justify-center',
                    !isSidebarOpen && 'absolute -top-1 -right-1'
                  )}
                >
                  {unreadCount}
                </Badge>
              )}
              
              {/* Tooltip when collapsed */}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div
          className={cn(
            'flex items-center gap-3',
            !isSidebarOpen && 'justify-center'
          )}
        >
          <Avatar className="w-10 h-10 border-2 border-[#5869fc]">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gray-800 text-white">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.plan}</p>
            </div>
          )}
          {isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
