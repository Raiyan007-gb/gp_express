// 'use client';

// import { useState } from 'react';
// import StreamView from '@/components/StreamView';
// import Sidebar from '@/components/Sidebar';

// export default function Home() {
//   const [streamUrl, setStreamUrl] = useState('https://romecam.mvcc.edu/mjpg/video.mjpg?timestamp=1687505435116');
//   const [stats, setStats] = useState({
//     personCount: 12,
//     maleCount: 8,
//     femaleCount: 4
//   });

//   // In a real application, this would connect to a backend service
//   // that provides real-time statistics and allows switching streams
//   const handleSwitchStream = () => {
//     // This is a placeholder function that would normally switch to a different stream
//     // For demo purposes, we'll just toggle between two URLs
//     if (streamUrl.includes('1687505435116')) {
//       setStreamUrl('https://romecam.mvcc.edu/mjpg/video.mjpg?timestamp=1687505435117');
//       setStats({
//         personCount: 8,
//         maleCount: 5,
//         femaleCount: 3
//       });
//     } else {
//       setStreamUrl('https://romecam.mvcc.edu/mjpg/video.mjpg?timestamp=1687505435116');
//       setStats({
//         personCount: 12,
//         maleCount: 8,
//         femaleCount: 4
//       });
//     }
//   };

//   return (
//     <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
//       {/* Stream view first on mobile/tablet, on the left for desktop */}
//       <div className="w-full lg:w-4/5 h-[60vh] lg:h-full order-first lg:order-none">
//         <StreamView streamUrl={streamUrl} stats={stats} />
//       </div>
//       <div className="w-full lg:w-1/5 h-auto lg:h-full">
//         <Sidebar stats={stats} onSwitchStream={handleSwitchStream} />
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import StreamView from '@/components/StreamView';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [streamUrl, setStreamUrl] = useState('http://localhost:8000/stream');
  const [stats, setStats] = useState({
    personCount: 0,
    maleCount: 0,
    femaleCount: 0
  });

  // Fetch stats from the API at regular intervals
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    // Update stats every 2 seconds
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // This function is now just a placeholder or could be used to switch camera feeds
  const handleSwitchStream = () => {
    // In a real app, you might have multiple camera streams to switch between
    console.log('Switch stream requested');
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
      <div className="w-full lg:w-4/5 h-[60vh] lg:h-full order-first lg:order-none">
        <StreamView streamUrl={streamUrl} stats={stats} />
      </div>
      <div className="w-full lg:w-1/5 h-auto lg:h-full">
        <Sidebar stats={stats} onSwitchStream={handleSwitchStream} />
      </div>
    </div>
  );
}