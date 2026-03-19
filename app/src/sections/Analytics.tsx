import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  Heart,
  Users,
  Calendar,
  Download,
  Youtube,
  Music,
  Instagram,
  Facebook,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const platformData = [
  { name: 'YouTube', views: 4500000, engagement: 8.5, followers: 125000, color: '#FF0000' },
  { name: 'TikTok', views: 3200000, engagement: 12.3, followers: 89000, color: '#000000' },
  { name: 'Instagram', views: 2800000, engagement: 6.8, followers: 67000, color: '#E4405F' },
  { name: 'Facebook', views: 1200000, engagement: 4.2, followers: 45000, color: '#1877F2' },
];

const viewsData = [
  { name: 'Mon', youtube: 4000, tiktok: 2400, instagram: 2400 },
  { name: 'Tue', youtube: 3000, tiktok: 1398, instagram: 2210 },
  { name: 'Wed', youtube: 2000, tiktok: 9800, instagram: 2290 },
  { name: 'Thu', youtube: 2780, tiktok: 3908, instagram: 2000 },
  { name: 'Fri', youtube: 1890, tiktok: 4800, instagram: 2181 },
  { name: 'Sat', youtube: 2390, tiktok: 3800, instagram: 2500 },
  { name: 'Sun', youtube: 3490, tiktok: 4300, instagram: 2100 },
];

const engagementData = [
  { name: 'Likes', value: 45, color: '#5869fc' },
  { name: 'Comments', value: 25, color: '#8b5cf6' },
  { name: 'Shares', value: 20, color: '#10b981' },
  { name: 'Saves', value: 10, color: '#f59e0b' },
];

const topVideos = [
  { id: 1, title: 'Cara Membuat Konten Viral', views: 2500000, engagement: 9.2, platform: 'YouTube' },
  { id: 2, title: 'Tutorial Edit Video Cepat', views: 1800000, engagement: 11.5, platform: 'TikTok' },
  { id: 3, title: 'Rahasia Algorithm', views: 1200000, engagement: 7.8, platform: 'Instagram' },
  { id: 4, title: 'Cara Dapat 100K Followers', views: 980000, engagement: 8.9, platform: 'YouTube' },
  { id: 5, title: 'Behind The Scene', views: 850000, engagement: 10.2, platform: 'TikTok' },
];

export function Analytics() {
  // Stats are available from store if needed
  // const { stats } = useStore();
  const [timeRange, setTimeRange] = useState('7d');

  const statCards = [
    {
      title: 'Total Views',
      value: '11.7M',
      change: '+23.5%',
      trend: 'up',
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Engagement Rate',
      value: '8.2%',
      change: '+1.5%',
      trend: 'up',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Total Followers',
      value: '326K',
      change: '+12.3%',
      trend: 'up',
      icon: Users,
      color: 'from-[#5869fc] to-[#4558e6]',
    },
    {
      title: 'Avg. Watch Time',
      value: '2:45',
      change: '-5.2%',
      trend: 'down',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">
            Track your content performance across all platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="24h" className="text-white">Last 24 Hours</SelectItem>
              <SelectItem value="7d" className="text-white">Last 7 Days</SelectItem>
              <SelectItem value="30d" className="text-white">Last 30 Days</SelectItem>
              <SelectItem value="90d" className="text-white">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-gray-700 text-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={index} className="bg-gray-900 border-gray-800">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Views by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewsData}>
                  <defs>
                    <linearGradient id="colorYoutube" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0000" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTiktok" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E4405F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E4405F" stopOpacity={0} />
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
                    dataKey="youtube"
                    stroke="#FF0000"
                    fillOpacity={1}
                    fill="url(#colorYoutube)"
                  />
                  <Area
                    type="monotone"
                    dataKey="tiktok"
                    stroke="#000000"
                    fillOpacity={1}
                    fill="url(#colorTiktok)"
                  />
                  <Area
                    type="monotone"
                    dataKey="instagram"
                    stroke="#E4405F"
                    fillOpacity={1}
                    fill="url(#colorInstagram)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Distribution */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Engagement Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {engagementData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-400 text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformData.map((platform) => (
              <div
                key={platform.name}
                className="p-4 rounded-xl bg-gray-800/50 border border-gray-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${platform.color}20` }}
                  >
                    {platform.name === 'YouTube' && <Youtube className="w-5 h-5" style={{ color: platform.color }} />}
                    {platform.name === 'TikTok' && <Music className="w-5 h-5" style={{ color: platform.color }} />}
                    {platform.name === 'Instagram' && <Instagram className="w-5 h-5" style={{ color: platform.color }} />}
                    {platform.name === 'Facebook' && <Facebook className="w-5 h-5" style={{ color: platform.color }} />}
                  </div>
                  <span className="text-white font-medium">{platform.name}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Views</span>
                    <span className="text-white">{(platform.views / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Engagement</span>
                    <span className="text-white">{platform.engagement}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Followers</span>
                    <span className="text-white">{(platform.followers / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Videos */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Top Performing Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topVideos.map((video, index) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#5869fc]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#5869fc] font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{video.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-gray-700 text-gray-300">{video.platform}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-gray-400">Views</p>
                    <p className="text-white font-medium">{(video.views / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">Engagement</p>
                    <p className="text-white font-medium">{video.engagement}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
