import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Activity, History, ScanFace, LogOut } from "lucide-react";

export const AppNav = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: Activity },
    { to: "/scan", label: "Scan", icon: ScanFace },
    { to: "/history", label: "History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
            <ScanFace className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">SkinPulse</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant={location.pathname === to ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={signOut} className="ml-2">
            <LogOut className="w-4 h-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
};
