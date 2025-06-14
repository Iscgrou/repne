import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  FileText, 
  Users, 
  DollarSign, 
  Calendar,
  Upload,
  Bell,
  Settings,
  LogOut,
  Flame
} from "lucide-react";
import StatCard from "@/components/stat-card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: representatives, isLoading: repsLoading } = useQuery({
    queryKey: ["/api/representatives"],
  });

  if (statsLoading || invoicesLoading || repsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="phoenix-gradient p-2 rounded-xl">
              <Flame className="h-8 w-8 text-obsidian" />
            </div>
            <div>
              <h1 className="text-2xl font-bold phoenix-gradient-text">Phoenix</h1>
              <p className="text-sm text-muted-foreground">پنل مدیریت</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src={user?.profileImageUrl || '/api/placeholder-avatar'} 
                alt={user?.firstName || 'کاربر'}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              {user?.isAdmin && (
                <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30">
                  مدیر سیستم
                </Badge>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">
            خوش آمدید، {user?.firstName}!
          </h2>
          <p className="text-muted-foreground">
            مدیریت فاکتورها و نمایندگان خود را از اینجا آغاز کنید
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="درآمد ماهانه"
            value={`${(stats?.monthlyRevenue || 0).toLocaleString('fa-IR')} تومان`}
            icon={<TrendingUp className="h-5 w-5" />}
            description="درآمد ماه جاری"
            trend={{
              value: 12.5,
              isPositive: true
            }}
            className="obsidian-card"
          />
          
          <StatCard
            title="فاکتورهای معوقه"
            value={stats?.overdueInvoices || 0}
            icon={<FileText className="h-5 w-5" />}
            description="نیاز به پیگیری"
            trend={{
              value: 3.2,
              isPositive: false
            }}
            className="obsidian-card"
          />
          
          <StatCard
            title="نمایندگان فعال"
            value={stats?.activeRepresentatives || 0}
            icon={<Users className="h-5 w-5" />}
            description="نمایندگان در حال فعالیت"
            className="obsidian-card"
          />
          
          <StatCard
            title="کمیسیون پرداختی"
            value={`${(stats?.paidCommissions || 0).toLocaleString('fa-IR')} تومان`}
            icon={<DollarSign className="h-5 w-5" />}
            description="کمیسیون ماه جاری"
            className="obsidian-card"
          />
        </div>

        {/* Quick Actions */}
        <Card className="obsidian-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-gold" />
              اقدامات سریع
            </CardTitle>
            <CardDescription>
              دسترسی سریع به عملیات مهم سیستم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex-col gap-2 phoenix-gradient hover:bg-gold-light text-obsidian"
                onClick={() => window.location.href = '/invoices'}
              >
                <FileText className="h-6 w-6" />
                آپلود JSON
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-gold text-gold hover:bg-gold hover:text-obsidian"
                onClick={() => window.location.href = '/representatives'}
              >
                <Users className="h-6 w-6" />
                مدیریت نمایندگان
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-gold text-gold hover:bg-gold hover:text-obsidian"
                onClick={() => window.location.href = '/invoices'}
              >
                <FileText className="h-6 w-6" />
                فاکتورها
              </Button>
              
              {user?.isAdmin && (
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-gold text-gold hover:bg-gold hover:text-obsidian"
                  onClick={() => window.location.href = '/admin'}
                >
                  <Settings className="h-6 w-6" />
                  پنل مدیریت
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card className="obsidian-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gold" />
                آخرین فاکتورها
              </CardTitle>
              <CardDescription>
                فاکتورهای اخیر سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices?.slice(0, 5).map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(invoice.issueDate).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="font-medium">
                        {invoice.totalAmount.toLocaleString('fa-IR')} تومان
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${invoice.status === 'PAID' ? 'status-success' : ''}
                          ${invoice.status === 'PENDING' ? 'status-warning' : ''}
                          ${invoice.status === 'OVERDUE' ? 'status-error' : ''}
                          ${invoice.status === 'DRAFT' ? 'status-info' : ''}
                        `}
                      >
                        {invoice.status === 'PAID' ? 'پرداخت شده' : 
                         invoice.status === 'PENDING' ? 'در انتظار' :
                         invoice.status === 'OVERDUE' ? 'معوقه' : 'پیش‌نویس'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {(!recentInvoices || recentInvoices.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    هنوز فاکتوری ثبت نشده است
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Representatives */}
          <Card className="obsidian-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                نمایندگان فعال
              </CardTitle>
              <CardDescription>
                نمایندگان با بیشترین فعالیت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {representatives?.filter((rep: any) => rep.isActive).slice(0, 5).map((rep: any) => (
                  <div key={rep.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{rep.persianFullName}</div>
                      <div className="text-sm text-muted-foreground">
                        کد: {rep.representativeCode}
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="font-medium">
                        {rep.balance.toLocaleString('fa-IR')} تومان
                      </div>
                      <Badge variant="outline" className="status-success">
                        فعال
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {(!representatives || representatives.filter((rep: any) => rep.isActive).length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    هنوز نماینده فعالی ثبت نشده است
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="obsidian-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gold" />
              وضعیت سیستم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">سیستم Phoenix آنلاین و آماده خدمات‌رسانی است</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}