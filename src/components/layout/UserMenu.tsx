'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-white border border-[#E2DDD2] hover:bg-[#F3EFE7] text-xs transition-colors cursor-pointer shadow-2xs"
      >
        <div className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px] font-bold">
          P
        </div>
        <span className="font-semibold text-[#1C1917]">Pavan</span>
        <ChevronDown className="w-3 h-3 text-[#78716C]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2DDD2] rounded-xl shadow-xl z-50 p-1.5 divide-y divide-[#F5F2EB] animate-in fade-in duration-100">
          <div className="px-3 py-2.5">
            <div className="text-xs font-bold text-[#1C1917]">Pavan Kumar</div>
            <div className="text-[11px] text-[#78716C] mt-0.5 font-medium">pavan@brandex.in · Administrator</div>
          </div>
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#78716C]" />
              <span>Profile & Account</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-[#78716C]" />
              <span>Workspace Settings</span>
            </Link>
            <Link
              href="/team"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#78716C]" />
              <span>Role Permissions</span>
            </Link>
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] text-left transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#B91C1C]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
