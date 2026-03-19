import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Auth } from '@/pages/Auth';
import { Dashboard } from '@/sections/Dashboard';
import { VideoDiscovery } from '@/sections/VideoDiscovery';
import { VideoEditor } from '@/sections/VideoEditor';
import { MusicEditor } from '@/sections/MusicEditor';
import { Scheduler } from '@/sections/Scheduler';
import { Notifications } from '@/sections/Notifications';
import { Analytics } from '@/sections/Analytics';
import { Settings } from '@/sections/Settings';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { isAuthenticated, activeTab, isSidebarOpen } = useStore();

  if (!isAuthenticated) {
    return (
      <>
        <Auth />
        <Toaster />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'videos':
        return <VideoDiscovery />;
      case 'editor':
        return <VideoEditor />;
      case 'music':
        return <MusicEditor />;
      case 'schedule':
        return <Scheduler />;
      case 'notifications':
        return <Notifications />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <Header />
      
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          isSidebarOpen ? 'pl-64' : 'pl-20'
        )}
      >
        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
