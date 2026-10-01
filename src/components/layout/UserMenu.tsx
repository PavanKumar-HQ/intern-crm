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
        className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-[#F7F7F6] text-xs transition-colors cursor-pointer"
      >
        <div className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center text-[10px] font-bold">
          P
        </div>
        <span className="font-medium text-[#18181B]">Pavan</span>
        <ChevronDown className="w-3 h-3 text-[#A1A1AA]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#EEEEEC] rounded-lg shadow-sm z-50 py-1 divide-y divide-[#EEEEEC]">
          <div className="px-3 py-2">
            <div className="text-xs font-semibold text-[#18181B]">Pavan Kumar</div>
            <div className="text-[10px] text-[#71717A] truncate">pavan@brandex.in · Admin</div>
          </div>
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#52525B] hover:text-[#18181B] hover:bg-[#F7F7F6]"
            >
              <User className="w-3.5 h-3.5 text-[#71717A]" />
              Profile & Account
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#52525B] hover:text-[#18181B] hover:bg-[#F7F7F6]"
            >
              <Settings className="w-3.5 h-3.5 text-[#71717A]" />
              Workspace Settings
            </Link>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
