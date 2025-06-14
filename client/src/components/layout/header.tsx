import { motion } from "framer-motion";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description: string;
  onMenuToggle: () => void;
}

export default function Header({ title, description, onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-obsidian-light border-b border-gold/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold phoenix-gradient-text">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </motion.div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-muted relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="sm" className="p-2 hover:bg-muted">
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
