'use client';

import { useState } from 'react';
import StreamView from '@/components/StreamView';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [streamUrl, setStreamUrl] = useState('http://localhost:8000/video-feed');
  const [stats, setStats] = useState({
    personCount: 12,
    maleCount: 8,
    femaleCount: 4
  });

  // In a real application, this would connect to a backend service
  // that provides real-time statistics and allows switching streams
  const handleSwitchStream = () => {
    // This is a placeholder function that would normally switch to a different stream
    // For demo purposes, we'll just toggle between two URLs
    // if (streamUrl.includes('1687505435116')) {
    //   setStreamUrl('https://romecam.mvcc.edu/mjpg/video.mjpg');
    //   setStats({
    //     personCount: 8,
    //     maleCount: 5,
    //     femaleCount: 3
    //   });
    // } else {
      setStreamUrl('http://localhost:8000/video-feed');
      setStats({
        personCount: 12,
        maleCount: 8,
        femaleCount: 4
      });
    // }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
      {/* Stream view first on mobile/tablet, on the left for desktop */}
      <div className="w-full lg:w-4/5 h-[60vh] lg:h-full order-first lg:order-none">
        <StreamView streamUrl={streamUrl} stats={stats} />
      </div>
      <div className="w-full lg:w-1/5 h-auto lg:h-full">
        <Sidebar stats={stats} onSwitchStream={handleSwitchStream} />
      </div>
    </div>
  );
}
// 'use client';
// import { useState } from 'react';
// import StreamView from '@/components/StreamView';
// import Sidebar from '@/components/Sidebar';

// export default function Home() {
//   const [apiUrl, setApiUrl] = useState('http://localhost:5000'); // Update with your API server URL
//   const [stats, setStats] = useState({
//     personCount: 12,
//     maleCount: 8,
//     femaleCount: 4
//   });

//   // In a real application, this would connect to a backend service
//   // that provides real-time statistics and allows switching streams
//   const handleSwitchStream = () => {
//     // In a real implementation, you would tell your API to switch cameras/streams
//     // For now, we'll just update the stats as a demo
//     setStats(prev => ({
//       personCount: prev.personCount === 12 ? 8 : 12,
//       maleCount: prev.maleCount === 8 ? 5 : 8,
//       femaleCount: prev.femaleCount === 4 ? 3 : 4
//     }));
//   };

//   return (
//     <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
//       {/* Stream view first on mobile/tablet, on the left for desktop */}
//       <div className="w-full lg:w-4/5 h-[60vh] lg:h-full order-first lg:order-none">
//         <StreamView apiUrl={apiUrl} stats={stats} />
//       </div>
//       <div className="w-full lg:w-1/5 h-auto lg:h-full">
//         <Sidebar stats={stats} onSwitchStream={handleSwitchStream} />
//       </div>
//     </div>
//   );
// }