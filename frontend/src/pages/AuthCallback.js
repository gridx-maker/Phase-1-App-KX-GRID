import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import KotlerXLogo from '@/components/KotlerXLogo';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processOAuthCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use ref to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (!sessionIdMatch) {
          toast.error('Invalid authentication response');
          navigate('/login');
          return;
        }

        const sessionId = sessionIdMatch[1];
        const user = await processOAuthCallback(sessionId);
        
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        
        toast.success(`Welcome, ${user.name}!`);
        
        // Navigate based on role first, then registration status for students
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin');
        } else if (user.role === 'trainer') {
          navigate('/crew');
        } else if (user.role === 'brand_head') {
          navigate('/brand-head');
        } else if (user.registration_complete) {
          navigate('/dashboard', { state: { user } });
        } else {
          navigate('/registration', { state: { user } });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    processAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <KotlerXLogo size="lg" variant="header" />
        </div>
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 font-inter">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
