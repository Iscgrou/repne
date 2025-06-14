import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./sidebar";
import Header from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "داشبورد", description: "مرور کلی سیستم فاکتور فنیکس" },
  "/invoices": { title: "فاکتورها", description: "مدیریت فاکتورها و پردازش" },
  "/representatives": { title: "نمایندگان", description: "مدیریت نمایندگان و تعرفه‌ها" },
  "/collaborators": { title: "همکاران فروش", description: "مدیریت همکاران و پورسانت‌ها" },
  "/admin": { title: "تنظیمات", description: "تنظیمات سیستم و مدیریت" },
};

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Close sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentPage = pageTitles[location] || pageTitles["/"];

  return (
    <div className="flex h-screen overflow-hidden bg-obsidian">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="lg:hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={currentPage.title}
          description={currentPage.description}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <motion.main
          key={location}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-6 space-y-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
