import React, { useState, useEffect, useRef } from 'react';
import kotlerxLogo from '../images/Vertical Logo with BG-01.png';
import SplitText from '@/components/ui/SplitText';
import DecryptedText from '@/components/ui/DecryptedText';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GlitchText from '@/components/ui/GlitchText';
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
  Phone, Mail, MapPin, MessageSquare, Handshake, X, Loader2, Building2
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ─── reusable scroll-trigger fade-up ──────────────────────────────────────────
function useFadeUp(y = 40, stagger = 0, once = true) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = stagger > 0 && el.children.length ? [...el.children] : el;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1, y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger,
          scrollTrigger: { trigger: el, start: 'top 88%', once },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [y, stagger]);
  return ref;
}

function useCountUp(target) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const raw = String(target);
    const suffix = raw.replace(/[\d.]/g, '');
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: num,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = (Number.isInteger(num) ? Math.round(obj.val) : obj.val.toFixed(1)) + suffix;
        },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [target]);
  return ref;
}

// ─── stat counter ──────────────────────────────────────────────────────────────
function StatItem({ value, label }) {
  const numRef = useCountUp(value);
  return (
    <div className="text-center">
      <div ref={numRef} className="font-unbounded font-bold text-2xl md:text-3xl text-primary mb-1">
        {value}
      </div>
      <div className="font-inter text-xs text-zinc-500 tracking-wide uppercase">{label}</div>
    </div>
  );
}

// ─── feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, index }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: 35, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          delay: index * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={ref}
      className="group relative rounded-2xl p-8 border border-white/8 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-500 cursor-default"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* top-left corner accent */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-primary/20 rounded-tl-2xl group-hover:border-primary/50 transition-colors duration-500" />
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-unbounded font-semibold text-lg text-white mb-3 leading-snug">{title}</h3>
      <p className="font-inter text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── program card ─────────────────────────────────────────────────────────────
function ProgramCard({ program, gradient, icon: Icon, index, onClick }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: 50, rotateX: 8 },
        {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.75,
          delay: index * 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-br ${gradient} p-6 min-h-[260px] flex flex-col items-center justify-center text-center`}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d', perspective: '600px' }}
    >
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-14 h-14 rounded-full border-2 border-white/30 flex items-center justify-center mb-5 bg-white/10 group-hover:scale-110 group-hover:border-white/60 transition-all duration-300">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-unbounded font-bold text-lg text-white mb-2 leading-tight">
          {program.name}
        </h3>
        <p className="font-inter text-white/60 text-xs mb-5">Professional Training</p>
        <div className="flex items-center gap-1 text-white/80 font-semibold text-sm group-hover:gap-2 transition-all">
          <span>Explore</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
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

  // GSAP refs
  const heroRef = useRef(null);
  const logoRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroDescRef = useRef(null);
  const heroBtnsRef = useRef(null);
  const statsRef = useRef(null);
  const navRef = useRef(null);
  const featuresTitleRef = useFadeUp(30);
  const featuresGridRef = useRef(null);
  const programsTitleRef = useFadeUp(30);
  const ctaRef = useFadeUp(40);
  const contactRef = useFadeUp(35);
  const directorRef = useFadeUp(40);

  useEffect(() => {
    fetchCmsContent();
    fetchMediaGallery();
    fetchPartners();
    fetchDirector();
    fetchContactInfo();
    fetchPrograms();
  }, []);

  // Hero entrance — runs once on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Nav slides down
      tl.fromTo(navRef.current,
        { y: -70, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      );

      // Logo pops in with slight bounce
      tl.fromTo(logoRef.current,
        { scale: 0.6, opacity: 0, filter: 'blur(16px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'back.out(1.4)' },
        '-=0.3'
      );

      // Hero heading
      tl.fromTo(heroTextRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      );

      // Description
      tl.fromTo(heroDescRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      );

      // CTA buttons staggered
      tl.fromTo([...heroBtnsRef.current?.children || []],
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12 },
        '-=0.4'
      );

      // Stats row
      tl.fromTo([...statsRef.current?.children || []],
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        '-=0.3'
      );
    });

    return () => ctx.revert();
  }, []);

  // Nav background on scroll
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top -60',
        onUpdate: (self) => {
          if (self.scroll() > 60) {
            gsap.to(nav, { backgroundColor: 'rgba(9,9,11,0.95)', duration: 0.3 });
          } else {
            gsap.to(nav, { backgroundColor: 'rgba(9,9,11,0.8)', duration: 0.3 });
          }
        },
      });
    });
    return () => ctx.revert();
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
    { icon: Smartphone, title: 'NFC-Powered Identity', description: 'One tap attendance and instant verification with smart NFC cards' },
    { icon: BarChart3, title: 'AI Gap Analysis', description: 'Personalized insights and recommendations powered by advanced AI' },
    { icon: Award, title: 'Digital Certificates', description: 'QR-verified certificates with anti-tampering protection' },
    { icon: Users, title: 'Multi-Brand Operations', description: 'Unified platform connecting all programmes and departments' },
    { icon: Shield, title: 'Safety Intelligence', description: 'Medical tracking and emergency contact integration' },
    { icon: Star, title: 'Gamified Progress', description: 'Badges, leaderboards, and recognition system' },
  ];

  const stats = cmsContent?.stats || {
    students_trained: '500+', programs: '10+', placement_rate: '95%', industry_partners: '20+',
  };

  const programGradients = [
    'from-teal-500 to-cyan-600', 'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600', 'from-green-500 to-emerald-600',
    'from-amber-500 to-yellow-600', 'from-violet-500 to-purple-600',
  ];
  const programIcons = [Award, GraduationCap, Star, Shield, Zap, Users];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Navigation ── */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10"
        style={{ backgroundColor: 'rgba(9,9,11,0.8)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <KotlerXLogo size="md" variant="header" />

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Programs'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-zinc-300 hover:text-primary transition-colors font-inter text-sm font-medium group"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <Magnet padding={50} magnetStrength={40}>
              <Button
                onClick={() => navigate('/programs')}
                className="bg-primary text-black hover:bg-primary/90 px-6 font-semibold"
                data-testid="nav-programs-btn"
              >
                View Programs
              </Button>
            </Magnet>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-white/10 py-4 px-6 space-y-4">
            <a href="#features" className="block text-zinc-300 hover:text-primary transition-colors font-inter font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#programs" className="block text-zinc-300 hover:text-primary transition-colors font-inter font-medium" onClick={() => setMobileMenuOpen(false)}>Programs</a>
            <Button onClick={() => { navigate('/programs'); setMobileMenuOpen(false); }} className="bg-primary text-black w-full font-semibold">View Programs</Button>
            <div className="pt-2 border-t border-white/10 space-y-2">
              <Button variant="outline" onClick={() => { navigate('/login/student'); setMobileMenuOpen(false); }} className="w-full border-white/10 text-white hover:border-primary hover:text-primary">Student Login</Button>
              <Button variant="outline" onClick={() => { navigate('/login/office'); setMobileMenuOpen(false); }} className="w-full border-white/10 text-white hover:border-primary hover:text-primary">Office Login</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">
        {/* Grid background */}
        <div className="absolute inset-0">
          <CursorGrid cellSize={60} color="#00FF94" radius={160} falloff="smooth" holdTime={400} fadeDuration={800} lineWidth={1.0} maxOpacity={0.7} fillOpacity={0.05} gridOpacity={0.03} cellRadius={2} clickPulse={true} pulseSpeed={600} />
        </div>

        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Tagline */}
          <div ref={heroTextRef} className="mb-6">
            <SplitText
              text="LEARN. EXECUTE. LEAD."
              animateBy="letters"
              direction="top"
              delay={50}
              stepDuration={0.8}
              className="font-unbounded font-black text-3xl md:text-5xl lg:text-6xl tracking-tight text-white"
            />
          </div>

          {/* Logo */}
          <div ref={logoRef} className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/25 blur-3xl rounded-full scale-[1.6] pointer-events-none" />
              <img
                src={kotlerxLogo}
                alt="KotlerX"
                className="relative h-40 md:h-52 lg:h-60 w-auto drop-shadow-[0_0_40px_rgba(168,85,247,0.3)]"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div ref={heroDescRef} className="mb-5">
            <h2 className="font-unbounded font-bold text-lg md:text-2xl lg:text-3xl mb-1 text-white">
              <DecryptedText text="India's First University Integrated" speed={40} sequential revealDirection="start" animateOn="hover" className="text-white" encryptedClassName="text-white/40" useOriginalCharsOnly />
            </h2>
            <h2 className="font-unbounded font-bold text-lg md:text-2xl lg:text-3xl text-primary">
              <DecryptedText text="Automotive, Motorsport & Media Skill Programmes" speed={40} sequential revealDirection="start" animateOn="hover" className="text-primary" encryptedClassName="text-primary/40" useOriginalCharsOnly />
            </h2>
          </div>

          <p className="font-inter text-sm md:text-base text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            GRID enables programme execution, department coordination, attendance &amp; assessment tracking, content delivery, and brand visibility across the ecosystem.
          </p>

          {/* CTA buttons */}
          <div ref={heroBtnsRef} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Magnet padding={60} magnetStrength={35}>
              <Button onClick={() => navigate('/programs')} className="btn-primary h-12 px-8 text-base font-bold w-full sm:w-auto" data-testid="hero-programs-btn">
                VIEW PROGRAMS
              </Button>
            </Magnet>
            <Magnet padding={60} magnetStrength={35}>
              <Button onClick={() => navigate('/register')} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 h-12 px-8 text-base font-bold w-full sm:w-auto" data-testid="hero-apply-btn">
                APPLY NOW
              </Button>
            </Magnet>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <StatItem value={stats.students_trained} label="Students Trained" />
            <StatItem value={stats.programs} label="Programs" />
            <StatItem value={stats.placement_rate} label="Placement Rate" />
            <StatItem value={stats.industry_partners} label="Industry Partners" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="font-inter text-xs text-zinc-500 tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-zinc-500 to-transparent" />
        </div>
      </section>

      {/* ── Promo Carousel ── */}
      <PromoCarousel />

      {/* ── Features ── */}
      <section id="features" className="py-28 relative">
        {/* subtle section divider line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <SplitText
              text="UNIFIED PLATFORM"
              tag="h2"
              className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-4"
            />
            <p className="font-inter text-zinc-400 max-w-xl mx-auto">
              One platform connecting all operations, departments, and stakeholders
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section id="programs" className="py-28 relative bg-surface">
        <div className="absolute inset-0 pointer-events-none">
          <CursorGrid cellSize={60} color="#00FF94" radius={160} falloff="smooth" holdTime={400} fadeDuration={800} lineWidth={1.0} maxOpacity={0.4} fillOpacity={0.03} gridOpacity={0.015} cellRadius={2} clickPulse pulseSpeed={600} />
        </div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-4">
              PROGRAMS
            </h2>
            <p className="font-inter text-zinc-400 max-w-xl mx-auto">
              Automotive, Motorsport & Media Skill Programmes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {(programs.length > 0 ? programs.slice(0, 6) : []).map((program, i) => (
              <ProgramCard
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
      <section className="py-24 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-4">
              EXPERIENCE <span className="text-secondary">KXGRID</span>
            </h2>
            <p className="font-inter text-zinc-400 max-w-xl mx-auto">
              See our students, trainers, and brands in action
            </p>
          </div>

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
              <div className="bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <p className="text-white/80 text-sm font-inter">Move your cursor to see the magic ✨</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 opacity-50" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-6">
            READY TO <span className="gradient-text">JOIN?</span>
          </h2>
          <p className="font-inter text-lg text-zinc-400 mb-10">
            Explore our programmes and start your journey today
          </ScrollReveal>
          <Magnet padding={70} magnetStrength={30}>
            <Button onClick={() => navigate('/programs')} className="btn-primary h-14 px-12 text-lg" data-testid="cta-programs-btn">
              View Programs
            </Button>
          </Magnet>
        </div>
      </section>

      {/* ── Partners Marquee ── */}
      {partners.length > 0 && (
        <section className="py-12 md:py-16 border-t border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6 md:mb-8">
            <h2 className="font-unbounded font-bold text-xl md:text-2xl text-white text-center mb-2">
              OUR <span className="gradient-text">PARTNERS & SPONSORS</span>
            </h2>
            <p className="text-xs md:text-sm text-zinc-500 text-center">
              Trusted by industry leaders
            </p>
          </div>

          {partners.filter(p => p.is_featured).length > 0 && (
            <div className="max-w-5xl mx-auto px-4 md:px-6 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partners.filter(p => p.is_featured).slice(0, 2).map((partner) => (
                  <div
                    key={partner.partner_id}
                    className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 md:p-8 border border-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedPartner(partner)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                    <div className="relative flex flex-col items-center text-center">
                      <div className="w-32 h-32 md:w-40 md:h-40 mb-4 flex items-center justify-center bg-white/5 rounded-xl p-4 group-hover:scale-105 transition-all duration-300">
                        {partner.logo_base64 || partner.logo_url ? (
                          <img src={partner.logo_base64 || partner.logo_url} alt={partner.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-4xl font-bold text-primary">
                            {partner.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-unbounded font-semibold text-lg text-white mb-2">{partner.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full mb-3 ${partner.partner_type === 'sponsor' ? 'bg-yellow-500/20 text-yellow-400' : partner.partner_type === 'association' ? 'bg-blue-500/20 text-blue-400' : 'bg-primary/20 text-primary'}`}>
                        {partner.partner_type?.charAt(0).toUpperCase() + partner.partner_type?.slice(1)}
                      </span>
                      <p className="text-sm text-zinc-400 line-clamp-3">{partner.description || `${partner.name} is a valued ${partner.partner_type} of KXGRID.`}</p>
                      {partner.website_url && (
                        <a href={partner.website_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="mt-4 text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                          Visit Website <ChevronRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative overflow-hidden">
            <div className="partners-marquee flex gap-6 md:gap-12 animate-marquee">
              {[...partners, ...partners, ...partners].map((partner, i) => (
                <div key={`${partner.partner_id}-${i}`} className="flex-shrink-0 w-20 h-14 md:w-32 md:h-20 flex items-center justify-center hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.7)] transition-all duration-300 cursor-pointer" onClick={() => setSelectedPartner(partner)}>
                  {partner.logo_base64 || partner.logo_url ? (
                    <img src={partner.logo_base64 || partner.logo_url} alt={partner.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-white/5 flex items-center justify-center">
                      <span className="text-[10px] md:text-xs text-zinc-500 font-medium text-center px-2">{partner.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
            .animate-marquee { animation: marquee 8s linear infinite; }
            .animate-marquee:hover { animation-play-state: paused; }
            @media(max-width:768px){ .animate-marquee { animation: marquee 6s linear infinite; } }
          `}</style>
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
            <h2 className="font-unbounded font-bold text-2xl text-white text-center mb-12">
              MESSAGE FROM <span className="gradient-text">PROGRAMME DIRECTOR</span>
            </h2>

            <div className="relative rounded-3xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
              <div className="absolute inset-0 backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-3xl group-hover:border-primary/30 transition-colors" />
              <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="relative flex-shrink-0">
                  <img
                    src={(director.photo_base64 || director.photo_url) || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                    alt={director.name}
                    className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover border border-white/20 z-10 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 text-center md:text-left flex flex-col">
                  <span className="text-6xl text-primary/20 font-serif leading-none absolute top-4 right-8">"</span>
                  <div className="mb-6">
                    <p className="font-unbounded font-bold text-white text-xl md:text-2xl tracking-wide">{director.name}</p>
                    <p className="text-sm text-primary/90 font-medium tracking-wide uppercase mt-1">{director.designation}</p>
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
                  <div>
                    <button onClick={() => navigate('/team')} className="inline-flex items-center gap-2 text-white bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                      MEET THE INSTRUCTORS <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Contact ── */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-unbounded font-bold text-3xl md:text-4xl text-white mb-4">
            {contactInfo?.heading_text || "Have Questions? Let's Connect"}
          </GlitchText>
          <ScrollReveal
            baseOpacity={0.2}
            enableBlur={true}
            baseRotation={2}
            blurStrength={4}
          >
            {contactInfo?.subheading_text || "Our admission and academic team will guide you through the right pathway"}
          </p>

          {/* Contact CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Magnet padding={60} magnetStrength={35}>
              <Button onClick={() => setCallbackOpen(true)} className="btn-primary h-14 px-8 gap-2 w-full sm:w-auto" data-testid="request-callback-btn">
                <Phone className="w-5 h-5" /> Request Call Back
              </Button>
            </Magnet>
            <Magnet padding={60} magnetStrength={35}>
              <Button onClick={openWhatsApp} variant="outline" className="h-14 px-8 gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10 w-full sm:w-auto" data-testid="whatsapp-btn">
                <MessageSquare className="w-5 h-5" /> Message Us
              </Button>
            </Magnet>
            <Magnet padding={60} magnetStrength={35}>
              <Button onClick={() => setContactPopupOpen(true)} variant="outline" className="h-14 px-8 gap-2 border-white/20 text-zinc-300 hover:bg-white/5 w-full sm:w-auto" data-testid="contact-us-btn">
                <Phone className="w-5 h-5" /> Contact Us
              </Button>
            </Magnet>
          </div>

          <div className="flex items-center justify-center gap-8">
            {[
              { href: `tel:${contactInfo?.phone || '+919514756314'}`, icon: Phone, color: 'cyan', label: 'Call' },
              { href: `mailto:${contactInfo?.email || 'info@kotlerx.com'}`, icon: Mail, color: 'blue', label: 'Mail' },
              { href: contactInfo?.map_url || 'https://maps.google.com/?q=Chennai,India', icon: MapPin, color: 'red', label: 'Location', external: true },
            ].map(({ href, icon: Icon, color, label, external }) => (
              <a key={label} href={href} target={external ? '_blank' : undefined} rel="noopener noreferrer"
                className={`flex flex-col items-center gap-2 text-white hover:text-${color}-400 transition-colors group`}>
                <div className={`w-12 h-12 rounded-full border-2 border-zinc-700 flex items-center justify-center group-hover:border-${color}-400 transition-colors`}>
                  <Icon className={`w-6 h-6 text-${color}-400`} />
                </div>
                <span className="text-xs text-zinc-400">{label}</span>
              </a>
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
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Phone className="w-10 h-10 text-primary" />
            </div>
            <p className="text-2xl font-unbounded font-bold text-white mb-2">{contactInfo?.phone || '+91 98765 43210'}</p>
            <p className="text-sm text-zinc-500 mb-6">Admissions Team</p>
            <a href={`tel:${contactInfo?.phone || '+919876543210'}`} className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/80 transition-colors">
              <Phone className="w-5 h-5" /> Call Now
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Footer ── */}
      <footer className="bg-zinc-900 border-t border-white/10" data-testid="footer">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
            {/* Social */}
            <div className="flex flex-col items-center md:items-start justify-center">
              <div className="flex items-center gap-3">
                {[
                  { href: contactInfo?.social_links?.facebook || 'https://facebook.com/kotlerx', color: 'blue-500', shadow: '59,130,246', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', testid: 'social-facebook' },
                ].map(() => null)}
                <a href={contactInfo?.social_links?.facebook || 'https://facebook.com/kotlerx'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-blue-500 hover:scale-110 transition-all duration-300" data-testid="social-facebook">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href={contactInfo?.social_links?.twitter || 'https://x.com/kotlerx'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-white hover:scale-110 transition-all duration-300" data-testid="social-twitter">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href={contactInfo?.social_links?.instagram || 'https://instagram.com/kotlerx'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-pink-500 hover:scale-110 transition-all duration-300" data-testid="social-instagram">
                  <svg className="w-5 h-5" fill="url(#ig-grad)" viewBox="0 0 24 24">
                    <defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFDC80" /><stop offset="50%" stopColor="#E1306C" /><stop offset="100%" stopColor="#833AB4" /></linearGradient></defs>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href={contactInfo?.social_links?.youtube || 'https://youtube.com/@kotlerx'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-red-500 hover:scale-110 transition-all duration-300" data-testid="social-youtube">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
                <a href="https://kotlerx.in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-purple-500 hover:scale-110 transition-all duration-300" data-testid="social-kxroot">
                  <img src={kotlerxLogo} alt="KotlerX" className="w-6 h-6 object-contain" />
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col items-center md:items-end">
              <h3 className="text-white text-lg font-bold mb-2">For More Updates</h3>
              <p className="text-zinc-400 text-xs mb-3 text-center md:text-right">Subscribe for news, blogs, tips &amp; opportunities.</p>
              <div className="flex gap-2 w-full max-w-xs">
                <input type="email" placeholder="Enter your email" className="flex-1 min-w-0 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors" data-testid="newsletter-email-input" />
                <button onClick={() => setCallbackOpen(true)} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-semibold py-2 px-4 rounded-md text-sm transition-all duration-300 hover:scale-105 whitespace-nowrap" data-testid="newsletter-subscribe-btn">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-inter text-xs text-zinc-500">&copy; 2025 KOTLERX. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/login/student')} className="font-inter text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1.5" data-testid="footer-student-login">
                <GraduationCap className="w-3.5 h-3.5" /> Student Login
              </button>
              <button onClick={() => navigate('/login/office')} className="font-inter text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1.5" data-testid="footer-office-login">
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
