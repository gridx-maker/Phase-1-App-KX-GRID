import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import {
  ArrowLeft, Calendar, Users, Clock, Award,
  ChevronRight, Loader2, Star, BookOpen, Zap
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandPage = () => {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrand();
  }, [brandSlug]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/brands/${brandSlug}`);
      setBrand(response.data);
    } catch (err) {
      console.error('Error fetching brand:', err);
      setError(err.response?.data?.detail || 'Brand not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/">
              <KotlerXLogo size="md" variant="header" />
            </Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="font-unbounded font-bold text-4xl text-white mb-4">Brand Not Found</h1>
          <p className="text-zinc-400 mb-8">{error}</p>
          <Button onClick={() => navigate('/')} className="btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <KotlerXLogo size="md" variant="header" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/programs">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                All Programs
              </Button>
            </Link>
            <Link to="/login/student">
              <Button className="btn-primary">
                Student Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-20 overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${brand.color}15 0%, transparent 50%)` 
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Link */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-8 text-zinc-400 hover:text-white gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Brand Logo/Icon */}
              <div className="mb-6">
                {brand.logo_url ? (
                  <img 
                    src={brand.logo_url} 
                    alt={brand.name} 
                    className="h-24 w-auto object-contain"
                  />
                ) : (
                  <div 
                    className="h-24 w-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                    style={{ backgroundColor: brand.color || '#00f0ff' }}
                  >
                    {brand.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>

              {/* Brand Name */}
              <h1 className="font-unbounded font-bold text-4xl sm:text-5xl text-white mb-4">
                {brand.name}
              </h1>

              {/* Description */}
              <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
                {brand.description || 'Explore our comprehensive programs designed to accelerate your career in the motorsport and automotive industry.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/programs">
                  <Button className="btn-primary gap-2" style={{ backgroundColor: brand.color }}>
                    <BookOpen className="w-4 h-4" />
                    View Programs
                  </Button>
                </Link>
                <Link to="/register/student">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
                    <Zap className="w-4 h-4" />
                    Register Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Card */}
            <div className="telemetry-card rounded-2xl p-8" style={{ borderColor: `${brand.color}30` }}>
              <h3 className="font-unbounded font-semibold text-xl text-white mb-6">
                Why Choose {brand.name}?
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: BookOpen, label: 'Programs', value: brand.programs?.length || '5+' },
                  { icon: Users, label: 'Expert Trainers', value: brand.trainers?.length || '10+' },
                  { icon: Award, label: 'Certifications', value: brand.stats_certifications || 'Industry' },
                  { icon: Star, label: 'Success Rate', value: brand.stats_success_rate || '95%' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-white/5">
                    <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: brand.color }} />
                    <div className="font-unbounded font-bold text-2xl text-white">{stat.value}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      {brand.programs && brand.programs.length > 0 && (
        <section className="py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-unbounded font-bold text-2xl text-white mb-2">
                  Available Programs
                </h2>
                <p className="text-zinc-400">
                  Explore our range of professional training programs
                </p>
              </div>
              <Link to="/programs">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brand.programs.slice(0, 6).map((program) => (
                <div 
                  key={program.program_id} 
                  className="telemetry-card rounded-xl p-6 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                      program.program_type === 'certification' ? 'bg-primary/20 text-primary' :
                      program.program_type === 'diploma' ? 'bg-secondary/20 text-secondary' :
                      'bg-accent/20 text-accent'
                    }`}>
                      {program.program_type?.replace('_', ' ')}
                    </span>
                    {program.registration_open !== false && (
                      <span className="px-2 py-1 rounded text-xs bg-accent-success/20 text-accent-success">
                        Open
                      </span>
                    )}
                  </div>
                  <h3 className="font-unbounded font-semibold text-lg text-white mb-2 group-hover:text-primary transition-colors">
                    {program.name}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                    {program.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {program.duration_weeks} weeks
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {program.batch_size} seats
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trainers Section */}
      {brand.trainers && brand.trainers.length > 0 && (
        <section className="py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-unbounded font-bold text-2xl text-white mb-2">
                Meet Our Expert Trainers
              </h2>
              <p className="text-zinc-400">
                Learn from industry professionals with years of experience
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {brand.trainers.slice(0, 6).map((trainer) => (
                <div key={trainer.user_id} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-white/10">
                    {trainer.picture ? (
                      <img 
                        src={trainer.picture} 
                        alt={trainer.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: brand.color }}
                      >
                        {trainer.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-white text-sm">{trainer.name}</h4>
                  <p className="text-xs text-zinc-500">Expert Trainer</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-unbounded font-bold text-3xl text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-zinc-400 mb-8 text-lg">
            Join {brand.name} and take the first step towards your dream career in motorsport and automotive industry.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register/student">
              <Button className="btn-primary px-8 py-6 text-lg gap-2" style={{ backgroundColor: brand.color }}>
                <Zap className="w-5 h-5" />
                Register Now
              </Button>
            </Link>
            <Link to="/programs">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg gap-2">
                <BookOpen className="w-5 h-5" />
                Explore Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <KotlerXLogo size="sm" variant="header" />
          <p className="text-sm text-zinc-500">
            © 2026 KXGRID. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/login/admin" className="text-zinc-500 hover:text-white">Admin</Link>
            <Link to="/login/crew" className="text-zinc-500 hover:text-white">Crew</Link>
            <Link to="/login/student" className="text-zinc-500 hover:text-white">Student</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BrandPage;
