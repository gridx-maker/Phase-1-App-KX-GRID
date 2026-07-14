import SplitText from '@/components/ui/SplitText';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import KotlerXLogo from '@/components/KotlerXLogo';
import ImageUploadWithZoom from '@/components/ImageUploadWithZoom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Users, Award, FileCheck, TrendingUp, AlertTriangle,
  LogOut, Loader2, Plus, Calendar, BarChart3, Trash2,
  Edit, Search, Shield, MessageSquare, X, Eye, UserPlus,
  Phone, MapPin, CreditCard, Landmark, Download, FileSpreadsheet,
  Lock, Unlock, ClipboardList, Settings, Mail, Send, Globe, Save,
  Layers, GripVertical, Image, EyeOff, Upload, CreditCard as NFCIcon,
  RefreshCw, AlertCircle, KeyRound, ToggleLeft, ToggleRight,
  Briefcase, FileDown, Building2, ExternalLink, GraduationCap, Megaphone,
  ShoppingBag
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadStats, setLeadStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [nfcCards, setNfcCards] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [createProgramOpen, setCreateProgramOpen] = useState(false);
  const [editProgramOpen, setEditProgramOpen] = useState(false);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [createBrandOpen, setCreateBrandOpen] = useState(false);
  const [editBrandOpen, setEditBrandOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [issueNfcOpen, setIssueNfcOpen] = useState(false);
  const [replaceNfcOpen, setReplaceNfcOpen] = useState(false);
  const [assignBrandHeadOpen, setAssignBrandHeadOpen] = useState(false);
  const [assignCrewBrandOpen, setAssignCrewBrandOpen] = useState(false);
  const [crewMembers, setCrewMembers] = useState([]);
  const [selectedNfc, setSelectedNfc] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reportLoading, setReportLoading] = useState(false);
  
  // Unit Builder state
  const [unitBuilderOpen, setUnitBuilderOpen] = useState(false);
  const [programUnits, setProgramUnits] = useState([]);
  const [createUnitOpen, setCreateUnitOpen] = useState(false);
  const [editUnitOpen, setEditUnitOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({
    name: '',
    description: '',
    brand_id: '',
    duration_weeks: 1,
    order: 1,
    theory_hours: 0,
    practical_hours: 0,
    assessments_required: []
  });

  // Media Gallery state
  const [mediaGallery, setMediaGallery] = useState([]);
  const [addMediaOpen, setAddMediaOpen] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    title: '',
    description: '',
    media_type: 'image',
    url: '',
    media_base64: '',
    thumbnail_url: '',
    thumbnail_base64: '',
    category: 'public',
    is_visible: true,
    order: 0
  });

  const [crewBrandForm, setCrewBrandForm] = useState({
    user_id: '',
    brand_id: ''
  });

  // Create Crew state
  const [createCrewOpen, setCreateCrewOpen] = useState(false);
  const [createCrewForm, setCreateCrewForm] = useState({
    name: '',
    email: '',
    password: '',
    brand_id: ''
  });

  const [brandHeadForm, setBrandHeadForm] = useState({
    user_id: '',
    brand_id: ''
  });

  // Create Brand Manager form
  const [createBrandManagerOpen, setCreateBrandManagerOpen] = useState(false);
  const [brandManagerForm, setBrandManagerForm] = useState({
    email: '',
    password: '',
    name: '',
    brand_id: ''
  });

  // NFC Users Management
  const [nfcUsers, setNfcUsers] = useState([]);
  const [nfcUserSearch, setNfcUserSearch] = useState('');
  const [nfcUploadOpen, setNfcUploadOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [selectedNfcUser, setSelectedNfcUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Assessment Categories Management
  const [assessmentCategories, setAssessmentCategories] = useState([]);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    assessment_type: 'rating',
    scale_min: 1,
    scale_max: 5,
    weight: 1.0,
    is_required: true,
    is_active: true,
    display_order: 0
  });

  // Careers Management
  const [careers, setCareers] = useState([]);
  const [createCareerOpen, setCreateCareerOpen] = useState(false);
  const [editCareerOpen, setEditCareerOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [careerForm, setCareerForm] = useState({
    title: '', company: '', location: '', job_type: 'full-time',
    description: '', requirements: [], salary_range: '', 
    application_url: '', brand_id: '', is_active: true
  });

  // Team Members Management
  const [teamMembers, setTeamMembers] = useState([]);
  const [createTeamMemberOpen, setCreateTeamMemberOpen] = useState(false);
  const [editTeamMemberOpen, setEditTeamMemberOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [teamMemberForm, setTeamMemberForm] = useState({
    name: '', role: '', category: 'instructor', 
    photo_url: '', photo_base64: '', bio: '', 
    email: '', phone: '', display_order: 0, is_active: true
  });

  // Promotional Banners Management
  const [promoBanners, setPromoBanners] = useState([]);
  const [workshopRegistrations, setWorkshopRegistrations] = useState([]);
  const [createBannerOpen, setCreateBannerOpen] = useState(false);
  const [editBannerOpen, setEditBannerOpen] = useState(false);
  const [selectedBannerItem, setSelectedBannerItem] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    title: '', description: '', button_text: 'Learn More',
    link_url: '', link_type: 'external', 
    gradient_from: '#00f0ff', gradient_to: '#ff00ff',
    icon: 'Zap', is_active: true, display_order: 0, registration_enabled: false
  });

  // Data Export
  const [exportLoading, setExportLoading] = useState({ students: false, assessments: false, attendance: false });

  // KXCraft Products Management
  const [kxcraftProducts, setKxcraftProducts] = useState([]);
  const [createKxcraftOpen, setCreateKxcraftOpen] = useState(false);
  const [editKxcraftOpen, setEditKxcraftOpen] = useState(false);
  const [selectedKxcraftProduct, setSelectedKxcraftProduct] = useState(null);
  const [kxcraftForm, setKxcraftForm] = useState({
    name: '', category: 'motorsport', price: '', description: '',
    image_url: '', image_base64: '', badge: '', rating: 5.0,
    is_visible: true, order: 0, external_link: ''
  });

  const [adminMessage, setAdminMessage] = useState({
    title: '',
    content: '',
    type: 'info'
  });

  const [programForm, setProgramForm] = useState({
    name: '',
    program_type: 'certification',
    description: '',
    duration_weeks: 4,
    batch_size: 20,
    status: 'active',
    brand_id: '',
    highlights: ['', '', '', '']  // 4 editable highlights
  });

  const [editProgramForm, setEditProgramForm] = useState({
    name: '',
    program_type: 'certification',
    description: '',
    duration_weeks: 4,
    batch_size: 20,
    status: 'active',
    next_batch_date: '',
    brand_id: '',
    highlights: ['', '', '', '']  // 4 editable highlights
  });

  const [cmsSettings, setCmsSettings] = useState({
    university_email: '',
    auto_email_enabled: false,
    auto_email_weekly: false,
    auto_email_monthly: false,
    logo_text_1: 'KX',
    logo_text_2: 'GRID'
  });

  const [themeSettings, setThemeSettings] = useState({
    primary_color: '#00f0ff',
    secondary_color: '#f59e0b',
    accent_color: '#ef4444',
    background_color: '#0a0a0f',
    surface_color: '#111118',
    heading_font: 'Unbounded',
    body_font: 'Inter',
    border_radius: '0.75rem'
  });

  const [landingContent, setLandingContent] = useState({
    hero_headline_1: "Unified Operating Platform for the KotlerX Ecosystem",
    hero_headline_2: "Connecting Brands, Programmes, Students, Crew & Partners",
    hero_headline_3: "NFC + AI-powered Skill Tracking Platform",
    hero_description: "GRID enables programme execution, department coordination, attendance & assessment tracking, content delivery, and brand visibility across the ecosystem.",
    stats: {
      students_trained: "500+",
      programs: "10+",
      placement_rate: "95%",
      industry_partners: "20+"
    }
  });

  const [emailLoading, setEmailLoading] = useState(false);

  const [brandForm, setBrandForm] = useState({
    name: '',
    description: '',
    color: '#00f0ff',
    is_visible: true,
    stats_certifications: 'Industry',
    stats_success_rate: '95%',
    tagline: ''
  });

  const [editBrandForm, setEditBrandForm] = useState({
    name: '',
    description: '',
    color: '#00f0ff',
    is_visible: true,
    stats_certifications: 'Industry',
    stats_success_rate: '95%',
    tagline: ''
  });

  const [nfcForm, setNfcForm] = useState({
    user_id: '',
    nfc_card_id: '',
    user_type: 'student'
  });

  const [replaceNfcForm, setReplaceNfcForm] = useState({
    old_nfc_id: '',
    new_nfc_id: ''
  });

  const [nfcSearchQuery, setNfcSearchQuery] = useState('');

  useEffect(() => {
    if (!['admin', 'super_admin'].includes(user?.role)) {
      navigate('/dashboard');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, studentsRes, programsRes, leadsRes, leadStatsRes, batchesRes, cmsRes, landingRes, brandsRes, nfcRes, pendingRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers, withCredentials: true }).catch(() => ({ data: {} })),
        axios.get(`${API}/students`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/programs`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/leads`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/leads/stats`, { headers, withCredentials: true }).catch(() => ({ data: null })),
        axios.get(`${API}/batches`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/cms/settings`, { headers, withCredentials: true }).catch(() => ({ data: {} })),
        axios.get(`${API}/cms/landing`, { headers, withCredentials: true }).catch(() => ({ data: {} })),
        axios.get(`${API}/admin/brands`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/nfc/all`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/nfc/pending-deletions`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/cms/theme`, { headers, withCredentials: true }).catch(() => ({ data: {} }))
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data || []);
      setPrograms(programsRes.data || []);
      setLeads(leadsRes.data || []);
      setLeadStats(leadStatsRes.data);
      setBatches(batchesRes.data || []);
      setBrands(brandsRes.data || []);
      setNfcCards(nfcRes.data || []);
      setPendingDeletions(pendingRes.data || []);
      if (cmsRes.data) {
        setCmsSettings(prev => ({ ...prev, ...cmsRes.data }));
      }
      if (landingRes.data) {
        setLandingContent(prev => ({ ...prev, ...landingRes.data }));
      }
      const themeRes = await axios.get(`${API}/cms/theme`, { headers, withCredentials: true }).catch(() => ({ data: {} }));
      if (themeRes.data) {
        setThemeSettings(prev => ({ ...prev, ...themeRes.data }));
      }
      // Fetch crew members
      const crewRes = await axios.get(`${API}/admin/crew`, { headers, withCredentials: true }).catch(() => ({ data: [] }));
      setCrewMembers(crewRes.data || []);
      // Fetch media gallery
      const mediaRes = await axios.get(`${API}/admin/media/gallery`, { headers, withCredentials: true }).catch(() => ({ data: [] }));
      setMediaGallery(mediaRes.data || []);
      // Fetch assessment categories
      const categoriesRes = await axios.get(`${API}/admin/assessment-categories`, { headers, withCredentials: true }).catch(() => ({ data: [] }));
      setAssessmentCategories(categoriesRes.data || []);
      // Fetch careers
      const careersRes = await axios.get(`${API}/admin/careers`, { headers, withCredentials: true }).catch(() => ({ data: [] }));
      setCareers(careersRes.data || []);
      // Fetch team members
      const teamRes = await axios.get(`${API}/admin/team`, { headers, withCredentials: true }).catch(() => ({ data: [] }));
      setTeamMembers(teamRes.data || []);
      // Fetch promo banners
      const bannersRes = await axios.get(`${API}/admin/promo-banners`, { headers, withCredentials: true }).catch(() => ({ data: [] }));
      setPromoBanners(bannersRes.data || []);
      // Fetch workshop registrations
      const regsRes = await axios.get(`${API}/admin/workshop-registrations`, { headers, withCredentials: true }).catch(() => ({ data: [] }));
      setWorkshopRegistrations(regsRes.data || []);
      // Fetch KXCraft products
      const kxcraftRes = await axios.get(`${API}/kxcraft/products/all`, { headers, withCredentials: true }).catch(() => ({ data: [] }));
      setKxcraftProducts(kxcraftRes.data || []);
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

  // KXCraft Product CRUD
  const handleKxcraftImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setKxcraftForm(prev => ({ ...prev, image_base64: reader.result }));
    reader.readAsDataURL(file);
  };

  const createKxcraftProduct = async () => {
    if (!kxcraftForm.name || !kxcraftForm.price) {
      toast.error('Name and Price are required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/kxcraft/products`, kxcraftForm, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true
      });
      toast.success('Product created');
      setCreateKxcraftOpen(false);
      setKxcraftForm({ name: '', category: 'motorsport', price: '', description: '', image_url: '', image_base64: '', badge: '', rating: 5.0, is_visible: true, order: 0, external_link: '' });
      refreshKxcraftProducts();
    } catch (error) {
      toast.error('Failed to create product');
    } finally { setSubmitting(false); }
  };

  const updateKxcraftProduct = async () => {
    if (!selectedKxcraftProduct) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/admin/kxcraft/products/${selectedKxcraftProduct.product_id}`, kxcraftForm, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true
      });
      toast.success('Product updated');
      setEditKxcraftOpen(false);
      refreshKxcraftProducts();
    } catch (error) {
      toast.error('Failed to update product');
    } finally { setSubmitting(false); }
  };

  const deleteKxcraftProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/admin/kxcraft/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true
      });
      toast.success('Product deleted');
      refreshKxcraftProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  // Careers CRUD
  const createCareer = async () => {
    if (!careerForm.title || !careerForm.company) {
      toast.error('Title and Company are required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/careers`, careerForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Career opportunity created!');
      setCreateCareerOpen(false);
      setCareerForm({ title: '', company: '', location: '', job_type: 'full-time', description: '', requirements: [], salary_range: '', application_url: '', brand_id: '', is_active: true });
      refreshCareers();
    } catch (error) {
      toast.error('Failed to create career');
    } finally {
      setSubmitting(false);
    }
  };

  const updateCareer = async () => {
    if (!selectedCareer) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/admin/careers/${selectedCareer.career_id}`, careerForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Career updated!');
      setEditCareerOpen(false);
      refreshCareers();
    } catch (error) {
      toast.error('Failed to update career');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCareer = async (careerId) => {
    if (!confirm('Delete this career posting?')) return;
    try {
      await axios.delete(`${API}/admin/careers/${careerId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Career deleted');
      refreshCareers();
    } catch (error) {
      toast.error('Failed to delete career');
    }
  };

  // Data Export functions
  const exportData = async (type) => {
    setExportLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await axios.post(`${API}/sheets/export/${type}`, { sheet_name: type.charAt(0).toUpperCase() + type.slice(1) }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      if (response.data.spreadsheet_url) {
        toast.success(`${response.data.rows_exported} records exported!`);
        window.open(response.data.spreadsheet_url, '_blank');
      } else {
        toast.success(`${response.data.rows_exported} records ready. Configure Google Sheets for auto-sync.`);
      }
    } catch (error) {
      toast.error(`Export failed: ${error.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setExportLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Targeted refresh for team members only (avoids 20+ API calls)
  const refreshTeamMembers = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const teamRes = await axios.get(`${API}/admin/team`, { headers, withCredentials: true });
      setTeamMembers(teamRes.data || []);
    } catch (error) {
      console.error('Failed to refresh team:', error);
    }
  };

  // Targeted refresh functions for each section
  const refreshKxcraftProducts = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/kxcraft/products/all`, { headers, withCredentials: true });
      setKxcraftProducts(res.data || []);
    } catch (error) {
      console.error('Failed to refresh KXCraft:', error);
    }
  };

  const refreshCareers = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/admin/careers`, { headers, withCredentials: true });
      setCareers(res.data || []);
    } catch (error) {
      console.error('Failed to refresh careers:', error);
    }
  };

  const refreshBanners = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/admin/promo-banners`, { headers, withCredentials: true });
      setPromoBanners(res.data || []);
    } catch (error) {
      console.error('Failed to refresh banners:', error);
    }
  };

  const refreshLeads = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [leadsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/leads`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/leads/stats`, { headers, withCredentials: true }).catch(() => ({ data: null }))
      ]);
      setLeads(leadsRes.data || []);
      setLeadStats(statsRes.data);
    } catch (error) {
      console.error('Failed to refresh leads:', error);
    }
  };

  const refreshBrands = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/admin/brands`, { headers, withCredentials: true });
      setBrands(res.data || []);
    } catch (error) {
      console.error('Failed to refresh brands:', error);
    }
  };

  const refreshStudents = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [studentsRes, statsRes] = await Promise.all([
        axios.get(`${API}/students`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/stats`, { headers, withCredentials: true }).catch(() => ({ data: {} }))
      ]);
      setStudents(studentsRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to refresh students:', error);
    }
  };

  const refreshNfcCards = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [nfcRes, pendingRes] = await Promise.all([
        axios.get(`${API}/admin/nfc/all`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/nfc/pending-deletions`, { headers, withCredentials: true }).catch(() => ({ data: [] }))
      ]);
      setNfcCards(nfcRes.data || []);
      setPendingDeletions(pendingRes.data || []);
    } catch (error) {
      console.error('Failed to refresh NFC:', error);
    }
  };

  const refreshPrograms = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/programs`, { headers, withCredentials: true });
      setPrograms(res.data || []);
    } catch (error) {
      console.error('Failed to refresh programs:', error);
    }
  };

  const refreshMedia = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/admin/media/gallery`, { headers, withCredentials: true });
      setMediaGallery(res.data || []);
    } catch (error) {
      console.error('Failed to refresh media:', error);
    }
  };

  const refreshAssessments = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/admin/assessment-categories`, { headers, withCredentials: true });
      setAssessmentCategories(res.data || []);
    } catch (error) {
      console.error('Failed to refresh assessments:', error);
    }
  };

  const refreshWorkshopRegistrations = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/admin/workshop-registrations`, { headers, withCredentials: true });
      setWorkshopRegistrations(res.data || []);
    } catch (error) {
      console.error('Failed to refresh registrations:', error);
    }
  };

  const refreshCrewMembers = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/admin/crew`, { headers, withCredentials: true });
      setCrewMembers(res.data || []);
    } catch (error) {
      console.error('Failed to refresh crew:', error);
    }
  };

  // Team Members CRUD
  const createTeamMember = async () => {
    if (!teamMemberForm.name || !teamMemberForm.role) {
      toast.error('Name and Role are required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/team`, teamMemberForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Team member added!');
      setCreateTeamMemberOpen(false);
      setTeamMemberForm({ name: '', role: '', category: 'instructor', photo_url: '', photo_base64: '', bio: '', email: '', phone: '', display_order: 0, is_active: true });
      refreshTeamMembers();
    } catch (error) {
      toast.error('Failed to add team member');
    } finally {
      setSubmitting(false);
    }
  };

  const updateTeamMember = async () => {
    if (!selectedTeamMember) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/admin/team/${selectedTeamMember.member_id}`, teamMemberForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Team member updated!');
      setEditTeamMemberOpen(false);
      setSelectedTeamMember(null);
      refreshTeamMembers();
    } catch (error) {
      toast.error('Failed to update team member');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTeamMember = async (memberId) => {
    if (!confirm('Delete this team member?')) return;
    try {
      await axios.delete(`${API}/admin/team/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Team member deleted!');
      refreshTeamMembers();
    } catch (error) {
      toast.error('Failed to delete team member');
    }
  };

  const handleTeamMemberPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setTeamMemberForm(prev => ({ ...prev, photo_base64: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Promotional Banner CRUD
  const createBanner = async () => {
    if (!bannerForm.title || !bannerForm.description) {
      toast.error('Title and Description are required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/promo-banners`, bannerForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Banner created!');
      setCreateBannerOpen(false);
      setBannerForm({ title: '', description: '', button_text: 'Learn More', link_url: '', link_type: 'external', gradient_from: '#00f0ff', gradient_to: '#ff00ff', icon: 'Zap', is_active: true, display_order: 0, registration_enabled: false });
      refreshBanners();
    } catch (error) {
      toast.error('Failed to create banner');
    } finally {
      setSubmitting(false);
    }
  };

  const updateBanner = async () => {
    if (!selectedBannerItem) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/admin/promo-banners/${selectedBannerItem.banner_id}`, bannerForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Banner updated!');
      setEditBannerOpen(false);
      refreshBanners();
    } catch (error) {
      toast.error('Failed to update banner');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBanner = async (bannerId) => {
    if (!confirm('Delete this promotional banner?')) return;
    try {
      await axios.delete(`${API}/admin/promo-banners/${bannerId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Banner deleted!');
      refreshBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const downloadWorkshopRegistrations = async (bannerId = null) => {
    try {
      const url = bannerId 
        ? `${API}/admin/workshop-registrations/export?banner_id=${bannerId}`
        : `${API}/admin/workshop-registrations/export`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
        withCredentials: true
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `workshop_registrations_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Registrations exported!');
    } catch (error) {
      toast.error('Failed to export registrations');
    }
  };

  // Media Gallery functions
  const addMediaItem = async () => {
    if (!mediaForm.title) {
      toast.error('Please enter a title');
      return;
    }
    if (!mediaForm.url && !mediaForm.media_base64) {
      toast.error('Please provide a URL or upload a file');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/media/gallery`, mediaForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Media added!');
      setAddMediaOpen(false);
      setMediaForm({
        title: '',
        description: '',
        media_type: 'image',
        url: '',
        media_base64: '',
        thumbnail_url: '',
        thumbnail_base64: '',
        category: 'public',
        is_visible: true,
        order: 0
      });
      refreshMedia();
    } catch (error) {
      toast.error('Failed to add media');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle media file upload
  const handleMediaFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB for images, 50MB for videos)
    const maxSize = mediaForm.media_type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${mediaForm.media_type === 'video' ? '50MB' : '10MB'}`);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaForm(prev => ({ ...prev, media_base64: reader.result, url: '' }));
    };
    reader.readAsDataURL(file);
  };

  const deleteMediaItem = async (mediaId) => {
    if (!confirm('Delete this media item?')) return;
    try {
      await axios.delete(`${API}/admin/media/gallery/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Media deleted');
      refreshMedia();
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  const toggleMediaVisibility = async (mediaId, isVisible) => {
    try {
      await axios.put(`${API}/admin/media/gallery/${mediaId}`, { is_visible: !isVisible }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Media updated');
      refreshMedia();
    } catch (error) {
      toast.error('Failed to update media');
    }
  };

  // NFC Users functions
  const fetchNfcUsers = async (search = '') => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const url = search ? `${API}/admin/nfc-users?search=${encodeURIComponent(search)}` : `${API}/admin/nfc-users`;
      const response = await axios.get(url, { headers, withCredentials: true });
      setNfcUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch NFC users');
    }
  };

  const downloadNfcTemplate = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/admin/nfc-users/template`, {
        headers,
        withCredentials: true,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'NFC_Users_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded!');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const uploadNfcUsers = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API}/admin/nfc-users/upload`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      toast.success(response.data.message);
      setNfcUploadOpen(false);
      fetchNfcUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload');
    } finally {
      setSubmitting(false);
    }
  };

  const resetNfcPassword = async (nfcId, newPassword = null) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/nfc-users/${nfcId}/reset-password`, 
        newPassword ? { new_password: newPassword } : {},
        { headers, withCredentials: true }
      );
      toast.success('Password reset successfully');
      setResetPasswordOpen(false);
      setSelectedNfcUser(null);
      setNewPasswordInput('');
      fetchNfcUsers(nfcUserSearch);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    }
  };

  const toggleNfcUserStatus = async (nfcId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(`${API}/admin/nfc-users/${nfcId}/toggle-status`, {}, { headers, withCredentials: true });
      toast.success(response.data.message);
      fetchNfcUsers(nfcUserSearch);
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  // Assessment Categories CRUD
  const createAssessmentCategory = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/assessment-categories`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Assessment category created!');
      setCreateCategoryOpen(false);
      setCategoryForm({ name: '', description: '', scale_min: 1, scale_max: 5, is_active: true });
      refreshAssessments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const updateAssessmentCategory = async () => {
    if (!selectedCategory) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/admin/assessment-categories/${selectedCategory.category_id}`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Category updated!');
      setEditCategoryOpen(false);
      setSelectedCategory(null);
      refreshAssessments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAssessmentCategory = async (categoryId) => {
    if (!confirm('Delete this assessment category?')) return;
    try {
      await axios.delete(`${API}/admin/assessment-categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Category deleted');
      refreshAssessments();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const openEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      assessment_type: category.assessment_type || 'rating',
      scale_min: category.scale_min || 1,
      scale_max: category.scale_max || 5,
      weight: category.weight || 1.0,
      is_required: category.is_required ?? true,
      is_active: category.is_active ?? true,
      display_order: category.display_order || 0
    });
    setEditCategoryOpen(true);
  };

  // Load NFC users when switching to that tab
  useEffect(() => {
    if (activeTab === 'nfc-users') {
      fetchNfcUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const updateLeadStatus = async (leadId, status) => {
    try {
      await axios.put(`${API}/admin/leads/${leadId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Lead updated');
      refreshLeads();
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const deleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    
    try {
      await axios.delete(`${API}/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Student removed');
      refreshStudents();
    } catch (error) {
      toast.error('Failed to remove student');
    }
  };

  const updateStudent = async () => {
    if (!selectedStudent) return;
    setSubmitting(true);
    
    try {
      await axios.put(`${API}/admin/students/${selectedStudent.student_id}`, selectedStudent, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Student updated');
      setEditDialogOpen(false);
      refreshStudents();
    } catch (error) {
      toast.error('Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const createProgram = async () => {
    setSubmitting(true);
    try {
      // Filter out empty highlights and prepare data
      const submitData = {
        ...programForm,
        duration_weeks: parseInt(programForm.duration_weeks) || 4,
        batch_size: parseInt(programForm.batch_size) || 20,
        highlights: programForm.highlights.filter(h => h.trim() !== '')
      };
      await axios.post(`${API}/programs`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Program created!');
      setCreateProgramOpen(false);
      refreshPrograms();
      setProgramForm({
        name: '',
        program_type: 'certification',
        description: '',
        duration_weeks: 4,
        batch_size: 20,
        status: 'active',
        brand_id: '',
        highlights: ['', '', '', '']
      });
    } catch (error) {
      toast.error('Failed to create program');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditProgram = (program) => {
    setSelectedProgram(program);
    // Ensure highlights array has 4 items, filling empty if needed
    const existingHighlights = program.highlights || [];
    const paddedHighlights = [...existingHighlights, '', '', '', ''].slice(0, 4);
    setEditProgramForm({
      name: program.name || '',
      program_type: program.program_type || 'certification',
      description: program.description || '',
      duration_weeks: program.duration_weeks || 4,
      batch_size: program.batch_size || 20,
      status: program.status || 'active',
      next_batch_date: program.next_batch_date || '',
      registration_open: program.registration_open !== false,
      brand_id: program.brand_id || '',
      highlights: paddedHighlights
    });
    setEditProgramOpen(true);
  };

  const updateProgram = async () => {
    if (!selectedProgram) return;
    setSubmitting(true);
    try {
      // Filter out empty highlights and prepare data
      const submitData = {
        ...editProgramForm,
        duration_weeks: parseInt(editProgramForm.duration_weeks) || 4,
        batch_size: parseInt(editProgramForm.batch_size) || 20,
        highlights: (editProgramForm.highlights || []).filter(h => h.trim() !== '')
      };
      await axios.put(`${API}/programs/${selectedProgram.program_id}`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Program updated!');
      setEditProgramOpen(false);
      refreshPrograms();
    } catch (error) {
      toast.error('Failed to update program');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProgram = async (programId) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await axios.delete(`${API}/programs/${programId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Program deleted');
      refreshPrograms();
    } catch (error) {
      toast.error('Failed to delete program');
    }
  };

  const saveAdminMessage = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/message`, adminMessage, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Message saved!');
      setMessageDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save message');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRegistration = async (programId, currentStatus, nextBatchDate) => {
    setSubmitting(true);
    try {
      await axios.put(`${API}/programs/${programId}/registration`, {
        registration_open: !currentStatus,
        next_batch_date: nextBatchDate || null
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success(`Registration ${!currentStatus ? 'opened' : 'closed'}`);
      setRegistrationDialogOpen(false);
      refreshPrograms();
    } catch (error) {
      toast.error('Failed to update registration');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReport = async (reportType, batchId = null) => {
    setReportLoading(true);
    try {
      let url = `${API}/admin/reports/${reportType}`;
      if (batchId) url += `/${batchId}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
        withCredentials: true
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `university_${reportType}_report_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Report downloaded!');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setReportLoading(false);
    }
  };

  const downloadCompletionReport = async (batchId) => {
    setReportLoading(true);
    try {
      const response = await axios.post(`${API}/admin/reports/completion`, {
        batch_id: batchId,
        completion_date: new Date().toISOString().slice(0,10)
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
        withCredentials: true
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `university_completion_${batchId}_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Completion report generated! Batch marked as completed.');
    } catch (error) {
      toast.error('Failed to generate completion report');
    } finally {
      setReportLoading(false);
    }
  };

  const saveCmsSettings = async () => {
    setSubmitting(true);
    try {
      await axios.put(`${API}/cms/settings`, cmsSettings, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  const saveLandingContent = async () => {
    setSubmitting(true);
    try {
      await axios.put(`${API}/cms/landing`, landingContent, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Landing page updated!');
    } catch (error) {
      toast.error('Failed to update landing page');
    } finally {
      setSubmitting(false);
    }
  };

  const saveThemeSettings = async () => {
    setSubmitting(true);
    try {
      await axios.put(`${API}/cms/theme`, themeSettings, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Theme settings updated! Refresh to see changes.');
    } catch (error) {
      toast.error('Failed to update theme settings');
    } finally {
      setSubmitting(false);
    }
  };

  const sendTestEmail = async () => {
    if (!cmsSettings.university_email) {
      toast.error('Please set university email first');
      return;
    }
    setEmailLoading(true);
    try {
      await axios.post(`${API}/admin/test-email`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Test email sent!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send test email');
    } finally {
      setEmailLoading(false);
    }
  };

  const sendReportEmail = async (reportType, batchId = null) => {
    if (!cmsSettings.university_email) {
      toast.error('Please set university email first');
      return;
    }
    setEmailLoading(true);
    try {
      await axios.post(`${API}/admin/reports/email`, {
        report_type: reportType,
        batch_id: batchId
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success(`${reportType} report sent to ${cmsSettings.university_email}!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send report email');
    } finally {
      setEmailLoading(false);
    }
  };

  const assignNFCCard = async (studentId, nfcCardId) => {
    try {
      await axios.put(`${API}/students/${studentId}/nfc`, {
        nfc_card_id: nfcCardId.toUpperCase()
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('NFC Card assigned!');
      refreshNfcCards();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to assign NFC card');
    }
  };

  // Brand management functions
  const createBrand = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/brands`, brandForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Brand created!');
      setCreateBrandOpen(false);
      setBrandForm({ name: '', description: '', color: '#00f0ff', is_visible: true });
      refreshBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create brand');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditBrand = (brand) => {
    setSelectedBrand(brand);
    setEditBrandForm({
      name: brand.name || '',
      description: brand.description || '',
      color: brand.color || '#00f0ff',
      is_visible: brand.is_visible !== false,
      stats_certifications: brand.stats_certifications || 'Industry',
      stats_success_rate: brand.stats_success_rate || '95%',
      tagline: brand.tagline || ''
    });
    setEditBrandOpen(true);
  };

  const updateBrand = async () => {
    if (!selectedBrand) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/admin/brands/${selectedBrand.brand_id}`, editBrandForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Brand updated!');
      setEditBrandOpen(false);
      refreshBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update brand');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBrand = async (brandId) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await axios.delete(`${API}/admin/brands/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Brand deleted');
      refreshBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete brand');
    }
  };

  const uploadBrandLogo = async (brandId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setSubmitting(true);
      const response = await axios.post(`${API}/admin/brands/${brandId}/logo`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      toast.success('Logo uploaded!');
      refreshBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBrandLogo = async (brandId) => {
    try {
      await axios.delete(`${API}/admin/brands/${brandId}/logo`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Logo removed');
      refreshBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove logo');
    }
  };

  const seedDefaultBrands = async () => {
    try {
      setSubmitting(true);
      const response = await axios.post(`${API}/admin/brands/seed-defaults`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success(response.data.message);
      refreshBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to seed brands');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBrandVisibility = async (brandId, currentVisibility) => {
    try {
      await axios.put(`${API}/admin/brands/${brandId}`, {
        is_visible: !currentVisibility
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success(`Brand ${!currentVisibility ? 'shown' : 'hidden'}`);
      refreshBrands();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  // NFC Management functions
  const issueNfcCard = async () => {
    if (!nfcForm.user_id || !nfcForm.nfc_card_id) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/nfc/issue`, {
        user_id: nfcForm.user_id,
        nfc_card_id: nfcForm.nfc_card_id.toUpperCase(),
        user_type: nfcForm.user_type
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('NFC Card issued successfully!');
      setIssueNfcOpen(false);
      setNfcForm({ user_id: '', nfc_card_id: '', user_type: 'student' });
      refreshNfcCards();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to issue NFC card');
    } finally {
      setSubmitting(false);
    }
  };

  const replaceNfcCard = async () => {
    if (!replaceNfcForm.old_nfc_id || !replaceNfcForm.new_nfc_id) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/nfc/replace`, {
        old_nfc_id: replaceNfcForm.old_nfc_id.toUpperCase(),
        new_nfc_id: replaceNfcForm.new_nfc_id.toUpperCase()
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('NFC Card replaced! Old card will be deleted in 10 days.');
      setReplaceNfcOpen(false);
      setReplaceNfcForm({ old_nfc_id: '', new_nfc_id: '' });
      refreshNfcCards();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to replace NFC card');
    } finally {
      setSubmitting(false);
    }
  };

  const revokeNfcCard = async (nfcCardId) => {
    if (!confirm(`Are you sure you want to revoke NFC card ${nfcCardId}? The user will no longer be able to use it for login.`)) return;
    try {
      await axios.delete(`${API}/admin/nfc/${nfcCardId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('NFC Card revoked');
      refreshNfcCards();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to revoke NFC card');
    }
  };

  const confirmNfcDeletion = async (oldNfcId) => {
    if (!confirm(`Permanently delete NFC card ${oldNfcId}? This cannot be undone.`)) return;
    try {
      await axios.post(`${API}/admin/nfc/confirm-deletion/${oldNfcId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('NFC Card permanently deleted');
      refreshNfcCards();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete NFC card');
    }
  };

  const openReplaceDialog = (nfcCardId) => {
    setReplaceNfcForm({ old_nfc_id: nfcCardId, new_nfc_id: '' });
    setReplaceNfcOpen(true);
  };

  // Brand Head management functions
  const assignBrandHead = async () => {
    if (!brandHeadForm.user_id || !brandHeadForm.brand_id) {
      toast.error('Please select both user and brand');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/brand-heads/assign`, brandHeadForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Brand Head assigned successfully!');
      setAssignBrandHeadOpen(false);
      setBrandHeadForm({ user_id: '', brand_id: '' });
      refreshBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to assign Brand Head');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Brand Manager account
  const createBrandManager = async () => {
    if (!brandManagerForm.email || !brandManagerForm.password || !brandManagerForm.name || !brandManagerForm.brand_id) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/admin/users/brand-manager`, brandManagerForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      const emailSent = response.data?.email_sent;
      toast.success(`Brand Manager account created successfully!${emailSent ? ' Login credentials sent via email.' : ''}`);
      setCreateBrandManagerOpen(false);
      setBrandManagerForm({ email: '', password: '', name: '', brand_id: '' });
      refreshBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create Brand Manager');
    } finally {
      setSubmitting(false);
    }
  };

  const removeBrandHead = async (userId) => {
    if (!confirm('Remove Brand Head role from this user?')) return;
    try {
      await axios.delete(`${API}/admin/brand-heads/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Brand Head role removed');
      refreshBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove Brand Head');
    }
  };

  // Create new crew member
  const createCrewMember = async () => {
    if (!createCrewForm.name || !createCrewForm.email || !createCrewForm.password) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/crew/create`, createCrewForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Crew member created successfully!');
      setCreateCrewOpen(false);
      setCreateCrewForm({ name: '', email: '', password: '', brand_id: '' });
      refreshCrewMembers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create crew member');
    } finally {
      setSubmitting(false);
    }
  };

  // Crew brand assignment
  const assignCrewToBrand = async () => {
    if (!crewBrandForm.user_id) {
      toast.error('Please select a crew member');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/crew/assign-brand`, crewBrandForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success(crewBrandForm.brand_id ? 'Crew assigned to brand!' : 'Brand assignment removed');
      setAssignCrewBrandOpen(false);
      setCrewBrandForm({ user_id: '', brand_id: '' });
      refreshCrewMembers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to assign crew to brand');
    } finally {
      setSubmitting(false);
    }
  };

  // Unit Builder functions
  const openUnitBuilder = async (program) => {
    setSelectedProgram(program);
    try {
      const response = await axios.get(`${API}/programs/${program.program_id}/units`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setProgramUnits(response.data || []);
    } catch (error) {
      setProgramUnits([]);
    }
    setUnitBuilderOpen(true);
  };

  const createUnit = async () => {
    if (!unitForm.name || !unitForm.brand_id) {
      toast.error('Please fill required fields');
      return;
    }
    setSubmitting(true);
    try {
      const nextOrder = programUnits.length + 1;
      await axios.post(`${API}/programs/${selectedProgram.program_id}/units`, {
        ...unitForm,
        program_id: selectedProgram.program_id,
        order: nextOrder
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Unit created!');
      setCreateUnitOpen(false);
      setUnitForm({ name: '', description: '', brand_id: '', duration_weeks: 1, order: 1, theory_hours: 0, practical_hours: 0, assessments_required: [] });
      // Refresh units
      const response = await axios.get(`${API}/programs/${selectedProgram.program_id}/units`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setProgramUnits(response.data || []);
      refreshPrograms();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create unit');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditUnit = (unit) => {
    setSelectedUnit(unit);
    setUnitForm({
      name: unit.name || '',
      description: unit.description || '',
      brand_id: unit.brand_id || '',
      duration_weeks: unit.duration_weeks || 1,
      order: unit.order || 1,
      theory_hours: unit.theory_hours || 0,
      practical_hours: unit.practical_hours || 0,
      assessments_required: unit.assessments_required || []
    });
    setEditUnitOpen(true);
  };

  const updateUnit = async () => {
    if (!selectedUnit) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/units/${selectedUnit.unit_id}`, unitForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Unit updated!');
      setEditUnitOpen(false);
      // Refresh units
      const response = await axios.get(`${API}/programs/${selectedProgram.program_id}/units`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setProgramUnits(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update unit');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUnit = async (unitId) => {
    if (!confirm('Delete this unit?')) return;
    try {
      await axios.delete(`${API}/units/${unitId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Unit deleted');
      setProgramUnits(programUnits.filter(u => u.unit_id !== unitId));
    } catch (error) {
      toast.error('Failed to delete unit');
    }
  };

  // Get brands that don't have a brand head assigned
  const brandsWithoutHead = brands.filter(b => !b.brand_head_id);

  const filteredNfcCards = nfcCards.filter(n =>
    n.nfc_card_id?.toLowerCase().includes(nfcSearchQuery.toLowerCase()) ||
    n.name?.toLowerCase().includes(nfcSearchQuery.toLowerCase()) ||
    n.email?.toLowerCase().includes(nfcSearchQuery.toLowerCase())
  );

  // Get users without NFC for the issue dropdown
  const usersWithoutNfc = students.filter(s => !s.nfc_card_id);

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nfc_card_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobile?.includes(searchQuery)
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
            <KotlerXLogo size="md" />
            <div className="hidden sm:block">
              <SplitText text="Admin Panel" tag="h1" className="font-unbounded font-bold text-xl text-white" />
              <p className="text-sm text-zinc-500">University Management Console</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setMessageDialogOpen(true)}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5 gap-2"
              data-testid="admin-message-btn"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Broadcast</span>
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

      {/* Tabs */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'leads', label: `Leads ${leadStats?.new ? `(${leadStats.new})` : ''}`, icon: UserPlus },
              { id: 'banners', label: `Banners (${promoBanners.length})`, icon: Megaphone },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'programs', label: 'Programs', icon: Calendar },
              { id: 'brands', label: `Brands (${brands.length})`, icon: Layers },
              { id: 'team', label: `Team (${teamMembers.length})`, icon: Users },
              { id: 'assessments', label: `Assessment (${assessmentCategories.length})`, icon: Award },
              { id: 'careers', label: 'Careers', icon: Briefcase },
              { id: 'nfc', label: `NFC Cards (${nfcCards.length})`, icon: CreditCard },
              { id: 'nfc-users', label: 'NFC Users', icon: KeyRound },
              { id: 'exports', label: 'Data Export', icon: FileDown },
              { id: 'reports', label: 'University Reports', icon: FileSpreadsheet },
              { id: 'cms', label: 'CMS & Settings', icon: Edit },
              { id: 'kxcraft', label: `KXCraft (${kxcraftProducts.length})`, icon: ShoppingBag },
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
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Lead Stats Banner */}
            {leadStats?.new > 0 && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-white font-semibold">{leadStats.new} New Leads</p>
                    <p className="text-sm text-zinc-400">People interested in your programs</p>
                  </div>
                </div>
                <Button onClick={() => setActiveTab('leads')} className="btn-primary">
                  View Leads
                </Button>
              </div>
            )}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Quick Stats */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="telemetry-card rounded-xl p-6">
                <h3 className="font-unbounded font-semibold text-lg text-white mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {stats?.top_performers?.slice(0, 5).map((student, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          i === 0 ? 'bg-yellow-500 text-black' : 
                          i === 1 ? 'bg-gray-400 text-black' :
                          i === 2 ? 'bg-amber-600 text-white' : 'bg-white/10 text-white'
                        }`}>{i + 1}</span>
                        <span className="text-white">{student.full_name}</span>
                      </div>
                      <span className="text-primary font-mono">{student.average_rating?.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="telemetry-card rounded-xl p-6">
                <h3 className="font-unbounded font-semibold text-lg text-white mb-4">Program Stats</h3>
                <div className="space-y-3">
                  {programs.slice(0, 5).map((prog, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white">{prog.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        prog.program_type === 'certification' ? 'bg-primary/20 text-primary' :
                        prog.program_type === 'diploma' ? 'bg-secondary/20 text-secondary' :
                        'bg-accent/20 text-accent'
                      }`}>{prog.program_type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banners Tab - Promotional Carousel Management */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-unbounded font-bold text-white">Promotional Banners</h2>
                <p className="text-zinc-400 text-sm">Manage auto-scrolling carousel ads on the landing page</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => downloadWorkshopRegistrations()} variant="outline" className="border-zinc-700 text-zinc-300 gap-2">
                  <Download className="w-4 h-4" />
                  Export All Registrations
                </Button>
                <Button onClick={() => { setBannerForm({ title: '', description: '', button_text: 'Learn More', link_url: '', link_type: 'external', gradient_from: '#00f0ff', gradient_to: '#ff00ff', icon: 'Zap', is_active: true, display_order: promoBanners.length, registration_enabled: false }); setCreateBannerOpen(true); }} className="btn-primary gap-2" data-testid="add-banner-btn">
                  <Plus className="w-4 h-4" />
                  Add Banner
                </Button>
              </div>
            </div>

            {/* Banners List */}
            <div className="grid gap-4">
              {promoBanners.length === 0 ? (
                <div className="telemetry-card rounded-xl p-12 text-center">
                  <Megaphone className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No promotional banners yet. Add your first banner to display on the landing page.</p>
                </div>
              ) : (
                promoBanners.map((banner) => (
                  <div 
                    key={banner.banner_id} 
                    className="telemetry-card rounded-xl p-6 hover:border-primary/30 transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${banner.gradient_from}10 0%, ${banner.gradient_to}10 100%)`
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${banner.gradient_from}, ${banner.gradient_to})` }}
                        >
                          <Megaphone className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-unbounded font-semibold text-lg text-white">{banner.title}</h3>
                            {!banner.is_active && (
                              <span className="px-2 py-0.5 rounded text-xs bg-zinc-700 text-zinc-400">Inactive</span>
                            )}
                            {banner.registration_enabled && (
                              <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">Registration Form</span>
                            )}
                          </div>
                          <p className="text-zinc-400 text-sm mb-2">{banner.description}</p>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span>Button: "{banner.button_text}"</span>
                            {banner.link_url && <span>→ {banner.link_url}</span>}
                            <span>Order: {banner.display_order}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBannerItem(banner);
                            setBannerForm({
                              title: banner.title,
                              description: banner.description,
                              button_text: banner.button_text,
                              link_url: banner.link_url || '',
                              link_type: banner.link_type,
                              gradient_from: banner.gradient_from,
                              gradient_to: banner.gradient_to,
                              icon: banner.icon,
                              is_active: banner.is_active,
                              display_order: banner.display_order,
                              registration_enabled: banner.registration_enabled
                            });
                            setEditBannerOpen(true);
                          }}
                          className="border-zinc-700"
                          data-testid={`edit-banner-${banner.banner_id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBanner(banner.banner_id)}
                          className="text-red-400 border-red-400/50"
                          data-testid={`delete-banner-${banner.banner_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Workshop Registrations Section */}
            {workshopRegistrations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-unbounded font-semibold text-white mb-4">Workshop Registrations ({workshopRegistrations.length})</h3>
                <div className="telemetry-card rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Event</th>
                          <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Name</th>
                          <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Email</th>
                          <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Phone</th>
                          <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workshopRegistrations.map((reg) => (
                          <tr key={reg.registration_id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-4 text-primary font-inter">{reg.event_title}</td>
                            <td className="p-4 text-white font-inter">{reg.name}</td>
                            <td className="p-4 text-zinc-400">{reg.email}</td>
                            <td className="p-4 text-zinc-400">{reg.phone}</td>
                            <td className="p-4 text-zinc-500 text-sm">{new Date(reg.registered_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Banner Dialog */}
        <Dialog open={createBannerOpen} onOpenChange={setCreateBannerOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white font-unbounded">Add Promotional Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-zinc-300">Title *</Label>
                <Input value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="input-dark mt-1" placeholder="e.g., Workshop on Custom Painting" data-testid="banner-title-input" />
              </div>
              <div>
                <Label className="text-zinc-300">Description *</Label>
                <Textarea value={bannerForm.description} onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })} className="input-dark mt-1" rows={3} placeholder="Describe the promotion..." data-testid="banner-desc-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Button Text</Label>
                  <Input value={bannerForm.button_text} onChange={(e) => setBannerForm({ ...bannerForm, button_text: e.target.value })} className="input-dark mt-1" placeholder="Learn More" />
                </div>
                <div>
                  <Label className="text-zinc-300">Link Type</Label>
                  <Select value={bannerForm.link_type} onValueChange={(v) => setBannerForm({ ...bannerForm, link_type: v })}>
                    <SelectTrigger className="input-dark mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="external">External Link</SelectItem>
                      <SelectItem value="registration">Registration Form</SelectItem>
                      <SelectItem value="internal">Internal Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {bannerForm.link_type !== 'registration' && (
                <div>
                  <Label className="text-zinc-300">Link URL</Label>
                  <Input value={bannerForm.link_url} onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })} className="input-dark mt-1" placeholder="https://..." />
                </div>
              )}
              {bannerForm.link_type === 'registration' && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <input type="checkbox" checked={bannerForm.registration_enabled} onChange={(e) => setBannerForm({ ...bannerForm, registration_enabled: e.target.checked })} className="w-4 h-4" />
                  <Label className="text-zinc-300">Enable Registration Form (for workshops/events)</Label>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Gradient From</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={bannerForm.gradient_from} onChange={(e) => setBannerForm({ ...bannerForm, gradient_from: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                    <Input value={bannerForm.gradient_from} onChange={(e) => setBannerForm({ ...bannerForm, gradient_from: e.target.value })} className="input-dark flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-zinc-300">Gradient To</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={bannerForm.gradient_to} onChange={(e) => setBannerForm({ ...bannerForm, gradient_to: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                    <Input value={bannerForm.gradient_to} onChange={(e) => setBannerForm({ ...bannerForm, gradient_to: e.target.value })} className="input-dark flex-1" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Display Order</Label>
                  <Input type="number" value={bannerForm.display_order} onChange={(e) => setBannerForm({ ...bannerForm, display_order: parseInt(e.target.value) || 0 })} className="input-dark mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-300">Status</Label>
                  <Select value={bannerForm.is_active ? 'active' : 'inactive'} onValueChange={(v) => setBannerForm({ ...bannerForm, is_active: v === 'active' })}>
                    <SelectTrigger className="input-dark mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Preview */}
              <div className="p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${bannerForm.gradient_from}30 0%, ${bannerForm.gradient_to}30 100%)` }}>
                <p className="text-xs text-zinc-500 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${bannerForm.gradient_from}, ${bannerForm.gradient_to})` }}></div>
                  <div>
                    <p className="text-white font-semibold">{bannerForm.title || 'Banner Title'}</p>
                    <p className="text-zinc-400 text-sm truncate max-w-[300px]">{bannerForm.description || 'Description...'}</p>
                  </div>
                </div>
              </div>
              <Button onClick={createBanner} disabled={submitting} className="w-full btn-primary" data-testid="create-banner-submit">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Banner'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Banner Dialog */}
        <Dialog open={editBannerOpen} onOpenChange={setEditBannerOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white font-unbounded">Edit Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-zinc-300">Title *</Label>
                <Input value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="input-dark mt-1" />
              </div>
              <div>
                <Label className="text-zinc-300">Description *</Label>
                <Textarea value={bannerForm.description} onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })} className="input-dark mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Button Text</Label>
                  <Input value={bannerForm.button_text} onChange={(e) => setBannerForm({ ...bannerForm, button_text: e.target.value })} className="input-dark mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-300">Link Type</Label>
                  <Select value={bannerForm.link_type} onValueChange={(v) => setBannerForm({ ...bannerForm, link_type: v })}>
                    <SelectTrigger className="input-dark mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="external">External Link</SelectItem>
                      <SelectItem value="registration">Registration Form</SelectItem>
                      <SelectItem value="internal">Internal Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {bannerForm.link_type !== 'registration' && (
                <div>
                  <Label className="text-zinc-300">Link URL</Label>
                  <Input value={bannerForm.link_url} onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })} className="input-dark mt-1" />
                </div>
              )}
              {bannerForm.link_type === 'registration' && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <input type="checkbox" checked={bannerForm.registration_enabled} onChange={(e) => setBannerForm({ ...bannerForm, registration_enabled: e.target.checked })} className="w-4 h-4" />
                  <Label className="text-zinc-300">Enable Registration Form</Label>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Gradient From</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={bannerForm.gradient_from} onChange={(e) => setBannerForm({ ...bannerForm, gradient_from: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                    <Input value={bannerForm.gradient_from} onChange={(e) => setBannerForm({ ...bannerForm, gradient_from: e.target.value })} className="input-dark flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-zinc-300">Gradient To</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={bannerForm.gradient_to} onChange={(e) => setBannerForm({ ...bannerForm, gradient_to: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                    <Input value={bannerForm.gradient_to} onChange={(e) => setBannerForm({ ...bannerForm, gradient_to: e.target.value })} className="input-dark flex-1" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Display Order</Label>
                  <Input type="number" value={bannerForm.display_order} onChange={(e) => setBannerForm({ ...bannerForm, display_order: parseInt(e.target.value) || 0 })} className="input-dark mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-300">Status</Label>
                  <Select value={bannerForm.is_active ? 'active' : 'inactive'} onValueChange={(v) => setBannerForm({ ...bannerForm, is_active: v === 'active' })}>
                    <SelectTrigger className="input-dark mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={updateBanner} disabled={submitting} className="w-full btn-primary">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Banner'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-dark h-12 pl-11"
                  placeholder="Search by name, NFC ID, or mobile..."
                  data-testid="student-search"
                />
              </div>
              <span className="text-zinc-500 text-sm">{filteredStudents.length} students</span>
            </div>

            {/* Students Table */}
            <div className="telemetry-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Student</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">NFC ID</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Mobile</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Rating</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Status</th>
                      <th className="text-right p-4 text-xs font-mono text-zinc-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.student_id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-inter">{student.full_name}</p>
                            <p className="text-xs text-zinc-500">{student.city}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-primary text-sm">{student.nfc_card_id}</span>
                        </td>
                        <td className="p-4 text-zinc-400">{student.mobile}</td>
                        <td className="p-4">
                          <span className="font-mono text-white">{student.average_rating?.toFixed(1) || '0.0'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-mono ${
                            student.status === 'active' ? 'bg-accent-success/20 text-accent-success' : 'bg-accent/20 text-accent'
                          }`}>{student.status}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/id/${student.nfc_card_id}`)}
                              className="text-zinc-400 hover:text-white"
                              data-testid={`view-${student.student_id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedStudent(student);
                                setEditDialogOpen(true);
                              }}
                              className="text-zinc-400 hover:text-white"
                              data-testid={`edit-${student.student_id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteStudent(student.student_id)}
                              className="text-zinc-400 hover:text-accent"
                              data-testid={`delete-${student.student_id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-unbounded font-semibold text-lg text-white">Programs</h2>
              <Button
                onClick={() => setCreateProgramOpen(true)}
                className="btn-primary gap-2"
                data-testid="create-program-btn"
              >
                <Plus className="w-4 h-4" />
                New Program
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => {
                const assignedBrand = brands.find(b => b.brand_id === program.brand_id);
                return (
                <div key={program.program_id} className="telemetry-card rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-unbounded font-semibold text-white">{program.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-mono ${
                          program.program_type === 'certification' ? 'bg-primary/20 text-primary' :
                          program.program_type === 'diploma' ? 'bg-secondary/20 text-secondary' :
                          'bg-accent/20 text-accent'
                        }`}>{program.program_type?.replace('_', ' ')}</span>
                        {assignedBrand && (
                          <span 
                            className="px-2 py-1 rounded text-xs font-mono"
                            style={{ backgroundColor: `${assignedBrand.color}20`, color: assignedBrand.color }}
                          >
                            {assignedBrand.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        program.status === 'active' ? 'bg-accent-success/20 text-accent-success' : 'bg-zinc-500/20 text-zinc-400'
                      }`}>{program.status}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProgram(program);
                          setRegistrationDialogOpen(true);
                        }}
                        className={`gap-1 text-xs ${
                          program.registration_open !== false 
                            ? 'border-accent-success/30 text-accent-success hover:bg-accent-success/10' 
                            : 'border-accent/30 text-accent hover:bg-accent/10'
                        }`}
                        data-testid={`toggle-reg-${program.program_id}`}
                      >
                        {program.registration_open !== false ? (
                          <><Unlock className="w-3 h-3" /> Open</>
                        ) : (
                          <><Lock className="w-3 h-3" /> Closed</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">{program.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span>{program.duration_weeks} weeks</span>
                      <span>Batch: {program.batch_size}</span>
                    </div>
                    {program.next_batch_date && !program.registration_open && (
                      <span className="text-xs text-secondary">Next: {program.next_batch_date}</span>
                    )}
                  </div>
                  {/* Edit & Delete Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUnitBuilder(program)}
                      className="flex-1 border-primary/30 text-primary hover:bg-primary/10 gap-1"
                      data-testid={`units-program-${program.program_id}`}
                    >
                      <Layers className="w-3 h-3" />
                      Units
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditProgram(program)}
                      className="flex-1 border-white/10 text-white hover:bg-white/5 gap-1"
                      data-testid={`edit-program-${program.program_id}`}
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteProgram(program.program_id)}
                      className="border-accent/30 text-accent hover:bg-accent/10 gap-1"
                      data-testid={`delete-program-${program.program_id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-semibold text-lg text-white">Brand Management</h2>
                <p className="text-sm text-zinc-500">Manage the 13+ KX brand tiles visible across the platform</p>
              </div>
              <div className="flex gap-2">
                {brands.length === 0 && (
                  <Button
                    onClick={seedDefaultBrands}
                    disabled={submitting}
                    variant="outline"
                    className="border-secondary/30 text-secondary hover:bg-secondary/10 gap-2"
                    data-testid="seed-brands-btn"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                    Seed Default Brands
                  </Button>
                )}
                <Button
                  onClick={() => setCreateBrandOpen(true)}
                  className="btn-primary gap-2"
                  data-testid="create-brand-btn"
                >
                  <Plus className="w-4 h-4" />
                  New Brand
                </Button>
              </div>
            </div>

            {brands.length === 0 ? (
              <div className="telemetry-card rounded-xl p-12 text-center">
                <Layers className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="font-unbounded font-semibold text-white mb-2">No Brands Yet</h3>
                <p className="text-zinc-500 mb-6">Get started by seeding the default KX brands or create your own.</p>
                <Button
                  onClick={seedDefaultBrands}
                  disabled={submitting}
                  className="btn-primary gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                  Seed 13 Default KX Brands
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map((brand) => (
                  <div 
                    key={brand.brand_id} 
                    className={`telemetry-card rounded-xl p-5 relative group ${!brand.is_visible ? 'opacity-60' : ''}`}
                    style={{ borderLeft: `4px solid ${brand.color || '#00f0ff'}` }}
                  >
                    {/* Visibility Badge */}
                    {!brand.is_visible && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 rounded text-xs bg-zinc-500/20 text-zinc-400 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      </div>
                    )}

                    {/* Logo or Placeholder */}
                    <div className="mb-4">
                      {brand.logo_url ? (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name} 
                          className="h-16 w-auto object-contain rounded"
                        />
                      ) : (
                        <div 
                          className="h-16 w-16 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: brand.color || '#00f0ff' }}
                        >
                          {brand.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Brand Info */}
                    <h3 className="font-unbounded font-semibold text-white mb-1">{brand.name}</h3>
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{brand.description || 'No description'}</p>

                    {/* Color Preview */}
                    <div className="flex items-center gap-2 mb-4">
                      <div 
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: brand.color }}
                      />
                      <span className="text-xs font-mono text-zinc-500">{brand.color}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      {/* Logo Upload */}
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadBrandLogo(brand.brand_id, file);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-white/10 text-white hover:bg-white/5 gap-1"
                          asChild
                        >
                          <span>
                            <Upload className="w-3 h-3" />
                            Logo
                          </span>
                        </Button>
                      </label>

                      {/* Toggle Visibility */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleBrandVisibility(brand.brand_id, brand.is_visible)}
                        className={`gap-1 ${brand.is_visible 
                          ? 'border-accent-success/30 text-accent-success hover:bg-accent-success/10' 
                          : 'border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/10'
                        }`}
                        data-testid={`toggle-visibility-${brand.brand_id}`}
                      >
                        {brand.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>

                      {/* Edit */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditBrand(brand)}
                        className="border-white/10 text-white hover:bg-white/5"
                        data-testid={`edit-brand-${brand.brand_id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>

                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBrand(brand.brand_id)}
                        className="border-accent/30 text-accent hover:bg-accent/10"
                        data-testid={`delete-brand-${brand.brand_id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Brand Heads Section */}
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-unbounded font-semibold text-white">Brand Heads</h3>
                  <p className="text-sm text-zinc-500">Assign users to manage specific brands</p>
                </div>
                <Button
                  onClick={() => setAssignBrandHeadOpen(true)}
                  className="btn-secondary gap-2"
                  data-testid="assign-brand-head-btn"
                >
                  <Plus className="w-4 h-4" />
                  Assign Existing User
                </Button>
                <Button
                  onClick={() => setCreateBrandManagerOpen(true)}
                  className="btn-primary gap-2"
                  data-testid="create-brand-manager-btn"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Brand Manager
                </Button>
              </div>
              
              <div className="space-y-3">
                {brands.filter(b => b.brand_head_id).length === 0 ? (
                  <p className="text-zinc-500 text-sm py-4 text-center">No brand heads assigned yet</p>
                ) : (
                  brands.filter(b => b.brand_head_id).map(brand => (
                    <div 
                      key={brand.brand_id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                      style={{ borderLeft: `3px solid ${brand.color}` }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: brand.color }}
                        >
                          {brand.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{brand.name}</p>
                          <p className="text-xs text-zinc-500">Managed by: {brand.brand_head_name}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeBrandHead(brand.brand_head_id)}
                        className="border-accent/30 text-accent hover:bg-accent/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Crew Brand Assignments */}
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-unbounded font-semibold text-white">Crew Brand Assignments</h3>
                  <p className="text-sm text-zinc-500">Lock crew/trainers to specific brands</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCreateCrewOpen(true)}
                    className="btn-secondary gap-2"
                    data-testid="create-crew-btn"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Crew
                  </Button>
                  <Button
                    onClick={() => setAssignCrewBrandOpen(true)}
                    className="btn-primary gap-2"
                    data-testid="assign-crew-brand-btn"
                  >
                    <Plus className="w-4 h-4" />
                    Assign Crew
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {crewMembers.length === 0 ? (
                  <p className="text-zinc-500 text-sm py-4 text-center">No crew members yet. Create trainer accounts first.</p>
                ) : (
                  crewMembers.map(crew => {
                    const assignedBrand = brands.find(b => b.brand_id === crew.assigned_brand_id);
                    return (
                      <div 
                        key={crew.user_id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                        style={{ borderLeft: assignedBrand ? `3px solid ${assignedBrand.color}` : '3px solid transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                            {crew.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{crew.name}</p>
                            <p className="text-xs text-zinc-500">{crew.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {assignedBrand ? (
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{ backgroundColor: `${assignedBrand.color}20`, color: assignedBrand.color }}
                            >
                              {assignedBrand.name}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-zinc-500/20 text-zinc-400">
                              All Brands
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCrewBrandForm({ user_id: crew.user_id, brand_id: crew.assigned_brand_id || '' });
                              setAssignCrewBrandOpen(true);
                            }}
                            className="border-white/10 text-white hover:bg-white/5"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                About Brand Tiles
              </h4>
              <p className="text-sm text-zinc-400">
                Brand tiles represent the different verticals within the KXGRID ecosystem. 
                Students can view these brands (if visible) from their dashboard. 
                Each brand can have its own logo, description, and theme color. 
                Hidden brands are not shown to students or on public pages.
              </p>
            </div>
          </div>
        )}

        {/* Assessment Categories Tab */}
        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-semibold text-lg text-white">Assessment Categories</h2>
                <p className="text-sm text-zinc-500">Define custom rating categories for crew assessments</p>
              </div>
              <Button
                onClick={() => {
                  setCategoryForm({ name: '', description: '', scale_min: 1, scale_max: 5, is_active: true });
                  setCreateCategoryOpen(true);
                }}
                className="btn-primary gap-2"
                data-testid="create-category-btn"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>

            {/* Info Banner */}
            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <h4 className="font-medium text-white mb-1">How Assessment Categories Work</h4>
                  <p className="text-sm text-zinc-400">
                    Crew members use these categories to rate students during NFC attendance sessions. 
                    Each category has a rating scale (e.g., 1-5). Students receive an overall average 
                    based on all their assessments.
                  </p>
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assessmentCategories.map(category => (
                <div 
                  key={category.category_id}
                  className={`telemetry-card rounded-xl p-5 relative ${!category.is_active ? 'opacity-60' : ''}`}
                >
                  {!category.is_active && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-zinc-700 text-xs text-zinc-400">
                      Inactive
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{category.name}</h3>
                      <p className="text-sm text-zinc-500">Scale: {category.scale_min} - {category.scale_max}</p>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-zinc-400 mb-4">{category.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditCategory(category)}
                      className="flex-1 border-white/10 text-zinc-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAssessmentCategory(category.category_id)}
                      className="border-accent/30 text-accent hover:bg-accent/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {assessmentCategories.length === 0 && (
                <div className="col-span-full telemetry-card rounded-xl p-8 text-center">
                  <Award className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">No Categories Yet</h3>
                  <p className="text-sm text-zinc-500 mb-4">
                    Create assessment categories for crew to rate students
                  </p>
                  <Button
                    onClick={() => setCreateCategoryOpen(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Category
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Category Dialog */}
        <Dialog open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
          <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-unbounded text-white">Create Assessment Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Category Name *</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="input-dark"
                  placeholder="e.g., Skill Control"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Description</Label>
                <Input
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="input-dark"
                  placeholder="What does this category measure?"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Assessment Type</Label>
                <Select value={categoryForm.assessment_type} onValueChange={(v) => setCategoryForm({ ...categoryForm, assessment_type: v })}>
                  <SelectTrigger className="input-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-white/10">
                    <SelectItem value="rating">Rating Scale (1-5, 1-10, etc.)</SelectItem>
                    <SelectItem value="checkbox">Checkbox (Pass/Fail)</SelectItem>
                    <SelectItem value="text">Text Input (Notes/Comments)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {categoryForm.assessment_type === 'rating' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Min Scale</Label>
                    <Input
                      type="number"
                      value={categoryForm.scale_min}
                      onChange={(e) => setCategoryForm({ ...categoryForm, scale_min: parseInt(e.target.value) || 1 })}
                      className="input-dark"
                      min={0}
                      max={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Max Scale</Label>
                    <Input
                      type="number"
                      value={categoryForm.scale_max}
                      onChange={(e) => setCategoryForm({ ...categoryForm, scale_max: parseInt(e.target.value) || 5 })}
                      className="input-dark"
                      min={1}
                      max={10}
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Weight (for scoring)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={categoryForm.weight}
                    onChange={(e) => setCategoryForm({ ...categoryForm, weight: parseFloat(e.target.value) || 1 })}
                    className="input-dark"
                    min={0.1}
                    max={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Display Order</Label>
                  <Input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                    className="input-dark"
                    min={0}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="category-required"
                    checked={categoryForm.is_required}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_required: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <Label htmlFor="category-required" className="text-zinc-400 cursor-pointer">Required (must be filled)</Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="category-active"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <Label htmlFor="category-active" className="text-zinc-400 cursor-pointer">Active (visible to crew)</Label>
                </div>
              </div>
              <Button
                onClick={createAssessmentCategory}
                disabled={!categoryForm.name || submitting}
                className="w-full btn-primary"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={editCategoryOpen} onOpenChange={setEditCategoryOpen}>
          <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-unbounded text-white">Edit Assessment Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Category Name *</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="input-dark"
                  placeholder="e.g., Skill Control"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Description</Label>
                <Input
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="input-dark"
                  placeholder="What does this category measure?"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Assessment Type</Label>
                <select 
                  value={categoryForm.assessment_type || 'rating'} 
                  onChange={(e) => setCategoryForm({ ...categoryForm, assessment_type: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="rating">Rating Scale (1-5, 1-10, etc.)</option>
                  <option value="checkbox">Checkbox (Pass/Fail)</option>
                  <option value="text">Text Input (Notes/Comments)</option>
                </select>
              </div>
              {(categoryForm.assessment_type === 'rating' || !categoryForm.assessment_type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Min Scale</Label>
                    <Input
                      type="number"
                      value={categoryForm.scale_min}
                      onChange={(e) => setCategoryForm({ ...categoryForm, scale_min: parseInt(e.target.value) || 1 })}
                      className="input-dark"
                      min={0}
                      max={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Max Scale</Label>
                    <Input
                      type="number"
                      value={categoryForm.scale_max}
                      onChange={(e) => setCategoryForm({ ...categoryForm, scale_max: parseInt(e.target.value) || 5 })}
                      className="input-dark"
                      min={1}
                      max={10}
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={categoryForm.weight || 1}
                    onChange={(e) => setCategoryForm({ ...categoryForm, weight: parseFloat(e.target.value) || 1 })}
                    className="input-dark"
                    min={0.1}
                    max={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Display Order</Label>
                  <Input
                    type="number"
                    value={categoryForm.display_order || 0}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                    className="input-dark"
                    min={0}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="edit-category-required"
                    checked={categoryForm.is_required !== false}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_required: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <Label htmlFor="edit-category-required" className="text-zinc-400 cursor-pointer">Required</Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="edit-category-active"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <Label htmlFor="edit-category-active" className="text-zinc-400 cursor-pointer">Active</Label>
                </div>
              </div>
              <Button
                onClick={updateAssessmentCategory}
                disabled={!categoryForm.name || submitting}
                className="w-full btn-primary"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Careers Tab */}
        {activeTab === 'careers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-semibold text-lg text-white">Career Opportunities</h2>
                <p className="text-sm text-zinc-500">Manage job postings visible to students</p>
              </div>
              <Button
                onClick={() => {
                  setCareerForm({ title: '', company: '', location: '', job_type: 'full-time', description: '', requirements: [], salary_range: '', application_url: '', brand_id: '', is_active: true });
                  setCreateCareerOpen(true);
                }}
                className="btn-primary gap-2"
                data-testid="create-career-btn"
              >
                <Plus className="w-4 h-4" />
                Add Career
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careers.map(career => (
                <div key={career.career_id} className={`telemetry-card rounded-xl p-5 ${!career.is_active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{career.title}</h3>
                      <p className="text-sm text-zinc-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {career.company}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${career.is_active ? 'bg-accent-success/20 text-accent-success' : 'bg-zinc-700 text-zinc-400'}`}>
                      {career.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{career.location}</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-white/5">{career.job_type}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{career.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCareer(career);
                        setCareerForm(career);
                        setEditCareerOpen(true);
                      }}
                      className="flex-1 border-white/10 text-zinc-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCareer(career.career_id)}
                      className="border-accent/30 text-accent hover:bg-accent/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {careers.length === 0 && (
                <div className="col-span-full telemetry-card rounded-xl p-8 text-center">
                  <Briefcase className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">No Career Postings</h3>
                  <p className="text-sm text-zinc-500 mb-4">Add job opportunities for students</p>
                  <Button onClick={() => setCreateCareerOpen(true)} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Career
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Career Dialog */}
        <Dialog open={createCareerOpen} onOpenChange={setCreateCareerOpen}>
          <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-unbounded text-white">Add Career Opportunity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Job Title *</Label>
                  <Input
                    value={careerForm.title}
                    onChange={(e) => setCareerForm(prev => ({ ...prev, title: e.target.value }))}
                    className="input-dark"
                    placeholder="e.g., Racing Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Company *</Label>
                  <Input
                    value={careerForm.company}
                    onChange={(e) => setCareerForm(prev => ({ ...prev, company: e.target.value }))}
                    className="input-dark"
                    placeholder="e.g., KX Racing"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Location</Label>
                  <Input
                    value={careerForm.location}
                    onChange={(e) => setCareerForm(prev => ({ ...prev, location: e.target.value }))}
                    className="input-dark"
                    placeholder="e.g., Chennai, India"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Job Type</Label>
                  <Select value={careerForm.job_type} onValueChange={(v) => setCareerForm(prev => ({ ...prev, job_type: v }))}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-white/10">
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Description</Label>
                <Textarea
                  value={careerForm.description}
                  onChange={(e) => setCareerForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-dark min-h-[100px]"
                  placeholder="Job description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Salary Range</Label>
                  <Input
                    value={careerForm.salary_range}
                    onChange={(e) => setCareerForm(prev => ({ ...prev, salary_range: e.target.value }))}
                    className="input-dark"
                    placeholder="e.g., ₹8-12 LPA"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Application URL</Label>
                  <Input
                    value={careerForm.application_url}
                    onChange={(e) => setCareerForm(prev => ({ ...prev, application_url: e.target.value }))}
                    className="input-dark"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={careerForm.is_active}
                  onChange={(e) => setCareerForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label className="text-zinc-400">Active (visible to students)</Label>
              </div>
              <Button onClick={createCareer} disabled={submitting} className="w-full btn-primary">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Career
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Career Dialog */}
        <Dialog open={editCareerOpen} onOpenChange={setEditCareerOpen}>
          <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-unbounded text-white">Edit Career</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Job Title *</Label>
                  <Input
                    value={careerForm.title}
                    onChange={(e) => setCareerForm(prev => ({ ...prev, title: e.target.value }))}
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Company *</Label>
                  <Input
                    value={careerForm.company}
                    onChange={(e) => setCareerForm(prev => ({ ...prev, company: e.target.value }))}
                    className="input-dark"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Location</Label>
                  <Input
                    value={careerForm.location}
                    onChange={(e) => setCareerForm(prev => ({ ...prev, location: e.target.value }))}
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Job Type</Label>
                  <Select value={careerForm.job_type} onValueChange={(v) => setCareerForm(prev => ({ ...prev, job_type: v }))}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-white/10">
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Description</Label>
                <Textarea
                  value={careerForm.description}
                  onChange={(e) => setCareerForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-dark min-h-[100px]"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={careerForm.is_active}
                  onChange={(e) => setCareerForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label className="text-zinc-400">Active</Label>
              </div>
              <Button onClick={updateCareer} disabled={submitting} className="w-full btn-primary">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Career
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-semibold text-lg text-white">Team Members</h2>
                <p className="text-sm text-zinc-500">Manage instructors and support staff displayed on the Team page</p>
              </div>
              <Button onClick={() => { setTeamMemberForm({ name: '', role: '', category: 'instructor', photo_url: '', photo_base64: '', bio: '', email: '', phone: '', display_order: teamMembers.length, is_active: true }); setCreateTeamMemberOpen(true); }} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" /> Add Team Member
              </Button>
            </div>

            {/* Instructors Section */}
            <div className="telemetry-card rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                Instructors & Tutors ({teamMembers.filter(m => m.category === 'instructor').length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.filter(m => m.category === 'instructor').map(member => (
                  <div key={member.member_id} className="bg-zinc-800/50 rounded-lg p-4 relative">
                    <div className="flex items-start gap-4">
                      {member.photo_base64 || member.photo_url ? (
                        <img src={member.photo_base64 || member.photo_url} alt={member.name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-zinc-700 flex items-center justify-center">
                          <Users className="w-8 h-8 text-zinc-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{member.name}</h4>
                        <p className="text-sm text-cyan-400">{member.role}</p>
                        {member.email && <p className="text-xs text-zinc-500 mt-1">{member.email}</p>}
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${member.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedTeamMember(member); setTeamMemberForm(member); setEditTeamMemberOpen(true); }}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-400 border-red-400/50" onClick={() => deleteTeamMember(member.member_id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {teamMembers.filter(m => m.category === 'instructor').length === 0 && (
                  <p className="text-zinc-500 col-span-full text-center py-8">No instructors added yet</p>
                )}
              </div>
            </div>

            {/* Support Staff Section */}
            <div className="telemetry-card rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                Support Staff ({teamMembers.filter(m => m.category === 'staff').length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teamMembers.filter(m => m.category === 'staff').map(member => (
                  <div key={member.member_id} className="bg-zinc-800/50 rounded-lg p-4 relative">
                    <div className="flex flex-col items-center text-center">
                      {member.photo_base64 || member.photo_url ? (
                        <img src={member.photo_base64 || member.photo_url} alt={member.name} className="w-20 h-20 rounded-lg object-cover mb-3" />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-zinc-700 flex items-center justify-center mb-3">
                          <Users className="w-10 h-10 text-zinc-500" />
                        </div>
                      )}
                      <h4 className="font-semibold text-white text-sm">{member.name}</h4>
                      <p className="text-xs text-amber-400">{member.role}</p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${member.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3 justify-center">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedTeamMember(member); setTeamMemberForm(member); setEditTeamMemberOpen(true); }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-400 border-red-400/50" onClick={() => deleteTeamMember(member.member_id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {teamMembers.filter(m => m.category === 'staff').length === 0 && (
                  <p className="text-zinc-500 col-span-full text-center py-8">No support staff added yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Team Member Dialog */}
        <Dialog open={createTeamMemberOpen} onOpenChange={setCreateTeamMemberOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Add Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400">Name *</Label>
                  <Input value={teamMemberForm.name} onChange={e => setTeamMemberForm({...teamMemberForm, name: e.target.value})} className="bg-zinc-800 border-zinc-700" placeholder="Full Name" />
                </div>
                <div>
                  <Label className="text-zinc-400">Role *</Label>
                  <Input value={teamMemberForm.role} onChange={e => setTeamMemberForm({...teamMemberForm, role: e.target.value})} className="bg-zinc-800 border-zinc-700" placeholder="e.g. Racing Instructor" />
                </div>
              </div>
              <div>
                <Label className="text-zinc-400">Category *</Label>
                <select value={teamMemberForm.category} onChange={e => setTeamMemberForm({...teamMemberForm, category: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white">
                  <option value="instructor">Instructor / Tutor</option>
                  <option value="staff">Support Staff</option>
                </select>
              </div>
              <div>
                <Label className="text-zinc-400">Photo</Label>
                <Input type="file" accept="image/*" onChange={handleTeamMemberPhotoUpload} className="bg-zinc-800 border-zinc-700" />
                {teamMemberForm.photo_base64 && (
                  <img src={teamMemberForm.photo_base64} alt="Preview" className="mt-2 w-24 h-24 rounded-lg object-cover" />
                )}
              </div>
              <div>
                <Label className="text-zinc-400">Bio</Label>
                <textarea value={teamMemberForm.bio} onChange={e => setTeamMemberForm({...teamMemberForm, bio: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white min-h-[100px]" placeholder="Short biography..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400">Email</Label>
                  <Input value={teamMemberForm.email} onChange={e => setTeamMemberForm({...teamMemberForm, email: e.target.value})} className="bg-zinc-800 border-zinc-700" placeholder="email@kotlerx.com" />
                </div>
                <div>
                  <Label className="text-zinc-400">Phone</Label>
                  <Input value={teamMemberForm.phone} onChange={e => setTeamMemberForm({...teamMemberForm, phone: e.target.value})} className="bg-zinc-800 border-zinc-700" placeholder="+91..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400">Display Order</Label>
                  <Input type="number" value={teamMemberForm.display_order} onChange={e => setTeamMemberForm({...teamMemberForm, display_order: parseInt(e.target.value) || 0})} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={teamMemberForm.is_active} onChange={e => setTeamMemberForm({...teamMemberForm, is_active: e.target.checked})} className="w-4 h-4" />
                  <Label className="text-zinc-400">Active (visible on website)</Label>
                </div>
              </div>
              <Button onClick={createTeamMember} disabled={submitting} className="w-full btn-primary">
                {submitting ? 'Adding...' : 'Add Team Member'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Team Member Dialog */}
        <Dialog open={editTeamMemberOpen} onOpenChange={setEditTeamMemberOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400">Name *</Label>
                  <Input value={teamMemberForm.name} onChange={e => setTeamMemberForm({...teamMemberForm, name: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label className="text-zinc-400">Role *</Label>
                  <Input value={teamMemberForm.role} onChange={e => setTeamMemberForm({...teamMemberForm, role: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                </div>
              </div>
              <div>
                <Label className="text-zinc-400">Category *</Label>
                <select value={teamMemberForm.category} onChange={e => setTeamMemberForm({...teamMemberForm, category: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white">
                  <option value="instructor">Instructor / Tutor</option>
                  <option value="staff">Support Staff</option>
                </select>
              </div>
              <div>
                <Label className="text-zinc-400">Photo</Label>
                <Input type="file" accept="image/*" onChange={handleTeamMemberPhotoUpload} className="bg-zinc-800 border-zinc-700" />
                {(teamMemberForm.photo_base64 || teamMemberForm.photo_url) && (
                  <img src={teamMemberForm.photo_base64 || teamMemberForm.photo_url} alt="Preview" className="mt-2 w-24 h-24 rounded-lg object-cover" />
                )}
              </div>
              <div>
                <Label className="text-zinc-400">Bio</Label>
                <textarea value={teamMemberForm.bio || ''} onChange={e => setTeamMemberForm({...teamMemberForm, bio: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white min-h-[100px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400">Email</Label>
                  <Input value={teamMemberForm.email || ''} onChange={e => setTeamMemberForm({...teamMemberForm, email: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label className="text-zinc-400">Phone</Label>
                  <Input value={teamMemberForm.phone || ''} onChange={e => setTeamMemberForm({...teamMemberForm, phone: e.target.value})} className="bg-zinc-800 border-zinc-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400">Display Order</Label>
                  <Input type="number" value={teamMemberForm.display_order || 0} onChange={e => setTeamMemberForm({...teamMemberForm, display_order: parseInt(e.target.value) || 0})} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={teamMemberForm.is_active} onChange={e => setTeamMemberForm({...teamMemberForm, is_active: e.target.checked})} className="w-4 h-4" />
                  <Label className="text-zinc-400">Active</Label>
                </div>
              </div>
              <Button onClick={updateTeamMember} disabled={submitting} className="w-full btn-primary">
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Data Export Tab */}
        {activeTab === 'exports' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-unbounded font-semibold text-lg text-white">Data Export</h2>
              <p className="text-sm text-zinc-500">Export data to Google Sheets for reporting and analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Students Export */}
              <div className="telemetry-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Students</h3>
                    <p className="text-sm text-zinc-500">{students.length} records</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Export all student profiles including contact info, program enrollment, and NFC cards.
                </p>
                <Button
                  onClick={() => exportData('students')}
                  disabled={exportLoading.students}
                  className="w-full btn-primary gap-2"
                >
                  {exportLoading.students ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  Export Students
                </Button>
              </div>

              {/* Assessments Export */}
              <div className="telemetry-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Assessments</h3>
                    <p className="text-sm text-zinc-500">NFC verified ratings</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Export all assessment records with ratings, crew confirmations, and timestamps.
                </p>
                <Button
                  onClick={() => exportData('assessments')}
                  disabled={exportLoading.assessments}
                  className="w-full btn-secondary gap-2"
                >
                  {exportLoading.assessments ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  Export Assessments
                </Button>
              </div>

              {/* Attendance Export */}
              <div className="telemetry-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-success/20 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-accent-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Attendance</h3>
                    <p className="text-sm text-zinc-500">Session records</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Export all NFC attendance records with session info, student details, and timestamps.
                </p>
                <Button
                  onClick={() => exportData('attendance')}
                  disabled={exportLoading.attendance}
                  variant="outline"
                  className="w-full border-accent-success/50 text-accent-success hover:bg-accent-success/10 gap-2"
                >
                  {exportLoading.attendance ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  Export Attendance
                </Button>
              </div>
            </div>

            {/* Google Sheets Setup Info */}
            <div className="telemetry-card rounded-xl p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Google Sheets Auto-Sync Setup
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                To enable automatic sync to Google Sheets, configure the following environment variables:
              </p>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-zinc-400">
                <p>GOOGLE_SHEETS_CREDENTIALS={"{"}"type":"service_account",...{"}"}</p>
                <p>GOOGLE_SPREADSHEET_ID=your_spreadsheet_id</p>
              </div>
              <p className="text-xs text-zinc-500 mt-3">
                Without Google Sheets configured, exports will display data preview in the app.
              </p>
            </div>
          </div>
        )}

        {/* NFC Cards Tab */}
        {activeTab === 'nfc' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-semibold text-lg text-white">NFC Card Management</h2>
                <p className="text-sm text-zinc-500">Issue, replace, and manage NFC cards for students and staff</p>
              </div>
              <Button
                onClick={() => setIssueNfcOpen(true)}
                className="btn-primary gap-2"
                data-testid="issue-nfc-btn"
              >
                <Plus className="w-4 h-4" />
                Issue NFC Card
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="telemetry-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-unbounded font-bold text-white">{nfcCards.length}</p>
                    <p className="text-xs text-zinc-500">Active Cards</p>
                  </div>
                </div>
              </div>
              <div className="telemetry-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-unbounded font-bold text-white">{nfcCards.filter(n => n.user_type === 'student').length}</p>
                    <p className="text-xs text-zinc-500">Student Cards</p>
                  </div>
                </div>
              </div>
              <div className="telemetry-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-unbounded font-bold text-white">{nfcCards.filter(n => n.user_type !== 'student').length}</p>
                    <p className="text-xs text-zinc-500">Staff Cards</p>
                  </div>
                </div>
              </div>
              <div className="telemetry-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-warning/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-accent-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-unbounded font-bold text-white">{pendingDeletions.length}</p>
                    <p className="text-xs text-zinc-500">Pending Deletion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Deletions Warning */}
            {pendingDeletions.length > 0 && (
              <div className="p-4 rounded-lg bg-accent-warning/10 border border-accent-warning/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent-warning mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-accent-warning mb-2">Pending NFC Deletions</h4>
                    <div className="space-y-2">
                      {pendingDeletions.map(p => (
                        <div key={p.old_nfc_id} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">
                            <span className="font-mono text-accent-warning">{p.old_nfc_id}</span>
                            {' → '}
                            <span className="font-mono text-accent-success">{p.new_nfc_id}</span>
                            <span className="text-zinc-500 ml-2">({p.days_remaining} days remaining)</span>
                          </span>
                          {p.is_due && (
                            <Button
                              size="sm"
                              onClick={() => confirmNfcDeletion(p.old_nfc_id)}
                              className="bg-accent/20 text-accent hover:bg-accent/30"
                            >
                              Confirm Deletion
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={nfcSearchQuery}
                onChange={(e) => setNfcSearchQuery(e.target.value)}
                className="input-dark pl-10"
                placeholder="Search by NFC ID, name, or email..."
                data-testid="nfc-search-input"
              />
            </div>

            {/* NFC Cards Table */}
            <div className="telemetry-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">NFC Card ID</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">User</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Type</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Status</th>
                      <th className="text-right p-4 text-xs font-mono text-zinc-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNfcCards.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500">
                          {nfcSearchQuery ? 'No NFC cards matching your search' : 'No NFC cards issued yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredNfcCards.map((nfc) => (
                        <tr key={nfc.nfc_card_id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <span className="font-mono text-primary font-semibold">{nfc.nfc_card_id}</span>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{nfc.name || 'Unknown'}</p>
                              <p className="text-xs text-zinc-500">{nfc.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-mono ${
                              nfc.user_type === 'student' ? 'bg-secondary/20 text-secondary' :
                              nfc.user_type === 'trainer' ? 'bg-accent/20 text-accent' :
                              'bg-primary/20 text-primary'
                            }`}>
                              {nfc.user_type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              nfc.status === 'active' ? 'bg-accent-success/20 text-accent-success' :
                              'bg-zinc-500/20 text-zinc-400'
                            }`}>
                              {nfc.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReplaceDialog(nfc.nfc_card_id)}
                                className="border-white/10 text-white hover:bg-white/5 gap-1"
                                title="Replace Card"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Replace
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => revokeNfcCard(nfc.nfc_card_id)}
                                className="border-accent/30 text-accent hover:bg-accent/10"
                                title="Revoke Card"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                About NFC Cards
              </h4>
              <p className="text-sm text-zinc-400">
                NFC cards allow students and staff to quickly log in by tapping their card on an NFC reader. 
                When replacing a card, the old card remains active for 10 days to allow for verification. 
                Revoked cards are immediately deactivated and cannot be used for login.
              </p>
            </div>
          </div>
        )}

        {/* NFC Users Tab */}
        {activeTab === 'nfc-users' && (
          <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-bold text-xl text-white">NFC User Management</h2>
                <p className="text-sm text-zinc-500">Bulk upload and manage NFC login credentials</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={downloadNfcTemplate}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 gap-2"
                  data-testid="download-nfc-template"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
                <Button
                  onClick={() => setNfcUploadOpen(true)}
                  className="btn-primary gap-2"
                  data-testid="upload-nfc-users"
                >
                  <Upload className="w-4 h-4" />
                  Upload Users
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                value={nfcUserSearch}
                onChange={(e) => {
                  setNfcUserSearch(e.target.value);
                  fetchNfcUsers(e.target.value);
                }}
                className="input-dark pl-11"
                placeholder="Search by NFC ID, Name, Mobile, or Email..."
              />
            </div>

            {/* NFC Users Table */}
            <div className="telemetry-card rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">NFC ID</th>
                    <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Name</th>
                    <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Mobile</th>
                    <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Role</th>
                    <th className="text-center p-4 text-xs font-mono text-zinc-500 uppercase">Password Changed</th>
                    <th className="text-center p-4 text-xs font-mono text-zinc-500 uppercase">Status</th>
                    <th className="text-center p-4 text-xs font-mono text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {nfcUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <KeyRound className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500">No NFC users found</p>
                        <p className="text-xs text-zinc-600 mt-1">Upload an Excel file to add NFC users</p>
                      </td>
                    </tr>
                  ) : (
                    nfcUsers.map(user => (
                      <tr key={user.nfc_id} className="border-t border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <span className="font-mono text-primary">{user.nfc_id}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-white">{user.name}</p>
                          {user.email && <p className="text-xs text-zinc-500">{user.email}</p>}
                        </td>
                        <td className="p-4 text-zinc-300">{user.mobile || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-mono ${
                            user.role === 'admin' ? 'bg-accent/20 text-accent' :
                            user.role === 'brand_head' ? 'bg-purple-500/20 text-purple-400' :
                            user.role === 'trainer' ? 'bg-secondary/20 text-secondary' :
                            'bg-primary/20 text-primary'
                          }`}>
                            {user.role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {user.password_changed ? (
                            <span className="text-accent-success">✓ Yes</span>
                          ) : (
                            <span className="text-zinc-500">Default</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleNfcUserStatus(user.nfc_id)}
                            className={`px-2 py-1 rounded text-xs ${
                              user.is_active 
                                ? 'bg-accent-success/20 text-accent-success' 
                                : 'bg-zinc-500/20 text-zinc-400'
                            }`}
                          >
                            {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedNfcUser(user);
                                setResetPasswordOpen(true);
                              }}
                              className="border-white/10 text-white hover:bg-white/5"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Info Card */}
            <div className="telemetry-card rounded-xl p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-secondary" />
                How NFC Login Works
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-zinc-400">
                <div>
                  <p className="text-white font-medium mb-1">1. Upload Users</p>
                  <p>Download the Excel template, fill in NFC IDs and user details, then upload.</p>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">2. Default Password</p>
                  <p>All uploaded users get default password <span className="font-mono text-primary">NFC1234</span></p>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">3. First Login</p>
                  <p>Users are prompted to change their password on first login (optional).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="telemetry-card rounded-xl p-6">
              <h2 className="font-unbounded font-semibold text-lg text-white mb-2">University Assessment Reports</h2>
              <p className="text-zinc-400 text-sm mb-6">Generate and download assessment reports for university/college partners</p>
              
              {/* Quick Reports */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Weekly Report</h3>
                      <p className="text-xs text-zinc-500">Current week assessment data</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => downloadReport('weekly')}
                    disabled={reportLoading}
                    className="w-full btn-primary gap-2"
                    data-testid="download-weekly-report"
                  >
                    {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download Weekly
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Monthly Report</h3>
                      <p className="text-xs text-zinc-500">Current month summary</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => downloadReport('monthly')}
                    disabled={reportLoading}
                    className="w-full bg-secondary text-black hover:bg-secondary/90 gap-2"
                    data-testid="download-monthly-report"
                  >
                    {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download Monthly
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">All Students</h3>
                      <p className="text-xs text-zinc-500">Complete assessment data</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => downloadReport('weekly')}
                    disabled={reportLoading}
                    variant="outline"
                    className="w-full border-accent/30 text-accent hover:bg-accent/10 gap-2"
                    data-testid="download-all-report"
                  >
                    {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download All
                  </Button>
                </div>
              </div>

              {/* Batch Reports */}
              <h3 className="font-semibold text-white mb-4">Batch Reports</h3>
              {batches.length === 0 ? (
                <p className="text-zinc-500 text-sm">No batches created yet. Create a batch to generate batch-specific reports.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Batch ID</th>
                        <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Program</th>
                        <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Students</th>
                        <th className="text-left p-3 text-xs font-mono text-zinc-500 uppercase">Status</th>
                        <th className="text-right p-3 text-xs font-mono text-zinc-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((batch) => {
                        const program = programs.find(p => p.program_id === batch.program_id);
                        return (
                          <tr key={batch.batch_id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-3 font-mono text-primary text-sm">{batch.batch_id}</td>
                            <td className="p-3 text-white">{program?.name || 'Unknown'}</td>
                            <td className="p-3 text-zinc-400">{batch.students?.length || 0}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                batch.status === 'completed' ? 'bg-accent-success/20 text-accent-success' :
                                batch.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-zinc-500/20 text-zinc-400'
                              }`}>{batch.status}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadReport('batch', batch.batch_id)}
                                  disabled={reportLoading}
                                  className="border-white/10 text-white hover:bg-white/5 gap-1"
                                  data-testid={`batch-report-${batch.batch_id}`}
                                >
                                  <Download className="w-3 h-3" />
                                  Report
                                </Button>
                                {batch.status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    onClick={() => downloadCompletionReport(batch.batch_id)}
                                    disabled={reportLoading}
                                    className="btn-primary gap-1"
                                    data-testid={`complete-batch-${batch.batch_id}`}
                                  >
                                    <FileCheck className="w-3 h-3" />
                                    Complete & Report
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Report Contents Info */}
              <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white mb-2">Report Contents (Excel Format)</h4>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Student ID, Name, Email, Mobile, NFC Card ID</li>
                  <li>• Attendance Sessions & Percentage</li>
                  <li>• Assessment Ratings: Skill Control, Discipline, Safety Awareness, Execution, Teamwork</li>
                  <li>• Overall Rating & Certificate Status</li>
                  <li>• Emergency Contact & Medical Information</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* CMS & Settings Tab */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            {/* Email Settings */}
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-unbounded font-semibold text-lg text-white">University Email Settings</h2>
                  <p className="text-sm text-zinc-500">Configure email for automated report delivery</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">University Email Address</Label>
                    <Input
                      type="email"
                      value={cmsSettings.university_email || ''}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, university_email: e.target.value })}
                      placeholder="university@example.edu"
                      className="input-dark"
                      data-testid="university-email-input"
                    />
                    <p className="text-xs text-zinc-500">Reports will be sent to this email address</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={saveCmsSettings}
                      disabled={submitting}
                      className="btn-primary gap-2"
                      data-testid="save-email-settings-btn"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Settings
                    </Button>
                    <Button
                      onClick={sendTestEmail}
                      disabled={emailLoading || !cmsSettings.university_email}
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5 gap-2"
                      data-testid="test-email-btn"
                    >
                      {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Test Email
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Quick Email Reports</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => sendReportEmail('weekly')}
                      disabled={emailLoading || !cmsSettings.university_email}
                      variant="outline"
                      className="w-full justify-start border-white/10 text-white hover:bg-white/5 gap-2"
                      data-testid="email-weekly-btn"
                    >
                      <Mail className="w-4 h-4 text-primary" />
                      Email Weekly Report
                    </Button>
                    <Button
                      onClick={() => sendReportEmail('monthly')}
                      disabled={emailLoading || !cmsSettings.university_email}
                      variant="outline"
                      className="w-full justify-start border-white/10 text-white hover:bg-white/5 gap-2"
                      data-testid="email-monthly-btn"
                    >
                      <Mail className="w-4 h-4 text-secondary" />
                      Email Monthly Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Settings */}
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold">KX</span>
                </div>
                <div>
                  <h2 className="font-unbounded font-semibold text-lg text-white">Logo Settings</h2>
                  <p className="text-sm text-zinc-500">Upload logo image or use text logo</p>
                </div>
              </div>
              
              {/* Logo Image Upload */}
              <div className="mb-6 p-4 border border-dashed border-white/20 rounded-lg">
                <Label className="text-zinc-400 mb-2 block">Upload Logo Image (PNG, JPG - Max 2MB)</Label>
                
                <ImageUploadWithZoom
                  value={cmsSettings.logo_image}
                  onChange={async (base64) => {
                    try {
                      setSubmitting(true);
                      const response = await axios.post(`${API}/cms/logo/upload-base64`, 
                        { image_base64: base64 },
                        {
                          headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          withCredentials: true
                        }
                      );
                      setCmsSettings({ ...cmsSettings, logo_image: response.data.logo_url });
                      toast.success('Logo uploaded!');
                    } catch (error) {
                      toast.error(error.response?.data?.detail || 'Failed to upload logo');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  onRemove={async () => {
                    try {
                      await axios.delete(`${API}/cms/logo`, {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true
                      });
                      setCmsSettings({ ...cmsSettings, logo_image: null });
                      toast.success('Logo removed');
                    } catch (error) {
                      toast.error('Failed to remove logo');
                    }
                  }}
                  previewSize="h-16 w-32"
                  label="Upload Logo"
                />
              </div>

              {/* Text Logo Fallback */}
              <div className={cmsSettings.logo_image ? 'opacity-50' : ''}>
                <p className="text-xs text-zinc-500 mb-3">Or use text logo (shown if no image uploaded):</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Logo Part 1 (White)</Label>
                    <Input
                      value={cmsSettings.logo_text_1 || 'KX'}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, logo_text_1: e.target.value })}
                      className="input-dark text-2xl font-bold"
                      placeholder="KX"
                      disabled={!!cmsSettings.logo_image}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Logo Part 2 (Cyan)</Label>
                    <Input
                      value={cmsSettings.logo_text_2 || 'GRID'}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, logo_text_2: e.target.value })}
                      className="input-dark text-2xl font-bold text-primary"
                      placeholder="GRID"
                      disabled={!!cmsSettings.logo_image}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-background rounded-lg mb-4">
                  <p className="text-xs text-zinc-500 mb-2">Text Preview:</p>
                  <span className="text-2xl font-bold text-white">{cmsSettings.logo_text_1 || 'KX'}</span>
                  <span className="text-2xl font-bold text-primary">{cmsSettings.logo_text_2 || 'GRID'}</span>
                </div>
                
                <Button
                  onClick={saveCmsSettings}
                  disabled={submitting || !!cmsSettings.logo_image}
                  className="btn-primary gap-2"
                  data-testid="save-logo-btn"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Text Logo
                </Button>
              </div>
            </div>

            {/* Theme Customization */}
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-unbounded font-semibold text-lg text-white">Theme Customization</h2>
                  <p className="text-sm text-zinc-500">Customize platform colors and fonts</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Colors */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Colors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-zinc-400 text-xs">Primary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSettings.primary_color}
                          onChange={(e) => setThemeSettings({ ...themeSettings, primary_color: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={themeSettings.primary_color}
                          onChange={(e) => setThemeSettings({ ...themeSettings, primary_color: e.target.value })}
                          className="input-dark font-mono text-xs flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-zinc-400 text-xs">Secondary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSettings.secondary_color}
                          onChange={(e) => setThemeSettings({ ...themeSettings, secondary_color: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={themeSettings.secondary_color}
                          onChange={(e) => setThemeSettings({ ...themeSettings, secondary_color: e.target.value })}
                          className="input-dark font-mono text-xs flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-zinc-400 text-xs">Accent</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSettings.accent_color}
                          onChange={(e) => setThemeSettings({ ...themeSettings, accent_color: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={themeSettings.accent_color}
                          onChange={(e) => setThemeSettings({ ...themeSettings, accent_color: e.target.value })}
                          className="input-dark font-mono text-xs flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-zinc-400 text-xs">Background</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSettings.background_color}
                          onChange={(e) => setThemeSettings({ ...themeSettings, background_color: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={themeSettings.background_color}
                          onChange={(e) => setThemeSettings({ ...themeSettings, background_color: e.target.value })}
                          className="input-dark font-mono text-xs flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fonts */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Typography</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-zinc-400 text-xs">Heading Font</Label>
                      <select
                        value={themeSettings.heading_font}
                        onChange={(e) => setThemeSettings({ ...themeSettings, heading_font: e.target.value })}
                        className="input-dark w-full"
                      >
                        <option value="Unbounded">Unbounded (Default)</option>
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Oswald">Oswald</option>
                        <option value="Raleway">Raleway</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-zinc-400 text-xs">Body Font</Label>
                      <select
                        value={themeSettings.body_font}
                        onChange={(e) => setThemeSettings({ ...themeSettings, body_font: e.target.value })}
                        className="input-dark w-full"
                      >
                        <option value="Inter">Inter (Default)</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Source Sans Pro">Source Sans Pro</option>
                        <option value="Nunito">Nunito</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-zinc-400 text-xs">Border Radius</Label>
                      <select
                        value={themeSettings.border_radius}
                        onChange={(e) => setThemeSettings({ ...themeSettings, border_radius: e.target.value })}
                        className="input-dark w-full"
                      >
                        <option value="0">Sharp (0)</option>
                        <option value="0.25rem">Subtle (0.25rem)</option>
                        <option value="0.5rem">Rounded (0.5rem)</option>
                        <option value="0.75rem">Default (0.75rem)</option>
                        <option value="1rem">Large (1rem)</option>
                        <option value="1.5rem">Extra Large (1.5rem)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 rounded-lg border border-white/10" style={{ backgroundColor: themeSettings.surface_color }}>
                <p className="text-xs text-zinc-500 mb-3">Preview</p>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded text-sm font-semibold text-white" style={{ backgroundColor: themeSettings.primary_color }}>Primary</div>
                  <div className="px-4 py-2 rounded text-sm font-semibold text-white" style={{ backgroundColor: themeSettings.secondary_color }}>Secondary</div>
                  <div className="px-4 py-2 rounded text-sm font-semibold text-white" style={{ backgroundColor: themeSettings.accent_color }}>Accent</div>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  onClick={saveThemeSettings}
                  disabled={submitting}
                  className="btn-primary gap-2"
                  data-testid="save-theme-btn"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Theme
                </Button>
              </div>
            </div>

            {/* Landing Page Content */}
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-unbounded font-semibold text-lg text-white">Landing Page Content</h2>
                  <p className="text-sm text-zinc-500">Edit public landing page text and headlines</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Headline 1</Label>
                  <Input
                    value={landingContent.hero_headline_1 || ''}
                    onChange={(e) => setLandingContent({ ...landingContent, hero_headline_1: e.target.value })}
                    className="input-dark"
                    data-testid="headline-1-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-400">Headline 2</Label>
                  <Input
                    value={landingContent.hero_headline_2 || ''}
                    onChange={(e) => setLandingContent({ ...landingContent, hero_headline_2: e.target.value })}
                    className="input-dark"
                    data-testid="headline-2-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-400">Headline 3 (NFC + AI)</Label>
                  <Input
                    value={landingContent.hero_headline_3 || ''}
                    onChange={(e) => setLandingContent({ ...landingContent, hero_headline_3: e.target.value })}
                    className="input-dark"
                    data-testid="headline-3-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-400">Hero Description</Label>
                  <textarea
                    value={landingContent.hero_description || ''}
                    onChange={(e) => setLandingContent({ ...landingContent, hero_description: e.target.value })}
                    className="input-dark w-full h-24 resize-none"
                    data-testid="hero-description-input"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs">Students Trained</Label>
                    <Input
                      value={landingContent.stats?.students_trained || ''}
                      onChange={(e) => setLandingContent({ 
                        ...landingContent, 
                        stats: { ...landingContent.stats, students_trained: e.target.value }
                      })}
                      className="input-dark"
                      placeholder="500+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs">Programs</Label>
                    <Input
                      value={landingContent.stats?.programs || ''}
                      onChange={(e) => setLandingContent({ 
                        ...landingContent, 
                        stats: { ...landingContent.stats, programs: e.target.value }
                      })}
                      className="input-dark"
                      placeholder="10+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs">Placement Rate</Label>
                    <Input
                      value={landingContent.stats?.placement_rate || ''}
                      onChange={(e) => setLandingContent({ 
                        ...landingContent, 
                        stats: { ...landingContent.stats, placement_rate: e.target.value }
                      })}
                      className="input-dark"
                      placeholder="95%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs">Industry Partners</Label>
                    <Input
                      value={landingContent.stats?.industry_partners || ''}
                      onChange={(e) => setLandingContent({ 
                        ...landingContent, 
                        stats: { ...landingContent.stats, industry_partners: e.target.value }
                      })}
                      className="input-dark"
                      placeholder="20+"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={saveLandingContent}
                  disabled={submitting}
                  className="btn-primary gap-2"
                  data-testid="save-landing-btn"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Landing Page
                </Button>
              </div>
            </div>

            {/* Media Gallery Section */}
            <div className="telemetry-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Image className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="font-unbounded font-semibold text-lg text-white">Media Gallery</h2>
                    <p className="text-sm text-zinc-500">Add photos and videos for Public view or Students only</p>
                  </div>
                </div>
                <Button
                  onClick={() => setAddMediaOpen(true)}
                  className="btn-primary gap-2"
                  data-testid="add-media-btn"
                >
                  <Plus className="w-4 h-4" />
                  Add Media
                </Button>
              </div>

              {/* Gallery by Category */}
              {['public', 'student'].map(category => {
                const categoryMedia = mediaGallery.filter(m => m.category === category);
                const categoryLabels = {
                  public: { label: 'Public Gallery (Landing Page)', color: 'text-primary', bgColor: 'bg-primary/10', desc: 'Visible to everyone' },
                  student: { label: 'Student Gallery', color: 'text-secondary', bgColor: 'bg-secondary/10', desc: 'Visible only to logged-in students' }
                };
                const catInfo = categoryLabels[category];
                
                return (
                  <div key={category} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono uppercase ${catInfo.bgColor} ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                      <span className="text-xs text-zinc-500">({categoryMedia.length} items)</span>
                      <span className="text-xs text-zinc-600">• {catInfo.desc}</span>
                    </div>
                    
                    {categoryMedia.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {categoryMedia.map(item => (
                          <div 
                            key={item.media_id} 
                            className={`relative rounded-lg overflow-hidden aspect-square group ${!item.is_visible ? 'opacity-50' : ''}`}
                          >
                            {item.media_type === 'video' ? (
                              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                  <Play className="w-5 h-5 text-white" />
                                </div>
                                <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-1 rounded">Video</span>
                              </div>
                            ) : (
                              <img 
                                src={item.media_base64 || item.url} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute top-2 left-2 right-2">
                              <p className="text-xs text-white bg-black/50 px-1 rounded truncate">{item.title}</p>
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleMediaVisibility(item.media_id, item.is_visible)}
                                className="h-8 w-8 p-0 border-white/30"
                              >
                                {item.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteMediaItem(item.media_id)}
                                className="h-8 w-8 p-0 border-accent/30 text-accent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                              <p className="text-xs text-white truncate">{item.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-white/10 rounded-lg p-6 text-center">
                        <Image className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">No {category} media yet</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setMediaForm(prev => ({ ...prev, category }));
                            setAddMediaOpen(true);
                          }}
                          className="mt-2 text-primary"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add {category} media
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Program Management Tip */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Program Management
              </h4>
              <p className="text-sm text-zinc-400">
                To edit program details, next batch dates, and registration status, go to the <strong>Programs</strong> tab. 
                You can open/close registration and set next batch dates that will be displayed on the public programs page.
              </p>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Lead Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Leads', value: leadStats?.total || 0, color: 'text-white' },
                { label: 'New', value: leadStats?.new || 0, color: 'text-primary' },
                { label: 'Contacted', value: leadStats?.contacted || 0, color: 'text-secondary' },
                { label: 'Converted', value: leadStats?.converted || 0, color: 'text-accent-success' },
              ].map((stat, i) => (
                <div key={i} className="telemetry-card rounded-xl p-4 text-center">
                  <div className={`font-unbounded font-bold text-2xl ${stat.color}`}>{stat.value}</div>
                  <span className="text-xs text-zinc-500 uppercase">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.get(`${API}/admin/leads/export`, {
                      headers: { Authorization: `Bearer ${token}` },
                      responseType: 'blob',
                      withCredentials: true
                    });
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `kotlerx_leads_${new Date().toISOString().slice(0,10)}.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    toast.success('Leads exported successfully!');
                  } catch (error) {
                    toast.error('Failed to export leads');
                  }
                }}
                className="btn-primary gap-2"
                data-testid="export-leads-btn"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </Button>
            </div>

            {/* Leads Table */}
            <div className="telemetry-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Name</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Location</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Mobile</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Program Interest</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Fee Type</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Status</th>
                      <th className="text-left p-4 text-xs font-mono text-zinc-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-zinc-500">
                          No leads yet. Leads will appear here when someone fills out the program interest form.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.lead_id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4 text-white font-inter">{lead.name}</td>
                          <td className="p-4 text-zinc-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {lead.location}
                          </td>
                          <td className="p-4 text-zinc-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.mobile}
                          </td>
                          <td className="p-4 text-primary">{lead.program_interest}</td>
                          <td className="p-4">
                            <span className={`flex items-center gap-1 ${
                              lead.fee_type === 'cash' ? 'text-accent-success' : 'text-secondary'
                            }`}>
                              {lead.fee_type === 'cash' ? <CreditCard className="w-3 h-3" /> : <Landmark className="w-3 h-3" />}
                              {lead.fee_type}
                            </span>
                          </td>
                          <td className="p-4">
                            <Select
                              value={lead.status}
                              onValueChange={(v) => updateLeadStatus(lead.lead_id, v)}
                            >
                              <SelectTrigger className={`h-8 w-28 text-xs ${
                                lead.status === 'new' ? 'bg-primary/20 text-primary border-primary/30' :
                                lead.status === 'contacted' ? 'bg-secondary/20 text-secondary border-secondary/30' :
                                lead.status === 'converted' ? 'bg-accent-success/20 text-accent-success border-accent-success/30' :
                                'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                              }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-surface border-white/10">
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="dropped">Dropped</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4 text-xs text-zinc-500">
                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* KXCraft Products Tab */}
        {activeTab === 'kxcraft' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded text-2xl text-white">KXCraft Products</h2>
                <p className="text-sm text-zinc-500">Manage products shown on the KXCraft page</p>
              </div>
              <Button onClick={() => { setKxcraftForm({ name: '', category: 'motorsport', price: '', description: '', image_url: '', image_base64: '', badge: '', rating: 5.0, is_visible: true, order: 0, external_link: '' }); setCreateKxcraftOpen(true); }} className="btn-primary gap-2" data-testid="add-kxcraft-btn">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </div>

            {kxcraftProducts.length === 0 ? (
              <div className="text-center py-12 telemetry-card rounded-xl">
                <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No products yet. Add your first KXCraft product.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kxcraftProducts.map(product => (
                  <div key={product.product_id} className="telemetry-card rounded-xl overflow-hidden" data-testid={`admin-product-${product.product_id}`}>
                    <div className="aspect-video bg-zinc-900 relative">
                      {(product.image_base64 || product.image_url) ? (
                        <img src={product.image_base64 || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-10 h-10 text-zinc-700" />
                        </div>
                      )}
                      {product.badge && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{product.badge}</span>
                      )}
                      {!product.is_visible && (
                        <span className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full">Hidden</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm mb-1">{product.name}</h3>
                      <p className="text-xs text-zinc-500 mb-2 line-clamp-1">{product.description || 'No description'}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-amber-400 font-bold">₹{product.price}</span>
                        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded">{product.category}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-white/10 text-white text-xs" onClick={() => {
                          setSelectedKxcraftProduct(product);
                          setKxcraftForm({
                            name: product.name, category: product.category, price: product.price,
                            description: product.description || '', image_url: product.image_url || '',
                            image_base64: product.image_base64 || '', badge: product.badge || '',
                            rating: product.rating || 5.0, is_visible: product.is_visible !== false,
                            order: product.order || 0, external_link: product.external_link || ''
                          });
                          setEditKxcraftOpen(true);
                        }} data-testid={`edit-product-${product.product_id}`}>
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 text-xs" onClick={() => deleteKxcraftProduct(product.product_id)} data-testid={`delete-product-${product.product_id}`}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Edit Student</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Full Name</Label>
                <Input
                  value={selectedStudent.full_name || ''}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, full_name: e.target.value })}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Mobile</Label>
                <Input
                  value={selectedStudent.mobile || ''}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, mobile: e.target.value })}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Status</Label>
                <Select
                  value={selectedStudent.status}
                  onValueChange={(v) => setSelectedStudent({ ...selectedStudent, status: v })}
                >
                  <SelectTrigger className="input-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-white/10">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={updateStudent} disabled={submitting} className="w-full btn-primary">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Program Dialog */}
      <Dialog open={createProgramOpen} onOpenChange={setCreateProgramOpen}>
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
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Program Type</Label>
              <Select
                value={programForm.program_type}
                onValueChange={(v) => setProgramForm({ ...programForm, program_type: v })}
              >
                <SelectTrigger className="input-dark">
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
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Duration (weeks)</Label>
                <Input
                  type="text"
                  value={programForm.duration_weeks}
                  onChange={(e) => setProgramForm({ ...programForm, duration_weeks: e.target.value })}
                  className="input-dark"
                  placeholder="e.g., 4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Batch Size</Label>
                <Input
                  type="text"
                  value={programForm.batch_size}
                  onChange={(e) => setProgramForm({ ...programForm, batch_size: e.target.value })}
                  className="input-dark"
                  placeholder="e.g., 20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Program Highlights (shown in public view)</Label>
              <div className="space-y-2">
                {programForm.highlights.map((highlight, idx) => (
                  <Input
                    key={idx}
                    value={highlight}
                    onChange={(e) => {
                      const newHighlights = [...programForm.highlights];
                      newHighlights[idx] = e.target.value;
                      setProgramForm({ ...programForm, highlights: newHighlights });
                    }}
                    className="input-dark"
                    placeholder={`Highlight ${idx + 1} (e.g., Track Training)`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Assign to Brand (optional)</Label>
              <select
                value={programForm.brand_id}
                onChange={(e) => setProgramForm({ ...programForm, brand_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- No Brand (General) --</option>
                {brands.map(b => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={createProgram} disabled={submitting || !programForm.name} className="w-full btn-primary">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Program'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="bg-surface border-white/10">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Broadcast Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Title</Label>
              <Input
                value={adminMessage.title}
                onChange={(e) => setAdminMessage({ ...adminMessage, title: e.target.value })}
                className="input-dark"
                placeholder="Message title"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Message</Label>
              <textarea
                value={adminMessage.content}
                onChange={(e) => setAdminMessage({ ...adminMessage, content: e.target.value })}
                className="w-full input-dark min-h-[120px] rounded-md p-3"
                placeholder="Your message to all students..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Type</Label>
              <Select
                value={adminMessage.type}
                onValueChange={(v) => setAdminMessage({ ...adminMessage, type: v })}
              >
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/10">
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveAdminMessage} disabled={submitting} className="w-full btn-primary">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Registration Toggle Dialog */}
      <Dialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">
              {selectedProgram?.registration_open !== false ? 'Close Registration' : 'Open Registration'}
            </DialogTitle>
          </DialogHeader>
          {selectedProgram && (
            <div className="space-y-4 py-4">
              <p className="text-zinc-400">
                {selectedProgram?.registration_open !== false 
                  ? 'Closing registration will prevent new students from enrolling. You can set a next batch date to capture leads.'
                  : 'Opening registration will allow new students to enroll in this program.'
                }
              </p>
              
              {selectedProgram?.registration_open !== false && (
                <div className="space-y-2">
                  <Label className="text-zinc-400">Next Batch Date (Optional)</Label>
                  <Input
                    type="date"
                    value={selectedProgram.next_batch_date || ''}
                    onChange={(e) => setSelectedProgram({ ...selectedProgram, next_batch_date: e.target.value })}
                    className="input-dark"
                    data-testid="next-batch-date"
                  />
                  <p className="text-xs text-zinc-500">When registration is closed, this date will be shown to visitors and their data captured as leads.</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setRegistrationDialogOpen(false)}
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => toggleRegistration(
                    selectedProgram.program_id, 
                    selectedProgram.registration_open !== false,
                    selectedProgram.next_batch_date
                  )}
                  disabled={submitting}
                  className={`flex-1 gap-2 ${
                    selectedProgram?.registration_open !== false 
                      ? 'bg-accent text-white hover:bg-accent/90' 
                      : 'btn-primary'
                  }`}
                  data-testid="confirm-registration-toggle"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    selectedProgram?.registration_open !== false 
                      ? <><Lock className="w-4 h-4" /> Close Registration</>
                      : <><Unlock className="w-4 h-4" /> Open Registration</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <Dialog open={editProgramOpen} onOpenChange={setEditProgramOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Edit Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-zinc-400">Program Name</Label>
              <Input
                value={editProgramForm.name}
                onChange={(e) => setEditProgramForm({ ...editProgramForm, name: e.target.value })}
                className="input-dark"
                placeholder="e.g., Racing Certification"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Program Type</Label>
              <Select
                value={editProgramForm.program_type}
                onValueChange={(v) => setEditProgramForm({ ...editProgramForm, program_type: v })}
              >
                <SelectTrigger className="input-dark">
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
              <textarea
                value={editProgramForm.description}
                onChange={(e) => setEditProgramForm({ ...editProgramForm, description: e.target.value })}
                className="w-full input-dark min-h-[80px] rounded-md p-3"
                placeholder="Program description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Duration (weeks)</Label>
                <Input
                  type="text"
                  value={editProgramForm.duration_weeks}
                  onChange={(e) => setEditProgramForm({ ...editProgramForm, duration_weeks: e.target.value })}
                  className="input-dark"
                  placeholder="e.g., 4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Batch Size</Label>
                <Input
                  type="text"
                  value={editProgramForm.batch_size}
                  onChange={(e) => setEditProgramForm({ ...editProgramForm, batch_size: e.target.value })}
                  className="input-dark"
                  placeholder="e.g., 20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Program Highlights (shown in public view)</Label>
              <div className="space-y-2">
                {editProgramForm.highlights?.map((highlight, idx) => (
                  <Input
                    key={idx}
                    value={highlight}
                    onChange={(e) => {
                      const newHighlights = [...(editProgramForm.highlights || [])];
                      newHighlights[idx] = e.target.value;
                      setEditProgramForm({ ...editProgramForm, highlights: newHighlights });
                    }}
                    className="input-dark"
                    placeholder={`Highlight ${idx + 1} (e.g., Track Training)`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Assign to Brand</Label>
              <select
                value={editProgramForm.brand_id}
                onChange={(e) => setEditProgramForm({ ...editProgramForm, brand_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- No Brand (General) --</option>
                {brands.map(b => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Status</Label>
              <Select
                value={editProgramForm.status}
                onValueChange={(v) => setEditProgramForm({ ...editProgramForm, status: v })}
              >
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/10">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Next Batch Date</Label>
              <Input
                type="date"
                value={editProgramForm.next_batch_date}
                onChange={(e) => setEditProgramForm({ ...editProgramForm, next_batch_date: e.target.value })}
                className="input-dark"
              />
            </div>
            <Button onClick={updateProgram} disabled={submitting || !editProgramForm.name} className="w-full btn-primary">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unit Builder Dialog */}
      <Dialog open={unitBuilderOpen} onOpenChange={setUnitBuilderOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-3">
              <Layers className="w-6 h-6 text-primary" />
              Unit Builder - {selectedProgram?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-zinc-400">
                  Create and manage program units. Each unit can be assigned to a specific brand.
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {programUnits.length} unit{programUnits.length !== 1 ? 's' : ''} configured
                </p>
              </div>
              <Button
                onClick={() => {
                  setUnitForm({ name: '', description: '', brand_id: '', duration_weeks: 1, order: programUnits.length + 1, theory_hours: 0, practical_hours: 0, assessments_required: [] });
                  setCreateUnitOpen(true);
                }}
                className="btn-primary gap-2"
                data-testid="add-unit-btn"
              >
                <Plus className="w-4 h-4" />
                Add Unit
              </Button>
            </div>

            {programUnits.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-xl p-12 text-center">
                <Layers className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="font-unbounded font-semibold text-white mb-2">No Units Yet</h3>
                <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                  Break down this program into units and assign each to a specific brand for tracking.
                </p>
                <Button
                  onClick={() => setCreateUnitOpen(true)}
                  className="btn-primary gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Unit
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {programUnits.sort((a, b) => a.order - b.order).map((unit, idx) => {
                  const unitBrand = brands.find(b => b.brand_id === unit.brand_id);
                  return (
                    <div 
                      key={unit.unit_id}
                      className="telemetry-card rounded-xl p-4 flex items-start gap-4"
                      style={{ borderLeft: `4px solid ${unitBrand?.color || '#00f0ff'}` }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-unbounded font-bold text-lg text-white">
                        {unit.order || idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-unbounded font-semibold text-white">{unit.name}</h4>
                          {unitBrand && (
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-mono"
                              style={{ backgroundColor: `${unitBrand.color}20`, color: unitBrand.color }}
                            >
                              {unitBrand.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2">{unit.description || 'No description'}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                          <span>{unit.duration_weeks || 1} week{(unit.duration_weeks || 1) !== 1 ? 's' : ''}</span>
                          <span>{unit.theory_hours || 0}h theory</span>
                          <span>{unit.practical_hours || 0}h practical</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditUnit(unit)}
                          className="border-white/10 text-white hover:bg-white/5"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteUnit(unit.unit_id)}
                          className="border-accent/30 text-accent hover:bg-accent/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Unit Dialog */}
      <Dialog open={createUnitOpen} onOpenChange={setCreateUnitOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Add New Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Unit Name *</Label>
              <Input
                value={unitForm.name}
                onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                className="input-dark"
                placeholder="e.g., Track Safety Basics"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <textarea
                value={unitForm.description}
                onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                className="input-dark w-full h-20 resize-none"
                placeholder="Brief description of this unit..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Assign to Brand *</Label>
              <select
                value={unitForm.brand_id}
                onChange={(e) => setUnitForm({ ...unitForm, brand_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- Select Brand --</option>
                {brands.map(b => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">This brand will be responsible for delivering this unit</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Duration (weeks)</Label>
                <Input
                  type="number"
                  value={unitForm.duration_weeks}
                  onChange={(e) => setUnitForm({ ...unitForm, duration_weeks: parseInt(e.target.value) || 1 })}
                  className="input-dark"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Theory Hours</Label>
                <Input
                  type="number"
                  value={unitForm.theory_hours}
                  onChange={(e) => setUnitForm({ ...unitForm, theory_hours: parseInt(e.target.value) || 0 })}
                  className="input-dark"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Practical Hours</Label>
                <Input
                  type="number"
                  value={unitForm.practical_hours}
                  onChange={(e) => setUnitForm({ ...unitForm, practical_hours: parseInt(e.target.value) || 0 })}
                  className="input-dark"
                  min="0"
                />
              </div>
            </div>
            <Button 
              onClick={createUnit} 
              disabled={submitting || !unitForm.name || !unitForm.brand_id} 
              className="w-full btn-primary"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Unit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Dialog */}
      <Dialog open={editUnitOpen} onOpenChange={setEditUnitOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Edit Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Unit Name *</Label>
              <Input
                value={unitForm.name}
                onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                className="input-dark"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <textarea
                value={unitForm.description}
                onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                className="input-dark w-full h-20 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Assign to Brand *</Label>
              <select
                value={unitForm.brand_id}
                onChange={(e) => setUnitForm({ ...unitForm, brand_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- Select Brand --</option>
                {brands.map(b => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Duration (weeks)</Label>
                <Input
                  type="number"
                  value={unitForm.duration_weeks}
                  onChange={(e) => setUnitForm({ ...unitForm, duration_weeks: parseInt(e.target.value) || 1 })}
                  className="input-dark"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Theory Hours</Label>
                <Input
                  type="number"
                  value={unitForm.theory_hours}
                  onChange={(e) => setUnitForm({ ...unitForm, theory_hours: parseInt(e.target.value) || 0 })}
                  className="input-dark"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Practical Hours</Label>
                <Input
                  type="number"
                  value={unitForm.practical_hours}
                  onChange={(e) => setUnitForm({ ...unitForm, practical_hours: parseInt(e.target.value) || 0 })}
                  className="input-dark"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Display Order</Label>
              <Input
                type="number"
                value={unitForm.order}
                onChange={(e) => setUnitForm({ ...unitForm, order: parseInt(e.target.value) || 1 })}
                className="input-dark"
                min="1"
              />
            </div>
            <Button 
              onClick={updateUnit} 
              disabled={submitting || !unitForm.name || !unitForm.brand_id} 
              className="w-full btn-primary"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Brand Dialog */}
      <Dialog open={createBrandOpen} onOpenChange={setCreateBrandOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Create New Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Brand Name *</Label>
              <Input
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                className="input-dark"
                placeholder="e.g., KX RACING"
                data-testid="brand-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <textarea
                value={brandForm.description}
                onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                className="input-dark w-full h-20 resize-none"
                placeholder="Brief description of this brand..."
                data-testid="brand-description-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Tagline (optional)</Label>
              <Input
                value={brandForm.tagline}
                onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                className="input-dark"
                placeholder="e.g., From Passion to Profession"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandForm.color}
                  onChange={(e) => setBrandForm({ ...brandForm, color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  value={brandForm.color}
                  onChange={(e) => setBrandForm({ ...brandForm, color: e.target.value })}
                  className="input-dark font-mono flex-1"
                  placeholder="#00f0ff"
                />
              </div>
            </div>

            {/* Why Choose Stats Section */}
            <div className="pt-3 border-t border-white/10">
              <Label className="text-zinc-300 font-semibold text-sm">Brand Page Stats ("Why Choose" Section)</Label>
              <p className="text-xs text-zinc-500 mb-3">These appear on the public brand landing page</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-xs">Certifications Label</Label>
                  <Input
                    value={brandForm.stats_certifications}
                    onChange={(e) => setBrandForm({ ...brandForm, stats_certifications: e.target.value })}
                    className="input-dark"
                    placeholder="e.g., Industry, FIA"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-xs">Success Rate</Label>
                  <Input
                    value={brandForm.stats_success_rate}
                    onChange={(e) => setBrandForm({ ...brandForm, stats_success_rate: e.target.value })}
                    className="input-dark"
                    placeholder="e.g., 95%"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="brand-visible"
                checked={brandForm.is_visible}
                onChange={(e) => setBrandForm({ ...brandForm, is_visible: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="brand-visible" className="text-zinc-400 cursor-pointer">
                Visible to students and public
              </Label>
            </div>
            <Button 
              onClick={createBrand} 
              disabled={submitting || !brandForm.name} 
              className="w-full btn-primary"
              data-testid="submit-create-brand"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Brand'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={editBrandOpen} onOpenChange={setEditBrandOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Edit Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Brand Name *</Label>
              <Input
                value={editBrandForm.name}
                onChange={(e) => setEditBrandForm({ ...editBrandForm, name: e.target.value })}
                className="input-dark"
                placeholder="e.g., KX RACING"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <textarea
                value={editBrandForm.description}
                onChange={(e) => setEditBrandForm({ ...editBrandForm, description: e.target.value })}
                className="input-dark w-full h-20 resize-none"
                placeholder="Brief description of this brand..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Tagline (optional)</Label>
              <Input
                value={editBrandForm.tagline}
                onChange={(e) => setEditBrandForm({ ...editBrandForm, tagline: e.target.value })}
                className="input-dark"
                placeholder="e.g., From Passion to Profession"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={editBrandForm.color}
                  onChange={(e) => setEditBrandForm({ ...editBrandForm, color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  value={editBrandForm.color}
                  onChange={(e) => setEditBrandForm({ ...editBrandForm, color: e.target.value })}
                  className="input-dark font-mono flex-1"
                  placeholder="#00f0ff"
                />
              </div>
            </div>

            {/* Why Choose Stats Section */}
            <div className="pt-3 border-t border-white/10">
              <Label className="text-zinc-300 font-semibold text-sm">Brand Page Stats ("Why Choose" Section)</Label>
              <p className="text-xs text-zinc-500 mb-3">These appear on the public brand landing page</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-xs">Certifications Label</Label>
                  <Input
                    value={editBrandForm.stats_certifications}
                    onChange={(e) => setEditBrandForm({ ...editBrandForm, stats_certifications: e.target.value })}
                    className="input-dark"
                    placeholder="e.g., Industry, FIA, Professional"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-xs">Success Rate</Label>
                  <Input
                    value={editBrandForm.stats_success_rate}
                    onChange={(e) => setEditBrandForm({ ...editBrandForm, stats_success_rate: e.target.value })}
                    className="input-dark"
                    placeholder="e.g., 95%, 98%"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-brand-visible"
                checked={editBrandForm.is_visible}
                onChange={(e) => setEditBrandForm({ ...editBrandForm, is_visible: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="edit-brand-visible" className="text-zinc-400 cursor-pointer">
                Visible to students and public
              </Label>
            </div>
            <Button 
              onClick={updateBrand} 
              disabled={submitting || !editBrandForm.name} 
              className="w-full btn-primary"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue NFC Card Dialog */}
      <Dialog open={issueNfcOpen} onOpenChange={setIssueNfcOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Issue New NFC Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">User Type *</Label>
              <select
                value={nfcForm.user_type}
                onChange={(e) => setNfcForm({ ...nfcForm, user_type: e.target.value, user_id: '' })}
                className="input-dark w-full"
              >
                <option value="student">Student</option>
                <option value="trainer">Trainer/Crew</option>
                <option value="brand_head">Brand Head</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Select User *</Label>
              <select
                value={nfcForm.user_id}
                onChange={(e) => setNfcForm({ ...nfcForm, user_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- Select User --</option>
                {nfcForm.user_type === 'student' ? (
                  usersWithoutNfc.map(s => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.full_name} ({s.email || s.mobile})
                    </option>
                  ))
                ) : (
                  students.map(s => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.full_name} ({s.email || s.mobile})
                    </option>
                  ))
                )}
              </select>
              {nfcForm.user_type === 'student' && usersWithoutNfc.length === 0 && (
                <p className="text-xs text-zinc-500">All students already have NFC cards assigned</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">NFC Card ID *</Label>
              <Input
                value={nfcForm.nfc_card_id}
                onChange={(e) => setNfcForm({ ...nfcForm, nfc_card_id: e.target.value.toUpperCase() })}
                className="input-dark font-mono"
                placeholder="e.g., NFC_KX001"
                data-testid="nfc-card-id-input"
              />
              <p className="text-xs text-zinc-500">Enter the ID printed on the physical NFC card</p>
            </div>
            <Button 
              onClick={issueNfcCard} 
              disabled={submitting || !nfcForm.user_id || !nfcForm.nfc_card_id} 
              className="w-full btn-primary"
              data-testid="submit-issue-nfc"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Issue NFC Card'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace NFC Card Dialog */}
      <Dialog open={replaceNfcOpen} onOpenChange={setReplaceNfcOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Replace NFC Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-accent-warning/10 border border-accent-warning/30">
              <p className="text-sm text-accent-warning">
                The old card will remain active for 10 days to allow verification. After that, you can permanently delete it.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Old NFC Card ID</Label>
              <Input
                value={replaceNfcForm.old_nfc_id}
                onChange={(e) => setReplaceNfcForm({ ...replaceNfcForm, old_nfc_id: e.target.value.toUpperCase() })}
                className="input-dark font-mono"
                placeholder="Current NFC ID"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">New NFC Card ID *</Label>
              <Input
                value={replaceNfcForm.new_nfc_id}
                onChange={(e) => setReplaceNfcForm({ ...replaceNfcForm, new_nfc_id: e.target.value.toUpperCase() })}
                className="input-dark font-mono"
                placeholder="New NFC ID"
                data-testid="new-nfc-card-id-input"
              />
            </div>
            <Button 
              onClick={replaceNfcCard} 
              disabled={submitting || !replaceNfcForm.old_nfc_id || !replaceNfcForm.new_nfc_id} 
              className="w-full btn-primary"
              data-testid="submit-replace-nfc"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Replace NFC Card'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Brand Head Dialog */}
      <Dialog open={assignBrandHeadOpen} onOpenChange={setAssignBrandHeadOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Assign Brand Head</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Brand Heads can view their assigned brand's dashboard with programs, crew, and student information.
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-400">Select User *</Label>
              <select
                value={brandHeadForm.user_id}
                onChange={(e) => setBrandHeadForm({ ...brandHeadForm, user_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- Select User --</option>
                {students.map(s => (
                  <option key={s.user_id} value={s.user_id}>
                    {s.full_name} ({s.email || s.mobile})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Select Brand *</Label>
              <select
                value={brandHeadForm.brand_id}
                onChange={(e) => setBrandHeadForm({ ...brandHeadForm, brand_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- Select Brand --</option>
                {brandsWithoutHead.map(b => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {brandsWithoutHead.length === 0 && (
                <p className="text-xs text-zinc-500">All brands already have Brand Heads assigned</p>
              )}
            </div>
            <Button 
              onClick={assignBrandHead} 
              disabled={submitting || !brandHeadForm.user_id || !brandHeadForm.brand_id} 
              className="w-full btn-primary"
              data-testid="submit-assign-brand-head"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign Brand Head'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Brand Manager Dialog */}
      <Dialog open={createBrandManagerOpen} onOpenChange={setCreateBrandManagerOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Create Brand Manager Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Create a new Brand Manager account with login credentials. They will be able to manage their assigned brand and create crew members.
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-400">Full Name *</Label>
              <Input
                value={brandManagerForm.name}
                onChange={(e) => setBrandManagerForm({ ...brandManagerForm, name: e.target.value })}
                className="input-dark"
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Email Address *</Label>
              <Input
                type="email"
                value={brandManagerForm.email}
                onChange={(e) => setBrandManagerForm({ ...brandManagerForm, email: e.target.value })}
                className="input-dark"
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Password *</Label>
              <Input
                type="password"
                value={brandManagerForm.password}
                onChange={(e) => setBrandManagerForm({ ...brandManagerForm, password: e.target.value })}
                className="input-dark"
                placeholder="Create a password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Assign to Brand *</Label>
              <select
                value={brandManagerForm.brand_id}
                onChange={(e) => setBrandManagerForm({ ...brandManagerForm, brand_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- Select Brand --</option>
                {brands.filter(b => !b.brand_head_id).map(b => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {brands.filter(b => !b.brand_head_id).length === 0 && (
                <p className="text-xs text-zinc-500">All brands already have Brand Managers. Remove an existing one first.</p>
              )}
            </div>
            <Button 
              onClick={createBrandManager} 
              disabled={submitting || !brandManagerForm.email || !brandManagerForm.password || !brandManagerForm.name || !brandManagerForm.brand_id} 
              className="w-full btn-primary"
              data-testid="submit-create-brand-manager"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Brand Manager'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Crew to Brand Dialog */}
      <Dialog open={assignCrewBrandOpen} onOpenChange={setAssignCrewBrandOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Assign Crew to Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Lock a crew member to only view and manage data for a specific brand.
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-400">Select Crew Member *</Label>
              <select
                value={crewBrandForm.user_id}
                onChange={(e) => setCrewBrandForm({ ...crewBrandForm, user_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- Select Crew --</option>
                {crewMembers.map(c => (
                  <option key={c.user_id} value={c.user_id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Assign to Brand</Label>
              <select
                value={crewBrandForm.brand_id}
                onChange={(e) => setCrewBrandForm({ ...crewBrandForm, brand_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- No Lock (All Brands) --</option>
                {brands.map(b => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">Leave empty to allow access to all brands</p>
            </div>
            <Button 
              onClick={assignCrewToBrand} 
              disabled={submitting || !crewBrandForm.user_id} 
              className="w-full btn-primary"
              data-testid="submit-assign-crew-brand"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Crew Dialog */}
      <Dialog open={createCrewOpen} onOpenChange={setCreateCrewOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Create Crew Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Create a new crew/trainer account with optional brand assignment.
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-400">Full Name *</Label>
              <Input
                value={createCrewForm.name}
                onChange={(e) => setCreateCrewForm({ ...createCrewForm, name: e.target.value })}
                className="input-dark"
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Email *</Label>
              <Input
                type="email"
                value={createCrewForm.email}
                onChange={(e) => setCreateCrewForm({ ...createCrewForm, email: e.target.value })}
                className="input-dark"
                placeholder="crew@kotlerx.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Password *</Label>
              <Input
                type="password"
                value={createCrewForm.password}
                onChange={(e) => setCreateCrewForm({ ...createCrewForm, password: e.target.value })}
                className="input-dark"
                placeholder="Set initial password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Assign to Brand (Optional)</Label>
              <select
                value={createCrewForm.brand_id}
                onChange={(e) => setCreateCrewForm({ ...createCrewForm, brand_id: e.target.value })}
                className="input-dark w-full"
              >
                <option value="">-- All Brands (No Lock) --</option>
                {brands.map(b => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">Optionally lock this crew to a specific brand</p>
            </div>
            <Button 
              onClick={createCrewMember} 
              disabled={submitting || !createCrewForm.name || !createCrewForm.email || !createCrewForm.password} 
              className="w-full btn-primary"
              data-testid="submit-create-crew"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Crew Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Media Dialog */}
      <Dialog open={addMediaOpen} onOpenChange={setAddMediaOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Add Media Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Title *</Label>
              <Input
                value={mediaForm.title}
                onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                className="input-dark"
                placeholder="e.g., Track Day 2024"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <Input
                value={mediaForm.description}
                onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })}
                className="input-dark"
                placeholder="Brief description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Media Type</Label>
                <select
                  value={mediaForm.media_type}
                  onChange={(e) => setMediaForm({ ...mediaForm, media_type: e.target.value, media_base64: '', url: '' })}
                  className="input-dark w-full"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Visibility</Label>
                <select
                  value={mediaForm.category}
                  onChange={(e) => setMediaForm({ ...mediaForm, category: e.target.value })}
                  className="input-dark w-full"
                >
                  <option value="public">Public (Landing Page)</option>
                  <option value="student">Students Only</option>
                </select>
              </div>
            </div>
            
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Upload {mediaForm.media_type === 'video' ? 'Video' : 'Image'}</Label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                {mediaForm.media_base64 ? (
                  <div className="space-y-2">
                    {mediaForm.media_type === 'image' ? (
                      <img src={mediaForm.media_base64} alt="Preview" className="max-h-32 mx-auto rounded" />
                    ) : (
                      <div className="p-4 bg-white/5 rounded">
                        <Play className="w-8 h-8 text-primary mx-auto" />
                        <p className="text-xs text-zinc-400 mt-1">Video uploaded</p>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setMediaForm({ ...mediaForm, media_base64: '' })}
                      className="border-white/20"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">Click to upload {mediaForm.media_type}</p>
                    <p className="text-xs text-zinc-600 mt-1">Max {mediaForm.media_type === 'video' ? '50MB' : '10MB'}</p>
                    <input 
                      type="file" 
                      accept={mediaForm.media_type === 'video' ? 'video/*' : 'image/*'}
                      className="hidden" 
                      onChange={handleMediaFileUpload} 
                    />
                  </label>
                )}
              </div>
            </div>
            
            {/* OR use URL */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-2 text-zinc-500">OR paste URL</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Input
                value={mediaForm.url}
                onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value, media_base64: '' })}
                className="input-dark"
                placeholder="https://..."
                disabled={!!mediaForm.media_base64}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-400">Display Order</Label>
              <Input
                type="number"
                value={mediaForm.order}
                onChange={(e) => setMediaForm({ ...mediaForm, order: parseInt(e.target.value) || 0 })}
                className="input-dark"
                placeholder="0"
              />
              <p className="text-xs text-zinc-500">Lower numbers appear first</p>
            </div>
            <Button 
              onClick={addMediaItem} 
              disabled={submitting || !mediaForm.title || (!mediaForm.url && !mediaForm.media_base64)} 
              className="w-full btn-primary"
              data-testid="submit-add-media"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Media'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* NFC Upload Dialog */}
      <Dialog open={nfcUploadOpen} onOpenChange={setNfcUploadOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Upload NFC Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Upload an Excel file with NFC user data. Download the template first to see the required format.
            </p>
            
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
              <Upload className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-white mb-2">Drag & drop or click to upload</p>
              <p className="text-xs text-zinc-500 mb-4">Accepts .xlsx files only</p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    uploadNfcUsers(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="nfc-file-upload"
              />
              <label htmlFor="nfc-file-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 cursor-pointer"
                  onClick={() => document.getElementById('nfc-file-upload').click()}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {submitting ? 'Uploading...' : 'Select File'}
                </Button>
              </label>
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="text-sm text-secondary flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                All uploaded users will get the default password: <span className="font-mono">NFC1234</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Reset User Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedNfcUser && (
              <>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-white font-medium">{selectedNfcUser.name}</p>
                  <p className="text-sm text-zinc-500">NFC ID: {selectedNfcUser.nfc_id}</p>
                  {selectedNfcUser.mobile && <p className="text-sm text-zinc-500">Mobile: {selectedNfcUser.mobile}</p>}
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => resetNfcPassword(selectedNfcUser.nfc_id)}
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-white/5"
                  >
                    Reset to Default (NFC1234)
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-surface px-2 text-zinc-500">Or set custom password</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="input-dark"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <Button
                    onClick={() => resetNfcPassword(selectedNfcUser.nfc_id, newPasswordInput)}
                    disabled={!newPasswordInput || newPasswordInput.length < 6}
                    className="w-full btn-primary"
                  >
                    Set Custom Password
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create KXCraft Product Dialog */}
      <Dialog open={createKxcraftOpen} onOpenChange={setCreateKxcraftOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Add KXCraft Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-zinc-400">Product Name *</Label>
              <Input value={kxcraftForm.name} onChange={e => setKxcraftForm({...kxcraftForm, name: e.target.value})} className="input-dark" placeholder="e.g. Racing Car Wood Model" data-testid="kxcraft-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-400">Price (₹) *</Label>
                <Input value={kxcraftForm.price} onChange={e => setKxcraftForm({...kxcraftForm, price: e.target.value})} className="input-dark" placeholder="2,499" data-testid="kxcraft-price" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Category</Label>
                <Select value={kxcraftForm.category} onValueChange={v => setKxcraftForm({...kxcraftForm, category: v})}>
                  <SelectTrigger className="input-dark" data-testid="kxcraft-category"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-white/10">
                    <SelectItem value="motorsport">Motorsport</SelectItem>
                    <SelectItem value="frames">Frames</SelectItem>
                    <SelectItem value="souvenirs">Souvenirs</SelectItem>
                    <SelectItem value="personalized">Personalized</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <Textarea value={kxcraftForm.description} onChange={e => setKxcraftForm({...kxcraftForm, description: e.target.value})} className="input-dark" rows={2} placeholder="Product description" data-testid="kxcraft-desc" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Product Image</Label>
              <div className="flex gap-2">
                <Input value={kxcraftForm.image_url} onChange={e => setKxcraftForm({...kxcraftForm, image_url: e.target.value})} className="input-dark flex-1" placeholder="Image URL (optional)" />
                <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm transition-colors">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleKxcraftImageUpload} />
                </label>
              </div>
              {(kxcraftForm.image_base64 || kxcraftForm.image_url) && (
                <img src={kxcraftForm.image_base64 || kxcraftForm.image_url} alt="preview" className="w-20 h-20 rounded-lg object-cover mt-2" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-400">Badge</Label>
                <Input value={kxcraftForm.badge} onChange={e => setKxcraftForm({...kxcraftForm, badge: e.target.value})} className="input-dark" placeholder="e.g. Bestseller" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Rating</Label>
                <Input type="number" min="1" max="5" step="0.1" value={kxcraftForm.rating} onChange={e => setKxcraftForm({...kxcraftForm, rating: parseFloat(e.target.value)})} className="input-dark" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">External Link (optional)</Label>
              <Input value={kxcraftForm.external_link} onChange={e => setKxcraftForm({...kxcraftForm, external_link: e.target.value})} className="input-dark" placeholder="https://shop.kotlerx.in/product/..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-400">Display Order</Label>
                <Input type="number" value={kxcraftForm.order} onChange={e => setKxcraftForm({...kxcraftForm, order: parseInt(e.target.value)})} className="input-dark" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <button onClick={() => setKxcraftForm({...kxcraftForm, is_visible: !kxcraftForm.is_visible})} className="text-zinc-400 hover:text-white">
                  {kxcraftForm.is_visible ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
                <span className="text-sm text-zinc-400">{kxcraftForm.is_visible ? 'Visible' : 'Hidden'}</span>
              </div>
            </div>
            <Button onClick={createKxcraftProduct} disabled={submitting} className="w-full btn-primary" data-testid="save-kxcraft-btn">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit KXCraft Product Dialog */}
      <Dialog open={editKxcraftOpen} onOpenChange={setEditKxcraftOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-zinc-400">Product Name *</Label>
              <Input value={kxcraftForm.name} onChange={e => setKxcraftForm({...kxcraftForm, name: e.target.value})} className="input-dark" data-testid="edit-kxcraft-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-400">Price (₹) *</Label>
                <Input value={kxcraftForm.price} onChange={e => setKxcraftForm({...kxcraftForm, price: e.target.value})} className="input-dark" data-testid="edit-kxcraft-price" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Category</Label>
                <Select value={kxcraftForm.category} onValueChange={v => setKxcraftForm({...kxcraftForm, category: v})}>
                  <SelectTrigger className="input-dark"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-white/10">
                    <SelectItem value="motorsport">Motorsport</SelectItem>
                    <SelectItem value="frames">Frames</SelectItem>
                    <SelectItem value="souvenirs">Souvenirs</SelectItem>
                    <SelectItem value="personalized">Personalized</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <Textarea value={kxcraftForm.description} onChange={e => setKxcraftForm({...kxcraftForm, description: e.target.value})} className="input-dark" rows={2} data-testid="edit-kxcraft-desc" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Product Image</Label>
              <div className="flex gap-2">
                <Input value={kxcraftForm.image_url} onChange={e => setKxcraftForm({...kxcraftForm, image_url: e.target.value})} className="input-dark flex-1" placeholder="Image URL" />
                <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm transition-colors">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleKxcraftImageUpload} />
                </label>
              </div>
              {(kxcraftForm.image_base64 || kxcraftForm.image_url) && (
                <img src={kxcraftForm.image_base64 || kxcraftForm.image_url} alt="preview" className="w-20 h-20 rounded-lg object-cover mt-2" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-400">Badge</Label>
                <Input value={kxcraftForm.badge} onChange={e => setKxcraftForm({...kxcraftForm, badge: e.target.value})} className="input-dark" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Rating</Label>
                <Input type="number" min="1" max="5" step="0.1" value={kxcraftForm.rating} onChange={e => setKxcraftForm({...kxcraftForm, rating: parseFloat(e.target.value)})} className="input-dark" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">External Link</Label>
              <Input value={kxcraftForm.external_link} onChange={e => setKxcraftForm({...kxcraftForm, external_link: e.target.value})} className="input-dark" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-zinc-400">Display Order</Label>
                <Input type="number" value={kxcraftForm.order} onChange={e => setKxcraftForm({...kxcraftForm, order: parseInt(e.target.value)})} className="input-dark" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <button onClick={() => setKxcraftForm({...kxcraftForm, is_visible: !kxcraftForm.is_visible})} className="text-zinc-400 hover:text-white">
                  {kxcraftForm.is_visible ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
                <span className="text-sm text-zinc-400">{kxcraftForm.is_visible ? 'Visible' : 'Hidden'}</span>
              </div>
            </div>
            <Button onClick={updateKxcraftProduct} disabled={submitting} className="w-full btn-primary" data-testid="update-kxcraft-btn">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
