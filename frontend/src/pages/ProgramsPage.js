import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Calendar, Clock, Users, CheckCircle2, ChevronRight,
  Award, Zap, CreditCard, Landmark, MapPin, Phone, User,
  Loader2, LogIn, Smartphone, Lock, CalendarDays
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProgramsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [nfcLoginOpen, setNfcLoginOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [nfcId, setNfcId] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const [leadForm, setLeadForm] = useState({
    name: '',
    location: '',
    mobile: '',
    program_interest: '',
    fee_type: ''
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API}/programs`);
      setPrograms(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNFCLogin = async () => {
    if (!nfcId) {
      toast.error('Please enter your NFC Card ID');
      return;
    }

    setSubmitting(true);
    try {
      // Check if NFC card exists
      const response = await axios.get(`${API}/students/nfc/${nfcId.toUpperCase()}`);
      if (response.data) {
        toast.success(`Welcome back, ${response.data.full_name}!`);
        // Redirect to ID card view or dashboard
        navigate(`/id/${nfcId.toUpperCase()}`);
      }
    } catch (error) {
      toast.error('NFC Card not found. Please register first.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.name || !leadForm.mobile || !leadForm.program_interest || !leadForm.fee_type) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/leads`, leadForm);
      toast.success('Thank you! Our team will contact you shortly.');
      setRegisterOpen(false);
      setLeadForm({
        name: '',
        location: '',
        mobile: '',
        program_interest: '',
        fee_type: ''
      });
    } catch (error) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openRegisterDialog = (program) => {
    setSelectedProgram(program);
    setLeadForm({ ...leadForm, program_interest: program?.name || '' });
    setRegisterOpen(true);
  };

  const defaultPrograms = [
    {
      program_id: 'cert_racing',
      name: 'Racing Fundamentals',
      program_type: 'certification',
      description: 'Master the basics of motorsport racing techniques and safety protocols',
      duration_weeks: 4,
      batch_size: 20,
      highlights: ['Track basics & safety', 'Vehicle handling', 'Race etiquette', 'Certification exam']
    },
    {
      program_id: 'diploma_pro',
      name: 'Professional Racing',
      program_type: 'diploma',
      description: 'Advanced training program for competitive racing careers',
      duration_weeks: 12,
      batch_size: 15,
      highlights: ['Advanced techniques', 'Race strategy', 'Pit crew training', 'Media handling']
    },
    {
      program_id: 'pg_mgmt',
      name: 'Motorsport Management',
      program_type: 'pg_diploma',
      description: 'Complete motorsport industry expertise with placement support',
      duration_weeks: 24,
      batch_size: 10,
      highlights: ['Team management', 'Event coordination', 'Sponsorship deals', 'Industry placement']
    }
  ];

  const displayPrograms = programs.length > 0 ? programs : defaultPrograms;

  const getProgramStyle = (type) => {
    switch (type) {
      case 'certification':
        return { gradient: 'from-cyan-500 to-blue-600', badge: 'bg-cyan-500/20 text-cyan-400', icon: '🏁' };
      case 'diploma':
        return { gradient: 'from-purple-500 to-pink-600', badge: 'bg-purple-500/20 text-purple-400', icon: '🏆' };
      case 'pg_diploma':
        return { gradient: 'from-orange-500 to-red-600', badge: 'bg-orange-500/20 text-orange-400', icon: '👑' };
      default:
        return { gradient: 'from-gray-500 to-gray-600', badge: 'bg-gray-500/20 text-gray-400', icon: '📚' };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <KotlerXLogo size="md" variant="header" />
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate('/dashboard')}
                className="btn-primary gap-2"
                data-testid="go-dashboard-btn"
              >
                Dashboard
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setNfcLoginOpen(true)}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 gap-2"
                  data-testid="nfc-login-btn"
                >
                  <Smartphone className="w-4 h-4" />
                  NFC Login
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className="text-zinc-400 hover:text-white"
                  data-testid="login-btn"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center relative z-10">
          <h1 className="font-unbounded font-bold text-2xl md:text-4xl lg:text-5xl text-white mb-3">
            OUR <span className="gradient-text">PROGRAMS</span>
          </h1>
          <p className="font-inter text-zinc-400 text-sm md:text-base max-w-2xl mx-auto">
            Choose your path to motorsport excellence. From certification to post-graduate diploma, 
            we have the perfect program for every aspiring professional.
          </p>
        </div>
      </section>

      {/* Program Type Filter Tiles */}
      <section className="py-6 md:py-8 border-y border-white/5 bg-surface/50 sticky top-[65px] z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {[
              { key: 'all', label: 'All', icon: Award, gradient: 'from-white/10 to-white/5', activeGradient: 'from-primary/30 to-cyan-500/20', borderColor: 'border-primary', color: 'text-primary', count: displayPrograms.length },
              { key: 'certification', label: 'Certificate', icon: Zap, gradient: 'from-cyan-500/10 to-blue-500/5', activeGradient: 'from-cyan-500/30 to-blue-600/20', borderColor: 'border-cyan-400', color: 'text-cyan-400', count: displayPrograms.filter(p => p.program_type === 'certification').length },
              { key: 'diploma', label: 'Diploma', icon: Award, gradient: 'from-purple-500/10 to-pink-500/5', activeGradient: 'from-purple-500/30 to-pink-600/20', borderColor: 'border-purple-400', color: 'text-purple-400', count: displayPrograms.filter(p => p.program_type === 'diploma').length },
              { key: 'pg_diploma', label: 'PG Diploma', icon: Calendar, gradient: 'from-orange-500/10 to-red-500/5', activeGradient: 'from-orange-500/30 to-red-600/20', borderColor: 'border-orange-400', color: 'text-orange-400', count: displayPrograms.filter(p => p.program_type === 'pg_diploma').length }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveFilter(item.key)}
                className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 transition-all duration-200 bg-gradient-to-br ${
                  activeFilter === item.key
                    ? `${item.activeGradient} ${item.borderColor} shadow-lg`
                    : `${item.gradient} border-white/10 hover:border-white/20`
                }`}
                data-testid={`filter-${item.key}`}
              >
                <item.icon className={`w-5 h-5 md:w-6 md:h-6 mb-1 ${activeFilter === item.key ? item.color : 'text-zinc-500'}`} />
                <span className={`text-[11px] md:text-sm font-bold leading-tight text-center ${activeFilter === item.key ? 'text-white' : 'text-zinc-400'}`}>
                  {item.label}
                </span>
                <span className={`text-[9px] md:text-xs mt-0.5 ${activeFilter === item.key ? item.color : 'text-zinc-600'}`}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            </div>
          ) : (
            <>
              {/* Active filter label */}
              <p className="text-zinc-500 text-sm mb-4 md:mb-6">
                Showing {activeFilter === 'all' ? 'all programs' : activeFilter.replace('_', ' ') + ' programs'} 
                ({(activeFilter === 'all' ? displayPrograms : displayPrograms.filter(p => p.program_type === activeFilter)).length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {(activeFilter === 'all' ? displayPrograms : displayPrograms.filter(p => p.program_type === activeFilter)).map((program) => {
                const style = getProgramStyle(program.program_type);
                return (
                  <div
                    key={program.program_id}
                    className="telemetry-card rounded-2xl overflow-hidden group hover:border-primary/30 transition-all"
                  >
                    {/* Header */}
                    <div className={`h-28 md:h-36 bg-gradient-to-br ${style.gradient} relative p-4 md:p-6`}>
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl md:text-3xl">{style.icon}</span>
                          <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-mono uppercase ${style.badge}`}>
                            {program.program_type?.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-unbounded font-bold text-base md:text-xl text-white leading-tight">{program.name}</h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-6">
                      <p className="text-xs md:text-sm text-zinc-400 mb-3 md:mb-4 line-clamp-2">
                        {program.description}
                      </p>

                      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5 text-xs md:text-sm">
                        {program.duration_weeks && (
                          <div className="flex items-center gap-1 text-zinc-500">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{program.duration_weeks} weeks</span>
                          </div>
                        )}
                        {program.batch_size && (
                          <div className="flex items-center gap-1 text-zinc-500">
                            <Users className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Batch: {program.batch_size}</span>
                          </div>
                        )}
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                        <p className="text-[10px] md:text-xs text-zinc-500 font-mono uppercase">Highlights</p>
                        {(program.highlights || []).slice(0, 4).map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs md:text-sm text-zinc-300">
                            <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="leading-tight">{item}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => openRegisterDialog(program)}
                        className={`w-full gap-2 h-10 md:h-11 text-sm ${
                          program.registration_open === false 
                            ? 'bg-secondary text-black hover:bg-secondary/90' 
                            : 'btn-primary'
                        }`}
                        data-testid={`register-${program.program_id}`}
                      >
                        {program.registration_open === false ? (
                          <>
                            <CalendarDays className="w-4 h-4" />
                            {program.next_batch_date 
                              ? `Next Batch: ${new Date(program.next_batch_date).toLocaleDateString()}` 
                              : 'Join Waitlist'
                            }
                          </>
                        ) : (
                          <>
                            Register Interest
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                      {program.registration_open === false && (
                        <p className="text-[10px] md:text-xs text-center text-zinc-500 mt-2">
                          <Lock className="w-3 h-3 inline mr-1" />
                          Reserve your spot for the next batch
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
              
              {/* Empty state */}
              {(activeFilter !== 'all' && displayPrograms.filter(p => p.program_type === activeFilter).length === 0) && (
                <div className="text-center py-12">
                  <p className="text-zinc-500">No {activeFilter.replace('_', ' ')} programs available yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-surface border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-unbounded font-bold text-3xl text-white mb-4">
            Already a Student?
          </h2>
          <p className="text-zinc-400 mb-8">
            Tap your NFC card or enter your NFC ID to access your dashboard
          </p>
          <Button
            onClick={() => setNfcLoginOpen(true)}
            className="btn-primary h-14 px-10 text-lg gap-3"
            data-testid="nfc-login-cta-btn"
          >
            <Smartphone className="w-6 h-6" />
            Login with NFC Card
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <KotlerXLogo size="sm" className="justify-center mb-4" />
          <p className="text-sm text-zinc-500">
            India's First NFC + AI Skill Platform for Motorsport Education
          </p>
        </div>
      </footer>

      {/* NFC Login Dialog */}
      <Dialog open={nfcLoginOpen} onOpenChange={setNfcLoginOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-primary" />
              NFC Login
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <p className="text-zinc-400 text-sm">
              Enter your NFC Card ID to access your student profile
            </p>

            <div className="space-y-2">
              <Label className="text-zinc-400">NFC Card ID</Label>
              <Input
                value={nfcId}
                onChange={(e) => setNfcId(e.target.value.toUpperCase())}
                className="input-dark h-14 font-mono text-center text-xl tracking-widest"
                placeholder="NFC_XXXXXXXX"
                data-testid="nfc-id-input"
              />
            </div>

            <Button
              onClick={handleNFCLogin}
              disabled={submitting || !nfcId}
              className="w-full h-12 btn-primary"
              data-testid="nfc-login-submit-btn"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access My Profile'}
            </Button>

            <p className="text-xs text-zinc-500 text-center">
              Don't have an NFC card? <button onClick={() => { setNfcLoginOpen(false); setRegisterOpen(true); }} className="text-primary hover:underline">Register for a program</button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Registration Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">
              {selectedProgram?.registration_open === false ? 'Join Waitlist for Next Batch' : 'Register Interest'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedProgram && (
              <div className={`p-4 rounded-lg border mb-4 ${
                selectedProgram.registration_open === false 
                  ? 'bg-secondary/10 border-secondary/30' 
                  : 'bg-primary/10 border-primary/30'
              }`}>
                <p className={`text-xs font-mono uppercase mb-1 ${
                  selectedProgram.registration_open === false ? 'text-secondary' : 'text-primary'
                }`}>
                  {selectedProgram.registration_open === false ? 'Next Batch' : 'Selected Program'}
                </p>
                <p className="text-white font-semibold">{selectedProgram.name}</p>
                {selectedProgram.registration_open === false && selectedProgram.next_batch_date && (
                  <p className="text-sm text-secondary mt-1">
                    <CalendarDays className="w-4 h-4 inline mr-1" />
                    Starting: {new Date(selectedProgram.next_batch_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-zinc-400">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="input-dark h-12 pl-11"
                  placeholder="Enter your name"
                  data-testid="lead-name-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Location (City) *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  value={leadForm.location}
                  onChange={(e) => setLeadForm({ ...leadForm, location: e.target.value })}
                  className="input-dark h-12 pl-11"
                  placeholder="Enter your city"
                  data-testid="lead-location-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Mobile Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  value={leadForm.mobile}
                  onChange={(e) => setLeadForm({ ...leadForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="input-dark h-12 pl-11"
                  placeholder="Enter mobile number"
                  data-testid="lead-mobile-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Program Interest *</Label>
              <Select
                value={leadForm.program_interest}
                onValueChange={(v) => setLeadForm({ ...leadForm, program_interest: v })}
              >
                <SelectTrigger className="input-dark h-12" data-testid="lead-program-select">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/10">
                  {displayPrograms.map(p => (
                    <SelectItem key={p.program_id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Fee Payment Type *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLeadForm({ ...leadForm, fee_type: 'cash' })}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                    leadForm.fee_type === 'cash'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                  data-testid="fee-cash-btn"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeadForm({ ...leadForm, fee_type: 'loan' })}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                    leadForm.fee_type === 'loan'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                  data-testid="fee-loan-btn"
                >
                  <Landmark className="w-5 h-5" />
                  <span>Loan</span>
                </button>
              </div>
            </div>

            <Button
              onClick={handleLeadSubmit}
              disabled={submitting || !leadForm.name || !leadForm.mobile || !leadForm.program_interest || !leadForm.fee_type}
              className="w-full h-12 btn-primary mt-4"
              data-testid="submit-lead-btn"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Registration'}
            </Button>

            <p className="text-xs text-zinc-500 text-center">
              Our team will contact you within 24 hours
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramsPage;
