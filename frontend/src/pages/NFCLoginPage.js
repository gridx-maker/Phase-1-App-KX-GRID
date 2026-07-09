import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import { CreditCard, Lock, Eye, EyeOff, AlertTriangle, KeyRound, ArrowLeft } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NFCLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [nfcId, setNfcId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetReminder, setShowResetReminder] = useState(false);
  const [loginResponse, setLoginResponse] = useState(null);
  
  // Password reset flow
  const [resetMode, setResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleNFCLogin = async (e) => {
    e.preventDefault();
    if (!nfcId || !password) {
      toast.error('Please enter NFC ID and password');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/nfc-password-login`, {
        nfc_card_id: nfcId,
        password: password
      });
      
      const data = response.data;
      setLoginResponse(data);
      
      // Check if first login - show password reset reminder
      if (data.show_password_reset_reminder) {
        setShowResetReminder(true);
      } else {
        // Normal login
        await login(data.token, {
          user_id: data.user_id,
          role: data.role,
          name: data.name,
          nfc_card_id: data.nfc_card_id
        });
        
        // Redirect based on role
        redirectBasedOnRole(data.role);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'brand_head':
        navigate('/brand-head');
        break;
      case 'trainer':
        navigate('/crew');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const proceedWithoutReset = async () => {
    if (loginResponse) {
      await login(loginResponse.token, {
        user_id: loginResponse.user_id,
        role: loginResponse.role,
        name: loginResponse.name,
        nfc_card_id: loginResponse.nfc_card_id
      });
      redirectBasedOnRole(loginResponse.role);
    }
    setShowResetReminder(false);
  };

  const goToPasswordReset = () => {
    setShowResetReminder(false);
    setResetMode(true);
  };

  const requestOTP = async () => {
    if (!mobile) {
      toast.error('Please enter your mobile number');
      return;
    }
    
    setResetLoading(true);
    try {
      await axios.post(`${API}/auth/request-password-reset`, { mobile });
      toast.success('OTP sent to your mobile number');
      setResetStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setResetLoading(false);
    }
  };

  const verifyAndReset = async () => {
    if (!otp || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setResetLoading(true);
    try {
      await axios.post(`${API}/auth/verify-reset-password`, {
        mobile,
        otp,
        new_password: newPassword
      });
      toast.success('Password reset successfully! Please login with your new password.');
      setResetMode(false);
      setResetStep(1);
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <KotlerXLogo className="h-12 mx-auto mb-4" variant="header" />
          <h1 className="font-unbounded font-bold text-2xl text-white">
            {resetMode ? 'Reset Password' : 'NFC Login'}
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            {resetMode ? 'Enter your mobile number to receive OTP' : 'Login with your NFC Card ID'}
          </p>
        </div>

        <div className="telemetry-card rounded-2xl p-8">
          {!resetMode ? (
            /* NFC Login Form */
            <form onSubmit={handleNFCLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-zinc-400">NFC Card ID</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <Input
                    type="text"
                    value={nfcId}
                    onChange={(e) => setNfcId(e.target.value.toUpperCase())}
                    className="input-dark pl-11"
                    placeholder="e.g., NFC001"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark pl-11 pr-11"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-600">Default password: NFC1234</p>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login with NFC'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            /* Password Reset Form */
            <div className="space-y-6">
              <button
                onClick={() => {
                  setResetMode(false);
                  setResetStep(1);
                }}
                className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>

              {resetStep === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Mobile Number</Label>
                    <Input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="input-dark"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <Button
                    onClick={requestOTP}
                    className="w-full btn-primary"
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Enter OTP</Label>
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="input-dark text-center text-2xl tracking-widest"
                      placeholder="123456"
                      maxLength={6}
                    />
                    <p className="text-xs text-zinc-500 text-center">
                      OTP sent to {mobile.slice(-4).padStart(mobile.length, '*')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-dark"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Confirm Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-dark"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button
                    onClick={verifyAndReset}
                    className="w-full btn-primary"
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Other login options */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-zinc-500 mb-4">Or login with</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/login/student')}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Email
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/login/admin')}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Admin
              </Button>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-zinc-500 hover:text-white"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* First Login Password Reset Reminder Dialog */}
      <Dialog open={showResetReminder} onOpenChange={setShowResetReminder}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-secondary" />
              Welcome to KXGRID!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
              <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">First Time Login Detected</p>
                <p className="text-sm text-zinc-400 mt-1">
                  You're using the default password. We recommend changing it to keep your account secure.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={goToPasswordReset}
                className="w-full btn-primary"
              >
                Change Password Now
              </Button>
              <Button
                onClick={proceedWithoutReset}
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5"
              >
                Skip for Now (Remind Me Later)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NFCLoginPage;
