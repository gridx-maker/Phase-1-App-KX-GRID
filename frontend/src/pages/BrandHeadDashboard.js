import React, { useState, useEffect } from 'react';
import SplitText from '@/components/ui/SplitText';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, Calendar, Award, TrendingUp,
  LogOut, Loader2, Search, FileCheck, BarChart3,
  BookOpen, Clock, Star, ChevronRight, Shield, Plus, UserPlus, Trash2,
  Download, AlertTriangle, CheckCircle2, PlayCircle, Circle, RefreshCw,
  MapPin, ClipboardList
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandHeadDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createCrewOpen, setCreateCrewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [crewForm, setCrewForm] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  // Reports state
  const [activeTab, setActiveTab] = useState('overview'); // overview, reports, reclasses
  const [incompleteReport, setIncompleteReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reclasses, setReclasses] = useState([]);
  const [createReclassOpen, setCreateReclassOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [reclassForm, setReclassForm] = useState({
    unit_id: '',
    scheduled_date: '',
    scheduled_time: '',
    location: '',
    notes: '',
    student_ids: []
  });

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'brand_head') {
      toast.error('Brand Head access required');
      navigate('/');
      return;
    }
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/brand-head/dashboard`, { headers, withCredentials: true });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Failed to load dashboard');
      if (error.response?.status === 403) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchIncompleteReport = async () => {
    setReportLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/brand-head/reports/incomplete-students`, { headers, withCredentials: true });
      setIncompleteReport(response.data);
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setReportLoading(false);
    }
  };

  const fetchReclasses = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/brand-head/reclasses`, { headers, withCredentials: true });
      setReclasses(response.data || []);
    } catch (error) {
      console.error('Failed to load reclasses');
    }
  };

  const downloadExcelReport = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/brand-head/reports/export-excel`, { 
        headers, 
        withCredentials: true,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Incomplete_Students_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel report downloaded!');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const createReclass = async () => {
    if (!reclassForm.unit_id || !reclassForm.scheduled_date || !reclassForm.scheduled_time) {
      toast.error('Please fill required fields');
      return;
    }
    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API}/brand-head/reclass`, reclassForm, { headers, withCredentials: true });
      toast.success('Re-class scheduled successfully!');
      setCreateReclassOpen(false);
      setReclassForm({ unit_id: '', scheduled_date: '', scheduled_time: '', location: '', notes: '', student_ids: [] });
      fetchReclasses();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create re-class');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReclass = async (reclassId) => {
    if (!confirm('Delete this re-class?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/brand-head/reclass/${reclassId}`, { headers, withCredentials: true });
      toast.success('Re-class deleted');
      fetchReclasses();
    } catch (error) {
      toast.error('Failed to delete re-class');
    }
  };

  // Load reports data when switching to reports tab
  useEffect(() => {
    if (activeTab === 'reports' && !incompleteReport) {
      fetchIncompleteReport();
    }
    if (activeTab === 'reclasses') {
      fetchReclasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const createCrewMember = async () => {
    if (!crewForm.email || !crewForm.password || !crewForm.name) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API}/brand-head/crew`, crewForm, { headers, withCredentials: true });
      const emailSent = response.data?.email_sent;
      toast.success(`Crew member created successfully!${emailSent ? ' Login credentials sent via email.' : ''}`);
      setCreateCrewOpen(false);
      setCrewForm({ email: '', password: '', name: '' });
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create crew member');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCrewMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this crew member?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/brand-head/crew/${userId}`, { headers, withCredentials: true });
      toast.success('Crew member removed');
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove crew member');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Failed to load dashboard</p>
          <Button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const { brand, programs, crew, students, stats } = dashboardData;
  const brandColor = brand?.color || '#00f0ff';

  const filteredStudents = students?.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobile?.includes(searchQuery)
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <KotlerXLogo size="md" variant="header" />
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: brandColor }}
              >
                {brand?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-unbounded font-semibold text-white text-sm">{brand?.name}</p>
                <p className="text-xs text-zinc-500">Brand Head Dashboard</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium">{user?.name}</p>
              <p className="text-xs text-zinc-500">Brand Head</p>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-white"
              data-testid="brand-head-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'reclasses', label: 'Re-Classes', icon: RefreshCw }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
        {/* Brand Hero */}
        <div 
          className="telemetry-card rounded-2xl p-8 relative overflow-hidden"
          style={{ borderColor: `${brandColor}30` }}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{ background: `linear-gradient(135deg, ${brandColor} 0%, transparent 50%)` }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {brand?.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="h-20 w-auto" />
              ) : (
                <div 
                  className="h-20 w-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: brandColor }}
                >
                  {brand?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
              )}
              <div>
                <SplitText 
                  text={brand?.name || ""} 
                  tag="h1" 
                  className="font-unbounded font-bold text-2xl text-white mb-1" 
                />
                <p className="text-zinc-400">{brand?.description}</p>
                {brand?.tagline && (
                  <p className="text-sm mt-1" style={{ color: brandColor }}>{brand.tagline}</p>
                )}
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-center px-6 py-3 rounded-xl bg-white/5">
                <p className="font-unbounded font-bold text-2xl text-white">{stats?.total_programs}</p>
                <p className="text-xs text-zinc-500">Programs</p>
              </div>
              <div className="text-center px-6 py-3 rounded-xl bg-white/5">
                <p className="font-unbounded font-bold text-2xl text-white">{stats?.total_crew}</p>
                <p className="text-xs text-zinc-500">Crew</p>
              </div>
              <div className="text-center px-6 py-3 rounded-xl bg-white/5">
                <p className="font-unbounded font-bold text-2xl text-white">{stats?.total_students}</p>
                <p className="text-xs text-zinc-500">Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: 'Programs', value: stats?.total_programs, color: brandColor },
            { icon: Users, label: 'Crew Members', value: stats?.total_crew, color: '#f59e0b' },
            { icon: Award, label: 'Active Students', value: stats?.total_students, color: '#10b981' },
            { icon: FileCheck, label: 'Assessments', value: stats?.recent_assessments, color: '#8b5cf6' },
          ].map((stat, i) => (
            <div key={i} className="telemetry-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-unbounded font-bold text-white">{stat.value || 0}</p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Programs */}
          <div className="telemetry-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-unbounded font-semibold text-white">Programs</h2>
              <Calendar className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="space-y-3">
              {programs?.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4 text-center">No programs assigned yet</p>
              ) : (
                programs?.slice(0, 5).map(program => (
                  <div key={program.program_id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{program.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{program.description?.slice(0, 60)}...</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        program.registration_open !== false 
                          ? 'bg-accent-success/20 text-accent-success' 
                          : 'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {program.registration_open !== false ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {program.duration_weeks} weeks
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {program.batch_size} seats
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Crew Members */}
          <div className="telemetry-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-unbounded font-semibold text-white">Crew / Trainers</h2>
              <Button
                onClick={() => setCreateCrewOpen(true)}
                className="btn-primary gap-2"
                data-testid="create-crew-btn"
              >
                <UserPlus className="w-4 h-4" />
                Add Crew
              </Button>
            </div>
            <div className="space-y-3">
              {crew?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">No crew members yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Create crew accounts for your brand's trainers</p>
                </div>
              ) : (
                crew?.slice(0, 5).map(member => (
                  <div key={member.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: brandColor }}
                    >
                      {member.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{member.name}</p>
                      <p className="text-xs text-zinc-500">{member.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCrewMember(member.user_id)}
                      className="text-zinc-500 hover:text-accent hover:bg-accent/10"
                      data-testid={`delete-crew-${member.user_id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <span className="px-2 py-1 rounded text-xs bg-secondary/20 text-secondary">
                      Trainer
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="telemetry-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-unbounded font-semibold text-white">Students</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark pl-10"
                placeholder="Search students..."
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Student</th>
                  <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Mobile</th>
                  <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">City</th>
                  <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Attendance</th>
                  <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      {searchQuery ? 'No students matching your search' : 'No students enrolled yet'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.slice(0, 10).map(student => (
                    <tr key={student.student_id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: brandColor }}
                          >
                            {student.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{student.full_name}</p>
                            <p className="text-xs text-zinc-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-zinc-300">{student.mobile}</td>
                      <td className="p-3 text-sm text-zinc-300">{student.city}</td>
                      <td className="p-3">
                        <span className="text-sm text-zinc-300">{student.total_attendance || 0} sessions</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-white">{student.average_rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredStudents.length > 10 && (
            <p className="text-center text-sm text-zinc-500 mt-4">
              Showing 10 of {filteredStudents.length} students
            </p>
          )}
        </div>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-bold text-xl text-white">Student Progress Reports</h2>
                <p className="text-sm text-zinc-500">View and export student completion data for your brand's units</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={fetchIncompleteReport}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 gap-2"
                  disabled={reportLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={downloadExcelReport}
                  className="btn-primary gap-2"
                  data-testid="download-excel-btn"
                >
                  <Download className="w-4 h-4" />
                  Download Excel
                </Button>
              </div>
            </div>

            {reportLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : incompleteReport ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="telemetry-card rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-unbounded font-bold text-white">{incompleteReport.total_students}</p>
                        <p className="text-xs text-zinc-500">Total Students</p>
                      </div>
                    </div>
                  </div>
                  <div className="telemetry-card rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-unbounded font-bold text-white">{incompleteReport.students_with_incomplete}</p>
                        <p className="text-xs text-zinc-500">Need Completion</p>
                      </div>
                    </div>
                  </div>
                  <div className="telemetry-card rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-2xl font-unbounded font-bold text-white">{incompleteReport.units?.length || 0}</p>
                        <p className="text-xs text-zinc-500">Units Tracked</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Students Table */}
                <div className="telemetry-card rounded-xl p-6">
                  <h3 className="font-unbounded font-semibold text-white mb-4">Students with Incomplete Units</h3>
                  {incompleteReport.students?.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-accent-success mx-auto mb-4" />
                      <p className="text-white font-semibold">All students are up to date!</p>
                      <p className="text-zinc-500 text-sm">No incomplete units found for your brand.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Student</th>
                            <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Contact</th>
                            <th className="text-center p-3 text-xs font-mono text-zinc-500 uppercase">Progress</th>
                            <th className="text-center p-3 text-xs font-mono text-zinc-500 uppercase">Incomplete</th>
                            {incompleteReport.units?.map(unit => (
                              <th key={unit.unit_id} className="text-center p-3 text-xs font-mono text-zinc-500 uppercase">
                                {unit.name?.slice(0, 15)}...
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {incompleteReport.students?.slice(0, 20).map(student => (
                            <tr key={student.student_id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-3">
                                <p className="font-medium text-white text-sm">{student.student_name}</p>
                                <p className="text-xs text-zinc-500">{student.city}</p>
                              </td>
                              <td className="p-3">
                                <p className="text-sm text-zinc-300">{student.mobile}</p>
                                <p className="text-xs text-zinc-500">{student.email}</p>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-mono ${
                                  student.progress_percent >= 75 ? 'bg-accent-success/20 text-accent-success' :
                                  student.progress_percent >= 50 ? 'bg-secondary/20 text-secondary' :
                                  'bg-accent/20 text-accent'
                                }`}>
                                  {student.progress_percent}%
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className="text-sm text-accent font-mono">{student.incomplete_units}</span>
                              </td>
                              {student.units?.map(unit => (
                                <td key={unit.unit_id} className="p-3 text-center">
                                  {unit.status === 'completed' ? (
                                    <CheckCircle2 className="w-5 h-5 text-accent-success mx-auto" />
                                  ) : unit.status === 'in_progress' ? (
                                    <PlayCircle className="w-5 h-5 text-secondary mx-auto" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-zinc-600 mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                No report data available
              </div>
            )}
          </div>
        )}

        {/* Re-Classes Tab */}
        {activeTab === 'reclasses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-bold text-xl text-white">Re-Class Management</h2>
                <p className="text-sm text-zinc-500">Schedule make-up sessions for students with incomplete units</p>
              </div>
              <Button
                onClick={() => {
                  setReclassForm({ unit_id: '', scheduled_date: '', scheduled_time: '', location: '', notes: '', student_ids: [] });
                  setCreateReclassOpen(true);
                }}
                className="btn-primary gap-2"
                data-testid="create-reclass-btn"
              >
                <Plus className="w-4 h-4" />
                Schedule Re-Class
              </Button>
            </div>

            {reclasses.length === 0 ? (
              <div className="telemetry-card rounded-xl p-12 text-center">
                <RefreshCw className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="font-unbounded font-semibold text-white mb-2">No Re-Classes Scheduled</h3>
                <p className="text-zinc-500 mb-6">Schedule make-up sessions for students who need to catch up on units.</p>
                <Button onClick={() => setCreateReclassOpen(true)} className="btn-primary gap-2">
                  <Plus className="w-4 h-4" />
                  Schedule First Re-Class
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {reclasses.map(reclass => (
                  <div key={reclass.reclass_id} className="telemetry-card rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{reclass.unit_name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {reclass.scheduled_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {reclass.scheduled_time}
                            </span>
                            {reclass.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {reclass.location}
                              </span>
                            )}
                          </div>
                          {reclass.notes && (
                            <p className="text-sm text-zinc-500 mt-2">{reclass.notes}</p>
                          )}
                          <p className="text-xs text-zinc-600 mt-2">
                            {reclass.student_ids?.length || 0} students enrolled
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          reclass.status === 'completed' ? 'bg-accent-success/20 text-accent-success' :
                          reclass.status === 'cancelled' ? 'bg-zinc-500/20 text-zinc-400' :
                          'bg-secondary/20 text-secondary'
                        }`}>
                          {reclass.status?.toUpperCase()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReclass(reclass.reclass_id)}
                          className="text-zinc-500 hover:text-accent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Crew Member Dialog */}
      <Dialog open={createCrewOpen} onOpenChange={setCreateCrewOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Create Crew Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Create a new crew/trainer account for <span className="text-white font-semibold">{brand?.name}</span>. They will only be able to manage students and assessments for this brand.
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-400">Full Name *</Label>
              <Input
                value={crewForm.name}
                onChange={(e) => setCrewForm({ ...crewForm, name: e.target.value })}
                className="input-dark"
                placeholder="Enter trainer's full name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Email Address *</Label>
              <Input
                type="email"
                value={crewForm.email}
                onChange={(e) => setCrewForm({ ...crewForm, email: e.target.value })}
                className="input-dark"
                placeholder="trainer@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Password *</Label>
              <Input
                type="password"
                value={crewForm.password}
                onChange={(e) => setCrewForm({ ...crewForm, password: e.target.value })}
                className="input-dark"
                placeholder="Create a password"
              />
            </div>
            <Button 
              onClick={createCrewMember} 
              disabled={submitting || !crewForm.email || !crewForm.password || !crewForm.name} 
              className="w-full btn-primary"
              data-testid="submit-create-crew"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Crew Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Re-Class Dialog */}
      <Dialog open={createReclassOpen} onOpenChange={setCreateReclassOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Schedule Re-Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Schedule a make-up session for students who need to complete a unit.
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-400">Select Unit *</Label>
              <select
                value={reclassForm.unit_id}
                onChange={(e) => setReclassForm({ ...reclassForm, unit_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- Select Unit --</option>
                {incompleteReport?.units?.map(unit => (
                  <option key={unit.unit_id} value={unit.unit_id}>
                    {unit.name}
                  </option>
                ))}
              </select>
              {!incompleteReport?.units?.length && (
                <p className="text-xs text-zinc-500">Load the Reports tab first to see available units</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Date *</Label>
                <Input
                  type="date"
                  value={reclassForm.scheduled_date}
                  onChange={(e) => setReclassForm({ ...reclassForm, scheduled_date: e.target.value })}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Time *</Label>
                <Input
                  type="time"
                  value={reclassForm.scheduled_time}
                  onChange={(e) => setReclassForm({ ...reclassForm, scheduled_time: e.target.value })}
                  className="input-dark"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Location</Label>
              <Input
                value={reclassForm.location}
                onChange={(e) => setReclassForm({ ...reclassForm, location: e.target.value })}
                className="input-dark"
                placeholder="e.g., Room 101, Main Building"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Notes</Label>
              <textarea
                value={reclassForm.notes}
                onChange={(e) => setReclassForm({ ...reclassForm, notes: e.target.value })}
                className="input-dark w-full h-20 resize-none"
                placeholder="Additional instructions for students..."
              />
            </div>
            <Button 
              onClick={createReclass} 
              disabled={submitting || !reclassForm.unit_id || !reclassForm.scheduled_date || !reclassForm.scheduled_time} 
              className="w-full btn-primary"
              data-testid="submit-create-reclass"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule Re-Class'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandHeadDashboard;
