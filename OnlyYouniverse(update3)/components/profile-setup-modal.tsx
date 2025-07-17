"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { GraduationCap, Globe, User, MapPin, Calendar, BookOpen, Phone, Mail } from "lucide-react";

interface ProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
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

export function ProfileSetupModal({ open, onOpenChange, onComplete }: ProfileSetupModalProps) {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [roleSelection, setRoleSelection] = useState<"student_in_india" | "student_abroad" | "">("");
  
  // Common fields
  const [formData, setFormData] = useState({
    bio: "",
    phone: "",
    // For students in India
    currentEducationLevel: "",
    targetCountry: "",
    desiredCourse: "",
    expectedAdmissionYear: "",
    currentCity: "",
    // For international students
    currentUniversity: "",
    studyCountry: "",
    enrolledProgram: "",
    yearOfStudy: "",
    residenceCity: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !roleSelection) {
      toast.error("Please select your current status");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const profileUpdate: any = {
        role: roleSelection,
        bio: formData.bio,
        phone: formData.phone,
        profile_completed: true,
        is_new_user: false,
      };

      if (roleSelection === "student_in_india") {
        profileUpdate.current_education_level = formData.currentEducationLevel;
        profileUpdate.preferred_destination = formData.targetCountry;
        profileUpdate.course = formData.desiredCourse;
        profileUpdate.expected_admission_year = formData.expectedAdmissionYear;
        profileUpdate.current_city = formData.currentCity;
        profileUpdate.country = "India";
      } else {
        profileUpdate.university = formData.currentUniversity;
        profileUpdate.country = formData.studyCountry;
        profileUpdate.course = formData.enrolledProgram;
        profileUpdate.year_of_study = formData.yearOfStudy;
        profileUpdate.current_city = formData.residenceCity;
      }

      await updateProfile(profileUpdate);
      toast.success("Profile setup completed!");
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete();
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center space-x-2">
            <User className="h-6 w-6" />
            <span>Complete Your Profile</span>
          </DialogTitle>
        </DialogHeader>
        
        {step === 1 && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <GraduationCap className="h-6 w-6" />
                <span>Your Current Status</span>
              </CardTitle>
              <CardDescription>
                Help us understand your educational journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Are you currently studying in India or abroad?</Label>
                <RadioGroup value={roleSelection} onValueChange={(value) => setRoleSelection(value as any)}>
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
              </div>
              
              <Button onClick={handleNext} className="w-full" size="lg">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>
                {roleSelection === "student_in_india" ? "Student in India" : "International Student"}
              </CardTitle>
              <CardDescription>
                Please fill in all applicable fields to create your complete profile
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Common Fields */}
              <div className="space-y-4">
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
              </div>

              {roleSelection === "student_in_india" ? (
                /* Fields for Students in India */
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Academic Information</span>
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="educationLevel">Current Education Level</Label>
                      <Select value={formData.currentEducationLevel} onValueChange={(value) => handleInputChange("currentEducationLevel", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent>
                          {educationLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetCountry">Target Country for Studies</Label>
                      <Select value={formData.targetCountry} onValueChange={(value) => handleInputChange("targetCountry", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="desiredCourse">Desired Course/Program</Label>
                      <Select value={formData.desiredCourse} onValueChange={(value) => handleInputChange("desiredCourse", value)}>
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
              ) : (
                /* Fields for International Students */
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>International Study Information</span>
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentUniversity">Current University/Institution</Label>
                    <Input
                      id="currentUniversity"
                      placeholder="Enter your university name"
                      value={formData.currentUniversity}
                      onChange={(e) => handleInputChange("currentUniversity", e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studyCountry">Country of Study</Label>
                      <Select value={formData.studyCountry} onValueChange={(value) => handleInputChange("studyCountry", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="residenceCity">City of Residence</Label>
                      <Input
                        id="residenceCity"
                        placeholder="Enter your city"
                        value={formData.residenceCity}
                        onChange={(e) => handleInputChange("residenceCity", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="enrolledProgram">Program Enrolled In</Label>
                      <Select value={formData.enrolledProgram} onValueChange={(value) => handleInputChange("enrolledProgram", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
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
                          {studyYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Complete Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}