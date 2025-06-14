import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserCheck, 
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
  {
    title: "داشبورد",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "فاکتورها",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "نمایندگان",
    href: "/representatives",
    icon: Users,
  },
  {
    title: "همکاران فروش",
    href: "/collaborators",
    icon: UserCheck,
  },
  {
    title: "تنظیمات",
    href: "/admin",
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleNavigation = (href: string) => {
    setLocation(href);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 z-50 h-full w-64 obsidian-card border-l border-gold/20 lg:relative lg:translate-x-0 lg:z-auto"
        style={{
          background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
        }}
      >
        {/* Logo and Brand */}
        <div className="p-6 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg phoenix-gradient flex items-center justify-center">
              <span className="text-obsidian font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold phoenix-gradient-text">Phoenix</h1>
              <p className="text-xs text-muted-foreground">سیستم فاکتور</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleNavigation(item.href)}
                  variant="ghost"
                  className={`w-full justify-start gap-3 px-4 py-3 h-auto ${
                    isActive
                      ? "bg-gold/20 text-gold border border-gold/30"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Button>
              </motion.div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gold/20">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-3">
            <div className="w-8 h-8 rounded-full phoenix-gradient flex items-center justify-center">
              <span className="text-obsidian font-semibold text-sm">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email || "مدیر سیستم"}
              </p>
              <p className="text-xs text-muted-foreground">ادمین</p>
            </div>
          </div>
          
          <Button
            onClick={() => window.location.href = '/api/logout'}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            خروج از سیستم
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
