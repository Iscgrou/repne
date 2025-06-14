import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Download,
  ArrowUpDown
} from "lucide-react";
import PageHeader from "@/components/page-header";
import UploadJsonModal from "@/components/upload-json-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Invoices() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'PAID': { text: 'پرداخت شده', className: 'invoice-status-paid' },
      'PENDING_PAYMENT': { text: 'در انتظار', className: 'invoice-status-pending' },
      'OVERDUE': { text: 'معوق', className: 'invoice-status-overdue' },
      'DRAFT': { text: 'پیش‌نویس', className: 'invoice-status-draft' },
      'CANCELLED': { text: 'لغو شده', className: 'invoice-status-cancelled' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.DRAFT;
    
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.text}
      </Badge>
    );
  };

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.representativeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded-xl"></div>
        <div className="h-96 bg-muted rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت فاکتورها"
        description="مدیریت فاکتورها و پردازش فایل‌های JSON"
        actions={
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="phoenix-gradient text-obsidian hover:opacity-90"
            >
              <Upload className="mr-2 h-4 w-4" />
              آپلود JSON
            </Button>
            <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-obsidian">
              <Plus className="mr-2 h-4 w-4" />
              فاکتور جدید
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="obsidian-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">جستجو</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="شماره فاکتور، نماینده..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">وضعیت</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="همه وضعیت‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="PAID">پرداخت شده</SelectItem>
                  <SelectItem value="PENDING_PAYMENT">در انتظار</SelectItem>
                  <SelectItem value="OVERDUE">معوق</SelectItem>
                  <SelectItem value="DRAFT">پیش‌نویس</SelectItem>
                  <SelectItem value="CANCELLED">لغو شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-from" className="text-sm font-medium mb-2 block">تاریخ از</Label>
              <Input
                id="date-from"
                type="date"
                className="ltr"
              />
            </div>
            <div>
              <Label htmlFor="date-to" className="text-sm font-medium mb-2 block">تاریخ تا</Label>
              <Input
                id="date-to"
                type="date"
                className="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="obsidian-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 hover:text-gold">
                    شماره فاکتور
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">نماینده</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 hover:text-gold">
                    مبلغ
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">وضعیت</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">تاریخ ایجاد</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">تاریخ سررسید</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice: any) => (
                  <tr key={invoice.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gold">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium">نماینده #{invoice.representativeId.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">کد: {invoice.representativeId.slice(-8)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="py-4 px-6">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {new Date(invoice.createdAt || '').toLocaleDateString('fa-IR')}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fa-IR') : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="p-2 text-blue-400 hover:bg-blue-500/20">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-2 text-green-400 hover:bg-green-500/20">
                          <Edit className="h-4 w-4" />
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
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-12 w-12 text-muted-foreground/50" />
                      <p>هیچ فاکتوری یافت نشد</p>
                      <p className="text-sm">فیلترها را تغییر دهید یا فاکتور جدیدی ایجاد کنید</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-border">
            <div className="text-sm text-muted-foreground">
              نمایش ۱ تا {Math.min(10, filteredInvoices.length)} از {filteredInvoices.length} نتیجه
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                قبلی
              </Button>
              <Button size="sm" className="phoenix-gradient text-obsidian">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">
                بعدی
              </Button>
            </div>
          </div>
        )}
      </Card>

      <UploadJsonModal 
        open={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}
