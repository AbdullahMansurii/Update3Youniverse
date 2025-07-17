"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { ProfileOverview } from "@/components/dashboard/profile-overview";
import { BrowseStudents } from "@/components/dashboard/search-students";
import { Messages } from "@/components/dashboard/messages";
import { Connections } from "@/components/dashboard/connections";
import { Settings } from "@/components/dashboard/settings";
import { Posts } from "@/components/dashboard/posts";
import { ProfileSetupModal } from "@/components/profile-setup-modal";
import { useAuth } from "@/contexts/auth-context";

export type DashboardView = "overview" | "search" | "messages" | "connections" | "posts" | "settings";

export function Dashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Show profile setup if profile is incomplete
  useEffect(() => {
    if (user && user.isNewUser && !user.profileComplete) {
      setShowProfileSetup(true);
    }
  }, [user]);

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return <ProfileOverview />;
      case "search":
        return <BrowseStudents />;
      case "messages":
        return <Messages />;
      case "connections":
        return <Connections />;
      case "posts":
        return <Posts />;
      case "settings":
        return <Settings />;
      default:
        return <ProfileOverview />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
      <ProfileSetupModal 
        open={showProfileSetup} 
        onOpenChange={setShowProfileSetup}
      />
    </div>
  );
}