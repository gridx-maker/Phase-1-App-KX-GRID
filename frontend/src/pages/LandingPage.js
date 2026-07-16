import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import kotlerxLogo from '../images/Vertical Logo with BG-01.png';
import SplitText from '@/components/ui/SplitText';
import DecryptedText from '@/components/ui/DecryptedText';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GlitchText from '@/components/ui/GlitchText';
import RotatingWords from '@/components/ui/RotatingWords';
import FloatingParticles from '@/components/ui/FloatingParticles';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import GlowingCard from '@/components/ui/GlowingCard';
import TextScramble from '@/components/ui/TextScramble';
import Spotlight from '@/components/ui/Spotlight';
import WavyText from '@/components/ui/WavyText';
import TiltedCard from '@/components/ui/TiltedCard';
import BlurText from '@/components/ui/BlurText';
import MagneticButton from '@/components/ui/MagneticButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import PromoCarousel from '@/components/PromoCarousel';
import CursorGrid from '@/components/ui/CursorGrid';
import Magnet from '@/components/ui/Magnet';
import ImageTrail from '@/components/ui/ImageTrail';
import axios from 'axios';
import { toast } from 'sonner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap, Shield, Award, Users, BarChart3,
  Smartphone, ChevronRight, Star, CheckCircle2,
  GraduationCap, Globe, Cpu, Play, Image as ImageIcon,
  Phone, Mail, MapPin, MessageSquare, Handshake, X, Loader2, Building2,
  Sparkles, Rocket, Target, TrendingUp
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ─── Animated Stat Counter ──────────────────────────────────────────────────
function AnimatedStatItem({ value, label, delay = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
          const suffix = String(value).replace(/[0-9.]/g, '');

          let start = 0;
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(numericValue * eased);
            setCount(current);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
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
      className="text-center group"
      whileHover={{ scale: 1.1, y: -5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <motion.div
        className="font-unbounded font-bold text-3xl md:text-4xl mb-2"
        style={{
          background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 50%, #FF003C 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 200%'
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      >
        {count}{suffix}
      </motion.div>
      <div className="font-inter text-xs text-zinc-500 tracking-wide uppercase group-hover:text-primary transition-colors">
        {label}
      </div>
    </motion.div>
  );
}

// ─── Feature Card with 3D Tilt ─────────────────────────────────────────────
function FeatureCard3D({ icon: Icon, title, description, index, glowColor }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX((y - centerY) / 10);
    setRotateY((centerX - x) / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <RevealOnScroll animation="pop" delay={index * 0.1}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        }}
        className="relative rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm cursor-pointer overflow-hidden group"
      >
        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${glowColor}40, transparent)`,
            opacity: isHovered ? 1 : 0
          }}
          animate={isHovered ? {
            x: ['-100%', '100%']
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Glow */}
        <motion.div
          className="absolute -inset-1 rounded-2xl blur-xl"
          style={{ background: glowColor }}
          animate={{ opacity: isHovered ? 0.2 : 0 }}
        />

        <div className="relative z-10" style={{ transform: 'translateZ(40px)' }}>
          <motion.div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
            style={{ background: `${glowColor}20` }}
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-7 h-7" style={{ color: glowColor }} />
          </motion.div>

          <h3 className="font-unbounded font-semibold text-lg text-white mb-3">
            <TextScramble text={title} trigger="hover" />
          </h3>

          <p className="font-inter text-sm text-zinc-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 rounded-tl-2xl transition-colors duration-300"
          style={{ borderColor: isHovered ? glowColor : 'rgba(255,255,255,0.1)' }} />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 rounded-br-2xl transition-colors duration-300"
          style={{ borderColor: isHovered ? glowColor : 'rgba(255,255,255,0.1)' }} />
      </motion.div>
    </RevealOnScroll>
  );
}

// ─── Program Card with Hover Effects ─────────────────────────────────────────
function ProgramCard3D({ program, gradient, icon: Icon, index, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <RevealOnScroll animation="flip" delay={index * 0.15}>
      <motion.div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br ${gradient} min-h-[280px]`}
        style={{ transformStyle: 'preserve-3d' }}
        whileHover={{
          scale: 1.05,
          rotateY: 5,
          rotateX: -5
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
          }}
          animate={isHovered ? { x: [0, 20] } : {}}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />

        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

        <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full text-center">
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center mb-6 bg-white/10"
            animate={isHovered ? {
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              borderColor: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']
            } : {}}
            transition={{ duration: 1.5 }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>

          <h3 className="font-unbounded font-bold text-xl text-white mb-2">
            {isHovered ? (
              <GlitchText speed={1.5} enableShadows={true}>
                {program.name}
              </GlitchText>
            ) : program.name}
          </h3>

          <p className="font-inter text-white/60 text-sm mb-6">Professional Training</p>

          <motion.div
            className="flex items-center gap-2 text-white/90 font-semibold"
            animate={isHovered ? { x: 10 } : { x: 0 }}
          >
            <span>Explore</span>
            <ChevronRight className="w-5 h-5" />
          </motion.div>

          {/* Sparkles on hover */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </RevealOnScroll>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const [cmsContent, setCmsContent] = useState(null);
  const [mediaGallery, setMediaGallery] = useState([]);
  const [partners, setPartners] = useState([]);
  const [director, setDirector] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [contactPopupOpen, setContactPopupOpen] = useState(false);
  const [callbackForm, setCallbackForm] = useState({ name: '', phone: '', message: '' });
  const [submittingCallback, setSubmittingCallback] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [directorExpanded, setDirectorExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchCmsContent();
    fetchMediaGallery();
    fetchPartners();
    fetchDirector();
    fetchContactInfo();
    fetchPrograms();
  }, []);

  // API fetchers
  const fetchPrograms = async () => {
    try { const r = await axios.get(`${API}/programs`); setPrograms(r.data || []); } catch { }
  };
  const fetchCmsContent = async () => {
    try { const r = await axios.get(`${API}/cms/landing`); setCmsContent(r.data); } catch { }
  };
  const fetchMediaGallery = async () => {
    try { const r = await axios.get(`${API}/media/gallery/public`); setMediaGallery(r.data || []); } catch { }
  };
  const fetchPartners = async () => {
    try { const r = await axios.get(`${API}/partners`); setPartners(r.data || []); } catch { }
  };
  const fetchDirector = async () => {
    try { const r = await axios.get(`${API}/cms/programme-director`); setDirector(r.data); } catch { }
  };
  const fetchContactInfo = async () => {
    try { const r = await axios.get(`${API}/cms/contact-info`); setContactInfo(r.data); } catch { }
  };

  const submitCallbackRequest = async () => {
    if (!callbackForm.name || !callbackForm.phone) {
      toast.error('Name and phone number are required');
      return;
    }
    setSubmittingCallback(true);
    try {
      await axios.post(`${API}/callback-request`, callbackForm);
      toast.success('Request received! Our team will contact you soon.');
      setCallbackOpen(false);
      setCallbackForm({ name: '', phone: '', message: '' });
    } catch { toast.error('Failed to submit request'); }
    finally { setSubmittingCallback(false); }
  };

  const openWhatsApp = () => {
    const number = contactInfo?.whatsapp_number || '+919876543210';
    window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=Hi, I'm interested in KXGRID programs`, '_blank');
  };

  const features = [
    { icon: Smartphone, title: 'NFC-Powered Identity', description: 'One tap attendance and instant verification with smart NFC cards', color: '#00F0FF' },
    { icon: BarChart3, title: 'AI Gap Analysis', description: 'Personalized insights and recommendations powered by advanced AI', color: '#7000FF' },
    { icon: Award, title: 'Digital Certificates', description: 'QR-verified certificates with anti-tampering protection', color: '#FF003C' },
    { icon: Users, title: 'Multi-Brand Operations', description: 'Unified platform connecting all programmes and departments', color: '#00FF94' },
    { icon: Shield, title: 'Safety Intelligence', description: 'Medical tracking and emergency contact integration', color: '#FF6B00' },
    { icon: Star, title: 'Gamified Progress', description: 'Badges, leaderboards, and recognition system', color: '#FFD700' },
  ];

  const stats = cmsContent?.stats || {
    students_trained: '500+', programs: '10+', placement_rate: '95%', industry_partners: '20+',
  };

  const programGradients = [
    'from-cyan-500 to-blue-600', 'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600', 'from-green-500 to-emerald-600',
    'from-amber-500 to-yellow-600', 'from-violet-500 to-purple-600',
  ];
  const programIcons = [Rocket, GraduationCap, Target, Shield, Zap, TrendingUp];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Navigation ── */}
      <motion.nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backgroundColor: scrollY > 50 ? 'rgba(9,9,11,0.95)' : 'rgba(9,9,11,0.6)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <KotlerXLogo size="md" variant="header" />
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Programs'].map((item, i) => (
              <MagneticButton key={item} strength={20}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="relative text-zinc-300 hover:text-primary transition-colors font-inter text-sm font-medium group py-2"
                >
                  <TextScramble text={item} trigger="hover" className="text-inherit" />
                  <motion.span
                    className="absolute -bottom-0.5 left-0 h-px bg-primary"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </a>
              </MagneticButton>
            ))}
            <MagneticButton strength={30}>
              <Button
                onClick={() => navigate('/programs')}
                className="bg-primary text-black hover:bg-primary/90 px-6 font-semibold relative overflow-hidden group"
              >
                <span className="relative z-10">View Programs</span>
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ opacity: 0.2 }}
                />
              </Button>
            </MagneticButton>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <motion.span
              className="w-6 h-0.5 bg-white"
              animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 8 : 0 }}
            />
            <motion.span
              className="w-6 h-0.5 bg-white"
              animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
            />
            <motion.span
              className="w-6 h-0.5 bg-white"
              animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -8 : 0 }}
            />
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-950 border-t border-white/10 overflow-hidden"
            >
              <div className="py-4 px-6 space-y-4">
                <a href="#features" className="block text-zinc-300 hover:text-primary transition-colors font-inter font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#programs" className="block text-zinc-300 hover:text-primary transition-colors font-inter font-medium" onClick={() => setMobileMenuOpen(false)}>Programs</a>
                <Button onClick={() => { navigate('/programs'); setMobileMenuOpen(false); }} className="bg-primary text-black w-full font-semibold">View Programs</Button>
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <Button variant="outline" onClick={() => { navigate('/login/student'); setMobileMenuOpen(false); }} className="w-full border-white/10 text-white hover:border-primary hover:text-primary">Student Login</Button>
                  <Button variant="outline" onClick={() => { navigate('/login/office'); setMobileMenuOpen(false); }} className="w-full border-white/10 text-white hover:border-primary hover:text-primary">Office Login</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">
        {/* Floating Particles Background */}
        <FloatingParticles
          count={60}
          colors={['#00F0FF', '#7000FF', '#FF003C', '#00FF94']}
          minSize={2}
          maxSize={5}
          speed={0.3}
        />

        {/* Grid background */}
        <div className="absolute inset-0 z-[1]">
          <CursorGrid cellSize={60} color="#00FF94" radius={180} falloff="smooth" holdTime={500} fadeDuration={900} lineWidth={1.0} maxOpacity={0.6} fillOpacity={0.04} gridOpacity={0.025} cellRadius={2} clickPulse={true} pulseSpeed={600} />
        </div>

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(112, 0, 255, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%)',
            filter: 'blur(50px)'
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Animated Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="font-unbounded font-black text-4xl md:text-6xl lg:text-7xl tracking-tight">
              <span className="text-white">
                <RotatingWords
                  words={['LEARN', 'EXECUTE', 'LEAD', 'DOMINATE']}
                  interval={2000}
                  textClassName="gradient-text"
                />
              </span>
              <span className="text-white">. </span>
              <span className="text-white">
                <RotatingWords
                  words={['GROW', 'EXCEL', 'WIN', 'SUCCEED']}
                  interval={2500}
                  textClassName="text-primary"
                />
              </span>
              <span className="text-white">.</span>
            </h1>
          </motion.div>

          {/* Logo with effects */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.5, type: 'spring' }}
            className="flex justify-center mb-8"
          >
            <div className="relative group">
              <motion.div
                className="absolute inset-0 rounded-full scale-150 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)'
                }}
                animate={{
                  scale: [1.5, 1.8, 1.5],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.img
                src={kotlerxLogo}
                alt="KotlerX"
                className="relative h-44 md:h-56 lg:h-64 w-auto"
                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                transition={{ rotate: { duration: 0.5 } }}
                style={{
                  filter: 'drop-shadow(0 0 60px rgba(168,85,247,0.4))'
                }}
              />
            </div>
          </motion.div>

          {/* Subtitle with decrypt effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-6 space-y-2"
          >
            <h2 className="font-unbounded font-bold text-lg md:text-2xl lg:text-3xl text-white">
              <DecryptedText
                text="India's First University Integrated"
                speed={30}
                sequential
                revealDirection="start"
                animateOn="view"
                className="text-white"
                encryptedClassName="text-primary/40"
              />
            </h2>
            <h2 className="font-unbounded font-bold text-lg md:text-2xl lg:text-3xl">
              <GlitchText speed={2} enableShadows={true} className="text-primary">
                Automotive, Motorsport & Media Skill Programmes
              </GlitchText>
            </h2>
          </motion.div>

          <BlurText
            text="GRID enables programme execution, department coordination, attendance & assessment tracking, content delivery, and brand visibility across the ecosystem."
            className="font-inter text-sm md:text-base text-zinc-400 max-w-2xl mx-auto mb-10"
            delay={30}
            animateBy="words"
          />

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <MagneticButton strength={40}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate('/programs')}
                  className="btn-primary h-14 px-10 text-base font-bold relative overflow-hidden group"
                >
                  <motion.span
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%', skewX: -15 }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    VIEW PROGRAMS
                  </span>
                </Button>
              </motion.div>
            </MagneticButton>

            <MagneticButton strength={40}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10 h-14 px-10 text-base font-bold group"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                    APPLY NOW
                  </span>
                </Button>
              </motion.div>
            </MagneticButton>
          </motion.div>

          {/* Stats with animated counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <AnimatedStatItem value={stats.students_trained} label="Students Trained" delay={0} />
            <AnimatedStatItem value={stats.programs} label="Programs" delay={200} />
            <AnimatedStatItem value={stats.placement_rate} label="Placement Rate" delay={400} />
            <AnimatedStatItem value={stats.industry_partners} label="Industry Partners" delay={600} />
          </div>
        </div>

        {/* Scroll indicator with animation */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="font-inter text-xs text-zinc-500 tracking-widest uppercase">Scroll</span>
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-zinc-600 flex justify-center pt-2"
          >
            <motion.div
              className="w-1 h-2 bg-primary rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Promo Carousel ── */}
      <PromoCarousel />

      {/* ── Features ── */}
      <Spotlight className="py-28 relative" spotlightColor="#00F0FF" spotlightSize={400}>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <RevealOnScroll animation="blur">
              <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-4">
                <WavyText text="UNIFIED PLATFORM" className="justify-center" />
              </h2>
            </RevealOnScroll>

            <RevealOnScroll animation="fadeUp" delay={0.2}>
              <ScrollReveal enableBlur={true} baseOpacity={0.2} blurStrength={4} containerClassName="!inline">
                <p className="font-inter text-zinc-400 max-w-xl mx-auto">
                  One platform connecting all operations, departments, and stakeholders
                </p>
              </ScrollReveal>
            </RevealOnScroll>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard3D key={i} {...f} index={i} glowColor={f.color} />
            ))}
          </div>
        </div>
      </Spotlight>

      {/* ── Programs ── */}
      <section id="programs" className="py-28 relative bg-surface overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <CursorGrid cellSize={60} color="#7000FF" radius={160} falloff="smooth" holdTime={400} fadeDuration={800} lineWidth={1.0} maxOpacity={0.35} fillOpacity={0.025} gridOpacity={0.015} cellRadius={2} clickPulse pulseSpeed={600} />
        </div>

        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <RevealOnScroll animation="scale">
              <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-4">
                <GlitchText speed={2} enableShadows enableOnHover>
                  PROGRAMS
                </GlitchText>
              </h2>
            </RevealOnScroll>

            <RevealOnScroll animation="fadeUp" delay={0.2}>
              <p className="font-inter text-zinc-400 max-w-xl mx-auto">
                <DecryptedText
                  text="Automotive, Motorsport & Media Skill Programmes"
                  speed={25}
                  sequential
                  animateOn="view"
                  className="text-zinc-400"
                  encryptedClassName="text-zinc-600"
                />
              </p>
            </RevealOnScroll>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(programs.length > 0 ? programs.slice(0, 6) : []).map((program, i) => (
              <ProgramCard3D
                key={program.program_id || i}
                program={program}
                gradient={programGradients[i % programGradients.length]}
                icon={programIcons[i % programIcons.length]}
                index={i}
                onClick={() => navigate('/programs')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Media / Image Trail ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <RevealOnScroll animation="rotate">
              <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-4">
                EXPERIENCE <span className="text-secondary">KXGRID</span>
              </h2>
            </RevealOnScroll>

            <RevealOnScroll animation="fadeUp" delay={0.2}>
              <p className="font-inter text-zinc-400 max-w-xl mx-auto">
                See our students, trainers, and brands in action
              </p>
            </RevealOnScroll>
          </div>

          <GlowingCard glowColor="#7000FF" glowSize={500} className="rounded-2xl">
            <div style={{ height: '500px', position: 'relative', overflow: 'hidden' }} className="rounded-2xl bg-gradient-to-b from-zinc-900/50 to-transparent border border-white/5">
              <ImageTrail
                items={[
                  'https://picsum.photos/id/119/300/300', 'https://picsum.photos/id/180/300/300',
                  'https://picsum.photos/id/244/300/300', 'https://picsum.photos/id/367/300/300',
                  'https://picsum.photos/id/381/300/300', 'https://picsum.photos/id/430/300/300',
                  'https://picsum.photos/id/494/300/300', 'https://picsum.photos/id/582/300/300',
                  'https://picsum.photos/id/659/300/300', 'https://picsum.photos/id/718/300/300',
                ]}
                variant={7}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  className="bg-black/50 backdrop-blur-md px-8 py-4 rounded-full border border-white/20"
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: ['0 0 0px rgba(0,240,255,0)', '0 0 30px rgba(0,240,255,0.3)', '0 0 0px rgba(0,240,255,0)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-white/90 text-sm font-inter flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    Move your cursor to see the magic
                  </p>
                </motion.div>
              </div>
            </div>
          </GlowingCard>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(112,0,255,0.2) 0%, rgba(0,240,255,0.2) 100%)'
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        <FloatingParticles count={30} colors={['#ffffff20']} minSize={1} maxSize={3} speed={0.2} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <RevealOnScroll animation="pop">
            <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-6">
              READY TO{' '}
              <span className="relative">
                <GlitchText speed={1.5} enableShadows className="gradient-text">
                  JOIN?
                </GlitchText>
              </span>
            </h2>
          </RevealOnScroll>

          <RevealOnScroll animation="fadeUp" delay={0.2}>
            <p className="font-inter text-lg text-zinc-300 mb-10">
              Explore our programmes and start your journey today
            </p>
          </RevealOnScroll>

          <RevealOnScroll animation="scale" delay={0.4}>
            <MagneticButton strength={50}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/programs')}
                  className="btn-primary h-16 px-14 text-lg font-bold relative overflow-hidden"
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
                    <Target className="w-6 h-6" />
                    View Programs
                  </span>
                </Button>
              </motion.div>
            </MagneticButton>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Partners Marquee ── */}
      {partners.length > 0 && (
        <section className="py-12 md:py-16 border-t border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6 md:mb-8">
            <RevealOnScroll animation="fadeUp">
              <h2 className="font-unbounded font-bold text-xl md:text-2xl text-white text-center mb-2">
                OUR <span className="gradient-text">PARTNERS & SPONSORS</span>
              </h2>
              <p className="text-xs md:text-sm text-zinc-500 text-center">
                Trusted by industry leaders
              </p>
            </RevealOnScroll>
          </div>

          {partners.filter(p => p.is_featured).length > 0 && (
            <div className="max-w-5xl mx-auto px-4 md:px-6 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partners.filter(p => p.is_featured).slice(0, 2).map((partner, idx) => (
                  <RevealOnScroll key={partner.partner_id} animation="slideUp" delay={idx * 0.2}>
                    <GlowingCard
                      glowColor={idx === 0 ? '#00F0FF' : '#7000FF'}
                      className="rounded-2xl p-6 md:p-8 border border-white/10 cursor-pointer"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          className="w-32 h-32 md:w-40 md:h-40 mb-4 flex items-center justify-center bg-white/5 rounded-xl p-4"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {partner.logo_base64 || partner.logo_url ? (
                            <img src={partner.logo_base64 || partner.logo_url} alt={partner.name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <span className="text-4xl font-bold text-primary">
                              {partner.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </span>
                          )}
                        </motion.div>
                        <h3 className="font-unbounded font-semibold text-lg text-white mb-2">{partner.name}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full mb-3 ${partner.partner_type === 'sponsor' ? 'bg-yellow-500/20 text-yellow-400' : partner.partner_type === 'association' ? 'bg-blue-500/20 text-blue-400' : 'bg-primary/20 text-primary'}`}>
                          {partner.partner_type?.charAt(0).toUpperCase() + partner.partner_type?.slice(1)}
                        </span>
                        <p className="text-sm text-zinc-400 line-clamp-3">{partner.description || `${partner.name} is a valued ${partner.partner_type} of KXGRID.`}</p>
                      </div>
                    </GlowingCard>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          )}

          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6 md:gap-12"
              animate={{ x: [0, -1000] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              {[...partners, ...partners, ...partners].map((partner, i) => (
                <motion.div
                  key={`${partner.partner_id}-${i}`}
                  className="flex-shrink-0 w-20 h-14 md:w-32 md:h-20 flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.2, filter: 'drop-shadow(0 0 15px rgba(0,240,255,0.7))' }}
                  onClick={() => setSelectedPartner(partner)}
                >
                  {partner.logo_base64 || partner.logo_url ? (
                    <img src={partner.logo_base64 || partner.logo_url} alt={partner.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-white/5 flex items-center justify-center">
                      <span className="text-[10px] md:text-xs text-zinc-500 font-medium text-center px-2">{partner.name}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Partner dialog */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              {(selectedPartner?.logo_base64 || selectedPartner?.logo_url) && (
                <img src={selectedPartner?.logo_base64 || selectedPartner?.logo_url} alt={selectedPartner?.name} className="w-12 h-12 object-contain rounded-lg bg-white/10 p-1" />
              )}
              {selectedPartner?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full ${selectedPartner?.partner_type === 'sponsor' ? 'bg-yellow-500/20 text-yellow-400' : selectedPartner?.partner_type === 'association' ? 'bg-blue-500/20 text-blue-400' : 'bg-primary/20 text-primary'}`}>
                {selectedPartner?.partner_type?.charAt(0).toUpperCase() + selectedPartner?.partner_type?.slice(1)}
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              {selectedPartner?.description || `${selectedPartner?.name} is a valued ${selectedPartner?.partner_type} of KXGRID.`}
            </p>
            {selectedPartner?.website_url && (
              <a href={selectedPartner.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary/80">
                Visit Website <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Director ── */}
      {director && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6">
            <RevealOnScroll animation="fadeUp">
              <h2 className="font-unbounded font-bold text-2xl text-white text-center mb-12">
                MESSAGE FROM <span className="gradient-text">PROGRAMME DIRECTOR</span>
              </h2>
            </RevealOnScroll>

            <RevealOnScroll animation="scale" delay={0.2}>
              <GlowingCard glowColor="#7000FF" glowSize={600} className="rounded-3xl">
                <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center gap-8 md:gap-12 border border-white/10 rounded-3xl bg-gradient-to-br from-white/5 to-transparent">
                  <div className="relative flex-shrink-0">
                    <motion.img
                      src={(director.photo_base64 || director.photo_url) || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                      alt={director.name}
                      className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover border border-white/20"
                      whileHover={{ scale: 1.05, rotate: 3 }}
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="text-6xl text-primary/20 font-serif leading-none absolute top-4 right-8">"</span>
                    <div className="mb-6">
                      <p className="font-unbounded font-bold text-white text-xl md:text-2xl">{director.name}</p>
                      <p className="text-sm text-primary/90 font-medium uppercase mt-1">{director.designation}</p>
                    </div>
                    <blockquote className="font-inter text-base md:text-lg text-zinc-300 italic leading-relaxed mb-8">
                      {directorExpanded || (director.message?.length <= 250)
                        ? `"${director.message}"`
                        : `"${director.message?.substring(0, 250)}..."`}
                      {director.message?.length > 250 && (
                        <button onClick={() => setDirectorExpanded(!directorExpanded)} className="text-primary text-sm mt-3 hover:text-white transition-colors block font-semibold">
                          {directorExpanded ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                    </blockquote>
                    <MagneticButton strength={30}>
                      <button onClick={() => navigate('/team')} className="inline-flex items-center gap-2 text-white bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                        MEET THE INSTRUCTORS <ChevronRight className="w-4 h-4" />
                      </button>
                    </MagneticButton>
                  </div>
                </div>
              </GlowingCard>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* ── Contact ── */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <RevealOnScroll animation="blur">
            <h2 className="font-unbounded font-bold text-3xl md:text-4xl text-white mb-4">
              <TextScramble text="Have Questions? Let's Connect" trigger="hover" scrambleOnMount />
            </h2>
          </RevealOnScroll>

          <RevealOnScroll animation="fadeUp" delay={0.2}>
            <p className="font-inter text-lg text-zinc-400 mb-10">
              {contactInfo?.subheading_text || "Our admission and academic team will guide you through the right pathway"}
            </p>
          </RevealOnScroll>

          {/* Contact CTAs */}
          <RevealOnScroll animation="slideUp" delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <MagneticButton strength={40}>
                <Button onClick={() => setCallbackOpen(true)} className="btn-primary h-14 px-8 gap-2 w-full sm:w-auto">
                  <Phone className="w-5 h-5" /> Request Call Back
                </Button>
              </MagneticButton>
              <MagneticButton strength={40}>
                <Button onClick={openWhatsApp} variant="outline" className="h-14 px-8 gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10 w-full sm:w-auto">
                  <MessageSquare className="w-5 h-5" /> Message Us
                </Button>
              </MagneticButton>
              <MagneticButton strength={40}>
                <Button onClick={() => setContactPopupOpen(true)} variant="outline" className="h-14 px-8 gap-2 border-white/20 text-zinc-300 hover:bg-white/5 w-full sm:w-auto">
                  <Phone className="w-5 h-5" /> Contact Us
                </Button>
              </MagneticButton>
            </div>
          </RevealOnScroll>

          <div className="flex items-center justify-center gap-8">
            {[
              { href: `tel:${contactInfo?.phone || '+919514756314'}`, icon: Phone, color: '#00F0FF', label: 'Call' },
              { href: `mailto:${contactInfo?.email || 'info@kotlerx.com'}`, icon: Mail, color: '#7000FF', label: 'Mail' },
              { href: contactInfo?.map_url || 'https://maps.google.com/?q=Chennai,India', icon: MapPin, color: '#FF003C', label: 'Location', external: true },
            ].map(({ href, icon: Icon, color, label, external }) => (
              <motion.a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
                whileHover={{ scale: 1.1, y: -5 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                  whileHover={{ borderColor: color, boxShadow: `0 0 20px ${color}40` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </motion.div>
                <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">{label}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Callback dialog ── */}
      <Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> Request a Call Back
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Your Name *</Label>
              <Input value={callbackForm.name} onChange={e => setCallbackForm(p => ({ ...p, name: e.target.value }))} className="input-dark" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Phone Number *</Label>
              <Input value={callbackForm.phone} onChange={e => setCallbackForm(p => ({ ...p, phone: e.target.value }))} className="input-dark" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Message (Optional)</Label>
              <Input value={callbackForm.message} onChange={e => setCallbackForm(p => ({ ...p, message: e.target.value }))} className="input-dark" placeholder="What would you like to discuss?" />
            </div>
            <Button onClick={submitCallbackRequest} disabled={submittingCallback} className="w-full btn-primary">
              {submittingCallback && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Contact popup ── */}
      <Dialog open={contactPopupOpen} onOpenChange={setContactPopupOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white text-center">Call Us Now</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Phone className="w-10 h-10 text-primary" />
            </motion.div>
            <p className="text-2xl font-unbounded font-bold text-white mb-2">{contactInfo?.phone || '+91 98765 43210'}</p>
            <p className="text-sm text-zinc-500 mb-6">Admissions Team</p>
            <a href={`tel:${contactInfo?.phone || '+919876543210'}`} className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-black font-semibold hover:bg-primary/80 transition-colors">
              <Phone className="w-5 h-5" /> Call Now
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Footer ── */}
      <footer className="bg-zinc-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
            {/* Social */}
            <div className="flex flex-col items-center md:items-start justify-center">
              <div className="flex items-center gap-3">
                {[
                  { href: contactInfo?.social_links?.facebook || 'https://facebook.com/kotlerx', color: '#3b82f6', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                  { href: contactInfo?.social_links?.twitter || 'https://x.com/kotlerx', color: '#ffffff', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { href: contactInfo?.social_links?.youtube || 'https://youtube.com/@kotlerx', color: '#ef4444', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center"
                    whileHover={{ scale: 1.2, borderColor: social.color, boxShadow: `0 0 15px ${social.color}40` }}
                  >
                    <svg className="w-5 h-5" fill={social.color} viewBox="0 0 24 24"><path d={social.icon} /></svg>
                  </motion.a>
                ))}
                <motion.a
                  href="https://kotlerx.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center"
                  whileHover={{ scale: 1.2, borderColor: '#a855f7' }}
                >
                  <img src={kotlerxLogo} alt="KotlerX" className="w-6 h-6 object-contain" />
                </motion.a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col items-center md:items-end">
              <h3 className="text-white text-lg font-bold mb-2">For More Updates</h3>
              <p className="text-zinc-400 text-xs mb-3 text-center md:text-right">Subscribe for news, blogs, tips & opportunities.</p>
              <div className="flex gap-2 w-full max-w-xs">
                <input type="email" placeholder="Enter your email" className="flex-1 min-w-0 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors" />
                <motion.button
                  onClick={() => setCallbackOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2 px-4 rounded-md text-sm whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-inter text-xs text-zinc-500">&copy; 2025 KOTLERX. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/login/student')} className="font-inter text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Student Login
              </button>
              <button onClick={() => navigate('/login/office')} className="font-inter text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Office Login
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
