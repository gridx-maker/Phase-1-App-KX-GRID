import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Smartphone, Users, Star, LogOut, Loader2, CheckCircle2,
  Wifi, WifiOff, MapPin, Clock, AlertCircle, User, Shield, Layers, Radio
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CrewDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [sessionType, setSessionType] = useState('normal');
  const [nfcInput, setNfcInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Assessment state
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [assessmentData, setAssessmentData] = useState({
    skill_control: 3,
    discipline: 3,
    safety_awareness: 3,
    execution: 3,
    teamwork: 3,
    notes: ''
  });

  useEffect(() => {
    if (user?.role !== 'trainer' && user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchDashboard();
    getLocation();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineRecords();
    }
  }, [isOnline]);

  const fetchDashboard = async () => {
    try {
      const [dashRes, batchRes] = await Promise.all([
        axios.get(`${API}/crew/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }),
        axios.get(`${API}/batches`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        })
      ]);
      setDashboardData(dashRes.data);
      setBatches(batchRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`${API}/batches`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setBatches(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location error:', err)
      );
    }
  };

  const handleNFCTap = async () => {
    if (!nfcInput || !selectedBatch) {
      toast.error('Please enter NFC ID and select batch');
      return;
    }

    setScanning(true);
    const attendanceData = {
      student_id: '',
      batch_id: selectedBatch,
      nfc_card_id: nfcInput.toUpperCase(),
      timestamp: new Date().toISOString(),
      gps_location: location,
      session_type: sessionType,
      offline_sync: !isOnline
    };

    if (isOnline) {
      try {
        const response = await axios.post(`${API}/attendance/mark`, attendanceData, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        const studentRes = await axios.get(`${API}/students/nfc/${nfcInput.toUpperCase()}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        toast.success(`Attendance marked for ${studentRes.data.full_name}`);
        
        const scanRecord = {
          ...response.data,
          student: studentRes.data,
          status: 'success',
          time: new Date().toLocaleTimeString()
        };
        
        setRecentScans(prev => [scanRecord, ...prev.slice(0, 9)]);

        // If assessment session, open assessment dialog
        if (sessionType === 'assessment') {
          setCurrentStudent(studentRes.data);
          setAssessmentOpen(true);
        }
        
        setNfcInput('');
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to mark attendance');
        setRecentScans(prev => [{
          nfc_card_id: nfcInput,
          status: 'failed',
          error: error.response?.data?.detail,
          time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 9)]);
      }
    } else {
      setOfflineQueue(prev => [...prev, attendanceData]);
      toast.info('Saved offline - will sync when online');
      setRecentScans(prev => [{
        nfc_card_id: nfcInput,
        status: 'offline',
        time: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);
      setNfcInput('');
    }

    setScanning(false);
  };

  const syncOfflineRecords = async () => {
    try {
      const response = await axios.post(`${API}/attendance/sync`, offlineQueue, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success(`Synced ${response.data.synced} records`);
      setOfflineQueue([]);
    } catch (error) {
      toast.error('Failed to sync');
    }
  };

  const submitAssessment = async () => {
    if (!currentStudent) return;

    try {
      await axios.post(`${API}/assessments`, {
        student_id: currentStudent.student_id,
        batch_id: selectedBatch,
        trainer_id: user.user_id,
        session_id: `session_${Date.now()}`,
        ...assessmentData
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      toast.success('Assessment submitted!');
      setAssessmentOpen(false);
      setAssessmentData({
        skill_control: 3,
        discipline: 3,
        safety_awareness: 3,
        execution: 3,
        teamwork: 3,
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to submit assessment');
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <Label className="text-zinc-400 text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star className={`w-7 h-7 ${star <= value ? 'text-primary fill-primary' : 'text-zinc-600'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <KotlerXLogo size="md" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="font-unbounded font-bold text-lg text-white">Crew Dashboard</h1>
                {dashboardData?.brand && (
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{ 
                      backgroundColor: `${dashboardData.brand.color}20`, 
                      color: dashboardData.brand.color 
                    }}
                  >
                    {dashboardData.brand.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500">
                {dashboardData?.is_brand_locked 
                  ? `Assigned to ${dashboardData.brand?.name}` 
                  : 'NFC Attendance System'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dashboardData?.is_brand_locked && (
              <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-xs text-zinc-400">
                <Shield className="w-3 h-3" />
                Brand Locked
              </div>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isOnline ? 'bg-accent-success/20' : 'bg-accent/20'
            }`}>
              {isOnline ? (
                <><Wifi className="w-4 h-4 text-accent-success" /><span className="text-xs text-accent-success font-mono">ONLINE</span></>
              ) : (
                <><WifiOff className="w-4 h-4 text-accent" /><span className="text-xs text-accent font-mono">OFFLINE</span></>
              )}
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-zinc-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Brand Lock Banner */}
      {dashboardData?.is_brand_locked && dashboardData?.brand && (
        <div 
          className="border-b py-2"
          style={{ 
            backgroundColor: `${dashboardData.brand.color}10`, 
            borderColor: `${dashboardData.brand.color}30` 
          }}
        >
          <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-2 text-sm">
            <Layers className="w-4 h-4" style={{ color: dashboardData.brand.color }} />
            <span className="text-zinc-300">
              You are viewing data for <strong style={{ color: dashboardData.brand.color }}>{dashboardData.brand.name}</strong> only
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick Action - NFC Attendance Mode */}
        <div 
          className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 cursor-pointer hover:border-primary/50 transition-all"
          onClick={() => navigate('/crew/attendance')}
          data-testid="nfc-attendance-mode-btn"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Radio className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-unbounded font-bold text-xl text-white">NFC Attendance Mode</h2>
                <p className="text-sm text-zinc-400">Start a session • Students tap NFC to mark attendance</p>
              </div>
            </div>
            <Button className="btn-primary gap-2">
              <Radio className="w-4 h-4" />
              Start Session
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        {dashboardData && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="telemetry-card rounded-xl p-4 text-center">
              <p className="text-2xl font-unbounded font-bold text-white">{dashboardData.stats?.total_programs || 0}</p>
              <p className="text-xs text-zinc-500">Programs</p>
            </div>
            <div className="telemetry-card rounded-xl p-4 text-center">
              <p className="text-2xl font-unbounded font-bold text-white">{dashboardData.stats?.total_students || 0}</p>
              <p className="text-xs text-zinc-500">Students</p>
            </div>
            <div className="telemetry-card rounded-xl p-4 text-center">
              <p className="text-2xl font-unbounded font-bold text-white">{dashboardData.stats?.recent_assessments || 0}</p>
              <p className="text-xs text-zinc-500">Assessments</p>
            </div>
          </div>
        )}

        {/* NFC Scanner */}
        <div className="telemetry-card rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center relative ${
              scanning ? 'bg-primary/20' : 'bg-white/5'
            }`}>
              <Smartphone className={`w-14 h-14 ${scanning ? 'text-primary' : 'text-zinc-500'}`} />
              {scanning && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-primary nfc-pulse-ring" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary nfc-pulse-ring" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>
            <p className="mt-4 text-zinc-400 font-inter">
              {scanning ? 'Processing...' : 'Enter NFC Card ID when student taps'}
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-sm">Batch</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="input-dark h-12" data-testid="batch-select">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-white/10">
                    {batches.map(b => (
                      <SelectItem key={b.batch_id} value={b.batch_id}>{b.batch_id}</SelectItem>
                    ))}
                    <SelectItem value="demo_batch">Demo Batch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-sm">Session Type</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger className="input-dark h-12" data-testid="session-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-white/10">
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">NFC Card ID</Label>
              <Input
                value={nfcInput}
                onChange={(e) => setNfcInput(e.target.value.toUpperCase())}
                className="input-dark h-14 font-mono text-center text-xl tracking-widest"
                placeholder="NFC_XXXXXXXX"
                data-testid="nfc-input"
              />
            </div>

            <Button
              onClick={handleNFCTap}
              disabled={scanning || !nfcInput || !selectedBatch}
              className="w-full h-14 btn-primary text-lg gap-2"
              data-testid="mark-attendance-btn"
            >
              {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><Smartphone className="w-5 h-5" />Mark Attendance</>
              )}
            </Button>

            {location && (
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <MapPin className="w-3 h-3" />
                <span>GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Offline Queue */}
        {offlineQueue.length > 0 && (
          <div className="telemetry-card rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-accent" />
                <span className="font-unbounded text-white">Offline Queue</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-mono">
                {offlineQueue.length} pending
              </span>
            </div>
            <p className="text-sm text-zinc-500">Will sync when back online</p>
          </div>
        )}

        {/* Recent Scans */}
        <div className="telemetry-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-zinc-500" />
            <h3 className="font-unbounded font-semibold text-white">Recent Scans</h3>
          </div>

          {recentScans.length > 0 ? (
            <div className="space-y-3">
              {recentScans.map((scan, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-lg border ${
                  scan.status === 'success' ? 'border-accent-success/30 bg-accent-success/5' :
                  scan.status === 'offline' ? 'border-accent-warning/30 bg-accent-warning/5' :
                  'border-accent/30 bg-accent/5'
                }`}>
                  <div className="flex items-center gap-3">
                    {scan.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-accent-success" />
                    ) : scan.status === 'offline' ? (
                      <WifiOff className="w-5 h-5 text-accent-warning" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-accent" />
                    )}
                    <div>
                      <p className="font-mono text-sm text-white">{scan.nfc_card_id}</p>
                      {scan.student && (
                        <p className="text-xs text-zinc-400">{scan.student.full_name}</p>
                      )}
                      {scan.error && <p className="text-xs text-accent">{scan.error}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">{scan.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">No scans yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Dialog */}
      <Dialog open={assessmentOpen} onOpenChange={setAssessmentOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              Assess {currentStudent?.full_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <StarRating
              label="Skill Control"
              value={assessmentData.skill_control}
              onChange={(v) => setAssessmentData({ ...assessmentData, skill_control: v })}
            />
            <StarRating
              label="Discipline"
              value={assessmentData.discipline}
              onChange={(v) => setAssessmentData({ ...assessmentData, discipline: v })}
            />
            <StarRating
              label="Safety Awareness"
              value={assessmentData.safety_awareness}
              onChange={(v) => setAssessmentData({ ...assessmentData, safety_awareness: v })}
            />
            <StarRating
              label="Execution"
              value={assessmentData.execution}
              onChange={(v) => setAssessmentData({ ...assessmentData, execution: v })}
            />
            <StarRating
              label="Teamwork"
              value={assessmentData.teamwork}
              onChange={(v) => setAssessmentData({ ...assessmentData, teamwork: v })}
            />

            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">Notes (Optional)</Label>
              <Textarea
                value={assessmentData.notes}
                onChange={(e) => setAssessmentData({ ...assessmentData, notes: e.target.value })}
                className="input-dark min-h-[80px]"
                placeholder="Additional feedback..."
              />
            </div>

            <Button onClick={submitAssessment} className="w-full btn-primary">
              Submit Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrewDashboard;
