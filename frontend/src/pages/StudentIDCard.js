import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, Phone, Droplets, MapPin, Shield, Award,
  Calendar, Star, QrCode, AlertTriangle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentIDCard = () => {
  const { nfcId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentByNFC();
  }, [nfcId]);

  const fetchStudentByNFC = async () => {
    try {
      const response = await axios.get(`${API}/students/nfc/${nfcId}`);
      setStudent(response.data);
    } catch (err) {
      setError('Student not found or invalid NFC card');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-glow w-16 h-16 rounded-xl bg-gradient-to-br from-secondary to-primary" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="telemetry-card rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="font-unbounded font-bold text-xl text-white mb-2">Invalid Card</h2>
          <p className="text-zinc-400">{error || 'This NFC card is not registered'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* ID Card */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-secondary opacity-50" />
          
          <div className="relative m-[2px] bg-surface rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary/30 to-primary/30 p-6 text-center border-b border-white/10">
              <span className="font-light text-xl text-white tracking-[0.25em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                KOTLERX
              </span>
              <p className="text-xs text-zinc-400 mt-1 font-mono">STUDENT IDENTITY CARD</p>
            </div>

            {/* Photo & Basic Info */}
            <div className="p-6">
              <div className="flex items-start gap-5">
                {/* Photo */}
                <div className="w-24 h-28 rounded-lg bg-gradient-to-br from-secondary to-primary p-[2px] flex-shrink-0">
                  <div className="w-full h-full rounded-lg bg-surface flex items-center justify-center">
                    {student.photo_url ? (
                      <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <User className="w-12 h-12 text-zinc-600" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-unbounded font-bold text-xl text-white truncate">{student.full_name}</h2>
                  <p className="text-primary font-mono text-sm mt-1">{student.nfc_card_id}</p>
                  
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Droplets className="w-4 h-4 text-accent" />
                      <span>Blood: <strong className="text-white">{student.blood_group}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="truncate">{student.mobile}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <Star className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="font-mono text-lg text-white">{student.average_rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-zinc-500">Rating</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <Calendar className="w-5 h-5 text-secondary mx-auto mb-1" />
                  <p className="font-mono text-lg text-white">{student.total_attendance || 0}</p>
                  <p className="text-xs text-zinc-500">Sessions</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <Award className="w-5 h-5 text-accent-warning mx-auto mb-1" />
                  <p className="font-mono text-lg text-white">{student.badges?.length || 0}</p>
                  <p className="text-xs text-zinc-500">Badges</p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-xs text-accent font-mono uppercase">Emergency Contact</span>
                </div>
                <p className="text-white font-mono">{student.emergency_contact}</p>
                {student.medical_conditions?.length > 0 && !student.medical_conditions.includes('None') && (
                  <p className="text-xs text-zinc-400 mt-2">
                    Medical: {student.medical_conditions.join(', ')}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                <MapPin className="w-4 h-4" />
                <span>{student.city}, {student.state}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Status</p>
                <p className={`text-sm font-mono ${student.status === 'active' ? 'text-accent-success' : 'text-accent'}`}>
                  {student.status?.toUpperCase() || 'ACTIVE'}
                </p>
              </div>
              <div className="w-16 h-16 bg-white rounded p-1">
                <QrCode className="w-full h-full text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Verified Badge */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-success/20 text-accent-success text-sm">
            <Shield className="w-4 h-4" />
            Verified KotlerX Student
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentIDCard;
