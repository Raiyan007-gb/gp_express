import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface SidebarProps {
  stats: {
    personCount: number;
    maleCount: number;
    femaleCount: number;
  };
  onSwitchStream: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ stats, onSwitchStream }) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Update date and time immediately
    updateDateTime();
    
    // Set up interval to update date and time every second
    const interval = setInterval(updateDateTime, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setCurrentDateTime(formattedDateTime);
  };

  const handleSignOut = () => {
    // Clear the authentication cookie
    document.cookie = 'admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Redirect to login page
    router.push('/login');
  };

  return (
    <div className="h-full flex flex-col bg-background/80 p-6 rounded-lg shadow-modern space-y-8 border border-primary">
      <div className="space-y-4">
        <h2 className="text-xl lg:text-2xl font-bold text-primary">Statistics</h2>
        <p className="text-sm lg:text-base text-secondary italic">{currentDateTime}</p>
        <div className="grid gap-4">
          <div className="card-modern p-3 lg:p-4 rounded-lg border border-secondary/30 hover:border-secondary/60">
            <p className="text-sm lg:text-lg font-medium text-secondary">Person Count</p>
            <p className="text-xl lg:text-3xl font-bold text-white">{stats.personCount}</p>
          </div>
          <div className="card-modern p-3 lg:p-4 rounded-lg border border-secondary/30 hover:border-secondary/60">
            <p className="text-sm lg:text-lg font-medium text-secondary">Male Count</p>
            <p className="text-xl lg:text-3xl font-bold text-white">{stats.maleCount}</p>
          </div>
          <div className="card-modern p-3 lg:p-4 rounded-lg border border-secondary/30 hover:border-secondary/60">
            <p className="text-sm lg:text-lg font-medium text-secondary">Female Count</p>
            <p className="text-xl lg:text-3xl font-bold text-white">{stats.femaleCount}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl lg:text-2xl font-bold text-primary">Heatmap Area</h2>
        <div className="bg-background/40 rounded-lg h-40 w-full border border-accent/30 p-2 shadow-inner">
          {/* Placeholder for heatmap visualization */}
        </div>
      </div>

      <div className="mt-auto flex flex-col space-y-4">
        <Button 
          onClick={onSwitchStream} 
          className="w-full text-lg py-6 gradient-blue shadow-modern"
          size="lg"
        >
          {/* Switch Bus */}
          Refresh
        </Button>
        
        <Button
          onClick={handleSignOut}
          className="self-end px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 rounded-md"
          variant="outline"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;