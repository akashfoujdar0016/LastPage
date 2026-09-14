'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthCard from '../../components/AuthCard';

function AuthPageContent() {
  return (
    <div className="min-h-screen bg-page text-ink flex flex-col justify-center items-center p-6 relative overflow-hidden selection:bg-ember/30 selection:text-ink">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-[32rem] h-[32rem] rounded-full bg-radial from-ember/[0.08] to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[28rem] h-[28rem] rounded-full bg-radial from-gold/[0.05] to-transparent blur-3xl pointer-events-none" />

      {/* Header back navigation */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={14} />
          <span>Back to home</span>
        </Link>
        <Link
          href="/"
          className="font-serif text-lg text-white font-medium tracking-wide"
        >
          LastPage
        </Link>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md relative z-10">
        <AuthCard />
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page" />}>
      <AuthPageContent />
    </Suspense>
  );
}
