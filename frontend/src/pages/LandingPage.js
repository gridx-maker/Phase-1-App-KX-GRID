import React, { useState, useEffect } from 'react';
import SplitText from '@/components/ui/SplitText';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import PromoCarousel from '@/components/PromoCarousel';
import TiltedCard from '@/components/ui/TiltedCard';
import CursorGrid from '@/components/ui/CursorGrid';
import Magnet from '@/components/ui/Magnet';
import ImageTrail from '@/components/ui/ImageTrail';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Zap, Shield, Award, Users, BarChart3, 
  Smartphone, ChevronRight, Star, CheckCircle2,
  GraduationCap, Globe, Cpu, Play, Image as ImageIcon,
  Phone, Mail, MapPin, MessageSquare, Handshake, X, Loader2, Building2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [cmsContent, setCmsContent] = useState(null);
  const [mediaGallery, setMediaGallery] = useState([]);
  const [partners, setPartners] = useState([]);
  const [director, setDirector] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Callback form state
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [contactPopupOpen, setContactPopupOpen] = useState(false);
  const [callbackForm, setCallbackForm] = useState({ name: '', phone: '', message: '' });
  const [submittingCallback, setSubmittingCallback] = useState(false);
  
  // Partner detail popup
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [directorExpanded, setDirectorExpanded] = useState(false);

  useEffect(() => {
    fetchCmsContent();
    fetchMediaGallery();
    fetchPartners();
    fetchDirector();
    fetchContactInfo();
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API}/programs`);
      setPrograms(response.data || []);
    } catch (error) {
      console.log('No programs');
    }
  };

  const fetchCmsContent = async () => {
    try {
      const response = await axios.get(`${API}/cms/landing`);
      setCmsContent(response.data);
    } catch (error) {
      console.log('Using default content');
    }
  };

  const fetchMediaGallery = async () => {
    try {
      const response = await axios.get(`${API}/media/gallery/public`);
      setMediaGallery(response.data || []);
    } catch (error) {
      console.log('No media gallery content');
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await axios.get(`${API}/partners`);
      setPartners(response.data || []);
    } catch (error) {
      console.log('No partners');
    }
  };

  const fetchDirector = async () => {
    try {
      const response = await axios.get(`${API}/cms/programme-director`);
      setDirector(response.data);
    } catch (error) {
      console.log('No director content');
    }
  };

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get(`${API}/cms/contact-info`);
      setContactInfo(response.data);
    } catch (error) {
      console.log('No contact info');
    }
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
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setSubmittingCallback(false);
    }
  };

  const openWhatsApp = () => {
    const number = contactInfo?.whatsapp_number || '+919876543210';
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=Hi, I'm interested in KXGRID programs`, '_blank');
  };

  const features = [
    {
      icon: Smartphone,
      title: "NFC-Powered Identity",
      description: "One tap attendance and instant verification with smart NFC cards"
    },
    {
      icon: BarChart3,
      title: "AI Gap Analysis",
      description: "Personalized insights and recommendations powered by advanced AI"
    },
    {
      icon: Award,
      title: "Digital Certificates",
      description: "QR-verified certificates with anti-tampering protection"
    },
    {
      icon: Users,
      title: "Multi-Brand Operations",
      description: "Unified platform connecting all programmes and departments"
    },
    {
      icon: Shield,
      title: "Safety Intelligence",
      description: "Medical tracking and emergency contact integration"
    },
    {
      icon: Star,
      title: "Gamified Progress",
      description: "Badges, leaderboards, and recognition system"
    }
  ];

  // Program colors based on index
  const programColors = [
    "from-cyan-500 to-blue-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-green-500 to-teal-500",
    "from-yellow-500 to-orange-500",
    "from-indigo-500 to-purple-500"
  ];

  // CMS content with defaults
  const heroHeadline1 = cmsContent?.hero_headline_1 || "Unified Operating Platform for the KotlerX Ecosystem";
  const heroHeadline2 = cmsContent?.hero_headline_2 || "Connecting Brands, Programmes, Students, Crew & Partners";
  const heroHeadline3 = cmsContent?.hero_headline_3 || "NFC + AI-powered Skill Tracking Platform";
  const heroDescription = cmsContent?.hero_description || "GRID enables programme execution, department coordination, attendance & assessment tracking, content delivery, and brand visibility across the ecosystem.";
  const stats = cmsContent?.stats || {
    students_trained: "500+",
    programs: "10+",
    placement_rate: "95%",
    industry_partners: "20+"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <KotlerXLogo size="md" variant="header" />
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-zinc-300 hover:text-[#00e5ff] transition-colors font-inter text-sm font-medium">Features</a>
            <a href="#programs" className="text-zinc-300 hover:text-[#00e5ff] transition-colors font-inter text-sm font-medium">Programs</a>
            <Magnet padding={50} magnetStrength={40}>
              <Button
                onClick={() => navigate('/programs')}
                className="bg-[#00e5ff] text-black hover:bg-[#00e5ff]/90 px-6 font-semibold transition-all"
                data-testid="nav-programs-btn"
              >
                View Programs
              </Button>
            </Magnet>
          </div>

          {/* Mobile Hamburger Menu */}
          <button 
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-white/10 py-4 px-6 space-y-4 shadow-lg">
            <a href="#features" className="block text-zinc-300 hover:text-[#00e5ff] transition-colors font-inter font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#programs" className="block text-zinc-300 hover:text-[#00e5ff] transition-colors font-inter font-medium" onClick={() => setMobileMenuOpen(false)}>Programs</a>
            <Magnet padding={50} magnetStrength={40} disabled={true}>
              <Button
                onClick={() => { navigate('/programs'); setMobileMenuOpen(false); }}
                className="bg-[#00e5ff] text-black hover:bg-[#00e5ff]/90 w-full font-semibold"
              >
                View Programs
              </Button>
            </Magnet>
            <div className="pt-2 border-t border-white/10 space-y-2">
              <Magnet padding={50} magnetStrength={40} disabled={true}>
                <Button
                  variant="outline"
                  onClick={() => { navigate('/login/student'); setMobileMenuOpen(false); }}
                  className="w-full border-white/10 text-white hover:border-[#00e5ff] hover:text-[#00e5ff]"
                >
                  Student Login
                </Button>
              </Magnet>
              <Magnet padding={50} magnetStrength={40} disabled={true}>
                <Button
                  variant="outline"
                  onClick={() => { navigate('/login/office'); setMobileMenuOpen(false); }}
                  className="w-full border-white/10 text-white hover:border-[#00e5ff] hover:text-[#00e5ff]"
                >
                  Office Login
                </Button>
              </Magnet>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <CursorGrid
            cellSize={60}
            color="#00FF94"
            radius={160}
            falloff="smooth"
            holdTime={400}
            fadeDuration={800}
            lineWidth={1.0}
            maxOpacity={0.7}
            fillOpacity={0.05}
            gridOpacity={0.03}
            cellRadius={2}
            clickPulse={true}
            pulseSpeed={600}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Main Tagline - Proper spacing */}
          <SplitText 
            text="LEARN. EXECUTE. LEAD." 
            tag="h1" 
            className="font-unbounded font-black text-3xl md:text-5xl lg:text-6xl tracking-tight mb-8 animate-slide-up text-white" 
          />
          
          {/* Hero Logo with Purple Glow */}
          <div className="animate-slide-up flex justify-center mb-8" style={{ animationDelay: '0.1s' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full scale-150"></div>
              <img 
                src="https://customer-assets.emergentagent.com/job_984a459f-bca4-4f6b-93c3-f060eda8d982/artifacts/jyzi0nv2_IMG_0354.png"
                alt="KotlerX"
                className="relative h-44 md:h-56 lg:h-64 w-auto"
              />
            </div>
          </div>
          
          {/* Subtitle */}
          <div className="animate-slide-up mb-6" style={{ animationDelay: '0.15s' }}>
            <h2 className="font-unbounded font-bold text-xl md:text-2xl lg:text-3xl text-white mb-2">
              India's First University Integrated
            </h2>
            <h2 className="font-unbounded font-bold text-xl md:text-2xl lg:text-3xl text-primary">
              Automotive, Motorsport & Media Skill Programmes
            </h2>
          </div>
          
          <p className="font-inter text-sm md:text-base text-zinc-400 max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            GRID enables programme execution, department coordination, attendance & assessment tracking, content delivery, and brand visibility across the ecosystem.
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <Magnet padding={60} magnetStrength={35}>
              <Button
                onClick={() => navigate('/programs')}
                className="btn-primary h-12 px-8 text-base font-bold w-full sm:w-auto"
                data-testid="hero-programs-btn"
              >
                VIEW PROGRAMS
              </Button>
            </Magnet>
            <Magnet padding={60} magnetStrength={35}>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 h-12 px-8 text-base font-bold w-full sm:w-auto"
                data-testid="hero-apply-btn"
              >
                APPLY NOW
              </Button>
            </Magnet>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {[
              { value: stats.students_trained, label: "Students Trained" },
              { value: stats.programs, label: "Programs" },
              { value: stats.placement_rate, label: "Placement Rate" },
              { value: stats.industry_partners, label: "Industry Partners" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-unbounded font-bold text-2xl md:text-3xl text-primary mb-1">{stat.value}</div>
                <div className="font-inter text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners Carousel */}
      <PromoCarousel />

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <SplitText 
              text="UNIFIED PLATFORM" 
              tag="h2" 
              className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-4" 
            />
            <p className="font-inter text-zinc-400 max-w-xl mx-auto">
              One platform connecting all operations, departments, and stakeholders
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="telemetry-card rounded-xl p-8 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-unbounded font-semibold text-xl text-white mb-3">{feature.title}</h3>
                <p className="font-inter text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-32 relative bg-surface">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <CursorGrid
            cellSize={60}
            color="#00FF94"
            radius={160}
            falloff="smooth"
            holdTime={400}
            fadeDuration={800}
            lineWidth={1.0}
            maxOpacity={0.4}
            fillOpacity={0.03}
            gridOpacity={0.015}
            cellRadius={2}
            clickPulse={true}
            pulseSpeed={600}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-4">
              PROGRAMS
            </h2>
            <p className="font-inter text-zinc-400 max-w-xl mx-auto">
              Automotive, Motorsport & Media Skill Programmes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(programs.length > 0 ? programs.slice(0, 6) : []).map((program, i) => {
              const gradients = [
                "from-teal-500 to-cyan-600",
                "from-purple-500 to-pink-600",
                "from-orange-500 to-red-600",
                "from-green-500 to-emerald-600",
                "from-amber-500 to-yellow-600",
                "from-violet-500 to-purple-600"
              ];
              const icons = [Award, GraduationCap, Star, Shield, Zap, Users];
              const IconComp = icons[i % icons.length];
              const gradient = gradients[i % gradients.length];
              
              return (
                <div 
                  key={program.program_id || i}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-br ${gradient} p-6 min-h-[280px] flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]`}
                  onClick={() => navigate('/programs')}
                  data-testid={`program-card-${i}`}
                >
                  <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center mb-6 bg-white/10">
                    <IconComp className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="font-unbounded font-bold text-xl text-white mb-3 leading-tight">
                    {program.name}
                  </h3>
                  
                  <p className="font-inter text-white/70 text-sm mb-4">
                    Professional Training
                  </p>
                  
                  <div className="flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Media Gallery Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-4">
              EXPERIENCE <span className="text-secondary">KXGRID</span>
            </h2>
            <p className="font-inter text-zinc-400 max-w-xl mx-auto">
              See our students, trainers, and brands in action
            </p>
          </div>

          {/* Interactive Image Trail */}
          <div style={{ height: '500px', position: 'relative', overflow: 'hidden' }} className="rounded-2xl bg-gradient-to-b from-zinc-900/50 to-transparent border border-white/5">
            <ImageTrail
              items={[
                'https://picsum.photos/id/119/300/300',
                'https://picsum.photos/id/180/300/300',
                'https://picsum.photos/id/244/300/300',
                'https://picsum.photos/id/367/300/300',
                'https://picsum.photos/id/381/300/300',
                'https://picsum.photos/id/430/300/300',
                'https://picsum.photos/id/494/300/300',
                'https://picsum.photos/id/582/300/300',
                'https://picsum.photos/id/659/300/300',
                'https://picsum.photos/id/718/300/300',
              ]}
              variant={7}
            />
            {/* Overlay text hint */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <p className="text-white/80 text-sm font-inter">
                  Move your cursor to see the magic ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 opacity-50" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-unbounded font-bold text-4xl md:text-5xl text-white mb-6">
            READY TO <span className="gradient-text">JOIN?</span>
          </h2>
          <p className="font-inter text-lg text-zinc-400 mb-10">
            Explore our programmes and start your journey today
          </p>
          <Magnet padding={70} magnetStrength={30}>
            <Button
              onClick={() => navigate('/programs')}
              className="btn-primary h-14 px-12 text-lg"
              data-testid="cta-programs-btn"
            >
              View Programs
            </Button>
          </Magnet>
        </div>
      </section>

      {/* Partners & Sponsors Marquee */}
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

          {/* Featured Partners - Big Logos */}
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
                      {/* Big Logo */}
                      <div className="w-32 h-32 md:w-40 md:h-40 mb-4 flex items-center justify-center bg-white/5 rounded-xl p-4 group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all duration-300">
                        {partner.logo_base64 || partner.logo_url ? (
                          <img 
                            src={partner.logo_base64 || partner.logo_url}
                            alt={partner.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-3xl md:text-4xl font-bold text-primary">
                            {partner.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </span>
                        )}
                      </div>
                      {/* Partner Name */}
                      <h3 className="font-unbounded font-semibold text-lg md:text-xl text-white mb-2">
                        {partner.name}
                      </h3>
                      {/* Partner Type Badge */}
                      <span className={`text-xs px-3 py-1 rounded-full mb-3 ${
                        partner.partner_type === 'sponsor' ? 'bg-yellow-500/20 text-yellow-400' :
                        partner.partner_type === 'association' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {partner.partner_type?.charAt(0).toUpperCase() + partner.partner_type?.slice(1)}
                      </span>
                      {/* Description */}
                      <p className="text-sm text-zinc-400 line-clamp-3">
                        {partner.description || `${partner.name} is a valued ${partner.partner_type} of KXGRID.`}
                      </p>
                      {/* Website Link */}
                      {partner.website_url && (
                        <a 
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                          Visit Website
                          <ChevronRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Marquee Animation */}
          <div className="relative">
            <div className="partners-marquee flex gap-6 md:gap-12 animate-marquee">
              {[...partners, ...partners, ...partners].map((partner, i) => (
                <div 
                  key={`${partner.partner_id}-${i}`}
                  className="flex-shrink-0 w-20 h-14 md:w-32 md:h-20 flex items-center justify-center hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.7)] transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedPartner(partner)}
                >
                  {partner.logo_base64 || partner.logo_url ? (
                    <img 
                      src={partner.logo_base64 || partner.logo_url}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-white/5 flex items-center justify-center">
                      <span className="text-[10px] md:text-xs text-zinc-500 font-medium text-center px-1 md:px-2">{partner.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-33.33%); }
            }
            .animate-marquee {
              animation: marquee 8s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
            @media (max-width: 768px) {
              .animate-marquee {
                animation: marquee 6s linear infinite;
              }
            }
          `}</style>
        </section>
      )}

      {/* Partner Detail Dialog */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              {(selectedPartner?.logo_base64 || selectedPartner?.logo_url) && (
                <img 
                  src={selectedPartner?.logo_base64 || selectedPartner?.logo_url}
                  alt={selectedPartner?.name}
                  className="w-12 h-12 object-contain rounded-lg bg-white/10 p-1"
                />
              )}
              {selectedPartner?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedPartner?.partner_type === 'sponsor' ? 'bg-yellow-500/20 text-yellow-400' :
                selectedPartner?.partner_type === 'association' ? 'bg-blue-500/20 text-blue-400' :
                'bg-primary/20 text-primary'
              }`}>
                {selectedPartner?.partner_type?.charAt(0).toUpperCase() + selectedPartner?.partner_type?.slice(1)}
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              {selectedPartner?.description || 
                `${selectedPartner?.name} is a valued ${selectedPartner?.partner_type} of KXGRID, contributing to our mission of developing world-class motorsport professionals.`
              }
            </p>
            {selectedPartner?.website_url && (
              <a 
                href={selectedPartner.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary/80"
              >
                Visit Website
                <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Programme Director Message */}
      {director && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="font-unbounded font-bold text-2xl text-white text-center mb-12">
              MESSAGE FROM <span className="gradient-text">PROGRAMME DIRECTOR</span>
            </h2>
            
            <div className="relative rounded-3xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
              <div className="absolute inset-0 backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-3xl transition-colors group-hover:border-primary/30" />
              
              <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="relative flex-shrink-0">
                  <img 
                    src={(director.photo_base64 || director.photo_url) ? (director.photo_base64 || director.photo_url) : "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                    alt={director.name}
                    className="relative w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover border border-white/20 z-10 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left flex flex-col">
                  <span className="text-6xl text-primary/20 font-serif leading-none absolute top-4 left-8 md:top-8 md:left-auto md:right-8">"</span>
                  <div className="mb-6 relative z-10">
                    <p className="font-unbounded font-bold text-white text-xl md:text-2xl tracking-wide">{director.name}</p>
                    <p className="text-sm md:text-base text-primary/90 font-medium tracking-wide uppercase mt-1">{director.designation}</p>
                  </div>
                  
                  <blockquote className="font-inter text-base md:text-lg text-zinc-300 italic leading-relaxed relative z-10 mb-8">
                    {directorExpanded || (director.message && director.message.length <= 250) 
                      ? `"${director.message}"`
                      : `"${director.message?.substring(0, 250)}..."`
                    }
                    {director.message && director.message.length > 250 && (
                      <button 
                        onClick={() => setDirectorExpanded(!directorExpanded)}
                        className="text-primary text-sm mt-3 hover:text-white transition-colors block font-semibold mx-auto md:mx-0"
                      >
                        {directorExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </blockquote>
                  
                  <div className="mt-auto relative z-10">
                    <button
                      onClick={() => navigate('/team')}
                      className="inline-flex items-center gap-2 text-white bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                    >
                      MEET THE INSTRUCTORS
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-unbounded font-bold text-3xl md:text-4xl text-white mb-4">
            {contactInfo?.heading_text || "Have Questions? Let's Connect"}
          </h2>
          <p className="font-inter text-lg text-zinc-400 mb-10">
            {contactInfo?.subheading_text || "Our admission and academic team will guide you through the right pathway"}
          </p>
          
          {/* Contact CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Magnet padding={60} magnetStrength={35}>
              <Button
                onClick={() => setCallbackOpen(true)}
                className="btn-primary h-14 px-8 gap-2 w-full sm:w-auto"
                data-testid="request-callback-btn"
              >
                <Phone className="w-5 h-5" />
                Request Call Back
              </Button>
            </Magnet>

            <Magnet padding={60} magnetStrength={35}>
              <Button
                onClick={openWhatsApp}
                variant="outline"
                className="h-14 px-8 gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10 w-full sm:w-auto"
                data-testid="whatsapp-btn"
              >
                <MessageSquare className="w-5 h-5" />
                Message Us
              </Button>
            </Magnet>

            <Magnet padding={60} magnetStrength={35}>
              <Button
                onClick={() => setContactPopupOpen(true)}
                variant="outline"
                className="h-14 px-8 gap-2 border-white/20 text-zinc-300 hover:bg-white/5 w-full sm:w-auto"
                data-testid="contact-us-btn"
              >
                <Phone className="w-5 h-5" />
                Contact Us
              </Button>
            </Magnet>
          </div>

          {/* Contact Icons */}
          <div className="flex items-center justify-center gap-8">
            <a href={`tel:${contactInfo?.phone || '+919514756314'}`} className="flex flex-col items-center gap-2 text-white hover:text-cyan-400 transition-colors group" data-testid="contact-phone">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-700 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
                <Phone className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-xs text-zinc-400">Call</span>
            </a>
            <a href={`mailto:${contactInfo?.email || 'info@kotlerx.com'}`} className="flex flex-col items-center gap-2 text-white hover:text-blue-400 transition-colors group" data-testid="contact-email">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-700 flex items-center justify-center group-hover:border-blue-400 transition-colors">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-zinc-400">Mail</span>
            </a>
            <a href={contactInfo?.map_url || "https://maps.google.com/?q=Chennai,India"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-white hover:text-red-400 transition-colors group" data-testid="contact-location">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-700 flex items-center justify-center group-hover:border-red-400 transition-colors">
                <MapPin className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-xs text-zinc-400">Location</span>
            </a>
          </div>
        </div>
      </section>

      {/* Request Callback Dialog */}
      <Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Request a Call Back
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Your Name *</Label>
              <Input
                value={callbackForm.name}
                onChange={(e) => setCallbackForm(prev => ({ ...prev, name: e.target.value }))}
                className="input-dark"
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Phone Number *</Label>
              <Input
                value={callbackForm.phone}
                onChange={(e) => setCallbackForm(prev => ({ ...prev, phone: e.target.value }))}
                className="input-dark"
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Message (Optional)</Label>
              <Input
                value={callbackForm.message}
                onChange={(e) => setCallbackForm(prev => ({ ...prev, message: e.target.value }))}
                className="input-dark"
                placeholder="What would you like to discuss?"
              />
            </div>
            <Magnet padding={50} magnetStrength={40} disabled={true}>
              <Button
                onClick={submitCallbackRequest}
                disabled={submittingCallback}
                className="w-full btn-primary"
              >
                {submittingCallback ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Request
              </Button>
            </Magnet>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Popup Dialog */}
      <Dialog open={contactPopupOpen} onOpenChange={setContactPopupOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white text-center">Call Us Now</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Phone className="w-10 h-10 text-primary" />
            </div>
            <p className="text-2xl font-unbounded font-bold text-white mb-2">
              {contactInfo?.phone || '+91 98765 43210'}
            </p>
            <p className="text-sm text-zinc-500 mb-6">Admissions Team</p>
            <a 
              href={`tel:${contactInfo?.phone || '+919876543210'}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-white/10" data-testid="footer">
        {/* Main Footer - 3-column layout on desktop, stacked on mobile */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
            {/* Column 1: Social */}
            <div className="flex flex-col items-center md:items-start justify-center">
              <div className="flex items-center gap-3">
                <a href={contactInfo?.social_links?.facebook || "https://facebook.com/kotlerx"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-blue-500 hover:scale-110 hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-300 shadow-[0_0_6px_rgba(59,130,246,0.15)]" data-testid="social-facebook">
                  <svg className="w-5 h-5 text-blue-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href={contactInfo?.social_links?.twitter || "https://x.com/kotlerx"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-white hover:scale-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-300 shadow-[0_0_6px_rgba(255,255,255,0.08)]" data-testid="social-twitter">
                  <svg className="w-5 h-5 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href={contactInfo?.social_links?.linkedin || "https://linkedin.com/company/kotlerx"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-blue-600 hover:scale-110 hover:shadow-[0_0_12px_rgba(37,99,235,0.5)] transition-all duration-300 shadow-[0_0_6px_rgba(37,99,235,0.15)]" data-testid="social-linkedin">
                  <svg className="w-5 h-5 text-blue-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href={contactInfo?.social_links?.instagram || "https://instagram.com/kotlerx"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-pink-500 hover:scale-110 hover:shadow-[0_0_12px_rgba(236,72,153,0.5)] transition-all duration-300 shadow-[0_0_6px_rgba(236,72,153,0.15)]" data-testid="social-instagram">
                  <svg className="w-5 h-5 drop-shadow-[0_0_4px_rgba(236,72,153,0.4)]" fill="url(#instagram-gradient-footer)" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="instagram-gradient-footer" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFDC80" />
                        <stop offset="25%" stopColor="#F77737" />
                        <stop offset="50%" stopColor="#E1306C" />
                        <stop offset="75%" stopColor="#C13584" />
                        <stop offset="100%" stopColor="#833AB4" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href={contactInfo?.social_links?.youtube || "https://youtube.com/@kotlerx"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-red-500 hover:scale-110 hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-300 shadow-[0_0_6px_rgba(239,68,68,0.15)]" data-testid="social-youtube">
                  <svg className="w-5 h-5 text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://kotlerx.in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-zinc-600/50 flex items-center justify-center hover:border-purple-500 hover:scale-110 hover:shadow-[0_0_12px_rgba(168,85,247,0.5)] transition-all duration-300 shadow-[0_0_6px_rgba(168,85,247,0.15)]" data-testid="social-kxroot">
                  <img src="https://customer-assets.emergentagent.com/job_8d9320ee-7426-4d04-936b-8c0c840bbee5/artifacts/6rxldpzx_Icon%20Only%20Transparent-03.png" alt="KotlerX" className="w-24 h-24 object-contain drop-shadow-[0_0_4px_rgba(168,85,247,0.4)] scale-[2.2]" />
                </a>
              </div>
            </div>

            {/* Column 2: Newsletter */}
            <div className="flex flex-col items-center md:items-end">
              <h3 className="text-white text-lg font-bold mb-2">For More Updates</h3>
              <p className="text-zinc-400 text-xs mb-3 text-center md:text-right">
                Subscribe for news, blogs, tips & opportunities.
              </p>
              <div className="flex gap-2 w-full max-w-xs">
                <input 
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  data-testid="newsletter-email-input"
                />
                <button 
                  onClick={() => setCallbackOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-semibold py-2 px-4 rounded-md text-sm transition-all duration-300 hover:scale-105 whitespace-nowrap"
                  data-testid="newsletter-subscribe-btn"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-inter text-xs text-zinc-500">
              &copy; 2025 KOTLERX. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <button 
                onClick={() => navigate('/login/student')}
                className="font-inter text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                data-testid="footer-student-login"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student Login
              </button>
              <button 
                onClick={() => navigate('/login/office')}
                className="font-inter text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                data-testid="footer-office-login"
              >
                <Building2 className="w-3.5 h-3.5" />
                Office Login
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
