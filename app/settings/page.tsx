'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sidebar from '@/components/sidebar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Screening {
  id: string;
  created_at: string;
  risk_level: 'low' | 'moderate' | 'high';
  confidence_score: number;
  overall_condition: string;
  indicators: string | string[];
  summary: string;
  image_url?: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Preferences
  const [screeningReminders, setScreeningReminders] = useState(true);
  const [eduUpdates, setEduUpdates] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'data' | 'account' | ''>('');
  const [deleting, setDeleting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/login');
    }
    // Check maintenance mode - but allow admins to access
    if (mounted && user) {
      const isAdmin = user.email?.includes('admin') || user.email === 'admin@smartsmile.com';
      const maintenanceMode = localStorage.getItem('maintenance_mode') === 'true';
      if (maintenanceMode && !isAdmin) {
        router.push('/maintenance');
      }
    }
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchScreenings();
    }
  }, [user]);

  const fetchScreenings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setScreenings(data);
    }
    setLoadingData(false);
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setPasswordStrength(score);
  };

  const getStrengthLabel = () => {
    const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    return labels[passwordStrength] || 'Very Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#f87171';
    if (passwordStrength <= 2) return '#fbbf24';
    return '#34d399';
  };

  const handlePasswordUpdate = async () => {
    if (!user) return;
    
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    setUpdatingPassword(true);
    
    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      });
      
      if (signInError) {
        setPasswordError('Current password is incorrect');
        setUpdatingPassword(false);
        return;
      }
      
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        setPasswordError(updateError.message);
      } else {
        setPasswordSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength(0);
        
        // Send custom SmartSmile password changed email
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'password-changed',
              to_email: user.email,
              user_name: user.email?.split('@')[0] || 'User'
            })
          });
        } catch (emailError) {
          console.log('Could not send confirmation email');
        }
        
        showToastMessage('Password updated successfully');
      }
    } catch (err) {
      setPasswordError('An unexpected error occurred');
    }
    
    setUpdatingPassword(false);
  };

  const handleDownloadJSON = async () => {
    if (!user) return;
    
    const data = {
      user: {
        email: user.email,
        created_at: user.created_at,
      },
      screenings: screenings.map(s => ({
        id: s.id,
        created_at: s.created_at,
        risk_level: s.risk_level,
        confidence_score: s.confidence_score,
        overall_condition: s.overall_condition,
        indicators: s.indicators,
        summary: s.summary,
      })),
      exported_at: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartsmile-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToastMessage('Your data export has been prepared');
  };

  const handleDownloadPDF = async () => {
    if (!user || screenings.length === 0) {
      showToastMessage('No screening data available to export');
      return;
    }
    
    // Open the report page in a new tab for PDF generation
    window.open(`/report?userId=${user.id}`, '_blank');
    showToastMessage('Opening PDF report (use Print > Save as PDF to download)');
  };

  const handleDeleteAllData = async () => {
    if (!user) return;
    
    setDeleting(true);
    
    try {
      // Delete all screenings
      const { error: deleteError } = await supabase
        .from('screenings')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        showToastMessage('Error deleting data: ' + deleteError.message);
      } else {
        setScreenings([]);
        showToastMessage('All screening data has been deleted');
      }
    } catch (err) {
      showToastMessage('An unexpected error occurred');
    }
    
    setDeleting(false);
    setIsModalOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleting(true);
    
    try {
      // Delete all screenings first
      await supabase
        .from('screenings')
        .delete()
        .eq('user_id', user.id);
      
      // Delete user data from user_data table if exists
      await supabase
        .from('user_data')
        .delete()
        .eq('user_id', user.id);
      
      // Call the delete API to remove user from Supabase Auth
      const response = await fetch('/api/auth/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error('Failed to delete account:', data.error);
        showToastMessage('Failed to delete account');
        setDeleting(false);
        setIsModalOpen(false);
        return;
      }
      
      // Sign out after successful deletion
      await signOut();
      
      showToastMessage('Account deleted successfully');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      showToastMessage('An unexpected error occurred');
      setDeleting(false);
      setIsModalOpen(false);
    }
  };

  const confirmDelete = () => {
    if (modalType === 'account') {
      handleDeleteAccount();
    } else {
      handleDeleteAllData();
    }
  };

  const openModal = (type: 'data' | 'account') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
  };

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!mounted || authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-[#00e5ff]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitial = user.email ? user.email[0].toUpperCase() : 'U';
  const userName = user.email ? user.email.split('@')[0] : 'User';

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <Sidebar />
      <main className="md:ml-[240px] flex-1 p-4 md:p-10 pt-20 md:pt-10 max-w-full md:max-w-[820px]">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">Account Settings</h1>
          <p className="text-[#666] text-[0.88rem]">Manage your account information, password, and data preferences.</p>
        </div>

        {/* Account Information */}
        <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.15)] flex items-center justify-center text-[1rem]">
              👤
            </div>
            <div>
              <h2 className="font-['Syne'] font-bold text-[0.95rem] text-[#f0f0f0]">Account Information</h2>
              <p className="text-[#666] text-[0.78rem]">Your account details — email address is read-only</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex justify-between items-center py-3 border-b border-[rgba(255,255,255,0.04)]">
              <div className="text-[#666] text-[0.8rem]">Email Address</div>
              <div className="text-[#f0f0f0] text-[0.88rem] font-medium">{user.email}</div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[rgba(255,255,255,0.04)]">
              <div className="text-[#666] text-[0.8rem]">Account Status</div>
              <div className="inline-flex items-center gap-1 bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)] text-[#34d399] rounded-[100px] px-3 py-1 text-[0.72rem] font-semibold">
                ✓ Active
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[rgba(255,255,255,0.04)]">
              <div className="text-[#666] text-[0.8rem]">Member Since</div>
              <div className="text-[#f0f0f0] text-[0.88rem] font-medium">{formatDate(user.created_at)}</div>
            </div>
            <div className="flex justify-between items-center py-3">
              <div className="text-[#666] text-[0.8rem]">Total Screenings</div>
              <div className="text-[#f0f0f0] text-[0.88rem] font-medium">{screenings.length} screenings</div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.15)] flex items-center justify-center text-[1rem]">
              🔒
            </div>
            <div>
              <h2 className="font-['Syne'] font-bold text-[0.95rem] text-[#f0f0f0]">Change Password</h2>
              <p className="text-[#666] text-[0.78rem]">Use a strong, unique password to keep your account secure</p>
            </div>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <label className="block text-[#666] text-[0.8rem] font-medium mb-2">Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[#666] text-[0.8rem] font-medium mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    checkPasswordStrength(e.target.value);
                  }}
                  placeholder="Enter new password"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] transition-all"
                />
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map((i) => (
                    <div 
                      key={i} 
                      className={`h-[3px] flex-1 rounded-[2px] transition-colors ${i <= passwordStrength ? (passwordStrength <= 1 ? 'bg-[#f87171]' : passwordStrength <= 2 ? 'bg-[#fbbf24]' : 'bg-[#34d399]') : 'bg-[rgba(255,255,255,0.08)]'}`}
                    />
                  ))}
                </div>
                <div className="text-[0.72rem] text-[#666] mt-1" style={{ color: passwordStrength > 0 ? getStrengthColor() : undefined }}>
                  {newPassword ? getStrengthLabel() : 'Enter a new password'}
                </div>
              </div>
              <div>
                <label className="block text-[#666] text-[0.8rem] font-medium mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] transition-all"
                />
                <div className="text-[0.74rem] text-[#666] mt-2">Must match your new password exactly</div>
              </div>
            </div>
            {passwordError && (
              <div className="text-[#f87171] text-[0.85rem] mb-3">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="text-[#34d399] text-[0.85rem] mb-3">{passwordSuccess}</div>
            )}
            <button 
              onClick={handlePasswordUpdate}
              disabled={updatingPassword}
              className="bg-[#00e5ff] text-black px-6 py-2.5 rounded-[10px] font-['Syne'] font-bold text-[0.88rem] cursor-pointer hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50"
            >
              🔒 {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.15)] flex items-center justify-center text-[1rem]">
              📦
            </div>
            <div>
              <h2 className="font-['Syne'] font-bold text-[0.95rem] text-[#f0f0f0]">Data & Privacy</h2>
              <p className="text-[#666] text-[0.78rem]">Download or manage your SmartSmile data</p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-4 flex flex-col gap-2 hover:border-[rgba(0,229,255,0.15)] transition-colors">
                <h4 className="font-['Syne'] font-bold text-[0.85rem] text-[#f0f0f0]">Download My Data</h4>
                <p className="text-[#666] text-[0.78rem] leading-relaxed flex-1">Export a full copy of all your screening results, risk levels, and recommendations as a JSON file.</p>
                <button 
                  onClick={handleDownloadJSON}
                  className="bg-[rgba(0,229,255,0.07)] border border-[rgba(0,229,255,0.15)] text-[#00e5ff] rounded-[8px] px-4 py-2 font-['Syne'] font-semibold text-[0.78rem] cursor-pointer hover:bg-[rgba(0,229,255,0.13)] transition-colors inline-flex items-center gap-2 w-fit"
                >
                  ⬇ Download JSON
                </button>
              </div>
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-4 flex flex-col gap-2 hover:border-[rgba(0,229,255,0.15)] transition-colors">
                <h4 className="font-['Syne'] font-bold text-[0.85rem] text-[#f0f0f0]">Download PDF Reports</h4>
                <p className="text-[#666] text-[0.78rem] leading-relaxed flex-1">Download all your screening results compiled into a single printable PDF document.</p>
                <button 
                  onClick={handleDownloadPDF}
                  className="bg-[rgba(0,229,255,0.07)] border border-[rgba(0,229,255,0.15)] text-[#00e5ff] rounded-[8px] px-4 py-2 font-['Syne'] font-semibold text-[0.78rem] cursor-pointer hover:bg-[rgba(0,229,255,0.13)] transition-colors inline-flex items-center gap-2 w-fit"
                >
                  ⬇ Download PDF
                </button>
              </div>
            </div>
            <p className="text-[#666] text-[0.78rem] leading-relaxed">
              Your images are retained for 90 days then automatically deleted. Results and history are kept until you delete your account. See our <Link href="/privacy" className="text-[#00e5ff]">Privacy Policy</Link> for full details.
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.15)] flex items-center justify-center text-[1rem]">
              🔔
            </div>
            <div>
              <h2 className="font-['Syne'] font-bold text-[0.95rem] text-[#f0f0f0]">Preferences</h2>
              <p className="text-[#666] text-[0.78rem]">Customize your SmartSmile experience</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex justify-between items-center py-3 border-b border-[rgba(255,255,255,0.04)]">
              <div>
                <div className="text-[0.88rem] font-semibold text-[#f0f0f0] mb-0.5">Screening Reminders</div>
                <div className="text-[0.78rem] text-[#666]">Receive a reminder every 4 weeks to do a new screening</div>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={screeningReminders}
                  onChange={(e) => setScreeningReminders(e.target.checked)}
                  className="accent-[#00e5ff] w-4 h-4"
                />
                <span className="text-[0.83rem] text-[#666]">{screeningReminders ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <div className="text-[0.88rem] font-semibold text-[#f0f0f0] mb-0.5">Education Hub Updates</div>
                <div className="text-[0.78rem] text-[#666]">Get notified when new articles are published</div>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={eduUpdates}
                  onChange={(e) => setEduUpdates(e.target.checked)}
                  className="accent-[#00e5ff] w-4 h-4"
                />
                <span className="text-[0.83rem] text-[#666]">{eduUpdates ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[rgba(248,113,113,0.03)] border border-[rgba(248,113,113,0.13)] rounded-[16px] overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-[rgba(248,113,113,0.1)] flex items-center gap-3">
            <div>
              <h2 className="font-['Syne'] font-bold text-[0.95rem] text-[#f87171]">⚠️ Danger Zone</h2>
              <p className="text-[#666] text-[0.78rem] mt-0.5">These actions are permanent and cannot be undone. Please proceed with caution.</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-4 px-5 border-b border-[rgba(248,113,113,0.07)]">
            <div>
              <h4 className="font-semibold text-[0.88rem] text-[#f0f0f0] mb-0.5">Delete All Screening Data</h4>
              <p className="text-[#666] text-[0.78rem] leading-relaxed max-w-md">Permanently delete all your screening images, results, and history. Your account will remain active but empty.</p>
            </div>
            <button 
              onClick={() => openModal('data')}
              className="bg-[rgba(248,113,113,0.08)] text-[#f87171] border border-[rgba(248,113,113,0.2)] rounded-[10px] px-5 py-2 font-['Syne'] font-bold text-[0.82rem] cursor-pointer hover:bg-[rgba(248,113,113,0.15)] transition-colors whitespace-nowrap"
            >
              Delete All Data
            </button>
          </div>
          <div className="flex justify-between items-center py-4 px-5">
            <div>
              <h4 className="font-semibold text-[0.88rem] text-[#f0f0f0] mb-0.5">Delete Account</h4>
              <p className="text-[#666] text-[0.78rem] leading-relaxed max-w-md">Permanently delete your account and all associated data including screenings, images, and results. This cannot be reversed.</p>
            </div>
            <button 
              onClick={() => openModal('account')}
              className="bg-[rgba(248,113,113,0.08)] text-[#f87171] border border-[rgba(248,113,113,0.2)] rounded-[10px] px-5 py-2 font-['Syne'] font-bold text-[0.82rem] cursor-pointer hover:bg-[rgba(248,113,113,0.15)] transition-colors whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
          <div className="bg-[#111] border border-[rgba(248,113,113,0.2)] rounded-[20px] p-10 max-w-[420px] w-full text-center">
            <div className="text-[2.5rem] mb-4">
              {modalType === 'account' ? '⚠️' : '🗑️'}
            </div>
            <h3 className="font-['Syne'] font-extrabold text-[1.2rem] text-[#f0f0f0] mb-2">
              {modalType === 'account' ? 'Delete Your Account?' : 'Delete All Screening Data?'}
            </h3>
            <p className="text-[#666] text-[0.88rem] leading-relaxed mb-6">
              {modalType === 'account' 
                ? 'This will permanently delete your account and all associated data. You will be logged out immediately and will not be able to recover your data. This cannot be undone.'
                : 'This will permanently delete all your screening images, results, and history. Your account will remain active but empty. This cannot be undone.'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={closeModal}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)] text-[#f0f0f0] rounded-[10px] px-6 py-2.5 font-['Syne'] font-semibold text-[0.88rem] cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-[#f87171] text-black rounded-[10px] px-6 py-2.5 font-['Syne'] font-bold text-[0.88rem] cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div 
        className={`fixed bottom-8 right-8 bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)] rounded-[12px] px-5 py-3.5 flex items-center gap-2 text-[0.85rem] text-[#34d399] transition-transform duration-300 z-[999] ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
      >
        <span>✅</span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
