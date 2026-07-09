import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import KotlerXLogo from '@/components/KotlerXLogo';
import ImageUploadWithZoom from '@/components/ImageUploadWithZoom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Shield, Users, Layers, Calendar, FileText, Settings, LogOut,
  Plus, Edit, Trash2, Loader2, UserPlus, Crown, BarChart3,
  Phone, Mail, MapPin, MessageSquare, Handshake, Image as ImageIcon,
  UserCog, ChevronRight, Eye, EyeOff, Award, Search, X
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  
  // Admin Management
  const [admins, setAdmins] = useState([]);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '', name: '' });
  
  // Partners/Sponsors
  const [partners, setPartners] = useState([]);
  const [createPartnerOpen, setCreatePartnerOpen] = useState(false);
  const [editPartnerOpen, setEditPartnerOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerForm, setPartnerForm] = useState({
    name: '', description: '', logo_url: '', logo_base64: '', website_url: '',
    partner_type: 'partner', is_visible: true, is_featured: false, order: 0
  });
  
  // Programme Director
  const [director, setDirector] = useState(null);
  const [directorForm, setDirectorForm] = useState({
    name: '', designation: '', message: '', photo_url: '', photo_base64: ''
  });
  
  // Contact Info
  const [contactInfo, setContactInfo] = useState(null);
  const [contactForm, setContactForm] = useState({
    email: '', phone: '', whatsapp_number: '', location_address: '',
    location_maps_url: '', heading_text: '', subheading_text: ''
  });
  
  // CMS Settings (Logo)
  const [siteSettings, setSiteSettings] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  
  // Callback Requests
  const [callbackRequests, setCallbackRequests] = useState([]);
  
  // Assessment Categories (with brand assignment)
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '', description: '', scale_min: 1, scale_max: 5, is_active: true, brand_ids: []
  });

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      toast.error('Super Admin access required');
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, adminsRes, partnersRes, directorRes, contactRes, callbacksRes, categoriesRes, brandsRes, settingsRes] = await Promise.all([
        axios.get(`${API}/super-admin/dashboard`, { headers, withCredentials: true }),
        axios.get(`${API}/super-admin/admins`, { headers, withCredentials: true }),
        axios.get(`${API}/admin/partners`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/cms/programme-director`, { headers, withCredentials: true }),
        axios.get(`${API}/cms/contact-info`, { headers, withCredentials: true }),
        axios.get(`${API}/admin/callback-requests`, { headers, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/assessment-categories`, { headers, withCredentials: true }),
        axios.get(`${API}/admin/brands`, { headers, withCredentials: true }),
        axios.get(`${API}/cms/settings`, { headers, withCredentials: true }).catch(() => ({ data: {} }))
      ]);
      
      setDashboardStats(statsRes.data);
      setAdmins(adminsRes.data || []);
      setPartners(partnersRes.data || []);
      setDirector(directorRes.data);
      setDirectorForm(directorRes.data || {});
      setContactInfo(contactRes.data);
      setContactForm(contactRes.data || {});
      setCallbackRequests(callbacksRes.data || []);
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
      setSiteSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Admin CRUD
  const createAdmin = async () => {
    if (!adminForm.email || !adminForm.password || !adminForm.name) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/super-admin/create-admin`, adminForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Admin account created!');
      setCreateAdminOpen(false);
      setAdminForm({ email: '', password: '', name: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAdmin = async (userId) => {
    if (!confirm('Delete this admin account?')) return;
    try {
      await axios.delete(`${API}/super-admin/admins/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Admin deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete admin');
    }
  };

  // Partners CRUD
  const createPartner = async () => {
    if (!partnerForm.name) {
      toast.error('Partner name is required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/partners`, partnerForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Partner added!');
      setCreatePartnerOpen(false);
      setPartnerForm({ name: '', description: '', logo_url: '', logo_base64: '', website_url: '', partner_type: 'partner', is_visible: true, is_featured: false, order: 0 });
      fetchData();
    } catch (error) {
      toast.error('Failed to add partner');
    } finally {
      setSubmitting(false);
    }
  };

  const updatePartner = async () => {
    if (!selectedPartner) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/admin/partners/${selectedPartner.partner_id}`, partnerForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Partner updated!');
      setEditPartnerOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update partner');
    } finally {
      setSubmitting(false);
    }
  };

  const deletePartner = async (partnerId) => {
    if (!confirm('Delete this partner?')) return;
    try {
      await axios.delete(`${API}/admin/partners/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Partner deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete partner');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartnerForm(prev => ({ ...prev, logo_base64: reader.result, logo_url: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Programme Director
  const updateDirector = async () => {
    setSubmitting(true);
    try {
      await axios.put(`${API}/cms/programme-director`, directorForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Programme Director updated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectorPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDirectorForm(prev => ({ ...prev, photo_base64: reader.result, photo_url: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Contact Info
  const updateContactInfo = async () => {
    setSubmitting(true);
    try {
      await axios.put(`${API}/cms/contact-info`, contactForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Contact info updated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  // Assessment Categories with Brand Assignment
  const openEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      scale_min: category.scale_min || 1,
      scale_max: category.scale_max || 5,
      is_active: category.is_active ?? true,
      brand_ids: category.brand_ids || []
    });
    setEditCategoryOpen(true);
  };

  const updateCategory = async () => {
    if (!selectedCategory) return;
    setSubmitting(true);
    try {
      await axios.put(`${API}/admin/assessment-categories/${selectedCategory.category_id}`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Category updated!');
      setEditCategoryOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBrandInCategory = (brandId) => {
    setCategoryForm(prev => {
      const currentBrands = prev.brand_ids || [];
      if (currentBrands.includes(brandId)) {
        return { ...prev, brand_ids: currentBrands.filter(id => id !== brandId) };
      } else {
        return { ...prev, brand_ids: [...currentBrands, brandId] };
      }
    });
  };

  // Site Logo Upload
  const handleSiteLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await axios.post(`${API}/cms/logo/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      toast.success('Logo uploaded successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const deleteLogo = async () => {
    if (!confirm('Remove the logo and revert to text?')) return;
    try {
      await axios.delete(`${API}/cms/logo`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Logo removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'branding', label: 'Site Branding', icon: ImageIcon },
    { id: 'admins', label: `Admins (${admins.length})`, icon: UserCog },
    { id: 'partners', label: `Partners (${partners.length})`, icon: Handshake },
    { id: 'director', label: 'Programme Director', icon: Crown },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'callbacks', label: `Callbacks (${callbackRequests.filter(c => c.status === 'new').length})`, icon: MessageSquare },
    { id: 'assessments', label: `Assessments (${categories.length})`, icon: Award }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <KotlerXLogo className="h-10" variant="header" />
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-unbounded font-bold text-white">KX ROOT</span>
              </div>
              <span className="text-xs text-zinc-500">Super Admin Panel</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="border-white/20 text-zinc-400 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-zinc-400 hover:text-accent">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Admins', value: dashboardStats.admins, icon: UserCog, color: 'text-yellow-400' },
                { label: 'Brand Heads', value: dashboardStats.brand_heads, icon: Crown, color: 'text-purple-400' },
                { label: 'Crew', value: dashboardStats.crew, icon: Users, color: 'text-blue-400' },
                { label: 'Students', value: dashboardStats.students, icon: Users, color: 'text-green-400' },
                { label: 'Programs', value: dashboardStats.programs, icon: Calendar, color: 'text-primary' },
                { label: 'Brands', value: dashboardStats.brands, icon: Layers, color: 'text-secondary' },
                { label: 'Total Leads', value: dashboardStats.total_leads, icon: FileText, color: 'text-orange-400' },
                { label: 'Pending Callbacks', value: dashboardStats.pending_callbacks, icon: Phone, color: 'text-accent' }
              ].map((stat, i) => (
                <div key={i} className="telemetry-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className={`text-2xl font-unbounded font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="telemetry-card rounded-xl p-6">
              <h3 className="font-unbounded font-semibold text-white mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Super Admin Capabilities
              </h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-primary" /> Create and manage Admin accounts</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-primary" /> Manage Partners, Sponsors & Associations</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-primary" /> Edit Programme Director message</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-primary" /> Update Contact Information</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-primary" /> View and manage Callback Requests</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-primary" /> Assign Assessment Categories to multiple Brands</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-primary" /> All Admin Panel features</li>
              </ul>
            </div>
          </div>
        )}

        {/* Site Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <h2 className="font-unbounded font-semibold text-lg text-white">Site Branding & Logo</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current Logo */}
              <div className="telemetry-card rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Current Logo</h3>
                <div className="bg-black/30 rounded-xl p-8 flex items-center justify-center min-h-[150px]">
                  {siteSettings?.logo_image ? (
                    <img 
                      src={siteSettings.logo_image}
                      alt="Site Logo"
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="font-unbounded font-bold text-3xl">
                        <span className="text-white">{siteSettings?.logo_text_1 || 'KX'}</span>
                        <span className="text-primary">{siteSettings?.logo_text_2 || 'GRID'}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">Text Logo (Default)</p>
                    </div>
                  )}
                </div>
                
                {siteSettings?.logo_image && (
                  <Button
                    onClick={deleteLogo}
                    variant="outline"
                    className="mt-4 w-full border-accent/30 text-accent hover:bg-accent/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Logo & Revert to Text
                  </Button>
                )}
              </div>

              {/* Upload New Logo */}
              <div className="telemetry-card rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Upload New Logo</h3>
                <label className="block">
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    {logoUploading ? (
                      <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                        <p className="text-zinc-400 mb-2">Click to upload logo</p>
                        <p className="text-xs text-zinc-500">PNG, JPG, SVG (max 2MB)</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleSiteLogoUpload}
                    disabled={logoUploading}
                  />
                </label>
                
                <div className="mt-4 p-4 rounded-lg bg-secondary/10 border border-secondary/30">
                  <p className="text-sm text-zinc-300">
                    <strong className="text-secondary">Tip:</strong> For best results, use a transparent PNG or SVG with a height of at least 80px.
                  </p>
                </div>
              </div>
            </div>

            {/* Logo Preview */}
            <div className="telemetry-card rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Preview (Navigation Header)</h3>
              <div className="bg-[#0a0a0f] rounded-xl p-4 flex items-center gap-4 border border-white/5">
                {siteSettings?.logo_image ? (
                  <img src={siteSettings.logo_image} alt="Logo" className="h-10 object-contain" />
                ) : (
                  <div className="font-unbounded font-bold text-xl">
                    <span className="text-white">{siteSettings?.logo_text_1 || 'KX'}</span>
                    <span className="text-primary">{siteSettings?.logo_text_2 || 'GRID'}</span>
                  </div>
                )}
                <div className="flex-1" />
                <div className="flex gap-4 text-sm text-zinc-500">
                  <span>Programs</span>
                  <span>About</span>
                  <span>Contact</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-primary/20 text-primary text-sm">Login</div>
              </div>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-semibold text-lg text-white">Admin Accounts</h2>
                <p className="text-sm text-zinc-500">Create and manage admin accounts</p>
              </div>
              <Button onClick={() => setCreateAdminOpen(true)} className="btn-primary gap-2" data-testid="create-admin-btn">
                <Plus className="w-4 h-4" />
                Create Admin
              </Button>
            </div>

            <div className="grid gap-4">
              {admins.map(admin => (
                <div key={admin.user_id} className="telemetry-card rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <UserCog className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{admin.name}</h3>
                      <p className="text-sm text-zinc-500">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">
                      Created: {new Date(admin.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAdmin(admin.user_id)}
                      className="border-accent/30 text-accent hover:bg-accent/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {admins.length === 0 && (
                <div className="telemetry-card rounded-xl p-8 text-center">
                  <UserCog className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">No admin accounts yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-unbounded font-semibold text-lg text-white">Partners, Sponsors & Associations</h2>
                <p className="text-sm text-zinc-500">Logos will scroll on landing page and student dashboard</p>
              </div>
              <Button onClick={() => setCreatePartnerOpen(true)} className="btn-primary gap-2" data-testid="create-partner-btn">
                <Plus className="w-4 h-4" />
                Add Partner
              </Button>
            </div>

            {/* Filter by type */}
            <div className="flex gap-2">
              {['All', 'Partner', 'Sponsor', 'Association'].map(type => (
                <button
                  key={type}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-zinc-400 hover:bg-white/10"
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.map(partner => (
                <div 
                  key={partner.partner_id}
                  className={`telemetry-card rounded-xl p-5 relative ${!partner.is_visible ? 'opacity-60' : ''} ${partner.is_featured ? 'ring-2 ring-primary/50' : ''}`}
                >
                  {partner.is_featured && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-primary/20 text-xs text-primary flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                  {!partner.is_visible && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-zinc-700 text-xs text-zinc-400">
                      Hidden
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-4 mt-4">
                    {partner.logo_base64 || partner.logo_url ? (
                      <img 
                        src={partner.logo_base64 || partner.logo_url} 
                        alt={partner.name}
                        className="w-16 h-16 object-contain rounded-lg bg-white/5 p-2"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                        <Handshake className="w-8 h-8 text-zinc-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{partner.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        partner.partner_type === 'sponsor' ? 'bg-yellow-500/20 text-yellow-400' :
                        partner.partner_type === 'association' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {partner.partner_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPartner(partner);
                        setPartnerForm(partner);
                        setEditPartnerOpen(true);
                      }}
                      className="flex-1 border-white/10 text-zinc-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePartner(partner.partner_id)}
                      className="border-accent/30 text-accent hover:bg-accent/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {partners.length === 0 && (
                <div className="col-span-full telemetry-card rounded-xl p-8 text-center">
                  <Handshake className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">No Partners Yet</h3>
                  <p className="text-sm text-zinc-500 mb-4">Add partners, sponsors, and associations</p>
                  <Button onClick={() => setCreatePartnerOpen(true)} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Partner
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Programme Director Tab */}
        {activeTab === 'director' && (
          <div className="space-y-6">
            <h2 className="font-unbounded font-semibold text-lg text-white">Message from Programme Director</h2>
            
            <div className="telemetry-card rounded-xl p-6 max-w-2xl">
              <div className="space-y-4">
                <div className="flex items-start gap-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Photo</Label>
                    {directorForm.photo_base64 || directorForm.photo_url ? (
                      <div className="relative w-32 h-32">
                        <img 
                          src={directorForm.photo_base64 || directorForm.photo_url}
                          alt="Director"
                          className="w-32 h-32 rounded-xl object-cover"
                        />
                        <button
                          onClick={() => setDirectorForm(prev => ({ ...prev, photo_base64: '', photo_url: '' }))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50">
                        <ImageIcon className="w-8 h-8 text-zinc-500 mb-2" />
                        <span className="text-xs text-zinc-500">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleDirectorPhotoUpload} />
                      </label>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Name</Label>
                      <Input
                        value={directorForm.name || ''}
                        onChange={(e) => setDirectorForm(prev => ({ ...prev, name: e.target.value }))}
                        className="input-dark"
                        placeholder="Dr. John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Designation</Label>
                      <Input
                        value={directorForm.designation || ''}
                        onChange={(e) => setDirectorForm(prev => ({ ...prev, designation: e.target.value }))}
                        className="input-dark"
                        placeholder="Director of Programmes"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Message</Label>
                  <Textarea
                    value={directorForm.message || ''}
                    onChange={(e) => setDirectorForm(prev => ({ ...prev, message: e.target.value }))}
                    className="input-dark min-h-[150px]"
                    placeholder="Welcome message from the Programme Director..."
                  />
                </div>

                <Button onClick={updateDirector} disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="font-unbounded font-semibold text-lg text-white">Contact Information</h2>
            
            <div className="telemetry-card rounded-xl p-6 max-w-2xl">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Email</Label>
                    <Input
                      value={contactForm.email || ''}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input-dark"
                      placeholder="admissions@kotlerx.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Phone</Label>
                    <Input
                      value={contactForm.phone || ''}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-dark"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">WhatsApp Number (with country code)</Label>
                  <Input
                    value={contactForm.whatsapp_number || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    className="input-dark"
                    placeholder="+919876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Location Address</Label>
                  <Input
                    value={contactForm.location_address || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, location_address: e.target.value }))}
                    className="input-dark"
                    placeholder="KotlerX Academy, Motorsport City, India"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Google Maps URL</Label>
                  <Input
                    value={contactForm.location_maps_url || ''}
                    onChange={(e) => setContactForm(prev => ({ ...prev, location_maps_url: e.target.value }))}
                    className="input-dark"
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                  <h4 className="font-medium text-white mb-3">Contact Section Text</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Heading</Label>
                      <Input
                        value={contactForm.heading_text || ''}
                        onChange={(e) => setContactForm(prev => ({ ...prev, heading_text: e.target.value }))}
                        className="input-dark"
                        placeholder="Questions? Please get in touch"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Subheading</Label>
                      <Input
                        value={contactForm.subheading_text || ''}
                        onChange={(e) => setContactForm(prev => ({ ...prev, subheading_text: e.target.value }))}
                        className="input-dark"
                        placeholder="Our admission team will be happy to discuss your options"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={updateContactInfo} disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Callbacks Tab */}
        {activeTab === 'callbacks' && (
          <div className="space-y-6">
            <h2 className="font-unbounded font-semibold text-lg text-white">Callback Requests</h2>
            
            <div className="space-y-4">
              {callbackRequests.map(request => (
                <div 
                  key={request.request_id}
                  className={`telemetry-card rounded-xl p-5 ${request.status === 'new' ? 'border-l-4 border-l-accent' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        request.status === 'new' ? 'bg-accent/20' : 'bg-accent-success/20'
                      }`}>
                        <Phone className={`w-5 h-5 ${request.status === 'new' ? 'text-accent' : 'text-accent-success'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{request.name}</h3>
                        <p className="text-sm text-zinc-400">{request.phone}</p>
                        {request.message && <p className="text-sm text-zinc-500 mt-1">{request.message}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'new' ? 'bg-accent/20 text-accent' :
                        request.status === 'contacted' ? 'bg-accent-success/20 text-accent-success' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {request.status}
                      </span>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {callbackRequests.length === 0 && (
                <div className="telemetry-card rounded-xl p-8 text-center">
                  <Phone className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">No callback requests yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-unbounded font-semibold text-lg text-white">Assessment Categories with Brand Assignment</h2>
              <p className="text-sm text-zinc-500">Assign categories to multiple brand teams for unified assessments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category.category_id} className="telemetry-card rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{category.name}</h3>
                      <p className="text-sm text-zinc-500">Scale: {category.scale_min} - {category.scale_max}</p>
                    </div>
                  </div>

                  {category.brand_names && category.brand_names.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-xs text-zinc-500 mb-2">Assigned Brands:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.brand_names.map((name, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 mb-4">All brands (no specific assignment)</p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditCategory(category)}
                    className="w-full border-white/10 text-zinc-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit & Assign Brands
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              Create Admin Account
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Create a new admin with full CMS access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Name *</Label>
              <Input
                value={adminForm.name}
                onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                className="input-dark"
                placeholder="Admin Name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Email *</Label>
              <Input
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                className="input-dark"
                placeholder="admin@kotlerx.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Password *</Label>
              <Input
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                className="input-dark"
                placeholder="••••••••"
              />
            </div>
            <Button onClick={createAdmin} disabled={submitting} className="w-full btn-primary">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Partner Dialog */}
      <Dialog open={createPartnerOpen} onOpenChange={setCreatePartnerOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Add Partner/Sponsor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Name *</Label>
              <Input
                value={partnerForm.name}
                onChange={(e) => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                className="input-dark"
                placeholder="Partner Name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <textarea
                value={partnerForm.description || ''}
                onChange={(e) => setPartnerForm(prev => ({ ...prev, description: e.target.value }))}
                className="input-dark w-full h-20 resize-none"
                placeholder="Brief description about this partner..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Type</Label>
              <Select value={partnerForm.partner_type} onValueChange={(v) => setPartnerForm(prev => ({ ...prev, partner_type: v }))}>
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/10">
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                  <SelectItem value="association">Association</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Logo</Label>
              <ImageUploadWithZoom
                value={partnerForm.logo_base64}
                onChange={(base64) => setPartnerForm(prev => ({ ...prev, logo_base64: base64, logo_url: '' }))}
                onRemove={() => setPartnerForm(prev => ({ ...prev, logo_base64: '', logo_url: '' }))}
                previewSize="w-24 h-24"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Website URL</Label>
              <Input
                value={partnerForm.website_url}
                onChange={(e) => setPartnerForm(prev => ({ ...prev, website_url: e.target.value }))}
                className="input-dark"
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={partnerForm.is_visible}
                onChange={(e) => setPartnerForm(prev => ({ ...prev, is_visible: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label className="text-zinc-400">Visible on public pages</Label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={partnerForm.is_featured}
                onChange={(e) => setPartnerForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <Label className="text-zinc-400">Featured (Big logo on landing page - max 2)</Label>
            </div>
            <Button onClick={createPartner} disabled={submitting} className="w-full btn-primary">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Partner
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Partner Dialog */}
      <Dialog open={editPartnerOpen} onOpenChange={setEditPartnerOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Edit Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Name *</Label>
              <Input
                value={partnerForm.name}
                onChange={(e) => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                className="input-dark"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <textarea
                value={partnerForm.description || ''}
                onChange={(e) => setPartnerForm(prev => ({ ...prev, description: e.target.value }))}
                className="input-dark w-full h-20 resize-none"
                placeholder="Brief description about this partner..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Type</Label>
              <Select value={partnerForm.partner_type} onValueChange={(v) => setPartnerForm(prev => ({ ...prev, partner_type: v }))}>
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/10">
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                  <SelectItem value="association">Association</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Logo</Label>
              <ImageUploadWithZoom
                value={partnerForm.logo_base64 || partnerForm.logo_url}
                onChange={(base64) => setPartnerForm(prev => ({ ...prev, logo_base64: base64, logo_url: '' }))}
                onRemove={() => setPartnerForm(prev => ({ ...prev, logo_base64: '', logo_url: '' }))}
                previewSize="w-24 h-24"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={partnerForm.is_visible}
                onChange={(e) => setPartnerForm(prev => ({ ...prev, is_visible: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label className="text-zinc-400">Visible on public pages</Label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={partnerForm.is_featured}
                onChange={(e) => setPartnerForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <Label className="text-zinc-400">Featured (Big logo on landing page - max 2)</Label>
            </div>
            <Button onClick={updatePartner} disabled={submitting} className="w-full btn-primary">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Partner
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category with Brand Assignment Dialog */}
      <Dialog open={editCategoryOpen} onOpenChange={setEditCategoryOpen}>
        <DialogContent className="bg-surface border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded text-white">Edit Assessment Category</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Assign this category to specific brand teams
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Category Name</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className="input-dark"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <Input
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                className="input-dark"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Min Scale</Label>
                <Input
                  type="number"
                  value={categoryForm.scale_min}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, scale_min: parseInt(e.target.value) || 1 }))}
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Max Scale</Label>
                <Input
                  type="number"
                  value={categoryForm.scale_max}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, scale_max: parseInt(e.target.value) || 5 }))}
                  className="input-dark"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <Label className="text-zinc-400 mb-3 block">Assign to Brand Teams</Label>
              <p className="text-xs text-zinc-500 mb-3">Leave empty to apply to all brands</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {brands.map(brand => (
                  <button
                    key={brand.brand_id}
                    onClick={() => toggleBrandInCategory(brand.brand_id)}
                    className={`p-2 rounded-lg text-left text-sm transition-all ${
                      categoryForm.brand_ids?.includes(brand.brand_id)
                        ? 'bg-primary/20 border border-primary/50 text-white'
                        : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: brand.color || '#00f0ff' }}
                      />
                      <span className="truncate">{brand.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={categoryForm.is_active}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label className="text-zinc-400">Active</Label>
            </div>

            <Button onClick={updateCategory} disabled={submitting} className="w-full btn-primary">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminPanel;
