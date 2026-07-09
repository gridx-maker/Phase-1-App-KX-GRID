import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Smartphone, Wifi, WifiOff, CheckCircle2, XCircle,
  MapPin, Clock, Users, ChevronLeft, Loader2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NFCAttendance = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [nfcInput, setNfcInput] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [sessionType, setSessionType] = useState('normal');
  const [batches, setBatches] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchBatches();
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

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`${API}/batches`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setBatches(response.data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location error:', error)
      );
    }
  };

  const simulateNFCScan = async () => {
    if (!nfcInput) {
      toast.error('Please enter NFC Card ID');
      return;
    }

    if (!selectedBatch) {
      toast.error('Please select a batch');
      return;
    }

    setScanning(true);

    const attendanceData = {
      student_id: '', // Will be resolved by backend from NFC
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
        
        toast.success('Attendance marked successfully!');
        setRecentScans(prev => [{
          ...response.data,
          status: 'success',
          time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 9)]);
        setNfcInput('');
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to mark attendance');
        setRecentScans(prev => [{
          nfc_card_id: nfcInput,
          status: 'failed',
          error: error.response?.data?.detail || 'Unknown error',
          time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 9)]);
      }
    } else {
      // Store offline
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
      toast.success(`Synced ${response.data.synced} offline records`);
      setOfflineQueue([]);
    } catch (error) {
      toast.error('Failed to sync offline records');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-zinc-400 hover:text-white"
              data-testid="back-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-unbounded font-bold text-xl text-white">NFC Attendance</h1>
              <p className="text-sm text-zinc-500">Tap to mark attendance</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isOnline ? 'bg-accent-success/20' : 'bg-accent/20'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-accent-success" />
                <span className="text-xs text-accent-success font-mono">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-accent" />
                <span className="text-xs text-accent font-mono">OFFLINE</span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* NFC Scanner Simulation */}
        <div className="telemetry-card rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center relative ${
              scanning ? 'bg-primary/20' : 'bg-white/5'
            }`}>
              <Smartphone className={`w-16 h-16 ${scanning ? 'text-primary' : 'text-zinc-500'}`} />
              {scanning && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-primary nfc-pulse-ring" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary nfc-pulse-ring" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>
            <p className="mt-4 text-zinc-400 font-inter">
              {scanning ? 'Scanning...' : 'Enter NFC Card ID to simulate tap'}
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Select Batch</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="input-dark h-12" data-testid="batch-select">
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/10">
                  {batches.map(batch => (
                    <SelectItem key={batch.batch_id} value={batch.batch_id}>
                      {batch.batch_id}
                    </SelectItem>
                  ))}
                  <SelectItem value="demo_batch">Demo Batch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Session Type</label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger className="input-dark h-12" data-testid="session-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/10">
                  <SelectItem value="normal">Normal Session</SelectItem>
                  <SelectItem value="assessment">Assessment Session</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">NFC Card ID</label>
              <Input
                value={nfcInput}
                onChange={(e) => setNfcInput(e.target.value.toUpperCase())}
                className="input-dark h-12 font-mono text-center text-lg tracking-wider"
                placeholder="NFC_XXXXXXXX"
                data-testid="nfc-input"
              />
            </div>

            <Button
              onClick={simulateNFCScan}
              disabled={scanning || !nfcInput || !selectedBatch}
              className="w-full h-14 btn-primary text-lg gap-2"
              data-testid="scan-nfc-btn"
            >
              {scanning ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  Simulate NFC Tap
                </>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-accent" />
                <h3 className="font-unbounded font-semibold text-white">Offline Queue</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-mono">
                {offlineQueue.length} pending
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              These records will be synced when you're back online
            </p>
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
                <div 
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    scan.status === 'success' 
                      ? 'border-accent-success/30 bg-accent-success/5'
                      : scan.status === 'offline'
                        ? 'border-accent-warning/30 bg-accent-warning/5'
                        : 'border-accent/30 bg-accent/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scan.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-accent-success" />
                    ) : scan.status === 'offline' ? (
                      <WifiOff className="w-5 h-5 text-accent-warning" />
                    ) : (
                      <XCircle className="w-5 h-5 text-accent" />
                    )}
                    <div>
                      <span className="font-mono text-sm text-white">{scan.nfc_card_id}</span>
                      {scan.error && (
                        <p className="text-xs text-accent">{scan.error}</p>
                      )}
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
    </div>
  );
};

export default NFCAttendance;
