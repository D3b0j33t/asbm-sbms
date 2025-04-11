
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NavigationHeader from "./NavigationHeader";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Calendar as CalendarIcon,
  CheckSquare,
  GraduationCap,
  Home,
  LucideIcon,
  ShieldCheck,
  UserCircle2,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Trophy,
  Download,
  UserPlus,
} from "lucide-react";

interface NavItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon: Icon, isActive, collapsed }) => {
  return (
    <Link to={to} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start transition-all duration-300",
          isActive 
            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
            : "hover:bg-muted hover:text-primary"
        )}
      >
        <Icon className={cn("h-5 w-5", isActive ? "animate-pulse" : "", collapsed ? "" : "mr-2")} />
        {!collapsed && label}
      </Button>
    </Link>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const { userRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const commonNavItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/calendar", label: "Calendar", icon: CalendarIcon },
    { to: "/todo", label: "Tasks", icon: CheckSquare },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/profile", label: "Profile", icon: UserCircle2 },
  ];

  const roleBasedNavItems = {
    student: [
      { to: "/course/1", label: "My Courses", icon: GraduationCap },
      { to: "/student/files", label: "Course Materials", icon: Download },
    ],
    teacher: [
      { to: "/course/1", label: "My Courses", icon: GraduationCap },
      { to: "/reports", label: "Reports", icon: BarChart3 },
      { to: "/teacher/files", label: "Teaching Files", icon: FileText },
    ],
    admin: [
      { to: "/reports", label: "Reports", icon: BarChart3 },
      { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
      { to: "/register-student", label: "Register Student", icon: UserPlus },
    ],
  };

  const getNavItems = () => {
    if (!userRole) return commonNavItems;

    return [
      ...commonNavItems,
      ...(roleBasedNavItems[userRole] || []),
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className={cn(
      "h-screen border-r bg-background transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      <NavigationHeader toggleSidebar={toggleSidebar} />
      
      <div className="p-2 flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              isActive={location.pathname === item.to}
              collapsed={collapsed}
            />
          ))}
        </div>
        
        {!collapsed && (
          <div className="p-4 bg-muted/40 rounded-lg space-y-2 mb-2">
            <h3 className="text-sm font-medium">ASBM University</h3>
            <p className="text-xs text-muted-foreground">Bhubaneswar Campus</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <BadgeCheck className="h-4 w-4 mr-1 text-primary" />
              Summer Term 2023
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleSidebar}
          className="self-end mb-2"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
