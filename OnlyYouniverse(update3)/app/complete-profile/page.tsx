"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ProfileSetupModal } from "@/components/profile-setup-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function CompleteProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // User not authenticated, redirect to home
      console.log("Unauthorized access to profile completion - no user");
      router.replace("/");
      return;
    }

    // Check if user should be on this page
    if (!user.isNewUser || user.profileComplete) {
      // Log unexpected access for existing users
      console.warn("Unexpected redirect to profile completion page:", {
        userId: user.id,
        isNewUser: user.isNewUser,
        profileComplete: user.profileComplete,
        timestamp: new Date().toISOString()
      });
      
      setError("Profile completion is only available for new users during initial signup.");
      
      // Redirect existing users to dashboard
      setTimeout(() => {
        router.replace("/");
      }, 3000);
      return;
    }

    // Valid new user, show profile setup
    setShowModal(true);
  }, [user, isLoading, router]);

  const handleProfileComplete = () => {
    setShowModal(false);
    // Redirect to dashboard after profile completion
    router.replace("/");
  };

  const handleModalClose = () => {
    // Prevent closing modal without completing profile for new users
    if (user?.isNewUser && !user.profileComplete) {
      return;
    }
    setShowModal(false);
    router.replace("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Access Restricted</span>
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You will be redirected to the home page shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Complete Your Profile</h1>
          <p className="text-muted-foreground mb-8">
            Let's set up your profile to help you connect with the right students.
          </p>
        </div>
      </div>
      
      <ProfileSetupModal 
        open={showModal} 
        onOpenChange={handleModalClose}
        onComplete={handleProfileComplete}
      />
    </div>
  );
}