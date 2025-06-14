import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  AlertTriangle, 
  Users, 
  HandHeart,
  Upload,
  UserPlus,
  CreditCard,
  BarChart3,
  Eye,
  Edit,
  Download
} from "lucide-react";
import StatCard from "@/components/stat-card";
import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import UploadJsonModal from "@/components/upload-json-modal";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غیر مجاز",
          description: "در حال انتقال به صفحه ورود...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد"
        description="مرور کلی سیستم فاکتور فنیکس"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="کل درآمد ماه"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          icon={<DollarSign className="h-4 w-4" />}
          description="درآمد ماه جاری"
          trend={{
            value: 15.2,
            isPositive: true
          }}
        />
        
        <StatCard
          title="فاکتورهای معوق"
          value={stats?.overdueInvoices || 0}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="نیاز به پیگیری"
          trend={{
            value: 8.5,
            isPositive: false
          }}
        />
        
        <StatCard
          title="نمایندگان فعال"
          value={stats?.activeRepresentatives || 0}
          icon={<Users className="h-4 w-4" />}
          description="در سراسر کشور"
          trend={{
            value: 2.1,
            isPositive: true
          }}
        />
        
        <StatCard
          title="پورسانت‌های پرداختی"
          value={formatCurrency(stats?.paidCommissions || 0)}
          icon={<HandHeart className="h-4 w-4" />}
          description="این ماه"
          trend={{
            value: 12.3,
            isPositive: true
          }}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Invoices */}
        <div className="lg:col-span-2">
          <Card className="obsidian-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">آخرین فاکتورها</CardTitle>
              <Button variant="ghost" size="sm" className="text-gold hover:text-gold-light">
                مشاهده همه
                <Eye className="mr-2 h-4 w-4 rtl-flip" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">شماره فاکتور</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">نماینده</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">مبلغ</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">وضعیت</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentInvoices?.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-medium text-gold">{invoice.invoiceNumber}</span>
                        </td>
                        <td className="py-4 px-4">نماینده #{invoice.representativeId.slice(-6)}</td>
                        <td className="py-4 px-4 font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                        <td className="py-4 px-4">
                          <Badge className={`invoice-status-${invoice.status.toLowerCase()}`}>
                            {invoice.status === 'PAID' ? 'پرداخت شده' : 
                             invoice.status === 'PENDING_PAYMENT' ? 'در انتظار' : 
                             invoice.status === 'OVERDUE' ? 'معوق' : 'پیش‌نویس'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">
                          {new Date(invoice.createdAt || '').toLocaleDateString('fa-IR')}
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          هنوز فاکتوری ایجاد نشده است
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div>
          <Card className="obsidian-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">اقدامات سریع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="w-full justify-start gap-4 h-auto p-4 bg-gold/20 hover:bg-gold/30 text-gold border-gold/30"
                variant="outline"
              >
                <div className="p-2 rounded-lg bg-gold/20">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium">آپلود فایل JSON</p>
                  <p className="text-sm text-muted-foreground">پردازش فاکتورهای جدید</p>
                </div>
              </Button>
              
              <Button 
                className="w-full justify-start gap-4 h-auto p-4"
                variant="outline"
              >
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium">نماینده جدید</p>
                  <p className="text-sm text-muted-foreground">افزودن نماینده</p>
                </div>
              </Button>
              
              <Button 
                className="w-full justify-start gap-4 h-auto p-4"
                variant="outline"
              >
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CreditCard className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium">ثبت پرداخت</p>
                  <p className="text-sm text-muted-foreground">پرداخت جدید</p>
                </div>
              </Button>
              
              <Button 
                className="w-full justify-start gap-4 h-auto p-4"
                variant="outline"
              >
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium">گزارش مالی</p>
                  <p className="text-sm text-muted-foreground">تولید گزارش</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <UploadJsonModal 
        open={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}
