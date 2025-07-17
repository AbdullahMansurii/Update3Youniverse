"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { type DashboardView } from "@/components/dashboard";
import {
  Home,
  Search,
  MessageCircle,
  Users,
  BookOpen,
  Settings,
  Globe,
  LogOut
} from "lucide-react";

interface SidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "overview", icon: Home, label: "Overview" },
    { id: "search", icon: Search, label: "Browse Students" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "connections", icon: Users, label: "Connections" },
    { id: "posts", icon: BookOpen, label: "Posts" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Globe className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold gradient-text">Youniverse</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.image} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{user?.name}</p>
            <Badge variant="secondary" className="text-xs mt-1">
              {user?.role === "student_in_india" ? "In India" : "Abroad"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onViewChange(item.id as DashboardView)}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}