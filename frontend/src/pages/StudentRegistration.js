import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KotlerXLogo from '@/components/KotlerXLogo';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Loader2, ChevronRight, ChevronLeft, User, Phone, 
  MapPin, Briefcase, Heart, Upload, CheckCircle2 
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    mobile: '',
    age: '',
    blood_group: '',
    address: '',
    city: '',
    state: '',
    emergency_contact: '',
    highest_degree: '',
    occupation_type: '',
    occupation_detail: '',
    medical_conditions: [],
    other_medical: '',
    blood_donation_willing: false,
    photo_url: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const degrees = ['10th', '12th', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other'];
  const occupationTypes = [
    { value: 'student', label: 'Student' },
    { value: 'working', label: 'Working Professional' },
    { value: 'business', label: 'Business Owner' },
    { value: 'govt', label: 'Government Officer' },
    { value: 'freelancer', label: 'Freelancer / Creator' }
  ];
  
  const medicalOptions = [
    'Asthma', 'Heart condition', 'BP', 'Diabetes', 
    'Back / Joint issues', 'Vision issues', 'None'
  ];

  const getOccupationLabel = () => {
    switch (formData.occupation_type) {
      case 'student': return 'College / Institute Name';
      case 'working': return 'Office / Company Name';
      case 'business': return 'Company Name';
      case 'govt': return 'Department Name';
      case 'freelancer': return 'Platform / Specialty';
      default: return 'Details';
    }
  };

  const sendOTP = async () => {
    if (!formData.mobile || formData.mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/otp/send`, { 
        phone: `+91${formData.mobile}` 
      });
      setOtpSent(true);
      toast.success('OTP sent to your mobile');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/otp/verify`, { 
        phone: `+91${formData.mobile}`,
        otp 
      });
      setOtpVerified(true);
      toast.success('Mobile verified!');
    } catch (error) {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalChange = (condition) => {
    setFormData(prev => {
      let newConditions;
      if (condition === 'None') {
        newConditions = prev.medical_conditions.includes('None') ? [] : ['None'];
      } else {
        newConditions = prev.medical_conditions.filter(c => c !== 'None');
        if (prev.medical_conditions.includes(condition)) {
          newConditions = newConditions.filter(c => c !== condition);
        } else {
          newConditions = [...newConditions, condition];
        }
      }
      return { ...prev, medical_conditions: newConditions };
    });
  };

  const handleSubmit = async () => {
    if (!otpVerified) {
      toast.error('Please verify your mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/students/register`, {
        user_id: user.user_id,
        ...formData,
        age: parseInt(formData.age)
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      toast.success('Registration complete!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { icon: User, label: 'Basic Info' },
    { icon: Briefcase, label: 'Occupation' },
    { icon: Heart, label: 'Medical & Safety' }
  ];

  const canProceed = () => {
    switch (step) {
      case 1:
        return otpVerified && formData.full_name && formData.age && 
               formData.blood_group && formData.address && formData.city && 
               formData.state && formData.emergency_contact && formData.highest_degree;
      case 2:
        return formData.occupation_type;
      case 3:
        return formData.medical_conditions.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/5 glass">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KotlerXLogo size="md" variant="header" />
            <span className="font-unbounded font-bold text-xl text-white">Student Registration</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                step === i + 1 
                  ? 'bg-primary/20 text-primary' 
                  : step > i + 1 
                    ? 'bg-accent-success/20 text-accent-success'
                    : 'bg-white/5 text-zinc-500'
              }`}>
                {step > i + 1 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
                <span className="font-inter text-sm hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-px mx-2 ${step > i + 1 ? 'bg-accent-success' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Steps */}
        <div className="telemetry-card rounded-2xl p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-unbounded font-bold text-2xl text-white mb-6">Basic Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-dark h-12"
                    placeholder="Enter your full name"
                    data-testid="fullname-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Mobile Number *</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-white/5 border border-white/10 rounded-md">
                      <span className="text-zinc-400">+91</span>
                    </div>
                    <Input
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="input-dark h-12 flex-1"
                      placeholder="9876543210"
                      disabled={otpVerified}
                      data-testid="mobile-input"
                    />
                    {!otpVerified && (
                      <Button 
                        onClick={sendOTP}
                        disabled={loading || formData.mobile.length < 10}
                        className="btn-primary px-4"
                        data-testid="send-otp-btn"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? 'Resend' : 'Send OTP'}
                      </Button>
                    )}
                    {otpVerified && (
                      <div className="flex items-center px-3 text-accent-success">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  {otpSent && !otpVerified && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input-dark h-12"
                        placeholder="Enter 6-digit OTP"
                        data-testid="otp-input"
                      />
                      <Button 
                        onClick={verifyOTP}
                        disabled={loading || otp.length < 6}
                        className="btn-primary px-4"
                        data-testid="verify-otp-btn"
                      >
                        Verify
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Age *</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="input-dark h-12"
                    placeholder="Enter your age"
                    min="16"
                    max="60"
                    data-testid="age-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Blood Group *</Label>
                  <Select 
                    value={formData.blood_group} 
                    onValueChange={(v) => setFormData({ ...formData, blood_group: v })}
                  >
                    <SelectTrigger className="input-dark h-12" data-testid="blood-group-select">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-white/10">
                      {bloodGroups.map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-zinc-400">Address *</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-dark h-12"
                    placeholder="Enter your address"
                    data-testid="address-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-dark h-12"
                    placeholder="Enter city"
                    data-testid="city-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">State *</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input-dark h-12"
                    placeholder="Enter state"
                    data-testid="state-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Emergency Contact *</Label>
                  <Input
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="input-dark h-12"
                    placeholder="Emergency contact number"
                    data-testid="emergency-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Highest Degree *</Label>
                  <Select 
                    value={formData.highest_degree} 
                    onValueChange={(v) => setFormData({ ...formData, highest_degree: v })}
                  >
                    <SelectTrigger className="input-dark h-12" data-testid="degree-select">
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-white/10">
                      {degrees.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Occupation */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-unbounded font-bold text-2xl text-white mb-6">Occupation Details</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Occupation Type *</Label>
                  <Select 
                    value={formData.occupation_type} 
                    onValueChange={(v) => setFormData({ ...formData, occupation_type: v, occupation_detail: '' })}
                  >
                    <SelectTrigger className="input-dark h-12" data-testid="occupation-select">
                      <SelectValue placeholder="Select occupation type" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-white/10">
                      {occupationTypes.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.occupation_type && (
                  <div className="space-y-2 animate-fade-in">
                    <Label className="text-zinc-400">{getOccupationLabel()}</Label>
                    <Input
                      value={formData.occupation_detail}
                      onChange={(e) => setFormData({ ...formData, occupation_detail: e.target.value })}
                      className="input-dark h-12"
                      placeholder={`Enter ${getOccupationLabel().toLowerCase()}`}
                      data-testid="occupation-detail-input"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Medical & Safety */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-unbounded font-bold text-2xl text-white mb-6">Medical & Safety Information</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-zinc-400">Medical Conditions *</Label>
                  <p className="text-sm text-zinc-500">Select all that apply</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {medicalOptions.map(condition => (
                      <div 
                        key={condition}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.medical_conditions.includes(condition)
                            ? 'border-primary bg-primary/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => handleMedicalChange(condition)}
                        data-testid={`medical-${condition.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Checkbox
                          checked={formData.medical_conditions.includes(condition)}
                          onCheckedChange={() => handleMedicalChange(condition)}
                          className="border-white/20"
                        />
                        <span className="text-sm text-white">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {!formData.medical_conditions.includes('None') && (
                  <div className="space-y-2 animate-fade-in">
                    <Label className="text-zinc-400">Other Medical Conditions</Label>
                    <Input
                      value={formData.other_medical}
                      onChange={(e) => setFormData({ ...formData, other_medical: e.target.value })}
                      className="input-dark h-12"
                      placeholder="Any other medical conditions..."
                      data-testid="other-medical-input"
                    />
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <Label className="text-zinc-400">Blood Donation Willingness</Label>
                  <p className="text-sm text-zinc-500">
                    Would you be willing to donate blood during camp emergencies?
                  </p>
                  
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={formData.blood_donation_willing ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, blood_donation_willing: true })}
                      className={formData.blood_donation_willing ? 'btn-primary' : 'border-white/10 text-white hover:bg-white/5'}
                      data-testid="blood-donation-yes"
                    >
                      Yes, I'm willing
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.blood_donation_willing ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, blood_donation_willing: false })}
                      className={!formData.blood_donation_willing ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'border-white/10 text-white hover:bg-white/5'}
                      data-testid="blood-donation-no"
                    >
                      No
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
            {step > 1 ? (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 gap-2"
                data-testid="prev-step-btn"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary gap-2"
                data-testid="next-step-btn"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="btn-primary gap-2"
                data-testid="submit-registration-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Complete Registration
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
