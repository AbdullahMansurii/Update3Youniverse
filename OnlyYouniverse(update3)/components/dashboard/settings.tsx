"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Camera, Save } from "lucide-react";

const countries = [
  "Australia", "Canada", "Germany", "Netherlands", "New Zealand", 
  "Singapore", "Sweden", "Switzerland", "UK", "USA"
];

const courses = [
  "Computer Science", "Engineering", "Business Administration", "Medicine",
  "Economics", "Psychology", "Data Science", "MBA", "Law", "Architecture"
];

export function Settings() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    country: user?.country || "",
    university: user?.university || "",
    course: user?.course || "",
    yearOfStudy: user?.yearOfStudy || "",
    preferredDestination: user?.preferredDestination || "",
    phone: user?.phone || "",
    currentEducationLevel: user?.currentEducationLevel || "",
    expectedAdmissionYear: user?.expectedAdmissionYear || "",
    currentCity: user?.currentCity || "",
  });

  const [notifications, setNotifications] = useState({
    connectionRequests: true,
    messages: true,
    posts: true,
    emailNotifications: false,
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        country: user.country || "",
        university: user.university || "",
        course: user.course || "",
        yearOfStudy: user.yearOfStudy || "",
        preferredDestination: user.preferredDestination || "",
        phone: user.phone || "",
        currentEducationLevel: user.currentEducationLevel || "",
        expectedAdmissionYear: user.expectedAdmissionYear || "",
        currentCity: user.currentCity || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    updateProfile({
      name: formData.name,
      bio: formData.bio,
      country: formData.country,
      university: formData.university,
      course: formData.course,
      year_of_study: formData.yearOfStudy,
      preferred_destination: formData.preferredDestination,
      phone: formData.phone,
      current_education_level: formData.currentEducationLevel,
      expected_admission_year: formData.expectedAdmissionYear,
      current_city: formData.currentCity,
    }).then(() => {
      toast.success("Profile updated successfully!");
    }).catch(() => {
      toast.error("Failed to update profile");
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and academic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.image} />
                <AvatarFallback className="text-lg">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell others about yourself, your interests, and how you can help..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
              />
            </div>

            {/* Academic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Current Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  placeholder="Enter your university name"
                  value={formData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course/Field</Label>
                <Select value={formData.course} onValueChange={(value) => handleInputChange("course", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearOfStudy">Year of Study</Label>
                <Select value={formData.yearOfStudy} onValueChange={(value) => handleInputChange("yearOfStudy", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="Final Year">Final Year</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {user?.role === "student_in_india" && (
              <div className="space-y-2">
                <Label htmlFor="preferredDestination">Preferred Destination</Label>
                <Select value={formData.preferredDestination} onValueChange={(value) => handleInputChange("preferredDestination", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleSave} className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="connection-requests">Connection Requests</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone sends you a connection request</p>
              </div>
              <Switch
                id="connection-requests"
                checked={notifications.connectionRequests}
                onCheckedChange={(checked) => handleNotificationChange("connectionRequests", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="messages">Messages</Label>
                <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
              </div>
              <Switch
                id="messages"
                checked={notifications.messages}
                onCheckedChange={(checked) => handleNotificationChange("messages", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="posts">Posts & Comments</Label>
                <p className="text-sm text-muted-foreground">Get notified about new posts and comments</p>
              </div>
              <Switch
                id="posts"
                checked={notifications.posts}
                onCheckedChange={(checked) => handleNotificationChange("posts", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account security and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Download My Data</Button>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}