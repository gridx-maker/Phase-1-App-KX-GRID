import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  ChevronLeft, ChevronRight, ExternalLink, Loader2,
  Zap, Paintbrush, Dumbbell, Users, Bike, Play, Star, 
  Trophy, Target, Rocket, Heart, Globe, Camera, Music, Gift
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Icon mapping
const iconMap = {
  Zap, Paintbrush, Dumbbell, Users, Bike, Play, Star,
  Trophy, Target, Rocket, Heart, Globe, Camera, Music, Gift
};

const PromoCarousel = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API}/promo-banners`);
      setBanners(response.data || []);
    } catch (error) {
      console.log('No promo banners');
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [banners.length, isAnimating]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [banners.length, isAnimating]);

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleBannerClick = (banner) => {
    if (banner.link_type === 'registration' && banner.registration_enabled) {
      setSelectedBanner(banner);
      setRegistrationOpen(true);
    } else if (banner.link_type === 'internal' && banner.link_url) {
      navigate(banner.link_url);
    } else if (banner.link_url) {
      window.open(banner.link_url, '_blank');
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBanner) return;

    setSubmitting(true);
    try {
      await axios.post(`${API}/workshop-register`, {
        banner_id: selectedBanner.banner_id,
        ...formData
      });
      toast.success('Registration successful! We will contact you soon.');
      setRegistrationOpen(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];
  const IconComponent = iconMap[currentBanner?.icon] || Zap;

  return (
    <>
      <section 
        className="relative py-6 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        data-testid="promo-carousel"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main Carousel Container */}
          <div className="relative">
            {/* Slides Container */}
            <div className="relative overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {banners.map((banner, index) => {
                  const BannerIcon = iconMap[banner.icon] || Zap;
                  return (
                    <div
                      key={banner.banner_id}
                      className="w-full flex-shrink-0"
                      data-testid={`promo-slide-${index}`}
                    >
                      <div
                        className="relative overflow-hidden rounded-2xl cursor-pointer group h-[340px] md:h-[260px] lg:h-[280px]"
                        onClick={() => handleBannerClick(banner)}
                        style={{
                          background: `linear-gradient(135deg, ${banner.gradient_from}20 0%, ${banner.gradient_to}20 100%)`,
                        }}
                      >
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 overflow-hidden">
                          <div 
                            className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl group-hover:scale-110 transition-transform duration-700"
                            style={{ background: `linear-gradient(135deg, ${banner.gradient_from}, ${banner.gradient_to})` }}
                          />
                          <div 
                            className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-20 blur-3xl group-hover:scale-110 transition-transform duration-700"
                            style={{ background: `linear-gradient(135deg, ${banner.gradient_to}, ${banner.gradient_from})` }}
                          />
                          {/* Grid Pattern */}
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
                        </div>

                        {/* Content - Logo RIGHT, Content LEFT */}
                        <div className="relative z-10 flex flex-col-reverse items-center text-center py-6 px-12 md:flex-row md:justify-between md:text-left md:py-8 md:px-16 lg:py-10 lg:px-24 gap-3 md:gap-8 h-full">
                          {/* Text Content - LEFT side */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                            <h3 
                              className="font-unbounded font-bold text-lg md:text-2xl lg:text-3xl text-white mb-3 line-clamp-2 leading-tight"
                              style={{ 
                                textShadow: `0 0 30px ${banner.gradient_from}50`
                              }}
                            >
                              {banner.title}
                            </h3>
                            <p className="text-zinc-300 text-xs md:text-sm max-w-lg mb-6 line-clamp-2 leading-relaxed">
                              {banner.description}
                            </p>
                            <div>
                            {/* CTA Button */}
                            <button
                              className="px-6 py-3 rounded-xl font-semibold text-white text-sm md:text-base flex items-center gap-2 group-hover:scale-105 transition-all duration-300 mx-auto md:mx-0"
                              style={{ 
                                background: `linear-gradient(135deg, ${banner.gradient_from}, ${banner.gradient_to})`,
                                boxShadow: `0 4px 20px ${banner.gradient_from}40`
                              }}
                              data-testid={`promo-cta-${index}`}
                            >
                              {banner.button_text}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            </div>
                          </div>

                          {/* Logo - RIGHT side */}
                          {banner.logo_url ? (
                            <div className="w-20 h-20 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden bg-black/20 p-2 flex-shrink-0">
                              <img 
                                src={banner.logo_url} 
                                alt={banner.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div 
                              className="w-20 h-20 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                              style={{ 
                                background: `linear-gradient(135deg, ${banner.gradient_from}, ${banner.gradient_to})`,
                                boxShadow: `0 10px 40px ${banner.gradient_from}40`
                              }}
                            >
                              <BannerIcon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Bottom Gradient Line */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-1 group-hover:h-2 transition-all duration-300"
                          style={{ 
                            background: `linear-gradient(90deg, ${banner.gradient_from}, ${banner.gradient_to})` 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-20"
                  data-testid="promo-prev-btn"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-20"
                  data-testid="promo-next-btn"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 bg-primary' 
                      : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  data-testid={`promo-dot-${index}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Registration Dialog */}
      <Dialog open={registrationOpen} onOpenChange={setRegistrationOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-unbounded">
              Register for {selectedBanner?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegistrationSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="reg-name" className="text-zinc-300">Full Name *</Label>
              <Input
                id="reg-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                placeholder="Enter your name"
                data-testid="workshop-reg-name"
              />
            </div>
            <div>
              <Label htmlFor="reg-email" className="text-zinc-300">Email *</Label>
              <Input
                id="reg-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                placeholder="Enter your email"
                data-testid="workshop-reg-email"
              />
            </div>
            <div>
              <Label htmlFor="reg-phone" className="text-zinc-300">Phone Number *</Label>
              <Input
                id="reg-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                placeholder="Enter your phone number"
                data-testid="workshop-reg-phone"
              />
            </div>
            <div>
              <Label htmlFor="reg-message" className="text-zinc-300">Message (Optional)</Label>
              <Textarea
                id="reg-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                placeholder="Any questions or comments?"
                rows={3}
                data-testid="workshop-reg-message"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRegistrationOpen(false)}
                className="flex-1 border-zinc-700 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-black font-semibold"
                data-testid="workshop-reg-submit"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PromoCarousel;
