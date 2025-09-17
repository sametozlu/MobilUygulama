import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ListTodo, FileText, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      path: "/",
      label: "Ana Sayfa",
      icon: Home,
      testId: "nav-dashboard"
    },
    {
      path: "/tasks",
      label: "Görevler",
      icon: ListTodo,
      testId: "nav-tasks"
    },
    {
      path: "/reports",
      label: "Raporlar",
      icon: FileText,
      testId: "nav-reports"
    },
    {
      path: "/admin",
      label: "Admin",
      icon: Shield,
      testId: "nav-admin",
      adminOnly: true
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-30">
      <div className="grid grid-cols-4 h-16">
        {navItems.map(({ path, label, icon: Icon, testId, adminOnly }) => {
          // Hide admin tab for non-admin users
          if (adminOnly && user?.role !== 'admin') {
            return <div key={path} />; // Empty div to maintain grid layout
          }

          const isActive = location === path;
          
          return (
            <Button
              key={path}
              variant="ghost"
              className={`flex flex-col items-center justify-center space-y-1 h-full rounded-none ${
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
              onClick={() => navigate(path)}
              data-testid={testId}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
