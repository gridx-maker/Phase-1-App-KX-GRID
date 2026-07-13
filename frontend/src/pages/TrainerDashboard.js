import SplitText from '@/components/ui/SplitText';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Users, Smartphone, Star, ChevronLeft, Plus,
  BarChart3, Calendar, LogOut, Loader2, CheckCircle2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [assessmentData, setAssessmentData] = useState({
    skill_control: 3,
    discipline: 3,
    safety_awareness: 3,
    execution: 3,
    teamwork: 3,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [batchesRes, studentsRes] = await Promise.all([
        axios.get(`${API}/batches`, { headers, withCredentials: true }),
        axios.get(`${API}/students`, { headers, withCredentials: true })
      ]);
      setBatches(batchesRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied');
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

  const submitAssessment = async () => {
    if (!selectedStudent || !selectedBatch) return;
    
    setSubmitting(true);
    try {
      await axios.post(`${API}/assessments`, {
        student_id: selectedStudent.student_id,
        batch_id: selectedBatch.batch_id,
        trainer_id: user.user_id,
        session_id: `session_${Date.now()}`,
        ...assessmentData
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      toast.success('Assessment submitted!');
      setAssessmentOpen(false);
      setAssessmentData({
        skill_control: 3,
        discipline: 3,
        safety_awareness: 3,
        execution: 3,
        teamwork: 3,
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <Label className="text-zinc-400 text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${star <= value ? 'text-primary fill-primary' : 'text-zinc-600'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );

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
              <SplitText text="Trainer Dashboard" tag="h1" className="font-unbounded font-bold text-xl text-white" />
              <p className="text-sm text-zinc-500">Welcome, {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/nfc-attendance')}
              className="btn-primary gap-2"
              data-testid="nfc-attendance-btn"
            >
              <Smartphone className="w-4 h-4" />
              NFC Attendance
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-white"
              data-testid="trainer-logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Batches', value: batches.length, icon: Calendar },
            { label: 'Total Students', value: students.length, icon: Users },
            { label: 'Assessments Today', value: 0, icon: Star },
            { label: 'Attendance Rate', value: '95%', icon: CheckCircle2 },
          ].map((stat, i) => (
            <div key={i} className="telemetry-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-zinc-500 uppercase">{stat.label}</span>
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="font-unbounded font-bold text-3xl text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Batches */}
          <div className="telemetry-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-unbounded font-semibold text-lg text-white">My Batches</h2>
              <Calendar className="w-5 h-5 text-zinc-500" />
            </div>

            <div className="space-y-3">
              {batches.length > 0 ? batches.map((batch) => (
                <button
                  key={batch.batch_id}
                  onClick={() => setSelectedBatch(batch)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    selectedBatch?.batch_id === batch.batch_id
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  data-testid={`batch-${batch.batch_id}`}
                >
                  <div className="font-mono text-sm text-primary mb-1">{batch.batch_id}</div>
                  <div className="text-xs text-zinc-500">
                    {batch.students?.length || 0} students
                  </div>
                </button>
              )) : (
                <div className="text-center py-8 text-zinc-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No batches assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* Students */}
          <div className="lg:col-span-2 telemetry-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-unbounded font-semibold text-lg text-white">Students</h2>
              <Users className="w-5 h-5 text-zinc-500" />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {students.length > 0 ? students.map((student) => (
                <div
                  key={student.student_id}
                  className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                      <span className="font-unbounded font-bold text-white text-sm">
                        {student.full_name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <div className="font-inter text-white">{student.full_name}</div>
                      <div className="text-xs text-zinc-500 font-mono">{student.nfc_card_id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="w-4 h-4 fill-primary" />
                        <span className="font-mono text-sm">{student.average_rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="text-xs text-zinc-500">{student.total_attendance || 0} sessions</div>
                    </div>

                    <Dialog open={assessmentOpen && selectedStudent?.student_id === student.student_id} onOpenChange={(open) => {
                      setAssessmentOpen(open);
                      if (open) setSelectedStudent(student);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="btn-primary"
                          data-testid={`assess-${student.student_id}`}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-surface border-white/10 max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-unbounded text-white">
                            Assess {student.full_name}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                          <StarRating
                            label="Skill Control"
                            value={assessmentData.skill_control}
                            onChange={(v) => setAssessmentData({ ...assessmentData, skill_control: v })}
                          />
                          <StarRating
                            label="Discipline"
                            value={assessmentData.discipline}
                            onChange={(v) => setAssessmentData({ ...assessmentData, discipline: v })}
                          />
                          <StarRating
                            label="Safety Awareness"
                            value={assessmentData.safety_awareness}
                            onChange={(v) => setAssessmentData({ ...assessmentData, safety_awareness: v })}
                          />
                          <StarRating
                            label="Execution"
                            value={assessmentData.execution}
                            onChange={(v) => setAssessmentData({ ...assessmentData, execution: v })}
                          />
                          <StarRating
                            label="Teamwork"
                            value={assessmentData.teamwork}
                            onChange={(v) => setAssessmentData({ ...assessmentData, teamwork: v })}
                          />

                          <div className="space-y-2">
                            <Label className="text-zinc-400 text-sm">Notes (Optional)</Label>
                            <Textarea
                              value={assessmentData.notes}
                              onChange={(e) => setAssessmentData({ ...assessmentData, notes: e.target.value })}
                              className="input-dark min-h-[80px]"
                              placeholder="Additional feedback..."
                              data-testid="assessment-notes"
                            />
                          </div>

                          <Button
                            onClick={submitAssessment}
                            disabled={submitting}
                            className="w-full btn-primary"
                            data-testid="submit-assessment-btn"
                          >
                            {submitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Submit Assessment'
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-zinc-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No students registered yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
