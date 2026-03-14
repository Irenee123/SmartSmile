'use client';

import { Suspense } from 'react';
import ResultsContent from './results-content';

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808] flex items-center justify-center"><div className="text-[#00e5ff]">Loading...</div></div>}>
      <ResultsContent />
    </Suspense>
  );
}
