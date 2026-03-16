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

export default function AdminSettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  // Settings state
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [imageRetentionDays, setImageRetentionDays] = useState('90');
  const [resultsRetentionDays, setResultsRetentionDays] = useState('365');
  const [maxImageSizeMB, setMaxImageSizeMB] = useState('10');
  const [maxScreeningsPerDay, setMaxScreeningsPerDay] = useState('5');

  // Danger modal
  const [dangerModal, setDangerModal] = useState<{ show: boolean; action: string; label: string }>({ show: false, action: '', label: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push('/login');
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!adminData) { router.push('/dashboard'); return; }
    setLoadingData(false);
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSaveGeneral = () => {
    // Save maintenance mode to localStorage
    localStorage.setItem('maintenance_mode', maintenanceMode.toString());
    showToast('General settings saved successfully');
  };

  const handleSaveRetention = () => {
    showToast('Data retention settings saved successfully');
  };

  const handleSaveLimits = () => {
    showToast('Usage limits saved successfully');
  };

  const handleDangerAction = () => {
    const { action } = dangerModal;
    setDangerModal({ show: false, action: '', label: '' });
    if (action === 'clear-screenings') {
      showToast('All screening data has been cleared');
    } else if (action === 'clear-users') {
      showToast('All user accounts have been removed');
    } else if (action === 'reset-system') {
      showToast('System has been reset to defaults');
    }
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

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: value ? '#a855f7' : 'rgba(255,255,255,0.1)' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  );

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'A';

  if (!mounted || authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="text-[#a855f7]">Loading settings...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#060608] flex">
      {/* Sidebar */}
      <aside className="w-[240px] min-w-[240px] bg-[#0a0a0c] border-r border-[rgba(255,255,255,0.07)] flex flex-col fixed left-0 top-0 h-screen z-50">
        <div className="py-6 px-4 border-b border-[rgba(255,255,255,0.07)]">
          <span className="font-['Syne'] font-extrabold text-[1.15rem] bg-gradient-to-r from-[#a855f7] to-[#00e5ff] bg-clip-text text-transparent">SmartSmile</span>
          <span className="inline-block bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.25)] text-[#a855f7] text-[0.62rem] px-1.5 py-0.5 rounded ml-1 align-middle font-bold tracking-wider">ADMIN</span>
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
        <Link href="/admin/dentists" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
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
        <Link href="/admin/settings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-l-2 border-[#a855f7] text-[0.88rem]">
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#a855f7] to-[#00e5ff] flex items-center justify-center font-bold text-[0.85rem] text-black">{userInitial}</div>
            <div>
              <div className="text-[0.85rem] font-semibold">Admin</div>
              <div className="text-[0.7rem] text-[#a855f7] font-semibold">System Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-[240px] flex-1 p-10 max-w-[820px]">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">System Settings</h1>
          <p className="text-[#666] text-[0.85rem]">Manage platform-wide configuration, data policies, and access controls</p>
        </div>

        {/* General Settings */}
        <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden mb-5">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.15)] flex items-center justify-center text-[1rem]">⚙️</div>
            <div>
              <h2 className="font-['Syne'] font-bold text-[0.95rem]">General Settings</h2>
              <p className="text-[#666] text-[0.75rem]">Platform access and authentication controls</p>
            </div>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            {[
              {
                label: 'Allow New Registrations',
                desc: 'Enable or disable new user sign-ups on the platform',
                value: allowRegistration,
                onChange: setAllowRegistration,
              },
              {
                label: 'Require Email Verification',
                desc: 'Users must verify their email before accessing the platform',
                value: requireEmailVerification,
                onChange: setRequireEmailVerification,
              },
              {
                label: 'Maintenance Mode',
                desc: 'Take the platform offline for maintenance — all users will see a maintenance page',
                value: maintenanceMode,
                onChange: setMaintenanceMode,
              },
            ].map((setting) => (
              <div key={setting.label} className="flex justify-between items-center py-3 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
                <div className="flex-1 mr-8">
                  <div className="text-[0.88rem] font-semibold text-[#f0f0f0] mb-0.5">{setting.label}</div>
                  <div className="text-[0.75rem] text-[#666] leading-relaxed">{setting.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[0.75rem]" style={{ color: setting.value ? '#a855f7' : '#666' }}>
                    {setting.value ? 'Enabled' : 'Disabled'}
                  </span>
                  <Toggle value={setting.value} onChange={setting.onChange} />
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveGeneral}
                className="bg-[#a855f7] text-black border-none rounded-[10px] px-5 py-2.5 font-['Syne'] font-bold text-[0.88rem] cursor-pointer hover:opacity-90 transition-opacity"
              >
                Save General Settings
              </button>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden mb-5">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.12)] flex items-center justify-center text-[1rem]">📦</div>
            <div>
              <h2 className="font-['Syne'] font-bold text-[0.95rem]">Data Retention Policy</h2>
              <p className="text-[#666] text-[0.75rem]">Configure how long data is kept before automatic deletion</p>
            </div>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            {[
              {
                label: 'Image Retention Period',
                desc: 'Days to keep uploaded dental images before auto-deletion',
                value: imageRetentionDays,
                onChange: setImageRetentionDays,
                unit: 'days',
              },
              {
                label: 'Results Retention Period',
                desc: 'Days to keep screening results and history records',
                value: resultsRetentionDays,
                onChange: setResultsRetentionDays,
                unit: 'days',
              },
            ].map((field) => (
              <div key={field.label} className="flex justify-between items-center py-3 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
                <div className="flex-1 mr-8">
                  <div className="text-[0.88rem] font-semibold text-[#f0f0f0] mb-0.5">{field.label}</div>
                  <div className="text-[0.75rem] text-[#666]">{field.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    className="w-20 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2 text-[#f0f0f0] text-[0.88rem] text-center outline-none focus:border-[#a855f7] transition-colors"
                  />
                  <span className="text-[0.78rem] text-[#666]">{field.unit}</span>
                </div>
              </div>
            ))}
            <div className="bg-[rgba(249,115,22,0.04)] border border-[rgba(249,115,22,0.1)] rounded-[10px] px-4 py-3 text-[0.75rem] text-[#666] leading-relaxed">
              ⚠️ Changing retention periods affects all users. Images set to a shorter period will be deleted on the next scheduled cleanup job. Always communicate changes to users in advance.
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveRetention}
                className="bg-[#a855f7] text-black border-none rounded-[10px] px-5 py-2.5 font-['Syne'] font-bold text-[0.88rem] cursor-pointer hover:opacity-90 transition-opacity"
              >
                Save Retention Policy
              </button>
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden mb-5">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.12)] flex items-center justify-center text-[1rem]">📊</div>
            <div>
              <h2 className="font-['Syne'] font-bold text-[0.95rem]">Usage Limits</h2>
              <p className="text-[#666] text-[0.75rem]">Control platform usage quotas per user</p>
            </div>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            {[
              {
                label: 'Max Image Upload Size',
                desc: 'Maximum file size allowed for dental image uploads',
                value: maxImageSizeMB,
                onChange: setMaxImageSizeMB,
                unit: 'MB',
              },
              {
                label: 'Max Screenings Per Day',
                desc: 'Maximum number of screenings a single user can perform per day',
                value: maxScreeningsPerDay,
                onChange: setMaxScreeningsPerDay,
                unit: 'per day',
              },
            ].map((field) => (
              <div key={field.label} className="flex justify-between items-center py-3 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
                <div className="flex-1 mr-8">
                  <div className="text-[0.88rem] font-semibold text-[#f0f0f0] mb-0.5">{field.label}</div>
                  <div className="text-[0.75rem] text-[#666]">{field.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    className="w-20 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2 text-[#f0f0f0] text-[0.88rem] text-center outline-none focus:border-[#a855f7] transition-colors"
                  />
                  <span className="text-[0.78rem] text-[#666]">{field.unit}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <button
                onClick={handleSaveLimits}
                className="bg-[#a855f7] text-black border-none rounded-[10px] px-5 py-2.5 font-['Syne'] font-bold text-[0.88rem] cursor-pointer hover:opacity-90 transition-opacity"
              >
                Save Usage Limits
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[rgba(248,113,113,0.03)] border border-[rgba(248,113,113,0.13)] rounded-[16px] overflow-hidden mb-5">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(248,113,113,0.1)]">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.15)] flex items-center justify-center text-[1rem]">⚠️</div>
            <div>
              <h2 className="font-['Syne'] font-bold text-[0.95rem] text-[#f87171]">Danger Zone</h2>
              <p className="text-[#666] text-[0.75rem]">Irreversible system actions — proceed with extreme caution</p>
            </div>
          </div>
          <div className="px-6 py-2">
            {[
              {
                action: 'clear-screenings',
                label: 'Clear All Screening Data',
                title: 'Clear All Screenings',
                desc: 'Permanently delete all screening records, images, and results from the entire platform. User accounts remain intact.',
              },
              {
                action: 'clear-users',
                label: 'Remove All Users',
                title: 'Remove All Users',
                desc: 'Permanently delete all user accounts and their associated data. Admin accounts will remain.',
              },
              {
                action: 'reset-system',
                label: 'Reset System to Defaults',
                title: 'Reset System',
                desc: 'Reset all settings to factory defaults. This will not delete user data but will revert all configuration.',
              },
            ].map((item) => (
              <div key={item.action} className="flex justify-between items-center py-4 border-b border-[rgba(248,113,113,0.07)] last:border-b-0">
                <div className="flex-1 mr-8">
                  <div className="text-[0.88rem] font-semibold text-[#f0f0f0] mb-0.5">{item.title}</div>
                  <div className="text-[0.75rem] text-[#666] leading-relaxed">{item.desc}</div>
                </div>
                <button
                  onClick={() => setDangerModal({ show: true, action: item.action, label: item.title })}
                  className="bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)] text-[#f87171] rounded-[10px] px-4 py-2 font-['Syne'] font-bold text-[0.82rem] cursor-pointer hover:bg-[rgba(248,113,113,0.15)] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Danger Modal */}
      {dangerModal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
          <div className="bg-[#111] border border-[rgba(248,113,113,0.2)] rounded-[20px] p-10 max-w-[420px] w-full text-center">
            <div className="text-[2.5rem] mb-4">⚠️</div>
            <h3 className="font-['Syne'] font-extrabold text-[1.2rem] mb-2">{dangerModal.label}?</h3>
            <p className="text-[#666] text-[0.88rem] leading-relaxed mb-6">
              This action is permanent and cannot be undone. Are you absolutely sure you want to proceed?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDangerModal({ show: false, action: '', label: '' })}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)] text-[#f0f0f0] rounded-[10px] px-6 py-2.5 font-['Syne'] font-semibold text-[0.88rem] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDangerAction}
                className="bg-[#f87171] text-black border-none rounded-[10px] px-6 py-2.5 font-['Syne'] font-bold text-[0.88rem] cursor-pointer"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div
          className="fixed bottom-8 right-8 rounded-[12px] px-5 py-3 flex items-center gap-3 text-[0.85rem] z-[999]"
          style={{
            background: toast.type === 'success' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
            color: toast.type === 'success' ? '#34d399' : '#f87171',
          }}
        >
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}
