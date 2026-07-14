import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ChevronRight, Phone, Mail, MapPin, MessageSquare, Loader2,
  Smartphone, BarChart3, Award, Users, Shield, Star,
  GraduationCap, Building2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LandingPagePremium = () => {
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

  const heroRef = useRef(null);

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
      description: "One tap attendance and instant verification with smart NFC cards",
      gradient: "from-cyan-500/20 to-blue-500/20"
    },
    {
      icon: BarChart3,
      title: "AI Gap Analysis",
      description: "Personalized insights and recommendations powered by advanced AI",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Award,
      title: "Digital Certificates",
      description: "QR-verified certificates with anti-tampering protection",
      gradient: "from-orange-500/20 to-red-500/20"
    },
    {
      icon: Users,
      title: "Multi-Brand Operations",
      description: "Unified platform connecting all programmes and departments",
      gradient: "from-green-500/20 to-teal-500/20"
    },
    {
      icon: Shield,
      title: "Safety Intelligence",
      description: "Medical tracking and emergency contact integration",
      gradient: "from-indigo-500/20 to-blue-500/20"
    },
    {
      icon: Star,
      title: "Gamified Progress",
      description: "Badges, leaderboards, and recognition system",
      gradient: "from-yellow-500/20 to-orange-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-zinc-950/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <KotlerXLogo size="md" variant="header" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-zinc-300 hover:text-primary transition-colors font-inter text-sm font-medium">Features</a>
            <a href="#programs" className="text-zinc-300 hover:text-primary transition-colors font-inter text-sm font-medium">Programs</a>
            <Button
              onClick={() => navigate('/programs')}
              className="bg-primary text-black hover:bg-primary/90 px-6 font-semibold transition-all"
            >
              View Programs
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950/80 backdrop-blur-md border-t border-white/5 py-4 px-6 space-y-4">
            <a href="#features" className="block text-zinc-300 hover:text-primary transition-colors font-inter font-medium">Features</a>
            <a href="#programs" className="block text-zinc-300 hover:text-primary transition-colors font-inter font-medium">Programs</a>
            <Button onClick={() => { navigate('/programs'); setMobileMenuOpen(false); }} className="bg-primary text-black w-full font-semibold">View Programs</Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-medium text-zinc-300">India's First University Integrated Motorsport Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-unbounded font-black tracking-tight mb-6 text-white leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Learn. Execute.
            <span className="block bg-gradient-to-r from-primary via-primary to-cyan-300 bg-clip-text text-transparent">
              Lead Forward.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in font-inter" style={{ animationDelay: '0.2s' }}>
            The next generation platform for skill development in automotive, motorsport, and media. Powered by NFC technology and AI-driven insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button
              onClick={() => navigate('/programs')}
              className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-primary to-cyan-400 text-black hover:shadow-lg hover:shadow-primary/50 transition-all w-full sm:w-auto"
            >
              Explore Programs
            </Button>
            <Button
              onClick={() => navigate('/register')}
              variant="outline"
              className="h-12 px-8 text-base font-semibold border-primary/50 text-primary hover:bg-primary/10 w-full sm:w-auto"
            >
              Apply Today
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-unbounded font-bold text-primary mb-1">500+</div>
              <div className="text-xs md:text-sm text-zinc-400">Students Trained</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-unbounded font-bold text-primary mb-1">10+</div>
              <div className="text-xs md:text-sm text-zinc-400">Programs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-unbounded font-bold text-primary mb-1">95%</div>
              <div className="text-xs md:text-sm text-zinc-400">Placement Rate</div>
            </div>
            <div className="hidden md:block text-center">
              <div className="text-3xl md:text-4xl font-unbounded font-bold text-primary mb-1">20+</div>
              <div className="text-xs md:text-sm text-zinc-400">Partners</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Scroll to explore</span>
            <div className="w-6 h-10 border border-zinc-500/30 rounded-full flex items-start justify-center pt-2">
              <div className="w-1 h-2 bg-zinc-500/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Platform Capabilities</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-unbounded font-bold text-white mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              A unified ecosystem designed to connect students, trainers, and industry partners in one intelligent platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group relative rounded-2xl border border-white/10 p-8 backdrop-blur-sm bg-gradient-to-br ${feature.gradient} hover:border-primary/30 transition-all duration-300 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="text-xl font-unbounded font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feature.description}</p>

                  <div className="mt-6 flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all duration-300">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24 md:py-32 relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Our Offerings</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-unbounded font-bold text-white mb-6">
              World-Class Programs
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Specialized training in automotive, motorsport, and media technologies.
            </p>
          </div>

          {programs.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.slice(0, 6).map((program, i) => {
                const gradients = [
                  "from-cyan-500 to-blue-600",
                  "from-purple-500 to-pink-600",
                  "from-orange-500 to-red-600",
                  "from-green-500 to-emerald-600",
                  "from-amber-500 to-yellow-600",
                  "from-violet-500 to-purple-600"
                ];

                return (
                  <div
                    key={program.program_id || i}
                    onClick={() => navigate('/programs')}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br ${gradients[i % gradients.length]} p-8 min-h-64 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center mb-4 bg-white/10 group-hover:scale-110 transition-transform duration-300">
                        <Award className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="text-2xl font-unbounded font-bold text-white mb-2">
                        {program.name}
                      </h3>

                      <p className="text-white/80 text-sm mb-6">Professional Training</p>

                      <div className="flex items-center gap-1 text-white font-semibold group-hover:gap-2 transition-all">
                        <span>Explore</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Image Gallery Section */}
      {mediaGallery.length > 0 && (
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Visual Story</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-unbounded font-bold text-white mb-6">
                Experience in Action
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaGallery.slice(0, 12).map((item, i) => (
                <div
                  key={item.media_id || i}
                  className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer"
                >
                  <img
                    src={item.media_base64 || item.thumbnail_url || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold text-sm line-clamp-2">{item.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-unbounded font-bold text-white mb-6">
            Ready to Transform Your Future?
          </h2>

          <p className="text-lg text-zinc-300 mb-10 leading-relaxed">
            Join hundreds of students building careers in automotive, motorsport, and media.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/programs')}
              className="h-12 px-8 text-base font-semibold bg-primary text-black hover:shadow-lg hover:shadow-primary/50 transition-all w-full sm:w-auto"
            >
              View All Programs
            </Button>

            <Button
              onClick={() => setCallbackOpen(true)}
              variant="outline"
              className="h-12 px-8 text-base font-semibold border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Schedule a Call
            </Button>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      {partners.length > 0 && (
        <section className="py-24 md:py-32 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trusted Partners</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-unbounded font-bold text-white mb-6">
                Industry Leaders
              </h2>
              <p className="text-lg text-zinc-400">Collaborating with top brands and organizations</p>
            </div>

            {/* Featured Partners */}
            {partners.filter(p => p.is_featured).length > 0 && (
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                {partners.filter(p => p.is_featured).slice(0, 2).map((partner) => (
                  <div
                    key={partner.partner_id}
                    className="group relative rounded-2xl border border-white/10 p-8 backdrop-blur-sm bg-gradient-to-br from-white/5 to-transparent hover:border-primary/30 cursor-pointer transition-all duration-300"
                    onClick={() => setSelectedPartner(partner)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-32 h-32 mb-6 flex items-center justify-center bg-white/5 rounded-2xl p-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        {partner.logo_base64 || partner.logo_url ? (
                          <img
                            src={partner.logo_base64 || partner.logo_url}
                            alt={partner.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-primary">{partner.name?.charAt(0)}</span>
                        )}
                      </div>

                      <h3 className="text-xl font-unbounded font-semibold text-white mb-2">
                        {partner.name}
                      </h3>

                      <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary mb-4">
                        {partner.partner_type?.charAt(0).toUpperCase() + partner.partner_type?.slice(1)}
                      </span>

                      <p className="text-sm text-zinc-400 line-clamp-2">
                        {partner.description || `Partner of KXGRID`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Partner Logos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {partners.slice(0, 12).map((partner, i) => (
                <div
                  key={partner.partner_id}
                  className="group flex items-center justify-center rounded-2xl border border-white/10 p-6 bg-white/[0.02] hover:border-primary/30 cursor-pointer transition-all duration-300 aspect-square"
                  onClick={() => setSelectedPartner(partner)}
                >
                  {partner.logo_base64 || partner.logo_url ? (
                    <img
                      src={partner.logo_base64 || partner.logo_url}
                      alt={partner.name}
                      className="max-w-[80%] max-h-[80%] object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-xs font-semibold text-zinc-500">{partner.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Director Section */}
      {director && (
        <section className="py-24 md:py-32 relative border-t border-white/5 overflow-hidden">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-5xl mx-auto px-6">
            <div className="rounded-3xl border border-white/10 backdrop-blur-sm bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
              <div className="p-8 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                {/* Director Photo */}
                <div className="flex-shrink-0">
                  <div className="relative w-40 h-40 md:w-56 md:h-56">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl"></div>
                    <img
                      src={director.photo_base64 || director.photo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                      alt={director.name}
                      className="relative w-full h-full rounded-3xl object-cover border border-white/20"
                    />
                  </div>
                </div>

                {/* Director Message */}
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-8">
                    <p className="text-xl font-unbounded font-bold text-white mb-2">{director.name}</p>
                    <p className="text-sm font-medium text-primary uppercase tracking-wide">{director.designation}</p>
                  </div>

                  <blockquote className="text-lg text-zinc-300 leading-relaxed italic mb-8 relative">
                    <span className="text-4xl text-primary/20 absolute -top-4 -left-2">"</span>
                    {director.message}
                  </blockquote>

                  <Button
                    onClick={() => navigate('/team')}
                    className="bg-white/10 text-white hover:bg-primary hover:text-black border border-white/10 hover:border-primary font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    Meet the Team
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-24 md:py-32 relative border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-unbounded font-bold text-white mb-6">
            Get in Touch
          </h2>

          <p className="text-lg text-zinc-400 mb-12 leading-relaxed">
            Have questions? Our admissions team is here to guide you every step of the way.
          </p>

          {/* Contact Buttons */}
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
            <button
              onClick={() => setCallbackOpen(true)}
              className="group p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-white mb-1">Call Back</p>
              <p className="text-xs text-zinc-400">Request a callback</p>
            </button>

            <button
              onClick={openWhatsApp}
              className="group p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-green-500/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <p className="font-semibold text-white mb-1">WhatsApp</p>
              <p className="text-xs text-zinc-400">Chat with us</p>
            </button>

            <button
              onClick={() => setContactPopupOpen(true)}
              className="group p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <p className="font-semibold text-white mb-1">Contact</p>
              <p className="text-xs text-zinc-400">Phone number</p>
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-6">
            <a href={`tel:${contactInfo?.phone || '+919514756314'}`} className="group flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-600 flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all">
                <Phone className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
              </div>
              <span className="text-xs text-zinc-500">Call</span>
            </a>

            <a href={`mailto:${contactInfo?.email || 'info@kotlerx.com'}`} className="group flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-600 flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all">
                <Mail className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
              </div>
              <span className="text-xs text-zinc-500">Email</span>
            </a>

            <a href={contactInfo?.map_url || "https://maps.google.com/?q=Chennai,India"} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-600 flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all">
                <MapPin className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
              </div>
              <span className="text-xs text-zinc-500">Location</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950/50 border-t border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8 md:mb-12">
            {/* Branding */}
            <div>
              <KotlerXLogo size="md" variant="header" />
              <p className="text-zinc-400 text-sm mt-4 leading-relaxed">
                Empowering the next generation of automotive, motorsport, and media professionals.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="font-semibold text-white mb-4">Quick Links</p>
              <div className="space-y-2 text-sm text-zinc-400">
                <a href="#features" className="hover:text-primary transition-colors block">Features</a>
                <a href="#programs" className="hover:text-primary transition-colors block">Programs</a>
                <button onClick={() => navigate('/team')} className="hover:text-primary transition-colors">Team</button>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <p className="font-semibold text-white mb-4">Stay Updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors"
                />
                <button className="px-4 py-2 rounded-lg bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>&copy; 2025 KOTLERX. All rights reserved.</p>
            <div className="flex gap-6">
              <button onClick={() => navigate('/login/student')} className="hover:text-primary transition-colors flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Student Login
              </button>
              <button onClick={() => navigate('/login/office')} className="hover:text-primary transition-colors flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                Office Login
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Callback Dialog */}
      <Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-unbounded flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Request a Call Back
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400 font-medium">Your Name</Label>
              <Input
                value={callbackForm.name}
                onChange={(e) => setCallbackForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder-zinc-500"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 font-medium">Phone Number</Label>
              <Input
                value={callbackForm.phone}
                onChange={(e) => setCallbackForm(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder-zinc-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 font-medium">Message (Optional)</Label>
              <Input
                value={callbackForm.message}
                onChange={(e) => setCallbackForm(prev => ({ ...prev, message: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder-zinc-500"
                placeholder="What would you like to discuss?"
              />
            </div>

            <Button
              onClick={submitCallbackRequest}
              disabled={submittingCallback}
              className="w-full bg-primary text-black hover:bg-primary/90 font-semibold"
            >
              {submittingCallback && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Popup Dialog */}
      <Dialog open={contactPopupOpen} onOpenChange={setContactPopupOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white font-unbounded text-center">Call Us Now</DialogTitle>
          </DialogHeader>

          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-primary" />
            </div>

            <p className="text-2xl font-unbounded font-bold text-white mb-2">
              {contactInfo?.phone || '+91 98765 43210'}
            </p>

            <p className="text-sm text-zinc-500 mb-6">Admissions Team</p>

            <a
              href={`tel:${contactInfo?.phone || '+919876543210'}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-black font-semibold hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Partner Dialog */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              {selectedPartner?.logo_base64 || selectedPartner?.logo_url ? (
                <img
                  src={selectedPartner?.logo_base64 || selectedPartner?.logo_url}
                  alt={selectedPartner?.name}
                  className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1"
                />
              ) : null}
              {selectedPartner?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary inline-block mb-4">
              {selectedPartner?.partner_type?.charAt(0).toUpperCase() + selectedPartner?.partner_type?.slice(1)}
            </span>

            <p className="text-zinc-400 leading-relaxed">
              {selectedPartner?.description || `${selectedPartner?.name} is a valued partner of KXGRID.`}
            </p>

            {selectedPartner?.website_url && (
              <a
                href={selectedPartner.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Visit Website
                <ChevronRight className="w-4 h-4" />
              </a>
            )}
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

export default LandingPagePremium;
