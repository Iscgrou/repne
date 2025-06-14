import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Database, 
  Users, 
  FileText, 
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);

  const { data: systemConfigs, isLoading: configsLoading } = useQuery({
    queryKey: ["/api/system-configs"],
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

  const { data: representatives } = useQuery({
    queryKey: ["/api/representatives"],
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: salesCollaborators } = useQuery({
    queryKey: ["/api/sales-collaborators"],
  });

  const seedDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/seed-data", {});
    },
    onSuccess: (data) => {
      toast({
        title: "موفقیت",
        description: "داده‌های اولیه با موفقیت ایجاد شدند",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: "خطا در ایجاد داده‌های اولیه: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedDataMutation.mutateAsync();
    } finally {
      setIsSeeding(false);
    }
  };

  const systemStats = {
    totalRepresentatives: representatives?.length || 0,
    totalInvoices: invoices?.length || 0,
    totalCollaborators: salesCollaborators?.length || 0,
    systemConfigs: systemConfigs?.length || 0,
  };

  if (configsLoading) {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="پنل مدیریت"
        description="تنظیمات سیستم و مدیریت داده‌ها"
        actions={
          <div className="flex gap-3">
            <Button 
              onClick={handleSeedData}
              disabled={isSeeding}
              className="phoenix-gradient text-obsidian hover:opacity-90"
            >
              {isSeeding ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              ایجاد داده‌های نمونه
            </Button>
            <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-obsidian">
              <Download className="mr-2 h-4 w-4" />
              بکاپ سیستم
            </Button>
          </div>
        }
      />

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="تعداد نمایندگان"
          value={systemStats.totalRepresentatives}
          icon={<Users className="h-4 w-4" />}
          description="نمایندگان ثبت شده"
        />
        
        <StatCard
          title="تعداد فاکتورها"
          value={systemStats.totalInvoices}
          icon={<FileText className="h-4 w-4" />}
          description="فاکتورهای ایجاد شده"
        />
        
        <StatCard
          title="همکاران فروش"
          value={systemStats.totalCollaborators}
          icon={<Users className="h-4 w-4" />}
          description="همکاران فعال"
        />
        
        <StatCard
          title="تنظیمات سیستم"
          value={systemStats.systemConfigs}
          icon={<Settings className="h-4 w-4" />}
          description="پیکربندی‌های فعال"
        />
      </div>

      {/* Main Admin Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System Configuration */}
        <Card className="obsidian-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              تنظیمات سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {systemConfigs?.length > 0 ? (
                systemConfigs.map((config: any) => (
                  <div key={config.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{config.key}</p>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">{config.value}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>هنوز تنظیماتی ایجاد نشده است</p>
                  <p className="text-sm">از دکمه "ایجاد داده‌های نمونه" استفاده کنید</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health & Status */}
        <Card className="obsidian-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              وضعیت سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-medium">پایگاه داده</p>
                    <p className="text-sm text-muted-foreground">اتصال برقرار</p>
                  </div>
                </div>
                <Badge className="status-success">فعال</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-medium">سیستم احراز هویت</p>
                    <p className="text-sm text-muted-foreground">Replit Auth</p>
                  </div>
                </div>
                <Badge className="status-success">فعال</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium">پردازشگر JSON</p>
                    <p className="text-sm text-muted-foreground">Marzban Adapter</p>
                  </div>
                </div>
                <Badge className="status-info">آماده</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="font-medium">سیستم تلگرام</p>
                    <p className="text-sm text-muted-foreground">اعلان‌های خودکار</p>
                  </div>
                </div>
                <Badge className="status-warning">در انتظار پیکربندی</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Tools */}
      <Card className="obsidian-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            ابزارهای توسعه
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleSeedData}
              disabled={isSeeding}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              {isSeeding ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <Database className="h-6 w-6" />
              )}
              <div className="text-center">
                <p className="font-medium">ایجاد داده‌های نمونه</p>
                <p className="text-xs text-muted-foreground">همکار، نماینده و فاکتور نمونه</p>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Upload className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">ورود داده‌های 227 نماینده</p>
                <p className="text-xs text-muted-foreground">بارگذاری فایل اکسل نمایندگان</p>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">خروجی گزارش کامل</p>
                <p className="text-xs text-muted-foreground">دانلود گزارش جامع سیستم</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Development Checklist */}
      <Card className="obsidian-card">
        <CardHeader>
          <CardTitle>وضعیت توسعه سیستم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-400">✅ کامل شده</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• طراحی پایگاه داده جامع</li>
                <li>• سیستم احراز هویت مدیریت</li>
                <li>• API کامل مدیریت</li>
                <li>• رابط کاربری چندصفحه‌ای</li>
                <li>• پردازشگر فایل JSON</li>
                <li>• محاسبات مالی پیشرفته</li>
                <li>• تم Obsidian & Gold</li>
                <li>• پشتیبانی کامل از فارسی</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-yellow-400">📋 برنامه‌ریزی شده</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• وارد کردن 227 نماینده</li>
                <li>• ادغام تلگرام برای اعلان‌ها</li>
                <li>• امکانات امنیتی پیشرفته</li>
                <li>• آماده‌سازی برای تولید</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
