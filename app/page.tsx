// 'use client';

// import { useState } from 'react';
// import StreamView from '@/components/StreamView';
// import Sidebar from '@/components/Sidebar';

// export default function Home() {
//   const [stats, setStats] = useState({
//     personCount: 12,
//     maleCount: 8,
//     femaleCount: 4
//   });

//   const handleSwitchStream = () => {
//     setStats({
//       personCount: 12,
//       maleCount: 8,
//       femaleCount: 4
//     });
//   };

//   return (
//     <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
//       <div className="w-full lg:w-4/5 h-[60vh] lg:h-full order-first lg:order-none">
//         <StreamView stats={stats} />
//       </div>
//       <div className="w-full lg:w-1/5 h-auto lg:h-full">
//         <Sidebar stats={stats} onSwitchStream={handleSwitchStream} />
//       </div>
//     </div>
//   );
// }
// 'use client';
// import { useState } from 'react';
// import StreamView from '@/components/StreamView';
// import Sidebar from '@/components/Sidebar';

// export default function Home() {
//   const [stats, setStats] = useState({
//     personCount: 0,
//     maleCount: 0,
//     femaleCount: 0
//   });
  
//   // Hardcoded stream type - change this value to 'rtsp', 'mjpg', or 'redis' as needed
//   const streamType = 'redis';
  
//   const handleSwitchStream = () => {
//     setStats({
//       personCount: 0,
//       maleCount: 0,
//       femaleCount: 0
//     });
//   };
  
//   return (
//     <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
//       <div className="w-full lg:w-4/5 h-[60vh] lg:h-full order-first lg:order-none">
//         <StreamView stats={stats} streamType={streamType} />
//       </div>
//       <div className="w-full lg:w-1/5 h-auto lg:h-full">
//         <Sidebar stats={stats} onSwitchStream={handleSwitchStream} />
//       </div>
//     </div>
//   );
// }
// 'use client';
// import { useState, useEffect } from 'react';
// import StreamView from '@/components/StreamView';
// import Sidebar from '@/components/Sidebar';

// export default function Home() {
//   // Hardcoded male and female counts
//   const [stats, setStats] = useState({
//     personCount: 0,
//     maleCount: 5,  // Hardcoded male count
//     femaleCount: 3  // Hardcoded female count
//   });

//   // Hardcoded stream type - change this value to 'rtsp', 'mjpg', or 'redis' as needed
//   const streamType = 'redis';
  
//   const handleSwitchStream = () => {
//     setStats({
//       personCount: 0,
//       maleCount: 5,  // Reset to hardcoded values when switching streams
//       femaleCount: 3  // Reset to hardcoded values
//     });
//   };

//   // Fetch stats from FastAPI backend
//   const fetchStats = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:5000/analytics'); // FastAPI endpoint
//       if (response.ok) {
//         const data = await response.json();
//         // Only update the person count (currentInFrame)
//         setStats(prevStats => ({
//           ...prevStats,
//           personCount: data.currentInFrame || 0  // Only update the person count
//         }));
//       } else {
//         console.error("Failed to fetch stats:", response.statusText);
//       }
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     }
//   };

//   // Fetch stats when the component mounts
//   useEffect(() => {
//     fetchStats();
//   }, []);

//   return (
//     <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
//       <div className="w-full lg:w-4/5 h-[60vh] lg:h-full order-first lg:order-none">
//         <StreamView stats={stats} streamType={streamType} />
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
  // State to hold stats
  const [stats, setStats] = useState({
    personCount: 0,
    maleCount: 0,  // Hardcoded male count
    femaleCount: 0  // Hardcoded female count
  });

  // Hardcoded stream type - change this value to 'rtsp', 'mjpg', or 'redis' as needed
  const streamType = 'redis';
  
  const handleSwitchStream = () => {
    setStats({
      personCount: 0,
      maleCount: 0,  // Reset to hardcoded values when switching streams
      femaleCount: 0  // Reset to hardcoded values
    });
  };

  // Fetch stats from FastAPI backend
  const fetchStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/analytics'); // FastAPI endpoint
      if (response.ok) {
        const data = await response.json();
        // Only update the person count (currentInFrame)
        setStats(prevStats => ({
          ...prevStats,
          personCount: data.currentInFrame || 0,
          maleCount: data.currentInFrame || 0  // Only update the person count
        }));
      } else {
        console.error("Failed to fetch stats:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch stats when the component mounts, and set up an interval for continuous updates
  useEffect(() => {
    fetchStats(); // Fetch initial stats
    const interval = setInterval(fetchStats, 5000); // Fetch every 5 seconds for real-time updates

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
      <div className="w-full lg:w-4/5 h-[60vh] lg:h-full order-first lg:order-none">
        <StreamView stats={stats} streamType={streamType} />
      </div>
      <div className="w-full lg:w-1/5 h-auto lg:h-full">
        <Sidebar stats={stats} onSwitchStream={handleSwitchStream} />
      </div>
    </div>
  );
}
