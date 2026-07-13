import React, { useState, useEffect } from 'react';
import SplitText from '@/components/ui/SplitText';
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
  Loader2, LogIn, Smartphone, Lock, CalendarDays,
  GraduationCap, Medal, Trophy
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProgramsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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
      const response = await axios.get(`${API}/students/nfc/${nfcId.toUpperCase()}`);
      if (response.data) {
        toast.success(`Welcome back, ${response.data.full_name}!`);
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
      description: 'Master the basics of motorsport racing techniques and safety protocols.',
      duration_weeks: 4,
      batch_size: 20,
      highlights: ['Track basics & safety', 'Vehicle handling', 'Race etiquette', 'Certification exam']
    },
    {
      program_id: 'diploma_pro',
      name: 'Professional Racing',
      program_type: 'diploma',
      description: 'Advanced training program for competitive racing careers.',
      duration_weeks: 12,
      batch_size: 15,
      highlights: ['Advanced techniques', 'Race strategy', 'Pit crew training', 'Media handling']
    },
    {
      program_id: 'pg_mgmt',
      name: 'Motorsport Management',
      program_type: 'pg_diploma',
      description: 'Complete motorsport industry expertise with placement support.',
      duration_weeks: 24,
      batch_size: 10,
      highlights: ['Team management', 'Event coordination', 'Sponsorship deals', 'Industry placement']
    }
  ];

  const displayPrograms = programs.length > 0 ? programs : defaultPrograms;

  const getProgramIcon = (type) => {
    let src = '';
    let alt = '';
    switch (type) {
      case 'certification':
        src = '/assets/biker.png';
        alt = 'Biker';
        break;
      case 'diploma':
        src = '/assets/racer.png';
        alt = 'Racer';
        break;
      case 'pg_diploma':
        src = '/assets/wheel.png';
        alt = 'Steering Wheel';
        break;
      default:
        src = '/assets/biker.png';
        alt = 'Biker';
    }
    return (
      <img
        src={src}
        alt={alt}
        className="w-12 h-12 object-contain transition-transform duration-300 hover:scale-125"
      />
    );
  };

  const filterOptions = [
    { key: 'all', label: 'All Programs', count: displayPrograms.length },
    { key: 'certification', label: 'Certificate', count: displayPrograms.filter(p => p.program_type === 'certification').length },
    { key: 'diploma', label: 'Diploma', count: displayPrograms.filter(p => p.program_type === 'diploma').length },
    { key: 'pg_diploma', label: 'PG Diploma', count: displayPrograms.filter(p => p.program_type === 'pg_diploma').length }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <KotlerXLogo size="md" variant="header" />
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} className="bg-[#00e5ff] text-black hover:bg-[#00e5ff]/90 font-semibold" data-testid="go-dashboard-btn">
                Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => setNfcLoginOpen(true)} variant="outline" className="border-white/10 text-white hover:border-[#00e5ff] hover:text-[#00e5ff] hover:bg-transparent" data-testid="nfc-login-btn">
                  <Smartphone className="w-4 h-4 mr-2" />
                  NFC Login
                </Button>
                <Button onClick={() => navigate('/login')} variant="ghost" className="text-zinc-300 hover:text-[#00e5ff] hover:bg-transparent" data-testid="login-btn">
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <SplitText 
            text="OUR PROGRAMS" 
            tag="h1" 
            className="font-unbounded font-bold text-3xl md:text-5xl text-white mb-4" 
          />
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
            Choose your path to motorsport excellence. From certification to post-graduate diploma, 
            we have the perfect program for every aspiring professional.
          </p>
        </div>
      </section>

      {/* Modern Pill Filters */}
      <section className="pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {filterOptions.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveFilter(item.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${
                  activeFilter === item.key
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {item.label} <span className="opacity-60 ml-1">({item.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-8 md:py-12 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeFilter === 'all' ? displayPrograms : displayPrograms.filter(p => p.program_type === activeFilter)).map((program) => {
                return (
                  <div
                    key={program.program_id}
                    className="flex flex-col bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="p-6 md:p-8 flex-1">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300 overflow-visible">
                          {getProgramIcon(program.program_type)}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-zinc-300 capitalize">
                          {program.program_type?.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <h3 className="font-unbounded font-semibold text-xl text-[#00e5ff] mb-3">
                        {program.name}
                      </h3>
                      <p className="text-sm text-zinc-400 mb-6 line-clamp-3">
                        {program.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-zinc-300 mb-6">
                        {program.duration_weeks && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            <span>{program.duration_weeks} wks</span>
                          </div>
                        )}
                        {program.batch_size && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-zinc-500" />
                            <span>{program.batch_size} seats</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-8">
                        {(program.highlights || []).slice(0, 4).map((item, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 opacity-80" />
                            <span className="leading-tight">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 pt-0 mt-auto">
                      <Button
                        onClick={() => openRegisterDialog(program)}
                        variant={program.registration_open === false ? "secondary" : "default"}
                        className={`w-full font-medium h-12 ${
                          program.registration_open === false 
                            ? 'bg-white/10 text-white hover:bg-#00e5ff' 
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                      >
                        {program.registration_open === false ? (
                          <>
                            <CalendarDays className="w-4 h-4 mr-2" />
                            {program.next_batch_date 
                              ? `Next Batch: ${new Date(program.next_batch_date).toLocaleDateString()}` 
                              : 'Join Waitlist'
                            }
                          </>
                        ) : (
                          'Register Interest'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {!loading && activeFilter !== 'all' && displayPrograms.filter(p => p.program_type === activeFilter).length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500">No {activeFilter.replace('_', ' ')} programs available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-surface border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-unbounded font-semibold text-2xl md:text-3xl text-white mb-4">
            Already a Student?
          </h2>
          <p className="text-zinc-400 mb-8">
            Tap your NFC card or enter your NFC ID to access your dashboard.
          </p>
          <Button
            onClick={() => setNfcLoginOpen(true)}
            className="bg-primary text-black hover:bg-primary/90 h-14 px-8 text-base font-medium"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Login with NFC Card
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <KotlerXLogo size="sm" className="justify-center mb-6 opacity-50 hover:opacity-100 transition-opacity" />
          <p className="text-sm text-zinc-500">
            India's First NFC + AI Skill Platform for Motorsport Education
          </p>
        </div>
      </footer>

      {/* Dialogs... (NFC Login & Registration kept same logic, just cleaner UI) */}
      <Dialog open={nfcLoginOpen} onOpenChange={setNfcLoginOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              <Smartphone className="w-5 h-5" />
              NFC Login
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Card ID</Label>
              <Input
                value={nfcId}
                onChange={(e) => setNfcId(e.target.value.toUpperCase())}
                className="bg-black/50 border-white/10 h-12 font-mono text-center tracking-widest text-white"
                placeholder="NFC_XXXXXXXX"
              />
            </div>
            <Button
              onClick={handleNFCLogin}
              disabled={submitting || !nfcId}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Access Profile'}
            </Button>
            <p className="text-sm text-zinc-500 text-center">
              Don't have a card? <button onClick={() => { setNfcLoginOpen(false); setRegisterOpen(true); }} className="text-white hover:underline">Register here</button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">
              {selectedProgram?.registration_open === false ? 'Join Waitlist' : 'Register Interest'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {selectedProgram && (
              <div className="p-4 rounded-xl border border-white/10 bg-black/20 mb-2">
                <p className="text-xs text-zinc-500 uppercase mb-1">
                  {selectedProgram.registration_open === false ? 'Waitlist For' : 'Selected Program'}
                </p>
                <p className="text-white font-medium">{selectedProgram.name}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="bg-black/50 border-white/10 h-11 pl-10 text-white"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    value={leadForm.location}
                    onChange={(e) => setLeadForm({ ...leadForm, location: e.target.value })}
                    className="bg-black/50 border-white/10 h-11 pl-10 text-white"
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    value={leadForm.mobile}
                    onChange={(e) => setLeadForm({ ...leadForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="bg-black/50 border-white/10 h-11 pl-10 text-white"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Program Interest</Label>
                <Select
                  value={leadForm.program_interest}
                  onValueChange={(v) => setLeadForm({ ...leadForm, program_interest: v })}
                >
                  <SelectTrigger className="bg-black/50 border-white/10 h-11 text-white">
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-white/10">
                    {displayPrograms.map(p => (
                      <SelectItem key={p.program_id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-400 text-xs">Payment Preference</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLeadForm({ ...leadForm, fee_type: 'cash' })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm transition-colors ${
                      leadForm.fee_type === 'cash'
                        ? 'bg-white text-black border-white'
                        : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadForm({ ...leadForm, fee_type: 'loan' })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm transition-colors ${
                      leadForm.fee_type === 'loan'
                        ? 'bg-white text-black border-white'
                        : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                    Loan
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLeadSubmit}
              disabled={submitting || !leadForm.name || !leadForm.mobile || !leadForm.program_interest || !leadForm.fee_type}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 mt-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Details'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramsPage;
