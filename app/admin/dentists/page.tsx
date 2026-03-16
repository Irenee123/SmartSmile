'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Clinic {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  website: string;
  hours: string;
  services: string[];
  partnership: 'pending' | 'partner' | 'none';
  created_at: string;
}

export default function AdminDentistsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    website: '',
    hours: 'Mon-Fri: 8AM-5PM',
    services: '',
    partnership: 'none' as 'pending' | 'partner' | 'none'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/login');
    }
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) {
      checkAdminAndFetchData();
    }
  }, [user]);

  const checkAdminAndFetchData = async () => {
    if (!user) return;

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      router.push('/dashboard');
      return;
    }

    fetchClinics();
  };

  const fetchClinics = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setClinics(data);
    }
    setLoadingData(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleAddClinic = async () => {
    const servicesArray = formData.services.split(',').map(s => s.trim()).filter(s => s);
    
    const { error } = await supabase
      .from('clinics')
      .insert([{
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        website: formData.website,
        hours: formData.hours,
        services: servicesArray,
        partnership: formData.partnership
      }]);

    if (error) {
      alert('Error adding clinic: ' + error.message);
    } else {
      setShowAddModal(false);
      resetForm();
      fetchClinics();
    }
  };

  const handleUpdateClinic = async () => {
    if (!editingClinic) return;
    
    const servicesArray = formData.services.split(',').map(s => s.trim()).filter(s => s);
    
    const { error } = await supabase
      .from('clinics')
      .update({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        website: formData.website,
        hours: formData.hours,
        services: servicesArray,
        partnership: formData.partnership
      })
      .eq('id', editingClinic.id);

    if (!error) {
      setEditingClinic(null);
      resetForm();
      fetchClinics();
    }
  };

  const handleDeleteClinic = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchClinics();
    }
    setDeletingId(null);
  };

  const handleTogglePartnership = async (clinic: Clinic) => {
    const newPartnership = clinic.partnership === 'partner' ? 'none' : 'partner';
    
    await supabase
      .from('clinics')
      .update({ partnership: newPartnership })
      .eq('id', clinic.id);

    fetchClinics();
  };

  const openEditModal = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      phone: clinic.phone,
      email: clinic.email,
      location: clinic.location,
      website: clinic.website,
      hours: clinic.hours,
      services: clinic.services.join(', '),
      partnership: clinic.partnership
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      location: '',
      website: '',
      hours: 'Mon-Fri: 8AM-5PM',
      services: '',
      partnership: 'none'
    });
  };

  const getPartnershipBadge = (status: string) => {
    switch (status) {
      case 'partner':
        return <span className="bg-[rgba(52,211,153,0.15)] text-[#34d399] text-[0.7rem] px-2 py-1 rounded-full font-medium">Partner</span>;
      case 'pending':
        return <span className="bg-[rgba(251,191,36,0.15)] text-[#fbbf24] text-[0.7rem] px-2 py-1 rounded-full font-medium">Pending</span>;
      default:
        return <span className="bg-[rgba(255,255,255,0.08)] text-[#666] text-[0.7rem] px-2 py-1 rounded-full font-medium">None</span>;
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-[#a855f7]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitial = user.email ? user.email[0].toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-[#080808] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-[240px] min-w-[240px] bg-[#0e0e0e] border-r border-[rgba(255,255,255,0.07)] flex flex-col fixed left-0 top-0 h-screen z-50">
        <div className="py-6 px-4 border-b border-[rgba(255,255,255,0.07)]">
          <div>
            <span className="font-['Syne'] font-extrabold text-[1.15rem] bg-gradient-to-r from-[#a855f7] to-[#00e5ff] bg-clip-text text-transparent">
              SmartSmile
            </span>
            <span className="inline-block bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.25)] text-[#a855f7] text-[0.62rem] px-1.5 py-0.5 rounded ml-1 align-middle font-bold tracking-wider">
              ADMIN
            </span>
          </div>
        </div>

        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666]">Overview</div>
        <Link href="/admin" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>📊</span> Dashboard
        </Link>

        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Management</div>
        <Link href="/admin/users" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>👥</span> Users
        </Link>
        <Link href="/admin/screenings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>📷</span> Screenings
        </Link>
        <Link href="/admin/dentists" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-l-2 border-[#a855f7] text-[0.88rem]">
          <span>🦷</span> Dentists
        </Link>
        <Link href="/admin/education" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>📚</span> Education
        </Link>
        <Link href="/admin/announcements" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>📣</span> Announcements
        </Link>

        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">System</div>
        <Link href="/admin/model" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>🤖</span> Model Monitor
        </Link>
        <Link href="/admin/settings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>⚙️</span> Settings
        </Link>

        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Session</div>
        <button onClick={handleLogout} className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors w-full text-left">
          <span>🚪</span> Log Out
        </button>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
            <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-8 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(255,200,50,0.1)] flex items-center justify-center text-3xl">
                  🚪
                </div>
                <h3 className="font-['Syne'] font-bold text-xl text-white mb-2">Log Out</h3>
                <p className="text-[#888] text-[0.92rem] mb-6">Are you sure you want to log out?</p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 bg-[#f87171] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[#ef4444] transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto py-4 px-4 border-t border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#a855f7] to-[#00e5ff] flex items-center justify-center font-bold text-[0.85rem] text-black">
              {userInitial}
            </div>
            <div>
              <div className="text-[0.85rem] font-semibold">Admin</div>
              <div className="text-[0.7rem] text-[#a855f7] font-semibold">System Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[240px] flex-1 p-10 max-w-[calc(100vw-240px)]">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">Dentist Management</h1>
            <p className="text-[#666] text-[0.85rem]">
              Manage dental clinic partnerships and listings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchClinics}
              className="flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#666] rounded-lg px-4 py-2 text-[0.8rem] cursor-pointer hover:border-[#a855f7] hover:text-[#f0f0f0] transition-all"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-2 bg-[#a855f7] text-white rounded-lg px-4 py-2 text-[0.8rem] font-medium cursor-pointer hover:bg-[#9333ea] transition-all"
            >
              + Add Clinic
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Total Clinics</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none">{clinics.length}</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Partner Clinics</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none text-[#34d399]">{clinics.filter(c => c.partnership === 'partner').length}</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Pending</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none text-[#fbbf24]">{clinics.filter(c => c.partnership === 'pending').length}</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Not Partners</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none text-[#666]">{clinics.filter(c => c.partnership === 'none').length}</div>
          </div>
        </div>

        {/* Clinics Table */}
        <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)]">
                  <th className="text-left py-4 px-5 text-[0.72rem] text-[#666] uppercase tracking-[0.08em] font-medium">Clinic Name</th>
                  <th className="text-left py-4 px-5 text-[0.72rem] text-[#666] uppercase tracking-[0.08em] font-medium">Location</th>
                  <th className="text-left py-4 px-5 text-[0.72rem] text-[#666] uppercase tracking-[0.08em] font-medium">Contact</th>
                  <th className="text-left py-4 px-5 text-[0.72rem] text-[#666] uppercase tracking-[0.08em] font-medium">Status</th>
                  <th className="text-left py-4 px-5 text-[0.72rem] text-[#666] uppercase tracking-[0.08em] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#666]">Loading...</td>
                  </tr>
                ) : clinics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#666]">No clinics found. Click "Add Clinic" to add one.</td>
                  </tr>
                ) : (
                  clinics.map((clinic) => (
                    <tr key={clinic.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="py-4 px-5">
                        <div className="font-medium text-[#f0f0f0]">{clinic.name}</div>
                        <div className="text-[0.72rem] text-[#666] mt-1">{clinic.services.slice(0, 2).join(', ')}{clinic.services.length > 2 ? '...' : ''}</div>
                      </td>
                      <td className="py-4 px-5 text-[#999] text-[0.85rem]">{clinic.location}</td>
                      <td className="py-4 px-5">
                        <div className="text-[#999] text-[0.85rem]">{clinic.phone}</div>
                        <div className="text-[#666] text-[0.72rem]">{clinic.email}</div>
                      </td>
                      <td className="py-4 px-5">
                        {getPartnershipBadge(clinic.partnership)}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePartnership(clinic)}
                            className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-medium cursor-pointer transition-all ${
                              clinic.partnership === 'partner' 
                                ? 'bg-[rgba(251,191,36,0.15)] text-[#fbbf24] hover:bg-[rgba(251,191,36,0.25)]'
                                : 'bg-[rgba(52,211,153,0.15)] text-[#34d399] hover:bg-[rgba(52,211,153,0.25)]'
                            }`}
                          >
                            {clinic.partnership === 'partner' ? 'Remove Partner' : 'Make Partner'}
                          </button>
                          <button
                            onClick={() => openEditModal(clinic)}
                            className="px-3 py-1.5 rounded-lg text-[0.75rem] font-medium bg-[rgba(255,255,255,0.08)] text-[#999] hover:bg-[rgba(255,255,255,0.12)] hover:text-[#f0f0f0] transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClinic(clinic.id)}
                            disabled={deletingId === clinic.id}
                            className="px-3 py-1.5 rounded-lg text-[0.75rem] font-medium bg-[rgba(248,113,113,0.15)] text-[#f87171] hover:bg-[rgba(248,113,113,0.25)] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === clinic.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {(showAddModal || editingClinic) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.1)] rounded-[16px] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[rgba(255,255,255,0.07)]">
              <h2 className="font-['Syne'] font-extrabold text-[1.25rem] text-[#f0f0f0]">
                {editingClinic ? 'Edit Clinic' : 'Add New Clinic'}
              </h2>
              <p className="text-[#666] text-[0.85rem] mt-1">
                {editingClinic ? 'Update clinic information' : 'Add a new dental clinic to the directory'}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[#666] text-[0.8rem] mb-2">Clinic Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7]"
                  placeholder="e.g., Kigali Dental Care"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#666] text-[0.8rem] mb-2">Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7]"
                    placeholder="+250 788 000 000"
                  />
                </div>
                <div>
                  <label className="block text-[#666] text-[0.8rem] mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7]"
                    placeholder="info@clinic.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#666] text-[0.8rem] mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7]"
                  placeholder="Kigali, Rwanda"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#666] text-[0.8rem] mb-2">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7]"
                    placeholder="https://clinic.com"
                  />
                </div>
                <div>
                  <label className="block text-[#666] text-[0.8rem] mb-2">Partnership Status</label>
                  <select
                    value={formData.partnership}
                    onChange={(e) => setFormData({...formData, partnership: e.target.value as any})}
                    className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7]"
                  >
                    <option value="none">None</option>
                    <option value="pending">Pending</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#666] text-[0.8rem] mb-2">Opening Hours</label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) => setFormData({...formData, hours: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7]"
                  placeholder="Mon-Fri: 8AM-5PM"
                />
              </div>

              <div>
                <label className="block text-[#666] text-[0.8rem] mb-2">Services (comma separated)</label>
                <input
                  type="text"
                  value={formData.services}
                  onChange={(e) => setFormData({...formData, services: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7]"
                  placeholder="General Dentistry, Orthodontics, Teeth Whitening"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[rgba(255,255,255,0.07)] flex justify-end gap-3">
              <button
                onClick={() => { setShowAddModal(false); setEditingClinic(null); resetForm(); }}
                className="px-5 py-2.5 rounded-lg text-[0.85rem] font-medium bg-[rgba(255,255,255,0.08)] text-[#999] hover:bg-[rgba(255,255,255,0.12)] hover:text-[#f0f0f0] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={editingClinic ? handleUpdateClinic : handleAddClinic}
                disabled={!formData.name || !formData.phone || !formData.location}
                className="px-5 py-2.5 rounded-lg text-[0.85rem] font-medium bg-[#a855f7] text-white hover:bg-[#9333ea] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingClinic ? 'Update Clinic' : 'Add Clinic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
