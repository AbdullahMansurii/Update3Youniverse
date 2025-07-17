"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { GraduationCap, Globe, User, MapPin, Calendar, BookOpen, Phone, Mail, Save, Camera, Edit } from "lucide-react";

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const countries = [
  "Australia", "Canada", "Germany", "Netherlands", "New Zealand", 
  "Singapore", "Sweden", "Switzerland", "UK", "USA"
];

const courses = [
  "Computer Science", "Engineering", "Business Administration", "Medicine",
  "Economics", "Psychology", "Data Science", "MBA", "Law", "Architecture",
  "Biotechnology", "Finance", "Marketing", "International Relations"
];

const educationLevels = [
  "12th Grade", "Bachelor's 1st Year", "Bachelor's 2nd Year", "Bachelor's 3rd Year",
  "Bachelor's Final Year", "Bachelor's Graduate", "Master's Student", "PhD Student"
];

const studyYears = [
  "1st Year", "2nd Year", "3rd Year", "Final Year", "Graduate", "PhD"
];

const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", 
  "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", "Visakhapatnam"
];

export function ProfileEditModal({ open, onOpenChange }: ProfileEditModalProps) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    role: "" as "student_in_india" | "student_abroad" | "",
    country: "",
    university: "",
    course: "",
    yearOfStudy: "",
    preferredDestination: "",
    currentEducationLevel: "",
    expectedAdmissionYear: "",
    currentCity: "",
  });

  // Load user data when modal opens
  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
        role: user.role || "",
        country: user.country || "",
        university: user.university || "",
        course: user.course || "",
        yearOfStudy: user.yearOfStudy || "",
        preferredDestination: user.preferredDestination || "",
        currentEducationLevel: user.currentEducationLevel || "",
        expectedAdmissionYear: user.expectedAdmissionYear || "",
        currentCity: user.currentCity || "",
      });
      setErrors({});
    }
  }, [open, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.role) {
      newErrors.role = "Please select your current status";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    if (formData.role === "student_abroad") {
      if (!formData.university.trim()) {
        newErrors.university = "University is required for international students";
      }
      if (!formData.course) {
        newErrors.course = "Course is required";
      }
      if (!formData.yearOfStudy) {
        newErrors.yearOfStudy = "Year of study is required";
      }
    }

    if (formData.role === "student_in_india") {
      if (!formData.currentEducationLevel) {
        newErrors.currentEducationLevel = "Education level is required";
      }
      if (!formData.preferredDestination) {
        newErrors.preferredDestination = "Preferred destination is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const profileUpdate: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        bio: formData.bio,
        phone: formData.phone,
        country: formData.country,
      };

      if (formData.role === "student_abroad") {
        profileUpdate.university = formData.university;
        profileUpdate.course = formData.course;
        profileUpdate.year_of_study = formData.yearOfStudy;
        profileUpdate.current_city = formData.currentCity;
      } else {
        profileUpdate.current_education_level = formData.currentEducationLevel;
        profileUpdate.preferred_destination = formData.preferredDestination;
        profileUpdate.course = formData.course;
        profileUpdate.expected_admission_year = formData.expectedAdmissionYear;
        profileUpdate.current_city = formData.currentCity;
      }

      await updateProfile(profileUpdate);
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center space-x-2">
            <Edit className="h-6 w-6" />
            <span>Edit Profile</span>
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal and academic information</CardDescription>
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

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / About Yourself</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself, your interests, and goals..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Current Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Current Status</span>
              </h3>
              
              <div className="space-y-4">
                <Label className="text-base font-medium">Are you currently studying in India or abroad? *</Label>
                <RadioGroup 
                  value={formData.role} 
                  onValueChange={(value) => handleInputChange("role", value)}
                  className={errors.role ? "border border-red-500 rounded-lg p-2" : ""}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="student_in_india" id="india" />
                    <Label htmlFor="india" className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">I am in India and planning to study abroad</p>
                          <p className="text-sm text-muted-foreground">Looking for guidance from students already abroad</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="student_abroad" id="abroad" />
                    <Label htmlFor="abroad" className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-secondary" />
                        <div>
                          <p className="font-medium">I am already studying abroad</p>
                          <p className="text-sm text-muted-foreground">Ready to help students planning their journey</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
              </div>
            </div>

            {/* Academic Information */}
            {formData.role && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Academic Information</span>
                </h3>
                
                {formData.role === "student_in_india" ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="educationLevel">Current Education Level *</Label>
                        <Select 
                          value={formData.currentEducationLevel} 
                          onValueChange={(value) => handleInputChange("currentEducationLevel", value)}
                        >
                          <SelectTrigger className={errors.currentEducationLevel ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                          <SelectContent>
                            {educationLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.currentEducationLevel && <p className="text-sm text-red-500">{errors.currentEducationLevel}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="targetCountry">Preferred Destination *</Label>
                        <Select 
                          value={formData.preferredDestination} 
                          onValueChange={(value) => handleInputChange("preferredDestination", value)}
                        >
                          <SelectTrigger className={errors.preferredDestination ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select target country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.preferredDestination && <p className="text-sm text-red-500">{errors.preferredDestination}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="desiredCourse">Desired Course/Program</Label>
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
                        <Label htmlFor="expectedYear">Expected Year of Admission</Label>
                        <Select value={formData.expectedAdmissionYear} onValueChange={(value) => handleInputChange("expectedAdmissionYear", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2027">2027</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Current Country *</Label>
                        <Select 
                          value={formData.country} 
                          onValueChange={(value) => handleInputChange("country", value)}
                        >
                          <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="India">India</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentCity">Current City</Label>
                        <Select value={formData.currentCity} onValueChange={(value) => handleInputChange("currentCity", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianCities.map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentUniversity">Current University/Institution *</Label>
                      <Input
                        id="currentUniversity"
                        placeholder="Enter your university name"
                        value={formData.university}
                        onChange={(e) => handleInputChange("university", e.target.value)}
                        className={errors.university ? "border-red-500" : ""}
                      />
                      {errors.university && <p className="text-sm text-red-500">{errors.university}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studyCountry">Country of Study *</Label>
                        <Select 
                          value={formData.country} 
                          onValueChange={(value) => handleInputChange("country", value)}
                        >
                          <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="residenceCity">City of Residence</Label>
                        <Input
                          id="residenceCity"
                          placeholder="Enter your city"
                          value={formData.currentCity}
                          onChange={(e) => handleInputChange("currentCity", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="enrolledProgram">Program Enrolled In *</Label>
                        <Select 
                          value={formData.course} 
                          onValueChange={(value) => handleInputChange("course", value)}
                        >
                          <SelectTrigger className={errors.course ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map(course => (
                              <SelectItem key={course} value={course}>{course}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.course && <p className="text-sm text-red-500">{errors.course}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearOfStudy">Year of Study *</Label>
                        <Select 
                          value={formData.yearOfStudy} 
                          onValueChange={(value) => handleInputChange("yearOfStudy", value)}
                        >
                          <SelectTrigger className={errors.yearOfStudy ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {studyYears.map(year => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.yearOfStudy && <p className="text-sm text-red-500">{errors.yearOfStudy}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}