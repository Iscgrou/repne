import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CreditCard, Phone, Calendar } from "lucide-react";

interface RepresentativeCardProps {
  representative: {
    id: string;
    representativeCode: string;
    persianFullName: string;
    balance?: number;
    isActive?: boolean;
    contactInfo?: string;
    createdAt?: string;
  };
  onClick?: () => void;
}

export default function RepresentativeCard({ representative, onClick }: RepresentativeCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-400";
    if (balance < 0) return "text-red-400";
    return "text-muted-foreground";
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(word => word.charAt(0)).join('');
  };

  const contactInfo = representative.contactInfo ? JSON.parse(representative.contactInfo) : {};

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className="obsidian-card hover:gold-glow transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full phoenix-gradient flex items-center justify-center">
                <span className="text-obsidian font-bold text-lg">
                  {getInitials(representative.persianFullName)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-gold transition-colors">
                  {representative.persianFullName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  کد: {representative.representativeCode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${representative.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <Badge className={representative.isActive ? "status-success" : "status-error"}>
                {representative.isActive ? "فعال" : "غیرفعال"}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">موجودی:</span>
              <span className={`font-semibold ${getBalanceColor(representative.balance || 0)}`}>
                {formatCurrency(representative.balance || 0)}
              </span>
            </div>
            
            {contactInfo.mobile && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">تلفن:</span>
                <span className="text-sm">{contactInfo.mobile}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">تاریخ عضویت:</span>
              <span className="text-sm">
                {representative.createdAt ? new Date(representative.createdAt).toLocaleDateString('fa-IR') : '-'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6 pt-4 border-t border-border">
            <Button 
              size="sm" 
              className="flex-1 gap-2 bg-gold/20 text-gold hover:bg-gold hover:text-obsidian transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <Eye className="h-3 w-3" />
              مشاهده
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 gap-2 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                // Handle payment action
              }}
            >
              <CreditCard className="h-3 w-3" />
              پرداخت
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
