'use client';

import { useState } from 'react';
import StreamView from '@/components/StreamView';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [stats, setStats] = useState({
    personCount: 12,
    maleCount: 8,
    femaleCount: 4
  });

  const handleSwitchStream = () => {
    setStats({
      personCount: 12,
      maleCount: 8,
      femaleCount: 4
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
      <div className="w-full lg:w-4/5 h-[60vh] lg:h-full order-first lg:order-none">
        <StreamView stats={stats} />
      </div>
      <div className="w-full lg:w-1/5 h-auto lg:h-full">
        <Sidebar stats={stats} onSwitchStream={handleSwitchStream} />
      </div>
    </div>
  );
}