import React, { useState, useEffect } from 'react';
import SplitText from '@/components/ui/SplitText';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import {
  LayoutDashboard, Award, Trophy, FileCheck, Settings,
  LogOut, ChevronRight, Star, TrendingUp, Calendar,
  Shield, Zap, Target, Clock, Users, BarChart3, Layers,
  CheckCircle2, Circle, PlayCircle, ChevronDown, ChevronUp,
  Briefcase, MapPin, Building2, ExternalLink, Image, Play
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [student, setStudent] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [brands, setBrands] = useState([]);
  const [partners, setPartners] = useState([]);
  const [careers, setCareers] = useState([]);
  const [mediaGallery, setMediaGallery] = useState([]);
  const [programProgress, setProgramProgress] = useState([]);
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // If user is admin or trainer, they shouldn't be on student dashboard
      if (user?.role === 'admin') {
        navigate('/admin');
        return;
      }
      if (user?.role === 'trainer') {
        navigate('/crew');
        return;
      }
      
      const [profileRes, certsRes, brandsRes, progressRes, partnersRes, careersRes, mediaRes] = await Promise.all([
        axios.get(`${API}/students/profile`, { headers, withCredentials: true }),
        axios.get(`${API}/certificates/student/${user?.user_id}`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/brands`, { withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/student/progress`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/partners`, { withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/careers`, { withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/media/gallery/student`, { withCredentials: true }).catch(() => ({ data: [] }))
      ]);

      if (!profileRes.data.registered) {
        navigate('/registration');
        return;
      }

      setStudent(profileRes.data);
      setCertificates(certsRes.data || []);
      setBrands(brandsRes.data || []);
      setProgramProgress(progressRes.data || []);
      setPartners(partnersRes.data || []);
      setCareers(careersRes.data || []);
      setMediaGallery(mediaRes.data || []);

      // Fetch AI analysis if student exists
      if (profileRes.data.student_id) {
        const analysisRes = await axios.get(
          `${API}/analysis/student/${profileRes.data.student_id}`,
          { headers, withCredentials: true }
        ).catch(() => ({ data: null }));
        setAnalysis(analysisRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const markUnitInProgress = async (unitId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/student/progress/${unitId}`, 
        { status: 'in_progress' },
        { headers, withCredentials: true }
      );
      toast.success('Unit marked as in progress');
      fetchData();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const skillLabels = {
    skill_control: 'Skill Control',
    discipline: 'Discipline',
    safety_awareness: 'Safety Awareness',
    execution: 'Execution',
    teamwork: 'Teamwork'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-glow w-16 h-16 rounded-xl bg-gradient-to-br from-secondary to-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-white/5 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <KotlerXLogo size="md" variant="header" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
            { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
            { icon: FileCheck, label: 'Certificates', path: '/certificates' },
            { icon: Calendar, label: 'Programs', path: '/programs' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                item.active 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-inter text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-inter text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-white/5">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <SplitText 
                text={`Welcome back, ${student?.full_name?.split(' ')[0] || user?.name}`} 
                tag="h1" 
                className="font-unbounded font-bold text-xl text-white" 
              />
              <p className="text-sm text-zinc-500 font-inter">Track your progress and achievements</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <span className="font-mono text-sm text-primary">{student?.nfc_card_id || 'NFC_PENDING'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Average Rating', value: student?.average_rating?.toFixed(1) || '0.0', icon: Star, color: 'text-primary' },
              { label: 'Attendance', value: student?.total_attendance || 0, icon: Calendar, color: 'text-secondary' },
              { label: 'Badges Earned', value: student?.badges?.length || 0, icon: Award, color: 'text-accent-warning' },
              { label: 'Certificates', value: certificates.length, icon: FileCheck, color: 'text-accent-success' },
            ].map((stat, i) => (
              <div key={i} className="telemetry-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`font-unbounded font-bold text-3xl ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Program Progress Section */}
          {programProgress.length > 0 && (
            <div className="telemetry-card rounded-xl p-6" data-testid="program-progress-section">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-unbounded font-semibold text-lg text-white">My Program Progress</h2>
                  <p className="text-sm text-zinc-500">Track your unit completion across programs</p>
                </div>
                <Layers className="w-5 h-5 text-secondary" />
              </div>

              <div className="space-y-4">
                {programProgress.map((program) => (
                  <div 
                    key={program.program_id}
                    className="border border-white/10 rounded-xl overflow-hidden"
                    data-testid={`progress-program-${program.program_id}`}
                  >
                    {/* Program Header - Clickable to expand */}
                    <button
                      onClick={() => setExpandedProgram(expandedProgram === program.program_id ? null : program.program_id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14">
                          <svg className="w-14 h-14 -rotate-90">
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-white/10"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${(program.progress_percent / 100) * 151} 151`}
                              className="text-secondary"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white">
                            {program.progress_percent}%
                          </span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-unbounded font-semibold text-white">{program.program_name}</h3>
                          <p className="text-sm text-zinc-500">
                            {program.completed_units} of {program.total_units} units completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                          program.progress_percent === 100 
                            ? 'bg-accent-success/20 text-accent-success' 
                            : program.progress_percent > 0 
                              ? 'bg-secondary/20 text-secondary' 
                              : 'bg-white/10 text-zinc-400'
                        }`}>
                          {program.progress_percent === 100 ? 'COMPLETED' : program.progress_percent > 0 ? 'IN PROGRESS' : 'NOT STARTED'}
                        </span>
                        {expandedProgram === program.program_id ? (
                          <ChevronUp className="w-5 h-5 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Units List */}
                    {expandedProgram === program.program_id && (
                      <div className="border-t border-white/10 p-4 bg-white/[0.02]">
                        <div className="space-y-3">
                          {program.units.map((unit, idx) => {
                            const status = unit.progress?.status || 'not_started';
                            const statusConfig = {
                              completed: { 
                                icon: CheckCircle2, 
                                color: 'text-accent-success', 
                                bg: 'bg-accent-success/10',
                                label: 'Completed'
                              },
                              in_progress: { 
                                icon: PlayCircle, 
                                color: 'text-secondary', 
                                bg: 'bg-secondary/10',
                                label: 'In Progress'
                              },
                              not_started: { 
                                icon: Circle, 
                                color: 'text-zinc-500', 
                                bg: 'bg-white/5',
                                label: 'Not Started'
                              }
                            };
                            const config = statusConfig[status];
                            const StatusIcon = config.icon;

                            return (
                              <div 
                                key={unit.unit_id}
                                className={`flex items-center gap-4 p-3 rounded-lg ${config.bg}`}
                                data-testid={`unit-progress-${unit.unit_id}`}
                              >
                                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 font-mono text-sm text-white">
                                  {unit.order || idx + 1}
                                </div>
                                <StatusIcon className={`w-5 h-5 flex-shrink-0 ${config.color}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-white text-sm">{unit.name}</h4>
                                    <span 
                                      className="px-2 py-0.5 rounded text-xs font-mono"
                                      style={{ 
                                        backgroundColor: `${unit.brand_color}20`, 
                                        color: unit.brand_color 
                                      }}
                                    >
                                      {unit.brand_name}
                                    </span>
                                  </div>
                                  <p className="text-xs text-zinc-500 mt-0.5">
                                    {unit.duration_weeks} week{unit.duration_weeks !== 1 ? 's' : ''} • {unit.theory_hours}h theory • {unit.practical_hours}h practical
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {status === 'not_started' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markUnitInProgress(unit.unit_id);
                                      }}
                                      className="border-secondary/30 text-secondary hover:bg-secondary/10 text-xs"
                                    >
                                      Start Unit
                                    </Button>
                                  )}
                                  {status === 'completed' && unit.progress?.score && (
                                    <span className="font-mono text-sm text-accent-success">
                                      Score: {unit.progress.score}%
                                    </span>
                                  )}
                                  {status === 'in_progress' && (
                                    <span className="text-xs text-zinc-400">Awaiting completion</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {program.progress_percent < 100 && (
                          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <p className="text-sm text-primary">
                              <strong>Next Step:</strong> Complete the remaining {program.total_units - program.completed_units} unit(s) to finish this program and earn your certificate!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Skill Breakdown */}
            <div className="lg:col-span-2 telemetry-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-unbounded font-semibold text-lg text-white">Skill Breakdown</h2>
                <BarChart3 className="w-5 h-5 text-zinc-500" />
              </div>

              {analysis?.skill_averages ? (
                <div className="space-y-5">
                  {Object.entries(analysis.skill_averages).map(([skill, value]) => (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-inter text-sm text-zinc-400">{skillLabels[skill]}</span>
                        <span className="font-mono text-sm text-primary">{value.toFixed(1)}/5</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                          style={{ width: `${(value / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500 font-inter">No assessments yet</p>
                  <p className="text-sm text-zinc-600">Complete your first session to see your skills</p>
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-unbounded font-semibold text-lg text-white">AI Insights</h2>
                <Zap className="w-5 h-5 text-primary" />
              </div>

              {analysis?.ai_insights ? (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-300 font-inter leading-relaxed">
                    {analysis.ai_insights}
                  </p>

                  {analysis.strong_areas?.length > 0 && (
                    <div>
                      <h4 className="font-mono text-xs text-zinc-500 uppercase mb-2">Strong Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.strong_areas.map((area, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-accent-success/20 text-accent-success text-xs">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.improvement_areas?.length > 0 && (
                    <div>
                      <h4 className="font-mono text-xs text-zinc-500 uppercase mb-2">Focus Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.improvement_areas.map((area, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-mono text-xs text-zinc-500 uppercase mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {analysis.recommendations.slice(0, 3).map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                            <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500 font-inter text-sm">AI insights will appear after assessments</p>
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="telemetry-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-unbounded font-semibold text-lg text-white">Your Badges</h2>
              <Award className="w-5 h-5 text-accent-warning" />
            </div>

            {student?.badges?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {student.badges.map((badge, i) => (
                  <div key={i} className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-warning to-accent mx-auto mb-3 flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm text-white font-inter capitalize">
                      {badge.badge_type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500 font-inter">No badges earned yet</p>
                <p className="text-sm text-zinc-600">Keep performing well to earn badges!</p>
              </div>
            )}
          </div>

          {/* Brand Tiles - KX Ecosystem */}
          {brands.length > 0 && (
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-unbounded font-semibold text-lg text-white">KX Ecosystem</h2>
                  <p className="text-sm text-zinc-500">Explore the brands within our platform</p>
                </div>
                <Layers className="w-5 h-5 text-primary" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {brands.map((brand) => {
                  const brandSlug = brand.name?.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link 
                      key={brand.brand_id}
                      to={`/brands/${brandSlug}`}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                      style={{ borderLeftColor: brand.color, borderLeftWidth: '3px' }}
                      data-testid={`brand-tile-${brand.brand_id}`}
                    >
                      {/* Logo or Placeholder */}
                      {brand.logo_url ? (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name} 
                          className="h-10 w-auto object-contain mb-3"
                        />
                      ) : (
                        <div 
                          className="h-10 w-10 rounded flex items-center justify-center text-white font-bold text-sm mb-3 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: brand.color || '#00f0ff' }}
                        >
                          {brand.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-primary transition-colors">{brand.name}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-2">{brand.description || 'Explore this brand'}</p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Learn more <ChevronRight className="w-3 h-3" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/leaderboard')}
              className="h-auto py-6 bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-3"
              data-testid="view-leaderboard-btn"
            >
              <Trophy className="w-8 h-8 text-primary" />
              <span className="font-inter text-white">View Leaderboard</span>
            </Button>
            <Button
              onClick={() => navigate('/certificates')}
              className="h-auto py-6 bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-3"
              data-testid="view-certificates-btn"
            >
              <FileCheck className="w-8 h-8 text-secondary" />
              <span className="font-inter text-white">My Certificates</span>
            </Button>
            <Button
              onClick={() => navigate('/programs')}
              className="h-auto py-6 bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-3"
              data-testid="view-programs-btn"
            >
              <Calendar className="w-8 h-8 text-accent-success" />
              <span className="font-inter text-white">Browse Programs</span>
            </Button>
          </div>
        </div>

        {/* Career Opportunities */}
        <div className="mt-12">
          <h2 className="font-unbounded font-bold text-xl text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-secondary" />
            Career Opportunities
          </h2>
          
          {careers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careers.slice(0, 4).map(career => (
                <div key={career.career_id} className="telemetry-card rounded-xl p-5 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{career.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Building2 className="w-4 h-4" />
                        <span>{career.company}</span>
                      </div>
                    </div>
                    {career.brand_name && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${career.brand_color}20`,
                          color: career.brand_color 
                        }}
                      >
                        {career.brand_name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-zinc-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {career.location}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded bg-white/5">
                      {career.job_type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                    {career.description}
                  </p>
                  
                  {career.application_url ? (
                    <a 
                      href={career.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                    >
                      Apply Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-sm text-zinc-500">Contact admin to apply</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="telemetry-card rounded-xl p-8 text-center">
              <Briefcase className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">No Openings Right Now</h3>
              <p className="text-sm text-zinc-500">
                Check back soon for career opportunities from our partner companies
              </p>
            </div>
          )}
        </div>

        {/* Media Gallery */}
        {mediaGallery.length > 0 && (
          <div className="mt-8 md:mt-12">
            <h2 className="font-unbounded font-bold text-lg md:text-xl text-white mb-4 md:mb-6 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaGallery.map((item) => (
                <div 
                  key={item.media_id}
                  className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer telemetry-card"
                >
                  {item.media_type === 'video' ? (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.media_base64 || item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-zinc-400 truncate">{item.description}</p>
                      )}
                    </div>
                  </div>
                  {item.category === 'student' && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-secondary/80 text-[10px] text-white">
                      Exclusive
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partners & Sponsors */}
        {partners.length > 0 && (
          <div className="mt-8 md:mt-12">
            <h2 className="font-unbounded font-bold text-lg md:text-xl text-white mb-4 md:mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Our Partners & Sponsors
            </h2>
            <div className="telemetry-card rounded-xl p-4 md:p-6 overflow-hidden">
              <div className="partners-marquee-student flex gap-4 md:gap-8 animate-marquee-student">
                {[...partners, ...partners, ...partners].map((partner, i) => (
                  <div 
                    key={`${partner.partner_id}-${i}`}
                    className="flex-shrink-0 w-16 h-12 md:w-24 md:h-16 flex items-center justify-center hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.7)] transition-all duration-300"
                  >
                    {partner.logo_base64 || partner.logo_url ? (
                      <img 
                        src={partner.logo_base64 || partner.logo_url}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full rounded bg-white/5 flex items-center justify-center">
                        <span className="text-[10px] md:text-xs text-zinc-500 text-center">{partner.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <style>{`
                @keyframes marquee-student {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-33.33%); }
                }
                .animate-marquee-student {
                  animation: marquee-student 10s linear infinite;
                }
                .animate-marquee-student:hover {
                  animation-play-state: paused;
                }
                @media (max-width: 768px) {
                  .animate-marquee-student {
                    animation: marquee-student 6s linear infinite;
                  }
                }
              `}</style>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
