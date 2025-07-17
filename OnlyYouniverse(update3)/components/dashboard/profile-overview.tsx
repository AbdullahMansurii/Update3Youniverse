"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileEditModal } from "@/components/profile-edit-modal";
import { useAuth } from "@/contexts/auth-context";
import { MapPin, GraduationCap, Users, MessageCircle, Edit, BookOpen } from "lucide-react";
import { useState } from "react";

export function ProfileOverview() {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const stats = [
    { label: "Connections", value: user?.profile?.connections?.length || 0, icon: Users },
    { label: "Messages", value: 12, icon: MessageCircle },
    { label: "Posts", value: 3, icon: BookOpen },
  ];

  const recentActivity = [
    { type: "connection", message: "Priya Sharma accepted your connection request", time: "2 hours ago" },
    { type: "message", message: "New message from Arjun Patel", time: "4 hours ago" },
    { type: "post", message: "Your post about visa process got 5 likes", time: "1 day ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's what's happening in your network</p>
        </div>
        <Button onClick={() => setShowEditModal(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your profile information and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.image} />
                <AvatarFallback className="text-lg">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h3 className="text-xl font-semibold">{user?.name}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <Badge variant={user?.role === "student_abroad" ? "default" : "secondary"}>
                  {user?.role === "student_in_india" ? "Student in India" : "Student Abroad"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {user?.profile?.country}
                  {user?.profile?.university && ` • ${user.profile.university}`}
                </span>
              </div>
              
              {user?.profile?.course && (
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{user.profile.course}</span>
                </div>
              )}
              
              {user?.profile?.preferredDestination && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Interested in: {user.profile.preferredDestination}</span>
                </div>
              )}
            </div>

            {user?.profile?.bio && (
              <div>
                <h4 className="font-semibold mb-2">Bio</h4>
                <p className="text-muted-foreground">{user.profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{stat.label}</span>
                </div>
                <span className="font-semibold">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ProfileEditModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
      />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>What's been happening in your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}