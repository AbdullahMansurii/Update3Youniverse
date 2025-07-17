"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MessageCircle, Users, BookOpen, ArrowRight, Star } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleAuthOpen = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">Youniverse</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" onClick={() => handleAuthOpen("login")}>
              Sign In
            </Button>
            <Button onClick={() => handleAuthOpen("register")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Connecting Indian Students Worldwide
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Your Gateway to Global Education
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with Indian students already studying abroad. Get real guidance, avoid expensive consultancies, and build meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => handleAuthOpen("register")}>
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleAuthOpen("login")}>
              I'm Already Abroad
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Youniverse?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Break free from expensive consultancies and get authentic guidance from peers who've been there.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Peer Connections</CardTitle>
              <CardDescription>
                Connect directly with Indian students studying abroad
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <CardTitle>Real-time Chat</CardTitle>
              <CardDescription>
                Instant messaging with students from your preferred destinations
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Course Guidance</CardTitle>
              <CardDescription>
                Get insights about universities, courses, and admission processes
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <CardTitle>Verified Profiles</CardTitle>
              <CardDescription>
                All profiles verified with university emails for authenticity
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to connect with your global community
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Create Profile</CardTitle>
                <CardDescription>
                  Sign up and tell us about your educational aspirations or current studies
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-secondary">2</span>
                </div>
                <CardTitle>Find Connections</CardTitle>
                <CardDescription>
                  Search and filter students by country, university, or course of study
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Start Conversations</CardTitle>
                <CardDescription>
                  Send connection requests and start meaningful conversations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of Indian students building their global network
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => handleAuthOpen("register")}>
            Join Youniverse Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Globe className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Youniverse</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Youniverse. Connecting students worldwide.
            </div>
          </div>
        </div>
      </footer>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
}