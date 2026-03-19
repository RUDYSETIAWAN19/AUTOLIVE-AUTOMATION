import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
// Auth page - no need for cn utility
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Youtube,
  Music,
  Instagram,
  Twitter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function Auth() {
  const { login, register, isAuthenticated } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(loginForm.email, loginForm.password);
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    await register(registerForm.name, registerForm.email, registerForm.whatsapp, registerForm.password);
    setIsLoading(false);
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5869fc] to-[#8b5cf6] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ViralContent</span>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#5869fc]">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-[#5869fc]">
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Welcome back</CardTitle>
                  <CardDescription className="text-gray-400">
                    Login to manage your content automation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#5869fc] hover:bg-[#4558e6] text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          Login
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Create account</CardTitle>
                  <CardDescription className="text-gray-400">
                    Start automating your content today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="John Doe"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">WhatsApp Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="+6281234567890"
                          value={registerForm.whatsapp}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <p className="text-gray-500 text-xs">Used for notifications</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#5869fc] hover:bg-[#4558e6] text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#5869fc]/20 via-black to-[#8b5cf6]/20 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5869fc]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg">
          <Badge className="bg-[#5869fc]/20 text-[#5869fc] border-[#5869fc]/30 mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Content Automation
          </Badge>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Automate Your{' '}
            <span className="bg-gradient-to-r from-[#5869fc] to-[#8b5cf6] bg-clip-text text-transparent">
              Viral Content
            </span>
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            Discover, edit, and schedule viral content across all platforms automatically. 
            Save hours of manual work with our AI-powered tools.
          </p>

          <div className="space-y-4">
            {[
              { icon: Zap, text: 'Auto-discover viral videos from multiple platforms' },
              { icon: Sparkles, text: 'AI-powered video editing and optimization' },
              { icon: Check, text: 'Schedule and upload to all platforms automatically' },
              { icon: Mail, text: 'Get notified via email and WhatsApp' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5869fc]/10 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-[#5869fc]" />
                </div>
                <span className="text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-black flex items-center justify-center"
                >
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-medium">10,000+ creators</p>
              <p className="text-gray-400 text-sm">trust ViralContent</p>
            </div>
          </div>

          {/* Platform Icons */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Youtube className="w-5 h-5" />
              <Music className="w-5 h-5" />
              <Instagram className="w-5 h-5" />
              <Twitter className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm">+ more platforms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
