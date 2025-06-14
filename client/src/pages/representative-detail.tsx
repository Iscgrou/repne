import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  CreditCard, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Eye,
  Download
} from "lucide-react";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import PaymentModal from "@/components/payment-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function RepresentativeDetail() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: representative, isLoading } = useQuery({
    queryKey: ["/api/representatives", id],
    enabled: !!id,
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/representatives", id, "invoices"],
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/representatives", id, "payments"],
    enabled: !!id,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return await apiRequest("POST", "/api/payments", paymentData);
    },
    onSuccess: () => {
      toast({
        title: "موفقیت",
        description: "پرداخت با موفقیت ثبت شد",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/representatives", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/representatives", id, "payments"] });
      setShowPaymentModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: "خطا در ثبت پرداخت: " + error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-muted rounded-xl"></div>
      </div>
    );
  }

  if (!representative) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">نماینده یافت نشد</h2>
        <Button onClick={() => setLocation("/representatives")}>
          <ArrowLeft className="mr-2 h-4 w-4 rtl-flip" />
          بازگشت به لیست نمایندگان
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-400";
    if (balance < 0) return "text-red-400";
    return "text-muted-foreground";
  };

  const contactInfo = representative.contactInfo ? JSON.parse(representative.contactInfo) : {};
  const totalDebt = invoices?.reduce((sum: number, invoice: any) => 
    invoice.status !== 'PAID' ? sum + invoice.totalAmount : sum, 0) || 0;
  const paymentReliability = invoices?.length > 0 ? 
    (invoices.filter((inv: any) => inv.status === 'PAID').length / invoices.length * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={representative.persianFullName}
        description={`کد نماینده: ${representative.representativeCode}`}
        actions={
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="phoenix-gradient text-obsidian hover:opacity-90"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              ثبت پرداخت
            </Button>
            <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-obsidian">
              <Edit className="mr-2 h-4 w-4" />
              ویرایش
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/representatives")}
            >
              <ArrowLeft className="mr-2 h-4 w-4 rtl-flip" />
              بازگشت
            </Button>
          </div>
        }
      />

      {/* Status and Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="موجودی حساب"
          value={formatCurrency(representative.balance || 0)}
          icon={<DollarSign className="h-4 w-4" />}
          description={representative.balance >= 0 ? "بستانکار" : "بدهکار"}
          className={getBalanceColor(representative.balance || 0)}
        />
        
        <StatCard
          title="کل بدهی"
          value={formatCurrency(totalDebt)}
          icon={<TrendingUp className="h-4 w-4" />}
          description="فاکتورهای پرداخت نشده"
        />
        
        <StatCard
          title="قابلیت اعتماد"
          value={`${paymentReliability}%`}
          icon={<Calendar className="h-4 w-4" />}
          description="نرخ پرداخت به موقع"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">اطلاعات کلی</TabsTrigger>
          <TabsTrigger value="invoices">فاکتورها ({invoices?.length || 0})</TabsTrigger>
          <TabsTrigger value="payments">پرداخت‌ها ({payments?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="obsidian-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  اطلاعات تماس
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contactInfo.mobile || 'اطلاعات موجود نیست'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{contactInfo.email || 'اطلاعات موجود نیست'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{contactInfo.address || 'اطلاعات موجود نیست'}</span>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">وضعیت:</span>
                    <Badge className={representative.isActive ? "status-success" : "status-error"}>
                      {representative.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Tiers */}
            <Card className="obsidian-card">
              <CardHeader>
                <CardTitle>تعرفه‌های اختصاصی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((tier) => (
                    <div key={tier} className="flex justify-between items-center p-2 rounded bg-muted/50">
                      <span className="text-sm font-medium">سطح {tier}:</span>
                      <span className="text-sm">
                        {formatCurrency(representative[`priceTier${tier}` as keyof typeof representative] || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card className="obsidian-card">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">شماره فاکتور</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">مبلغ</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">وضعیت</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">تاریخ ایجاد</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">سررسید</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices?.length > 0 ? (
                      invoices.map((invoice: any) => (
                        <tr key={invoice.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-medium text-gold">{invoice.invoiceNumber}</span>
                          </td>
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
                          <td className="py-4 px-4 text-muted-foreground text-sm">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fa-IR') : '-'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="p-2 text-blue-400 hover:bg-blue-500/20">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-2 text-purple-400 hover:bg-purple-500/20">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          هنوز فاکتوری برای این نماینده ایجاد نشده است
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="obsidian-card">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">مبلغ</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">روش پرداخت</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">شماره مرجع</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">تاریخ</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments?.length > 0 ? (
                      payments.map((payment: any) => (
                        <tr key={payment.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4 font-semibold">{formatCurrency(payment.amount)}</td>
                          <td className="py-4 px-4">{payment.paymentMethod}</td>
                          <td className="py-4 px-4 text-muted-foreground">{payment.referenceNumber || '-'}</td>
                          <td className="py-4 px-4 text-muted-foreground text-sm">
                            {new Date(payment.paymentDate || '').toLocaleDateString('fa-IR')}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={payment.isConfirmed ? "status-success" : "status-warning"}>
                              {payment.isConfirmed ? "تأیید شده" : "در انتظار تأیید"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          هنوز پرداختی برای این نماینده ثبت نشده است
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={(data) => createPaymentMutation.mutate({ 
          ...data, 
          representativeId: representative.id 
        })}
        isLoading={createPaymentMutation.isPending}
      />
    </div>
  );
}
