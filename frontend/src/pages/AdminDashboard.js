import SplitText from '@/components/ui/SplitText';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Users, Award, FileCheck, TrendingUp, AlertTriangle,
  DollarSign, LogOut, Loader2, Plus, Calendar, BarChart3
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [createProgramOpen, setCreateProgramOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [programForm, setProgramForm] = useState({
    name: '',
    program_type: 'certification',
    description: '',
    duration_weeks: 4,
    batch_size: 20
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, programsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers, withCredentials: true }),
        axios.get(`${API}/programs`, { headers, withCredentials: true })
      ]);
      setStats(statsRes.data);
      setPrograms(programsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const createProgram = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API}/programs`, programForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Program created!');
      setCreateProgramOpen(false);
      fetchData();
      setProgramForm({
        name: '',
        program_type: 'certification',
        description: '',
        duration_weeks: 4,
        batch_size: 20
      });
    } catch (error) {
      toast.error('Failed to create program');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <KotlerXLogo size="md" variant="header" />
            <div>
              <SplitText text="Admin Dashboard" tag="h1" className="font-unbounded font-bold text-xl text-white" />
              <p className="text-sm text-zinc-500">University Management Console</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/nfc-attendance')}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
              data-testid="admin-nfc-btn"
            >
              NFC System
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-white"
              data-testid="admin-logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Students', value: stats?.total_students || 0, icon: Users, color: 'text-primary' },
            { label: 'Active Students', value: stats?.active_students || 0, icon: TrendingUp, color: 'text-accent-success' },
            { label: 'Certificates Issued', value: stats?.total_certificates || 0, icon: FileCheck, color: 'text-secondary' },
            { label: 'Medical Flags', value: stats?.medical_flags || 0, icon: AlertTriangle, color: 'text-accent' },
          ].map((stat, i) => (
            <div key={i} className="telemetry-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-zinc-500 uppercase">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`font-unbounded font-bold text-3xl ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Programs', value: stats?.total_programs || 0, icon: Calendar },
            { label: 'Batches', value: stats?.total_batches || 0, icon: Users },
            { label: 'Placement Ready', value: stats?.placement_ready || 0, icon: Award },
            { label: 'Attendance Records', value: stats?.total_attendance_records || 0, icon: BarChart3 },
          ].map((stat, i) => (
            <div key={i} className="telemetry-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-zinc-500 uppercase">{stat.label}</span>
                <stat.icon className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="font-unbounded font-bold text-3xl text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Programs */}
          <div className="telemetry-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-unbounded font-semibold text-lg text-white">Programs</h2>
              <Dialog open={createProgramOpen} onOpenChange={setCreateProgramOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary gap-2" data-testid="create-program-btn">
                    <Plus className="w-4 h-4" />
                    New Program
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface border-white/10">
                  <DialogHeader>
                    <DialogTitle className="font-unbounded text-white">Create Program</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Program Name</Label>
                      <Input
                        value={programForm.name}
                        onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                        className="input-dark"
                        placeholder="e.g., Advanced Racing Techniques"
                        data-testid="program-name-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400">Program Type</Label>
                      <Select
                        value={programForm.program_type}
                        onValueChange={(v) => setProgramForm({ ...programForm, program_type: v })}
                      >
                        <SelectTrigger className="input-dark" data-testid="program-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-white/10">
                          <SelectItem value="certification">Certification</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                          <SelectItem value="pg_diploma">PG Diploma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400">Description</Label>
                      <Input
                        value={programForm.description}
                        onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                        className="input-dark"
                        placeholder="Brief description"
                        data-testid="program-desc-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Duration (weeks)</Label>
                        <Input
                          type="number"
                          value={programForm.duration_weeks}
                          onChange={(e) => setProgramForm({ ...programForm, duration_weeks: parseInt(e.target.value) })}
                          className="input-dark"
                          min="1"
                          data-testid="program-duration-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Batch Size</Label>
                        <Input
                          type="number"
                          value={programForm.batch_size}
                          onChange={(e) => setProgramForm({ ...programForm, batch_size: parseInt(e.target.value) })}
                          className="input-dark"
                          min="5"
                          data-testid="program-batch-input"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={createProgram}
                      disabled={submitting || !programForm.name}
                      className="w-full btn-primary"
                      data-testid="submit-program-btn"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Program'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {programs.length > 0 ? programs.map((program) => (
                <div
                  key={program.program_id}
                  className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-inter text-white">{program.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-mono uppercase ${
                      program.program_type === 'certification' ? 'bg-primary/20 text-primary' :
                      program.program_type === 'diploma' ? 'bg-secondary/20 text-secondary' :
                      'bg-accent/20 text-accent'
                    }`}>
                      {program.program_type?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>{program.duration_weeks} weeks</span>
                    <span>Batch: {program.batch_size}</span>
                    <span>Enrolled: {program.total_enrolled || 0}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-zinc-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No programs created yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="telemetry-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-unbounded font-semibold text-lg text-white">Top Performers</h2>
              <Award className="w-5 h-5 text-accent-warning" />
            </div>

            <div className="space-y-3">
              {stats?.top_performers?.length > 0 ? stats.top_performers.map((student, i) => (
                <div
                  key={student.student_id}
                  className="flex items-center justify-between p-4 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-unbounded font-bold text-sm ${
                      i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' :
                      i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                      i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                      'bg-white/10 text-white'
                    }`}>
                      {i + 1}
                    </div>
                    <span className="font-inter text-white">{student.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Award className="w-4 h-4" />
                    <span className="font-mono text-sm">{student.average_rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-zinc-500">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No performance data yet</p>
                </div>
              )}
            </div>

            <Button
              onClick={() => navigate('/leaderboard')}
              variant="outline"
              className="w-full mt-4 border-white/10 text-white hover:bg-white/5"
              data-testid="view-full-leaderboard-btn"
            >
              View Full Leaderboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
