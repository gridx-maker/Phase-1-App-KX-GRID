import SplitText from '@/components/ui/SplitText';
import React, { useState } from 'react';
import kotlerxLogo from '../images/Vertical Logo with BG-01.png';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ChevronRight, Smartphone, Phone, CreditCard, GraduationCap, Users, Shield, Building2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const roleConfig = {
  student: {
    title: 'Student Portal',
    subtitle: 'Access your learning dashboard',
    icon: GraduationCap,
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary/30',
    allowedRoles: ['student'],
    registerLink: '/register/student'
  },
  crew: {
    title: 'Crew / Trainer Portal',
    subtitle: 'Manage attendance and assessments',
    icon: Users,
    color: 'text-secondary',
    bgColor: 'bg-secondary/20',
    borderColor: 'border-secondary/30',
    allowedRoles: ['trainer', 'crew'],
    registerLink: null
  },
  admin: {
    title: 'Admin Portal',
    subtitle: 'Platform management console',
    icon: Shield,
    color: 'text-accent',
    bgColor: 'bg-accent/20',
    borderColor: 'border-accent/30',
    allowedRoles: ['admin', 'super_admin', 'brand_head'],
    registerLink: null
  },
  office: {
    title: 'Office Login',
    subtitle: 'For Admin, Crew & Management',
    icon: Building2,
    color: 'text-secondary',
    bgColor: 'bg-secondary/20',
    borderColor: 'border-secondary/30',
    allowedRoles: ['admin', 'super_admin', 'brand_head', 'trainer', 'crew'],
    registerLink: null
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { role: urlRole } = useParams();
  const { login, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  
  // Get role config or default to student
  const currentRole = roleConfig[urlRole] || roleConfig.student;
  const RoleIcon = currentRole.icon;
  
  // Email login
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  
  // NFC login
  const [nfcId, setNfcId] = useState('');
  
  // Mobile OTP login
  const [mobileForm, setMobileForm] = useState({ mobile: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await login(emailForm.email, emailForm.password);
      
      // Check if user role matches the portal they're trying to access
      if (!currentRole.allowedRoles.includes(user.role)) {
        toast.error(`This portal is for ${currentRole.allowedRoles.join('/')} only. You are logged in as ${user.role}.`);
        // Still navigate them to their appropriate dashboard
        navigateByRole(user.role);
        return;
      }
      
      toast.success('Welcome back!');
      navigateByRole(user.role);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNFCLogin = async () => {
    if (!nfcId) {
      toast.error('Please enter your NFC Card ID');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/nfc-login`, { 
        nfc_card_id: nfcId.toUpperCase() 
      }, { withCredentials: true });
      
      const { token, ...userData } = response.data;
      localStorage.setItem('kotlerx_token', token);
      toast.success(`Welcome back, ${userData.name}!`);
      navigateByRole(userData.role);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'NFC Card not found');
    } finally {
      setLoading(false);
    }
  };

  const sendMobileOTP = async () => {
    if (!mobileForm.mobile || mobileForm.mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/otp/send`, { phone: `+91${mobileForm.mobile}` });
      setOtpSent(true);
      toast.success('OTP sent to your mobile');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileLogin = async () => {
    if (!mobileForm.otp) {
      toast.error('Please enter OTP');
      return;
    }
    
    setLoading(true);
    try {
      // Verify OTP
      await axios.post(`${API}/otp/verify`, { 
        phone: `+91${mobileForm.mobile}`, 
        otp: mobileForm.otp 
      });
      
      // Login with mobile
      const response = await axios.post(`${API}/auth/mobile-login`, { 
        mobile: mobileForm.mobile 
      }, { withCredentials: true });
      
      const { token, ...userData } = response.data;
      localStorage.setItem('kotlerx_token', token);
      toast.success(`Welcome back, ${userData.name}!`);
      navigateByRole(userData.role);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const navigateByRole = (role) => {
    if (role === 'admin' || role === 'super_admin') {
      navigate('/admin');
    } else if (role === 'trainer') {
      navigate('/crew');
    } else if (role === 'brand_head') {
      navigate('/brand-head');
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo - BIG */}
          <Link to="/" className="block mb-6">
            <img 
              src={kotlerxLogo}
              alt="KotlerX"
              className="h-28 md:h-36 w-auto"
            />
          </Link>

          {/* Role Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentRole.bgColor} border ${currentRole.borderColor} mb-6`}>
            <RoleIcon className={`w-5 h-5 ${currentRole.color}`} />
            <span className={`font-inter font-medium ${currentRole.color}`}>{currentRole.title}</span>
          </div>

          <SplitText text="Welcome Back" tag="h1" className="font-unbounded font-bold text-3xl text-white mb-2" />
          <p className="font-inter text-zinc-400 mb-8">{currentRole.subtitle}</p>

          {/* Login Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-white/5 p-1 rounded-lg">
              <TabsTrigger 
                value="email" 
                className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-md text-sm"
                data-testid="tab-email"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger 
                value="nfc"
                className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-md text-sm"
                data-testid="tab-nfc"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                NFC
              </TabsTrigger>
              <TabsTrigger 
                value="mobile"
                className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-md text-sm"
                data-testid="tab-mobile"
              >
                <Phone className="w-4 h-4 mr-2" />
                Mobile
              </TabsTrigger>
            </TabsList>

            {/* Email Login */}
            <TabsContent value="email" className="space-y-5">
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-inter text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      className="input-dark h-12 pl-11"
                      placeholder="you@example.com"
                      required
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 font-inter text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      className="input-dark h-12 pl-11"
                      placeholder="••••••••"
                      required
                      data-testid="password-input"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 btn-primary gap-2"
                  data-testid="login-submit-btn"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Sign In<ChevronRight className="w-5 h-5" /></>
                  )}
                </Button>
              </form>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-zinc-500">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <Button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                variant="outline"
                className="w-full h-12 border-white/10 text-white hover:bg-white/5 gap-3"
                data-testid="google-login-btn"
              >
                {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>
            </TabsContent>

            {/* NFC Login */}
            <TabsContent value="nfc" className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="w-10 h-10 text-primary" />
                </div>
                <p className="text-zinc-400 text-sm">Enter your NFC Card ID to login</p>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 font-inter text-sm">NFC Card ID</Label>
                <Input
                  value={nfcId}
                  onChange={(e) => setNfcId(e.target.value.toUpperCase())}
                  className="input-dark h-14 font-mono text-center text-xl tracking-widest"
                  placeholder="NFC_XXXXXXXX"
                  data-testid="nfc-login-input"
                />
              </div>

              <Button 
                onClick={handleNFCLogin}
                disabled={loading || !nfcId}
                className="w-full h-12 btn-primary gap-2"
                data-testid="nfc-login-submit-btn"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Login with NFC<ChevronRight className="w-5 h-5" /></>
                )}
              </Button>
            </TabsContent>

            {/* Mobile OTP Login */}
            <TabsContent value="mobile" className="space-y-5">
              <div className="space-y-2">
                <Label className="text-zinc-400 font-inter text-sm">Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-white/5 border border-white/10 rounded-md">
                    <span className="text-zinc-400">+91</span>
                  </div>
                  <Input
                    value={mobileForm.mobile}
                    onChange={(e) => setMobileForm({ ...mobileForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="input-dark h-12 flex-1"
                    placeholder="9876543210"
                    disabled={otpSent}
                    data-testid="mobile-input"
                  />
                  {!otpSent && (
                    <Button 
                      onClick={sendMobileOTP}
                      disabled={loading || mobileForm.mobile.length < 10}
                      className="btn-primary px-4"
                      data-testid="send-otp-btn"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                    </Button>
                  )}
                </div>
              </div>

              {otpSent && (
                <>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 font-inter text-sm">Enter OTP</Label>
                    <Input
                      value={mobileForm.otp}
                      onChange={(e) => setMobileForm({ ...mobileForm, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="input-dark h-14 font-mono text-center text-xl tracking-widest"
                      placeholder="000000"
                      data-testid="otp-input"
                    />
                  </div>

                  <Button 
                    onClick={handleMobileLogin}
                    disabled={loading || mobileForm.otp.length < 6}
                    className="w-full h-12 btn-primary gap-2"
                    data-testid="mobile-login-submit-btn"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>Verify & Login<ChevronRight className="w-5 h-5" /></>
                    )}
                  </Button>

                  <button 
                    onClick={() => { setOtpSent(false); setMobileForm({ ...mobileForm, otp: '' }); }}
                    className="w-full text-sm text-zinc-500 hover:text-primary"
                  >
                    Change mobile number
                  </button>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Registration link - only show for students */}
          {currentRole.registerLink ? (
            <p className="text-center text-zinc-400 mt-8 font-inter text-sm">
              Don't have an account?{' '}
              <Link to={currentRole.registerLink} className={`${currentRole.color} hover:underline`} data-testid="register-link">
                Register now
              </Link>
            </p>
          ) : (
            <p className="text-center text-zinc-500 mt-8 font-inter text-sm">
              {urlRole === 'crew' ? 'Crew accounts are created by administrators' : 'Admin accounts are invitation only'}
            </p>
          )}

          {/* Portal Navigation */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-zinc-500 text-xs mb-3">Switch Portal</p>
            <div className="flex justify-center gap-3">
              {urlRole !== 'student' && (
                <Link to="/login/student" className="text-primary text-sm hover:underline">Student</Link>
              )}
              {urlRole !== 'crew' && (
                <Link to="/login/crew" className="text-secondary text-sm hover:underline">Crew</Link>
              )}
              {urlRole !== 'admin' && (
                <Link to="/login/admin" className="text-accent text-sm hover:underline">Admin</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block flex-1 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/login-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 flex items-end p-12">
          <div>
            <h2 className="font-unbounded font-bold text-4xl text-white mb-4">
              {urlRole === 'admin' || urlRole === 'office' ? 'Platform Control Center' : 
               urlRole === 'crew' ? 'Training Excellence' :
               'Accelerate Your Career'}
            </h2>
            <p className="font-inter text-zinc-300 max-w-md">
              {urlRole === 'admin' || urlRole === 'office' ? 'Manage students, programs, and platform settings from one powerful dashboard' :
               urlRole === 'crew' ? 'Mark attendance, assess students, and track batch performance' :
               'Join the elite community of motorsport professionals trained with cutting-edge technology'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

