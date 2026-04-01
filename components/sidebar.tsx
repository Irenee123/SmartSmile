'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, ScanLine, ClockArrowUp, BookOpen, MapPin, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
  const userName = user?.email ? user.email.split('@')[0] : 'User';

  const navLink = (href: string, icon: React.ReactNode, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[0.88rem] transition-colors ${
          active
            ? 'bg-[rgba(0,229,255,0.08)] text-[#00e5ff] border-l-2 border-[#00e5ff]'
            : 'text-[#666] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0]'
        }`}
      >
        {icon} {label}
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="py-6 px-4 border-b border-[rgba(255,255,255,0.07)] font-['Syne'] font-extrabold text-[1.2rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
        SmartSmile
      </div>
      <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666]">Main</div>
      {navLink('/dashboard', <LayoutDashboard size={16} />, 'Dashboard')}
      {navLink('/screening', <ScanLine size={16} />, 'New Screening')}
      {navLink('/history', <ClockArrowUp size={16} />, 'History')}
      {navLink('/education', <BookOpen size={16} />, 'Education Hub')}
      {navLink('/dentist', <MapPin size={16} />, 'Find a Dentist')}
      <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Account</div>
      {navLink('/settings', <Settings size={16} />, 'Settings')}
      <button
        onClick={() => { setOpen(false); setShowLogoutModal(true); }}
        className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors w-full text-left"
      >
        <LogOut size={16} /> Log Out
      </button>
      <div className="mt-auto py-4 px-4 border-t border-[rgba(255,255,255,0.07)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#a855f7] flex items-center justify-center font-bold text-[0.85rem] text-black">
            {userInitial}
          </div>
          <div>
            <div className="text-[0.85rem] font-semibold">{userName}</div>
            <div className="text-[0.72rem] text-[#666] truncate max-w-[140px]">{user?.email}</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[240px] min-w-[240px] bg-[#0e0e0e] border-r border-[rgba(255,255,255,0.07)] flex-col fixed left-0 top-0 h-screen z-50">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0e0e0e] border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between px-4 z-50">
        <span className="font-['Syne'] font-extrabold text-[1.1rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
          SmartSmile
        </span>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          aria-label="Open menu"
        >
          <span className="w-5 h-[2px] bg-[#f0f0f0] rounded" />
          <span className="w-5 h-[2px] bg-[#f0f0f0] rounded" />
          <span className="w-5 h-[2px] bg-[#f0f0f0] rounded" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-[260px] bg-[#0e0e0e] border-r border-[rgba(255,255,255,0.07)] flex flex-col z-[70] transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between py-4 px-4 border-b border-[rgba(255,255,255,0.07)]">
          <span className="font-['Syne'] font-extrabold text-[1.1rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-[#666] hover:text-[#f0f0f0] text-xl transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto pt-2">
          <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666]">Main</div>
          {navLink('/dashboard', <LayoutDashboard size={16} />, 'Dashboard')}
          {navLink('/screening', <ScanLine size={16} />, 'New Screening')}
          {navLink('/history', <ClockArrowUp size={16} />, 'History')}
          {navLink('/education', <BookOpen size={16} />, 'Education Hub')}
          {navLink('/dentist', <MapPin size={16} />, 'Find a Dentist')}
          <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Account</div>
          {navLink('/settings', <Settings size={16} />, 'Settings')}
          <button
            onClick={() => { setOpen(false); setShowLogoutModal(true); }}
            className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors w-full text-left"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
        <div className="py-4 px-4 border-t border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#a855f7] flex items-center justify-center font-bold text-[0.85rem] text-black">
              {userInitial}
            </div>
            <div>
              <div className="text-[0.85rem] font-semibold">{userName}</div>
              <div className="text-[0.72rem] text-[#666] truncate max-w-[160px]">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Logout modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(255,200,50,0.1)] flex items-center justify-center text-[#fbbf24]"><LogOut size={28} /></div>
              <h3 className="font-['Syne'] font-bold text-xl text-white mb-2">Log Out</h3>
              <p className="text-[#888] text-[0.92rem] mb-6">Are you sure you want to log out?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => { await signOut(); router.push('/login'); }}
                  className="flex-1 bg-[#f87171] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[#ef4444] transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
