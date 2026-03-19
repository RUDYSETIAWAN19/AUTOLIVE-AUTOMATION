import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Heart,
  Calendar,
  TrendingUp,
  Video,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const chartData = [
  { name: 'Mon', views: 4000, engagement: 2400 },
  { name: 'Tue', views: 3000, engagement: 1398 },
  { name: 'Wed', views: 2000, engagement: 9800 },
  { name: 'Thu', views: 2780, engagement: 3908 },
  { name: 'Fri', views: 1890, engagement: 4800 },
  { name: 'Sat', views: 2390, engagement: 3800 },
  { name: 'Sun', views: 3490, engagement: 4300 },
];

const recentActivity = [
  {
    id: 1,
    type: 'upload_success',
    title: 'Video uploaded successfully',
    description: 'Cara Membuat Konten Viral uploaded to 3 platforms',
    time: '2 hours ago',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 2,
    type: 'schedule',
    title: 'New schedule created',
    description: 'Rahasia Algorithm Revealed scheduled for tomorrow',
    time: '5 hours ago',
    icon: Calendar,
    color: 'text-[#5869fc]',
    bgColor: 'bg-[#5869fc]/10',
  },
  {
    id: 3,
    type: 'viral_detected',
    title: 'Viral content detected',
    description: 'Found video with 92 viral score on YouTube',
    time: '1 day ago',
    icon: TrendingUp,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 4,
    type: 'upload_failed',
    title: 'Upload failed',
    description: 'Failed to upload to Instagram - Auth expired',
    time: '2 days ago',
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
];

export function Dashboard() {
  const { stats, user, setActiveTab } = useStore();

  const statCards = [
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Engagement Rate',
      value: `${stats.engagementRate}%`,
      change: '+2.3%',
      trend: 'up',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Scheduled Posts',
      value: stats.scheduledPosts.toString(),
      change: '+3',
      trend: 'up',
      icon: Calendar,
      color: 'from-[#5869fc] to-[#4558e6]',
    },
    {
      title: 'Follower Growth',
      value: `+${stats.followerGrowth}%`,
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Good morning, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-400 mt-1">
            Here's what's happening with your content today.
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#5869fc] to-[#8b5cf6] hover:from-[#4558e6] hover:to-[#7c3aed] text-white gap-2"
          onClick={() => setActiveTab('videos')}
        >
          <Zap className="w-4 h-4" />
          Create Automation
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card
              key={index}
              className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300 group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                    stat.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  )}>
                    <TrendIcon className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Performance Overview</CardTitle>
              <p className="text-gray-400 text-sm mt-1">Views and engagement over time</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-gray-700 text-gray-300">
                <div className="w-2 h-2 rounded-full bg-[#5869fc] mr-2" />
                Views
              </Badge>
              <Badge variant="outline" className="border-gray-700 text-gray-300">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                Engagement
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5869fc" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5869fc" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#5869fc"
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorEngagement)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <p className="text-gray-400 text-sm mt-1">Latest updates and events</p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer group"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      activity.bgColor
                    )}>
                      <Icon className={cn('w-5 h-5', activity.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm group-hover:text-[#5869fc] transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                        {activity.description}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Uploaded Videos</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.uploadedVideos}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <Progress value={75} className="mt-4 h-2 bg-gray-800" />
            <p className="text-gray-500 text-xs mt-2">75% of monthly quota used</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Uploads</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.pendingUploads}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#5869fc]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#5869fc]" />
              </div>
            </div>
            <Progress value={30} className="mt-4 h-2 bg-gray-800" />
            <p className="text-gray-500 text-xs mt-2">Next upload in 2 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Failed Uploads</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.failedUploads}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <Progress value={10} className="mt-4 h-2 bg-gray-800" />
            <p className="text-gray-500 text-xs mt-2">Requires your attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
