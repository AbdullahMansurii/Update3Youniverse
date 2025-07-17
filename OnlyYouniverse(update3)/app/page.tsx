"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LandingPage } from "@/components/landing-page";
import { Dashboard } from "@/components/dashboard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;

    // Check if user needs to complete profile
    if (user.isNewUser && !user.profileComplete) {
      console.log('🔄 Redirecting new user to profile completion:', {
        userId: user.id,
        isNewUser: user.isNewUser,
        profileComplete: user.profileComplete
      });
      router.push("/complete-profile");
      return;
    }

    // Log successful authentication for existing users
    if (!user.isNewUser || user.profileComplete) {
      console.log('✅ User authenticated successfully:', {
        userId: user.id,
        isNewUser: user.isNewUser,
        profileComplete: user.profileComplete
      });
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show loading while redirecting new users
  if (user && user.isNewUser && !user.profileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  return user ? <Dashboard /> : <LandingPage />;
}