import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GlitchText from '@/components/ui/GlitchText';
import DecryptedText from '@/components/ui/DecryptedText';
import BlurText from '@/components/ui/BlurText';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import GlowingCard from '@/components/ui/GlowingCard';
import TextScramble from '@/components/ui/TextScramble';
import FloatingParticles from '@/components/ui/FloatingParticles';
import MagneticButton from '@/components/ui/MagneticButton';
import RotatingWords from '@/components/ui/RotatingWords';
import Spotlight from '@/components/ui/Spotlight';
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
  Sparkles, TrendingUp, Zap, Rocket, Target, Award, Shield, GraduationCap
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ─── Animated Program Card ───────────────────────────────────────────────────
function AnimatedProgramCard({ program, gradient, borderGradient, index, onClick, getProgramImage }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <RevealOnScroll animation="flip" delay={index * 0.1}>
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        className={`group relative rounded-2xl border border-white/10 backdrop-blur-sm bg-gradient-to-br ${gradient} p-8 flex flex-col overflow-hidden cursor-pointer`}
        style={{ transformStyle: 'preserve-3d', minHeight: '400px' }}
        whileHover={{
          scale: 1.03,
          rotateY: 3,
          rotateX: -3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Spotlight effect */}
        <motion.div
          className="absolute pointer-events-none rounded-2xl"
          style={{
            width: 300,
            height: 300,
            x: mousePosition.x - 150,
            y: mousePosition.y - 150,
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            opacity: isHovered ? 1 : 0
          }}
        />

        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, ${borderGradient}, transparent)`,
            filter: 'blur(1px)'
          }}
          animate={isHovered ? { rotate: [0, 360] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          animate={isHovered ? { x: ['-100%', '100%'] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            width: '50%'
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <motion.div
              className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden"
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {getProgramImage(program.program_type)}
            </motion.div>

            <motion.div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${borderGradient.replace('rgba', 'rgb').replace(/,[\d.]+\)/, ')')} bg-opacity-20`}
              animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-white"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {program.program_type?.replace('_', ' ').replace('pg diploma', 'PG Diploma').replace('certification', 'Certificate')}
            </motion.div>
          </div>

          {/* Content */}
          <h3 className="font-unbounded font-bold text-xl text-white mb-3">
            {isHovered ? (
              <GlitchText speed={1.5} enableShadows>
                {program.name}
              </GlitchText>
            ) : (
              <TextScramble text={program.name} trigger="hover" />
            )}
          </h3>

          <p className="text-sm text-zinc-300 mb-6 leading-relaxed flex-grow">
            {program.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-sm text-zinc-300 mb-6 py-4 border-t border-b border-white/10">
            {program.duration_weeks && (
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1, color: '#00F0FF' }}
              >
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{program.duration_weeks} weeks</span>
              </motion.div>
            )}
            {program.batch_size && (
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1, color: '#00F0FF' }}
              >
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">{program.batch_size} seats</span>
              </motion.div>
            )}
          </div>

          {/* Highlights */}
          {program.highlights && program.highlights.length > 0 && (
            <div className="space-y-2 mb-6 flex-grow">
              {program.highlights.slice(0, 3).map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 text-sm text-zinc-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0.8, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <MagneticButton strength={20}>
            <motion.div
              className={`w-full h-12 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                program.registration_open === false
                  ? 'bg-white/10 text-white'
                  : 'bg-gradient-to-r from-primary to-cyan-400 text-black'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
                  <span>Explore Program</span>
                  <motion.div
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </>
              )}
            </motion.div>
          </MagneticButton>
        </div>

        {/* Sparkle effects on hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.random() * 300 - 150,
                    y: Math.random() * 400 - 200
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.15 }}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                >
                  <Sparkles className="w-4 h-4 text-white/60" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </RevealOnScroll>
  );
}

// ─── Animated Stats ───────────────────────────────────────────────────────────
function AnimatedStat({ value, label, icon: Icon, delay = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(numericValue * eased));

            if (progress < 1) requestAnimationFrame(animate);
          };

          setTimeout(() => requestAnimationFrame(animate), delay);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, delay]);

  const suffix = String(value).replace(/[0-9.]/g, '');

  return (
    <motion.div
      ref={ref}
      className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center"
      whileHover={{ scale: 1.05, borderColor: 'rgba(0, 240, 255, 0.3)' }}
    >
      <motion.div
        className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <Icon className="w-6 h-6 text-primary" />
      </motion.div>
      <motion.div
        className="text-3xl font-unbounded font-bold mb-1"
        style={{
          background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        {count}{suffix}
      </motion.div>
      <div className="text-xs text-zinc-400 uppercase tracking-wide">{label}</div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
  const [scrollY, setScrollY] = useState(0);

  const [leadForm, setLeadForm] = useState({
    name: '',
    location: '',
    mobile: '',
    program_interest: '',
    fee_type: ''
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { key: 'all', label: 'All Programs', count: displayPrograms.length, icon: Target },
    { key: 'certification', label: 'Certificate', count: displayPrograms.filter(p => p.program_type === 'certification').length, icon: Award },
    { key: 'diploma', label: 'Diploma', count: displayPrograms.filter(p => p.program_type === 'diploma').length, icon: GraduationCap },
    { key: 'pg_diploma', label: 'PG Diploma', count: displayPrograms.filter(p => p.program_type === 'pg_diploma').length, icon: Shield }
  ];

  const gradients = [
    'from-cyan-500/20 to-blue-500/20',
    'from-purple-500/20 to-pink-500/20',
    'from-orange-500/20 to-red-500/20',
    'from-green-500/20 to-teal-500/20',
    'from-indigo-500/20 to-purple-500/20',
    'from-yellow-500/20 to-orange-500/20'
  ];

  const borderGradients = [
    'rgba(0, 240, 255, 0.5)',
    'rgba(168, 85, 247, 0.5)',
    'rgba(239, 68, 68, 0.5)',
    'rgba(34, 197, 94, 0.5)',
    'rgba(99, 102, 241, 0.5)',
    'rgba(245, 158, 11, 0.5)'
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingParticles
          count={40}
          colors={['#00F0FF', '#7000FF', '#FF003C']}
          minSize={1}
          maxSize={4}
          speed={0.2}
        />
      </div>

      {/* Navigation */}
      <motion.header
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backgroundColor: scrollY > 50 ? 'rgba(9, 9, 11, 0.95)' : 'rgba(9, 9, 11, 0.4)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
          >
            <KotlerXLogo size="md" variant="header" />
          </motion.div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <MagneticButton strength={30}>
                <Button onClick={() => navigate('/dashboard')} className="bg-primary text-black hover:bg-primary/90 px-6 font-semibold">
                  Dashboard
                </Button>
              </MagneticButton>
            ) : (
              <>
                <MagneticButton strength={25}>
                  <Button onClick={() => setNfcLoginOpen(true)} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <Smartphone className="w-4 h-4 mr-2" />
                    NFC Login
                  </Button>
                </MagneticButton>
                <MagneticButton strength={25}>
                  <Button onClick={() => navigate('/login')} className="bg-white/10 text-white hover:bg-white/20">
                    Sign In
                  </Button>
                </MagneticButton>
              </>
            )}
          </div>

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
      </motion.header>

      {/* Hero Section */}
      <Spotlight className="relative py-20 md:py-32 overflow-hidden" spotlightColor="#7000FF" spotlightSize={500}>
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, 20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              x: [0, -30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <RevealOnScroll animation="pop">
            <h1 className="font-unbounded font-black tracking-tight mb-6 text-white leading-tight text-4xl md:text-6xl lg:text-7xl">
              <span className="block">
                <RotatingWords
                  words={['UNLOCK', 'DISCOVER', 'UNLEASH', 'IGNITE']}
                  interval={2500}
                  textClassName="gradient-text"
                />
              </span>
              <span className="block mt-2">
                <GlitchText speed={2} enableShadows enableOnHover>
                  YOUR FULL POTENTIAL
                </GlitchText>
              </span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll animation="fadeUp" delay={0.3}>
            <BlurText
              text="Choose your path to excellence with our comprehensive programs in automotive, motorsport, and media. Find the perfect fit for your career goals."
              className="font-inter text-lg text-zinc-400 max-w-2xl mx-auto mb-12"
              delay={20}
              animateBy="words"
            />
          </RevealOnScroll>

          {/* Quick Stats */}
          <RevealOnScroll animation="slideUp" delay={0.5}>
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <AnimatedStat value={`${filterOptions[0].count}+`} label="Programs" icon={Target} delay={0} />
              <AnimatedStat value="12+" label="Weeks Avg" icon={Clock} delay={200} />
              <AnimatedStat value="1000+" label="Graduates" icon={GraduationCap} delay={400} />
            </div>
          </RevealOnScroll>
        </div>
      </Spotlight>

      {/* Filter Section */}
      <motion.section
        className="sticky top-20 z-40 py-6 backdrop-blur-xl border-b border-white/5"
        style={{
          backgroundColor: scrollY > 100 ? 'rgba(9, 9, 11, 0.95)' : 'rgba(9, 9, 11, 0.6)'
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">
                <DecryptedText text="Filter by type" speed={30} animateOn="view" className="text-zinc-400" />
              </p>
              <motion.p
                className="text-xs text-zinc-500"
                key={activeFilter}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {(activeFilter === 'all' ? displayPrograms : displayPrograms.filter(p => p.program_type === activeFilter)).length} programs
              </motion.p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((item, idx) => (
                <MagneticButton key={item.key} strength={15}>
                  <motion.button
                    onClick={() => setActiveFilter(item.key)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border flex items-center gap-2 ${
                      activeFilter === item.key
                        ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                        : 'bg-white/5 text-zinc-300 border-white/10 hover:border-primary/30 hover:bg-white/[0.08]'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </motion.button>
                </MagneticButton>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Programs Grid */}
      <section className="py-16 md:py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl border border-white/5 p-8 space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                >
                  <div className="w-14 h-14 rounded-xl bg-white/10" />
                  <div className="h-6 bg-white/10 rounded-lg w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded" />
                    <div className="h-4 bg-white/10 rounded w-5/6" />
                  </div>
                  <div className="h-12 bg-white/10 rounded-lg mt-6" />
                </motion.div>
              ))}
            </div>
          ) : displayPrograms.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              layout
            >
              <AnimatePresence mode="popLayout">
                {(activeFilter === 'all' ? displayPrograms : displayPrograms.filter(p => p.program_type === activeFilter)).map((program, idx) => (
                  <AnimatedProgramCard
                    key={program.program_id}
                    program={program}
                    gradient={gradients[idx % gradients.length]}
                    borderGradient={borderGradients[idx % borderGradients.length]}
                    index={idx}
                    onClick={() => openRegisterDialog(program)}
                    getProgramImage={getProgramImage}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <RevealOnScroll animation="scale">
              <div className="text-center py-20">
                <motion.div
                  className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Search className="w-10 h-10 text-zinc-500" />
                </motion.div>
                <p className="text-zinc-400 text-xl mb-2">No programs found</p>
                <p className="text-sm text-zinc-500">Try adjusting your filters or check back later</p>
              </div>
            </RevealOnScroll>
          )}

          {!loading && activeFilter !== 'all' && displayPrograms.filter(p => p.program_type === activeFilter).length === 0 && (
            <RevealOnScroll animation="pop">
              <div className="text-center py-20">
                <motion.div
                  className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-10 h-10 text-primary" />
                </motion.div>
                <p className="text-zinc-400 text-xl mb-2">No {activeFilter.replace('_', ' ')} programs</p>
                <p className="text-sm text-zinc-500 mb-8">Explore other categories to find perfect programs</p>
                <MagneticButton strength={30}>
                  <Button
                    onClick={() => setActiveFilter('all')}
                    className="bg-primary text-black hover:bg-primary/90 px-8"
                  >
                    View All Programs
                  </Button>
                </MagneticButton>
              </div>
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden border-t border-white/5">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(112, 0, 255, 0.15) 100%)'
          }}
        />
        <FloatingParticles count={20} colors={['#ffffff15']} minSize={1} maxSize={3} speed={0.15} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <RevealOnScroll animation="blur">
            <h2 className="text-4xl md:text-5xl font-unbounded font-bold text-white mb-6">
              <TextScramble text="Already a Student?" trigger="hover" scrambleOnMount />
            </h2>
          </RevealOnScroll>

          <RevealOnScroll animation="fadeUp" delay={0.2}>
            <p className="text-lg text-zinc-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              <DecryptedText
                text="Tap your NFC card or enter your NFC ID to access your personalized dashboard and track your progress."
                speed={20}
                sequential
                animateOn="view"
                className="text-zinc-300"
                encryptedClassName="text-zinc-600"
              />
            </p>
          </RevealOnScroll>

          <RevealOnScroll animation="scale" delay={0.4}>
            <MagneticButton strength={50}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setNfcLoginOpen(true)}
                  className="h-16 px-12 text-lg font-semibold bg-primary text-black relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, white, transparent)'
                    }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    initial={{ opacity: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center gap-3">
                    <Smartphone className="w-6 h-6" />
                    Login with NFC Card
                  </span>
                </Button>
              </motion.div>
            </MagneticButton>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950/50 border-t border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8 md:mb-12">
            <div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <KotlerXLogo size="md" variant="header" />
              </motion.div>
              <p className="text-zinc-400 text-sm mt-4 leading-relaxed">
                India's first NFC and AI-powered skill platform for automotive, motorsport, and media education.
              </p>
            </div>

            <div>
              <p className="font-semibold text-white mb-4">Explore</p>
              <div className="space-y-2 text-sm text-zinc-400">
                <motion.button
                  onClick={() => navigate('/')}
                  className="hover:text-primary transition-colors block"
                  whileHover={{ x: 5 }}
                >
                  Home
                </motion.button>
                <motion.button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-primary transition-colors block"
                  whileHover={{ x: 5 }}
                >
                  Back to Top
                </motion.button>
                <motion.a
                  href="mailto:info@kotlerx.com"
                  className="hover:text-primary transition-colors block"
                  whileHover={{ x: 5 }}
                >
                  Contact
                </motion.a>
              </div>
            </div>

            <div>
              <p className="font-semibold text-white mb-4">Get Started</p>
              <div className="space-y-2 text-sm text-zinc-400">
                {isAuthenticated ? (
                  <motion.button
                    onClick={() => navigate('/dashboard')}
                    className="hover:text-primary transition-colors block"
                    whileHover={{ x: 5 }}
                  >
                    My Dashboard
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      onClick={() => navigate('/register')}
                      className="hover:text-primary transition-colors block"
                      whileHover={{ x: 5 }}
                    >
                      Register
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/login')}
                      className="hover:text-primary transition-colors block"
                      whileHover={{ x: 5 }}
                    >
                      Sign In
                    </motion.button>
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
              <motion.div
                className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Smartphone className="w-5 h-5 text-primary" />
              </motion.div>
              <TextScramble text="NFC Card Login" trigger="none" scrambleOnMount />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            <p className="text-sm text-zinc-400">
              <DecryptedText
                text="Enter your NFC card ID to access your personalized dashboard."
                speed={20}
                sequential
                animateOn="view"
                className="text-zinc-400"
              />
            </p>

            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">Card ID</Label>
              <Input
                value={nfcId}
                onChange={(e) => setNfcId(e.target.value.toUpperCase())}
                className="bg-white/5 border-white/10 h-12 font-mono text-center tracking-widest text-white placeholder-zinc-500"
                placeholder="NFC_XXXXXXXX"
              />
            </div>

            <MagneticButton strength={20} className="w-full">
              <Button
                onClick={handleNFCLogin}
                disabled={submitting || !nfcId}
                className="w-full h-12 bg-gradient-to-r from-primary to-cyan-400 text-black font-semibold"
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
            </MagneticButton>

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
              <motion.div
                className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
              {selectedProgram?.registration_open === false ? 'Join Waitlist' : 'Register Your Interest'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            {selectedProgram && (
              <GlowingCard glowColor="#00F0FF" glowSize={200} className="rounded-xl">
                <div className="p-4 border border-primary/30 rounded-xl bg-primary/5">
                  <p className="text-xs text-primary/70 uppercase font-semibold mb-1">
                    {selectedProgram.registration_open === false ? 'Joining Waitlist For' : 'Selected Program'}
                  </p>
                  <p className="text-white font-semibold text-lg">{selectedProgram.name}</p>
                </div>
              </GlowingCard>
            )}

            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setLeadForm({ ...leadForm, fee_type: 'cash' })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border font-medium transition-all duration-300 ${
                      leadForm.fee_type === 'cash'
                        ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:border-primary/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CreditCard className="w-4 h-4" />
                    Cash
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setLeadForm({ ...leadForm, fee_type: 'loan' })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border font-medium transition-all duration-300 ${
                      leadForm.fee_type === 'loan'
                        ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:border-primary/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <TrendingUp className="w-4 h-4" />
                    EMI Loan
                  </motion.button>
                </div>
              </div>
            </div>

            <MagneticButton strength={20} className="w-full">
              <Button
                onClick={handleLeadSubmit}
                disabled={submitting || !leadForm.name || !leadForm.mobile || !leadForm.program_interest || !leadForm.fee_type}
                className="w-full h-12 bg-gradient-to-r from-primary to-cyan-400 text-black font-semibold"
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
            </MagneticButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramsPage;
