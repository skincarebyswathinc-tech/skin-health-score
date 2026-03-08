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
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/40">
      <div className="container flex items-center justify-between h-14">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
            <ScanFace className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">SkinPulse</span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link key={to} to={to}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-1.5 rounded-full text-xs ${isActive ? "font-semibold" : ""}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            );
          })}
          <div className="w-px h-5 bg-border/60 mx-1.5" />
          <Button variant="ghost" size="icon" onClick={signOut} className="rounded-full w-8 h-8">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </nav>
      </div>
    </header>
  );
};
