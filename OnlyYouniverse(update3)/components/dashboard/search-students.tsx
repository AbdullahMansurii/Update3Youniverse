"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useStudents } from "@/hooks/use-students";
import { useConnections } from "@/hooks/use-connections";
import { Search, MapPin, GraduationCap, Send, Filter } from "lucide-react";
import { toast } from "sonner";

export function BrowseStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  
  const { students, loading, refetch } = useStudents();
  const { sendConnectionRequest } = useConnections();

  const handleSearch = () => {
    refetch({
      search: searchQuery || undefined,
      country: countryFilter === "all-countries" ? undefined : countryFilter || undefined,
      course: courseFilter === "all-courses" ? undefined : courseFilter || undefined,
      role: locationFilter === "all" ? undefined : locationFilter === "india" ? "student_in_india" : "student_abroad",
    });
  };

  const handleConnect = async (student: any) => {
    try {
      await sendConnectionRequest(student.id);
      toast.success(`Connection request sent to ${student.name}`);
    } catch (error) {
      toast.error("Failed to send connection request");
    }
  };

  const countries = [...new Set(students.map(s => s.country))];
  const courses = [...new Set(students.map(s => s.course).filter(Boolean))];

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Students</h1>
        <p className="text-muted-foreground">Connect with Indian students studying abroad</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Location Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Filter by Location</Label>
              <RadioGroup 
                value={locationFilter} 
                onValueChange={setLocationFilter}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">All Students</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="india" id="india" />
                  <Label htmlFor="india" className="cursor-pointer">Students in India</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="abroad" id="abroad" />
                  <Label htmlFor="abroad" className="cursor-pointer">Students Abroad</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Search and Other Filters */}
            <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, university, course, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-countries">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-courses">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Search</Button>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {students.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student.image_url} />
                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{student.name}</h3>
                  <Badge 
                    variant={student.role === "student_abroad" ? "default" : "secondary"} 
                    className="text-xs mt-1"
                  >
                    {student.role === "student_in_india" ? "In India" : "Abroad"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="truncate">{student.country}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span className="truncate">{student.course || 'Course not specified'}</span>
                </div>
                <p className="text-sm font-medium truncate">
                  {student.university || 'University not specified'}
                </p>
                {student.year_of_study && (
                  <p className="text-xs text-muted-foreground">
                    {student.year_of_study}
                  </p>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {student.bio || 'No bio available'}
              </p>
              
              <Button 
                className="w-full" 
                onClick={() => handleConnect(student)}
              >
                <Send className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      )}

      {!loading && students.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {locationFilter === "all" 
              ? "No students found matching your criteria." 
              : `No ${locationFilter === "india" ? "students in India" : "students abroad"} found matching your criteria.`
            }
          </p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  );
}