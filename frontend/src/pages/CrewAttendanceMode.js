import React, { useState, useEffect, useCallback, useRef } from 'react';
import SplitText from '@/components/ui/SplitText';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Smartphone, Wifi, WifiOff, CheckCircle2, XCircle, AlertCircle,
  MapPin, Clock, Users, ChevronLeft, Loader2, Play, Square,
  Star, User, NfcIcon, Zap, Award, FileCheck, Radio, Volume2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CrewAttendanceMode = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // NFC States
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [nfcInput, setNfcInput] = useState('');
  
  // Session States
  const [activeSession, setActiveSession] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Attendance States
  const [recentAttendees, setRecentAttendees] = useState([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  
  // Assessment States
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [assessmentCategories, setAssessmentCategories] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [assessmentRatings, setAssessmentRatings] = useState({});
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [awaitingCrewNfc, setAwaitingCrewNfc] = useState(false);
  
  // Network States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState(null);
  
  // Audio feedback
  const successAudio = useRef(null);
  const errorAudio = useRef(null);

  // Check NFC support on mount
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setManualMode(true);
    }
    
    fetchUnits();
    fetchActiveSession();
    fetchAssessmentCategories();
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

  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${API}/crew/units`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setUnits(response.data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const response = await axios.get(`${API}/crew/active-session`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (response.data) {
        setActiveSession(response.data);
        setAttendanceCount(response.data.attendance_count || 0);
        // Fetch attendance records
        const detailsRes = await axios.get(`${API}/crew/attendance-session/${response.data.session_id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        setRecentAttendees(detailsRes.data.attendance_records || []);
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const fetchAssessmentCategories = async () => {
    try {
      const response = await axios.get(`${API}/admin/assessment-categories`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setAssessmentCategories(response.data || []);
      // Initialize ratings
      const initialRatings = {};
      (response.data || []).forEach(cat => {
        initialRatings[cat.category_id] = 3;
      });
      setAssessmentRatings(initialRatings);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  // Start NFC Reading
  const startNfcReading = async () => {
    if (!nfcSupported) {
      toast.error('NFC not supported on this device');
      setManualMode(true);
      return;
    }

    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setNfcEnabled(true);
      setScanning(true);
      toast.success('NFC Reader activated! Students can now tap their cards.');

      ndef.addEventListener('reading', ({ message, serialNumber }) => {
        console.log('NFC Read:', serialNumber, message);
        // Use serial number as NFC ID
        const nfcId = serialNumber.replace(/:/g, '').toUpperCase();
        handleNfcTap(nfcId);
      });

      ndef.addEventListener('readingerror', () => {
        toast.error('NFC read error. Please try again.');
      });
    } catch (error) {
      console.error('NFC Error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('NFC permission denied. Please allow NFC access.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('NFC not supported on this device');
        setManualMode(true);
      } else {
        toast.error('Failed to start NFC reader');
        setManualMode(true);
      }
    }
  };

  // Handle NFC Tap (either from Web NFC or manual input)
  const handleNfcTap = async (nfcId) => {
    if (!activeSession) {
      toast.error('Please start a session first');
      return;
    }

    const nfcCardId = nfcId.toUpperCase().trim();

    // If awaiting crew NFC for assessment confirmation
    if (awaitingCrewNfc) {
      await confirmAssessmentWithNfc(nfcCardId);
      return;
    }

    // Regular student attendance
    try {
      const response = await axios.post(`${API}/crew/attendance-session/${activeSession.session_id}/nfc-tap`, {
        nfc_card_id: nfcCardId,
        session_id: activeSession.session_id
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      if (response.data.status === 'success') {
        // Play success sound
        playSound('success');
        toast.success(response.data.message);
        
        setAttendanceCount(prev => prev + 1);
        setRecentAttendees(prev => [{
          ...response.data,
          student_name: response.data.student?.full_name,
          nfc_card_id: nfcCardId,
          marked_at: response.data.marked_at,
          status: 'success'
        }, ...prev.slice(0, 19)]);

        // If in assessment mode, open assessment dialog for this student
        if (assessmentMode) {
          setCurrentStudent(response.data.student);
          setShowAssessmentDialog(true);
        }
      } else if (response.data.status === 'already_marked') {
        playSound('info');
        toast.info(response.data.message);
      }
    } catch (error) {
      playSound('error');
      toast.error(error.response?.data?.detail || 'Failed to record attendance');
      setRecentAttendees(prev => [{
        nfc_card_id: nfcCardId,
        status: 'failed',
        error: error.response?.data?.detail,
        marked_at: new Date().toISOString()
      }, ...prev.slice(0, 19)]);
    }

    setNfcInput('');
  };

  const playSound = (type) => {
    // Simple beep sounds using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'success') {
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
      } else if (type === 'error') {
        oscillator.frequency.value = 300;
        oscillator.type = 'square';
        gainNode.gain.value = 0.2;
      } else {
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.2;
      }
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 150);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // Start Session
  const startSession = async () => {
    if (!selectedUnit) {
      toast.error('Please select a unit');
      return;
    }

    try {
      const response = await axios.post(`${API}/crew/attendance-session/start`, {
        unit_id: selectedUnit,
        session_name: sessionName || undefined,
        notes: sessionNotes || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      setActiveSession(response.data);
      setAttendanceCount(0);
      setRecentAttendees([]);
      toast.success('Session started! Ready for NFC taps.');
      
      // Auto-start NFC if supported
      if (nfcSupported && !manualMode) {
        startNfcReading();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to start session');
    }
  };

  // End Session
  const endSession = async () => {
    if (!activeSession) return;

    try {
      await axios.put(`${API}/crew/attendance-session/${activeSession.session_id}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      toast.success(`Session ended. Total attendance: ${attendanceCount}`);
      setActiveSession(null);
      setScanning(false);
      setNfcEnabled(false);
      setAttendanceCount(0);
      setRecentAttendees([]);
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  // Submit Assessment
  const submitAssessment = async () => {
    if (!currentStudent || !activeSession) return;

    setAwaitingCrewNfc(true);
    toast.info('Please tap your crew NFC card to confirm assessment');
  };

  const confirmAssessmentWithNfc = async (crewNfcId) => {
    try {
      const response = await axios.post(`${API}/crew/assessment/nfc-submit`, {
        student_id: currentStudent.student_id,
        session_id: activeSession.session_id,
        unit_id: activeSession.unit_id,
        ratings: assessmentRatings,
        notes: assessmentNotes,
        crew_nfc_confirmation: crewNfcId
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      playSound('success');
      toast.success(response.data.message);
      
      // Reset assessment state
      setShowAssessmentDialog(false);
      setCurrentStudent(null);
      setAssessmentNotes('');
      setAwaitingCrewNfc(false);
      
      // Reset ratings to default
      const initialRatings = {};
      assessmentCategories.forEach(cat => {
        initialRatings[cat.category_id] = 3;
      });
      setAssessmentRatings(initialRatings);
    } catch (error) {
      playSound('error');
      toast.error(error.response?.data?.detail || 'Failed to submit assessment');
      setAwaitingCrewNfc(false);
    }
  };

  // Manual NFC Input handler
  const handleManualSubmit = () => {
    if (!nfcInput) {
      toast.error('Please enter NFC Card ID');
      return;
    }
    handleNfcTap(nfcInput);
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
            <Button
              variant="ghost"
              onClick={() => navigate('/crew')}
              className="text-zinc-400 hover:text-white"
              data-testid="back-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <SplitText 
                text="NFC Attendance Mode" 
                tag="h1" 
                className="font-unbounded font-bold text-xl text-white flex items-center gap-2" 
              />
              <p className="text-sm text-zinc-500">
                {activeSession ? `Session: ${activeSession.unit_name}` : 'Start a session to begin'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Assessment Mode Toggle */}
            <Button
              variant={assessmentMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAssessmentMode(!assessmentMode)}
              className={assessmentMode ? 'bg-secondary text-white' : 'border-white/20 text-zinc-400'}
              data-testid="assessment-toggle"
            >
              <Award className="w-4 h-4 mr-1" />
              Assessment
            </Button>

            {/* Network Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isOnline ? 'bg-accent-success/20' : 'bg-accent/20'
            }`}>
              {isOnline ? (
                <><Wifi className="w-4 h-4 text-accent-success" /><span className="text-xs text-accent-success font-mono">ONLINE</span></>
              ) : (
                <><WifiOff className="w-4 h-4 text-accent" /><span className="text-xs text-accent font-mono">OFFLINE</span></>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Session Setup (when no active session) */}
        {!activeSession ? (
          <div className="telemetry-card rounded-2xl p-8 mb-8">
            <h2 className="font-unbounded font-bold text-xl text-white mb-6 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Start Attendance Session
            </h2>

            <div className="space-y-6 max-w-lg">
              <div className="space-y-2">
                <Label className="text-zinc-400">Select Unit *</Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="input-dark h-12" data-testid="unit-select">
                    <SelectValue placeholder="Choose a unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-white/10 max-h-60">
                    {units.map(unit => (
                      <SelectItem key={unit.unit_id} value={unit.unit_id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: unit.brand_color || '#00f0ff' }}
                          />
                          <span>{unit.name}</span>
                          <span className="text-zinc-500 text-xs">({unit.program_name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Session Name (optional)</Label>
                <Input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="input-dark"
                  placeholder="e.g., Morning Batch - Day 3"
                  data-testid="session-name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Notes (optional)</Label>
                <Textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="input-dark min-h-[80px]"
                  placeholder="Any notes for this session..."
                />
              </div>

              <Button
                onClick={startSession}
                disabled={!selectedUnit}
                className="w-full h-14 btn-primary text-lg gap-2"
                data-testid="start-session-btn"
              >
                <Play className="w-5 h-5" />
                Start Session
              </Button>

              {!nfcSupported && (
                <p className="text-center text-sm text-zinc-500">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Web NFC not supported. Using manual input mode.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Active Session Card */}
            <div className="telemetry-card rounded-2xl p-8 mb-6 relative overflow-hidden">
              {/* Animated Background */}
              {scanning && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-pulse" />
              )}

              <div className="relative z-10">
                {/* Session Info */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-accent-success animate-pulse" />
                      <span className="text-sm text-accent-success font-mono">SESSION ACTIVE</span>
                    </div>
                    <h2 className="font-unbounded font-bold text-2xl text-white">
                      {activeSession.unit_name}
                    </h2>
                    <p className="text-sm text-zinc-400">{activeSession.session_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-unbounded font-bold text-primary">
                      {attendanceCount}
                    </div>
                    <div className="text-xs text-zinc-500">Students Present</div>
                  </div>
                </div>

                {/* NFC Scanner Area */}
                <div className="bg-black/30 rounded-xl p-8 mb-6">
                  <div className="text-center">
                    <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center relative ${
                      scanning ? 'bg-primary/20' : 'bg-white/5'
                    }`}>
                      {scanning ? (
                        <Radio className="w-16 h-16 text-primary animate-pulse" />
                      ) : (
                        <Smartphone className="w-16 h-16 text-zinc-500" />
                      )}
                      {scanning && (
                        <>
                          <div className="absolute inset-0 rounded-full border-2 border-primary nfc-pulse-ring" />
                          <div className="absolute inset-0 rounded-full border-2 border-primary nfc-pulse-ring" style={{ animationDelay: '0.5s' }} />
                        </>
                      )}
                    </div>

                    <p className="mt-4 text-lg text-zinc-300">
                      {awaitingCrewNfc ? (
                        <span className="text-secondary">Tap your crew NFC card to confirm</span>
                      ) : scanning ? (
                        'Waiting for student NFC tap...'
                      ) : (
                        'Start NFC reader or use manual input'
                      )}
                    </p>

                    {assessmentMode && !awaitingCrewNfc && (
                      <p className="mt-2 text-sm text-secondary">
                        <Award className="w-4 h-4 inline mr-1" />
                        Assessment mode enabled - Rate students after attendance
                      </p>
                    )}
                  </div>
                </div>

                {/* NFC Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* NFC Toggle / Manual Input */}
                  {nfcSupported && !manualMode ? (
                    <Button
                      onClick={scanning ? () => setScanning(false) : startNfcReading}
                      className={`h-14 gap-2 ${scanning ? 'bg-accent-success hover:bg-accent-success/80' : 'btn-primary'}`}
                      data-testid="nfc-toggle"
                    >
                      <Radio className="w-5 h-5" />
                      {scanning ? 'NFC Reader Active' : 'Enable NFC Reader'}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={nfcInput}
                        onChange={(e) => setNfcInput(e.target.value.toUpperCase())}
                        className="input-dark h-14 font-mono text-center text-lg tracking-wider flex-1"
                        placeholder="NFC_XXXXXXXX"
                        onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                        data-testid="manual-nfc-input"
                      />
                      <Button
                        onClick={handleManualSubmit}
                        className="h-14 btn-primary px-6"
                        disabled={!nfcInput}
                        data-testid="manual-submit"
                      >
                        <Zap className="w-5 h-5" />
                      </Button>
                    </div>
                  )}

                  {/* End Session */}
                  <Button
                    onClick={endSession}
                    variant="outline"
                    className="h-14 border-accent/50 text-accent hover:bg-accent/10 gap-2"
                    data-testid="end-session-btn"
                  >
                    <Square className="w-5 h-5" />
                    End Session
                  </Button>
                </div>

                {/* Toggle Manual Mode */}
                {nfcSupported && (
                  <button
                    onClick={() => setManualMode(!manualMode)}
                    className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 underline"
                  >
                    {manualMode ? 'Use NFC Reader' : 'Use Manual Input Instead'}
                  </button>
                )}
              </div>
            </div>

            {/* Recent Attendees */}
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-zinc-500" />
                  <h3 className="font-unbounded font-semibold text-white">Recent Attendees</h3>
                </div>
                <span className="text-sm text-zinc-500">{recentAttendees.length} recorded</span>
              </div>

              {recentAttendees.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentAttendees.map((attendee, i) => (
                    <div 
                      key={i}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        attendee.status === 'success' 
                          ? 'border-accent-success/30 bg-accent-success/5'
                          : attendee.status === 'already_marked'
                            ? 'border-accent-warning/30 bg-accent-warning/5'
                            : 'border-accent/30 bg-accent/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {attendee.status === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-accent-success" />
                        ) : attendee.status === 'already_marked' ? (
                          <AlertCircle className="w-5 h-5 text-accent-warning" />
                        ) : (
                          <XCircle className="w-5 h-5 text-accent" />
                        )}
                        <div>
                          <p className="font-medium text-white">
                            {attendee.student_name || attendee.student?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs font-mono text-zinc-500">{attendee.nfc_card_id}</p>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(attendee.marked_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Smartphone className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">No attendance recorded yet</p>
                  <p className="text-sm text-zinc-600">Students can tap their NFC cards to mark attendance</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Location Info */}
        {location && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <MapPin className="w-3 h-3" />
            <span>GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
        )}
      </div>

      {/* Assessment Dialog */}
      <Dialog open={showAssessmentDialog} onOpenChange={(open) => {
        if (!open && !awaitingCrewNfc) {
          setShowAssessmentDialog(false);
          setCurrentStudent(null);
        }
      }}>
        <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              Assess {currentStudent?.full_name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Rate the student&apos;s performance in each category
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {assessmentCategories.filter(cat => cat.is_active).map(category => (
              <div key={category.category_id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">{category.name}</Label>
                  <span className="text-primary font-mono text-lg">
                    {assessmentRatings[category.category_id] || 3}/{category.scale_max}
                  </span>
                </div>
                <Slider
                  value={[assessmentRatings[category.category_id] || 3]}
                  onValueChange={(value) => setAssessmentRatings(prev => ({
                    ...prev,
                    [category.category_id]: value[0]
                  }))}
                  min={category.scale_min}
                  max={category.scale_max}
                  step={1}
                  className="w-full"
                />
                {category.description && (
                  <p className="text-xs text-zinc-500">{category.description}</p>
                )}
              </div>
            ))}

            <div className="space-y-2">
              <Label className="text-zinc-400">Notes (Optional)</Label>
              <Textarea
                value={assessmentNotes}
                onChange={(e) => setAssessmentNotes(e.target.value)}
                className="input-dark min-h-[80px]"
                placeholder="Additional feedback for the student..."
              />
            </div>

            {awaitingCrewNfc ? (
              <div className="bg-secondary/20 rounded-lg p-6 text-center">
                <Radio className="w-12 h-12 text-secondary mx-auto mb-3 animate-pulse" />
                <p className="text-secondary font-medium">Tap your crew NFC card to confirm</p>
                <p className="text-sm text-zinc-400 mt-1">Or enter NFC ID below:</p>
                <div className="flex gap-2 mt-3">
                  <Input
                    value={nfcInput}
                    onChange={(e) => setNfcInput(e.target.value.toUpperCase())}
                    className="input-dark font-mono text-center"
                    placeholder="CREW_NFC_ID"
                  />
                  <Button
                    onClick={() => confirmAssessmentWithNfc(nfcInput)}
                    disabled={!nfcInput}
                    className="btn-secondary"
                  >
                    Confirm
                  </Button>
                </div>
                <button
                  onClick={() => setAwaitingCrewNfc(false)}
                  className="mt-3 text-sm text-zinc-500 hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <Button 
                onClick={submitAssessment} 
                className="w-full btn-primary gap-2"
                data-testid="submit-assessment-btn"
              >
                <FileCheck className="w-5 h-5" />
                Submit Assessment
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CSS for NFC pulse animation */}
      <style>{`
        @keyframes nfc-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .nfc-pulse-ring {
          animation: nfc-pulse 1.5s ease-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CrewAttendanceMode;
