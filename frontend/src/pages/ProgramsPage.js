import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Clock, Users, CheckCircle2,
  CreditCard, MapPin, Phone, User,
  Loader2, Smartphone, CalendarDays, Search, ArrowRight,
  Sparkles, TrendingUp, Zap
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProgramsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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

  const getProgramImage = (type) => {
    let src = '';
    let alt = '';
    switch (type) {
      case 'certification':
        src = '/assets/biker.png';
        alt = 'Certification Program';
        break;
      case 'diploma':
        src = '/assets/racer.png';
        alt = 'Diploma Program';
        break;
      case 'pg_diploma':
        src = '/assets/wheel.png';
        alt = 'PG Diploma Program';
        break;
      default:
        src = '/assets/biker.png';
        alt = 'Program';
    }
    return (
      <img
        src={src}
        alt={alt}
        className="w-14 h-14 object-contain transition-transform duration-300"
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <KotlerXLogo size="md" variant="header" />
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} className="bg-primary text-black hover:bg-primary/90 px-6 font-semibold">
                Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => setNfcLoginOpen(true)} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  <Smartphone className="w-4 h-4 mr-2" />
                  NFC Login
                </Button>
                <Button onClick={() => navigate('/login')} className="bg-white/10 text-white hover:bg-white/20">
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} size="sm" className="bg-primary text-black">
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => setNfcLoginOpen(true)} size="sm" variant="outline" className="border-primary/50">
                <Smartphone className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={4}
            blurStrength={8}
            containerClassName="text-center mb-6"
          >
            Unlock Your Full Potential
          </ScrollReveal>

          <ScrollReveal
            baseOpacity={0.2}
            enableBlur={true}
            baseRotation={2}
            blurStrength={4}
          >
            Choose your path to excellence with our comprehensive programs in automotive, motorsport, and media. Find the perfect fit for your career goals.
          </ScrollReveal>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-unbounded font-bold text-primary mb-1">{filterOptions[0].count}+</div>
              <div className="text-xs text-zinc-400">Programs</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-unbounded font-bold text-primary mb-1">12+</div>
              <div className="text-xs text-zinc-400">Weeks Avg</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-unbounded font-bold text-primary mb-1">1000+</div>
              <div className="text-xs text-zinc-400">Graduates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section - Premium */}
      <section className="sticky top-20 z-40 py-6 backdrop-blur-xl bg-zinc-950/40 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Filter by type</p>
              <p className="text-xs text-zinc-500">{(activeFilter === 'all' ? displayPrograms : displayPrograms.filter(p => p.program_type === activeFilter)).length} programs</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveFilter(item.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    activeFilter === item.key
                      ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                      : 'bg-white/5 text-zinc-300 border-white/10 hover:border-primary/30 hover:bg-white/[0.08]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 p-8 space-y-4 animate-pulse">
                  <div className="w-14 h-14 rounded-xl bg-white/10"></div>
                  <div className="h-6 bg-white/10 rounded-lg w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded"></div>
                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                  </div>
                  <div className="h-12 bg-white/10 rounded-lg mt-6"></div>
                </div>
              ))}
            </div>
          ) : displayPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(activeFilter === 'all' ? displayPrograms : displayPrograms.filter(p => p.program_type === activeFilter)).map((program, idx) => {
                const gradients = [
                  'from-cyan-500/20 to-blue-500/20',
                  'from-purple-500/20 to-pink-500/20',
                  'from-orange-500/20 to-red-500/20',
                  'from-green-500/20 to-teal-500/20',
                  'from-indigo-500/20 to-purple-500/20',
                  'from-yellow-500/20 to-orange-500/20'
                ];

                const borderGradients = [
                  'from-cyan-500 to-blue-500',
                  'from-purple-500 to-pink-500',
                  'from-orange-500 to-red-500',
                  'from-green-500 to-teal-500',
                  'from-indigo-500 to-purple-500',
                  'from-yellow-500 to-orange-500'
                ];

                return (
                  <div
                    key={program.program_id}
                    className={`group relative rounded-2xl border border-white/10 backdrop-blur-sm bg-gradient-to-br ${gradients[idx % gradients.length]} p-8 flex flex-col transition-all duration-300 hover:border-white/30 hover:shadow-xl hover:shadow-white/5 overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 overflow-hidden">
                          {getProgramImage(program.program_type)}
                        </div>

                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${borderGradients[idx % borderGradients.length]} bg-opacity-20`}>
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          {program.program_type?.replace('_', ' ').replace('pg diploma', 'PG Diploma').replace('certification', 'Certificate')}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="font-unbounded font-bold text-xl text-white mb-3 group-hover:text-primary transition-colors">
                        {program.name}
                      </h3>

                      <p className="text-sm text-zinc-300 mb-6 leading-relaxed flex-grow">
                        {program.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-zinc-300 mb-8 py-4 border-t border-b border-white/5">
                        {program.duration_weeks && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-medium">{program.duration_weeks} weeks</span>
                          </div>
                        )}
                        {program.batch_size && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="font-medium">{program.batch_size} seats</span>
                          </div>
                        )}
                      </div>

                      {/* Highlights */}
                      {program.highlights && program.highlights.length > 0 && (
                        <div className="space-y-2 mb-8 flex-grow">
                          {program.highlights.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA Button */}
                      <Button
                        onClick={() => openRegisterDialog(program)}
                        className={`w-full h-12 font-semibold transition-all duration-300 group/btn flex items-center justify-center gap-2 ${
                          program.registration_open === false
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-gradient-to-r from-primary to-cyan-400 text-black hover:shadow-lg hover:shadow-primary/50'
                        }`}
                      >
                        {program.registration_open === false ? (
                          <>
                            <CalendarDays className="w-4 h-4" />
                            {program.next_batch_date
                              ? `Next Batch: ${new Date(program.next_batch_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
                              : 'Join Waitlist'}
                          </>
                        ) : (
                          <>
                            Explore Program
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-zinc-500" />
              </div>
              <p className="text-zinc-400 text-lg mb-2">No programs found</p>
              <p className="text-sm text-zinc-500">Try adjusting your filters or check back later</p>
            </div>
          )}

          {!loading && activeFilter !== 'all' && displayPrograms.filter(p => p.program_type === activeFilter).length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-zinc-500" />
              </div>
              <p className="text-zinc-400 text-lg mb-2">No {activeFilter.replace('_', ' ')} programs</p>
              <p className="text-sm text-zinc-500 mb-6">Explore other categories to find perfect programs</p>
              <Button
                onClick={() => setActiveFilter('all')}
                className="bg-primary text-black hover:bg-primary/90"
              >
                View All Programs
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-unbounded font-bold text-white mb-6">
            Already a Student?
          </h2>

          <p className="text-lg text-zinc-300 mb-10 leading-relaxed">
            Tap your NFC card or enter your NFC ID to access your personalized dashboard and track your progress.
          </p>

          <Button
            onClick={() => setNfcLoginOpen(true)}
            className="h-14 px-10 text-base font-semibold bg-primary text-black hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Login with NFC Card
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950/50 border-t border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8 md:mb-12">
            <div>
              <KotlerXLogo size="md" variant="header" />
              <p className="text-zinc-400 text-sm mt-4 leading-relaxed">
                India's first NFC and AI-powered skill platform for automotive, motorsport, and media education.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-4">Explore</p>
              <div className="space-y-2 text-sm text-zinc-400">
                <button onClick={() => navigate('/')} className="hover:text-primary transition-colors block">Home</button>
                <button onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition-colors block">Back to Top</button>
                <a href="mailto:info@kotlerx.com" className="hover:text-primary transition-colors block">Contact</a>
              </div>
            </div>

            <div>
              <p className="font-semibold text-white mb-4">Get Started</p>
              <div className="space-y-2 text-sm text-zinc-400">
                {isAuthenticated ? (
                  <>
                    <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors block">My Dashboard</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate('/register')} className="hover:text-primary transition-colors block">Register</button>
                    <button onClick={() => navigate('/login')} className="hover:text-primary transition-colors block">Sign In</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center text-xs text-zinc-500">
            <p>&copy; 2025 KOTLERX. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* NFC Login Dialog */}
      <Dialog open={nfcLoginOpen} onOpenChange={setNfcLoginOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              NFC Card Login
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            <p className="text-sm text-zinc-400">Enter your NFC card ID to access your personalized dashboard.</p>

            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">Card ID</Label>
              <Input
                value={nfcId}
                onChange={(e) => setNfcId(e.target.value.toUpperCase())}
                className="bg-white/5 border-white/10 h-12 font-mono text-center tracking-widest text-white placeholder-zinc-500"
                placeholder="NFC_XXXXXXXX"
              />
            </div>

            <Button
              onClick={handleNFCLogin}
              disabled={submitting || !nfcId}
              className="w-full h-12 bg-gradient-to-r from-primary to-cyan-400 text-black font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Access Dashboard
                </>
              )}
            </Button>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-zinc-500 text-center">
                Don't have a card?{' '}
                <button
                  onClick={() => {
                    setNfcLoginOpen(false);
                    setRegisterOpen(true);
                  }}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Registration Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              {selectedProgram?.registration_open === false ? 'Join Waitlist' : 'Register Your Interest'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            {selectedProgram && (
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm">
                <p className="text-xs text-primary/70 uppercase font-semibold mb-1">
                  {selectedProgram.registration_open === false ? 'Joining Waitlist For' : 'Selected Program'}
                </p>
                <p className="text-white font-semibold text-lg">{selectedProgram.name}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="bg-white/5 border-white/10 h-12 pl-12 text-white placeholder-zinc-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    value={leadForm.location}
                    onChange={(e) => setLeadForm({ ...leadForm, location: e.target.value })}
                    className="bg-white/5 border-white/10 h-12 pl-12 text-white placeholder-zinc-500"
                    placeholder="Chennai, India"
                  />
                </div>
              </div>

              {/* Mobile Field */}
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    value={leadForm.mobile}
                    onChange={(e) => setLeadForm({ ...leadForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="bg-white/5 border-white/10 h-12 pl-12 text-white placeholder-zinc-500"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Program Selection */}
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Interested Program</Label>
                <Select
                  value={leadForm.program_interest}
                  onValueChange={(v) => setLeadForm({ ...leadForm, program_interest: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10">
                    {displayPrograms.map(p => (
                      <SelectItem key={p.program_id} value={p.name} className="text-white">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Preference */}
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLeadForm({ ...leadForm, fee_type: 'cash' })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border font-medium transition-all duration-300 ${
                      leadForm.fee_type === 'cash'
                        ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:border-primary/30 hover:bg-white/[0.08]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadForm({ ...leadForm, fee_type: 'loan' })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border font-medium transition-all duration-300 ${
                      leadForm.fee_type === 'loan'
                        ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:border-primary/30 hover:bg-white/[0.08]'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    EMI Loan
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLeadSubmit}
              disabled={submitting || !leadForm.name || !leadForm.mobile || !leadForm.program_interest || !leadForm.fee_type}
              className="w-full h-12 bg-gradient-to-r from-primary to-cyan-400 text-black font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Registration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgramsPage;
