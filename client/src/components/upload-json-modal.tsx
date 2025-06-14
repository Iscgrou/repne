import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadJsonModalProps {
  open: boolean;
  onClose: () => void;
}

interface ProcessingResult {
  success: boolean;
  processedCount: number;
  errorCount: number;
  newRepresentativesCount: number;
  skippedInactive: number;
  errors: { identifier: string; reason: string }[];
}

export default function UploadJsonModal({ open, onClose }: UploadJsonModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);

  const form = useForm({
    defaultValues: {
      autoCreateRepresentatives: true,
      applySmartPricing: true,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { fileContent: string; fileName: string; autoCreateRepresentatives: boolean; applySmartPricing: boolean }) => {
      return await apiRequest("POST", "/api/process-marzban-json", data);
    },
    onSuccess: (response) => {
      const result = response as any;
      setProcessingResult(result);
      
      toast({
        title: "موفقیت",
        description: `${result.processedCount} فاکتور با موفقیت پردازش شد`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/representatives"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: "خطا در پردازش فایل: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        setSelectedFile(file);
      } else {
        toast({
          title: "فرمت نامعتبر",
          description: "لطفاً فقط فایل‌های JSON آپلود کنید",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (data: any) => {
    if (!selectedFile) {
      toast({
        title: "خطا",
        description: "لطفاً ابتدا فایل JSON را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileContent = await selectedFile.text();
      
      await uploadMutation.mutateAsync({
        fileContent,
        fileName: selectedFile.name,
        autoCreateRepresentatives: data.autoCreateRepresentatives,
        applySmartPricing: data.applySmartPricing,
      });
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "خطا",
        description: "خطا در خواندن فایل",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setProcessingResult(null);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="obsidian-card max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 phoenix-gradient-text">
            <Upload className="h-5 w-5" />
            آپلود و پردازش فایل JSON
          </DialogTitle>
        </DialogHeader>

        {!processingResult ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-4">
                <FormLabel>انتخاب فایل JSON</FormLabel>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    فایل JSON خروجی سیستم Marzban را انتخاب کنید
                  </p>
                  <Input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="max-w-xs mx-auto"
                  />
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Processing Options */}
              <div className="space-y-4">
                <FormLabel>تنظیمات پردازش</FormLabel>
                
                <FormField
                  control={form.control}
                  name="autoCreateRepresentatives"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>ایجاد خودکار نمایندگان جدید</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          اگر نماینده‌ای در سیستم موجود نباشد، به صورت خودکار ایجاد شود
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applySmartPricing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>اعمال قیمت‌گذاری هوشمند</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          استفاده از الگوریتم ۱۲ سطحه قیمت‌گذاری و محاسبات مالی پیشرفته
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="flex-1 phoenix-gradient text-obsidian hover:opacity-90"
                >
                  {uploadMutation.isPending ? "در حال پردازش..." : "شروع پردازش"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  انصراف
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          /* Processing Results */
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
              <h3 className="text-lg font-semibold mb-2">پردازش با موفقیت انجام شد</h3>
              <p className="text-muted-foreground">
                فایل JSON شما با موفقیت پردازش و فاکتورهای مربوطه ایجاد شدند
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-2xl font-bold text-green-400">{processingResult.processedCount}</p>
                <p className="text-sm text-muted-foreground">فاکتور ایجاد شده</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-2xl font-bold text-blue-400">{processingResult.newRepresentativesCount}</p>
                <p className="text-sm text-muted-foreground">نماینده جدید</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-2xl font-bold text-yellow-400">{processingResult.skippedInactive}</p>
                <p className="text-sm text-muted-foreground">رکورد نادیده گرفته شده</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-2xl font-bold text-red-400">{processingResult.errorCount}</p>
                <p className="text-sm text-muted-foreground">خطا</p>
              </div>
            </div>

            {/* Errors */}
            {processingResult.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <h4 className="font-semibold">خطاهای رخ داده:</h4>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {processingResult.errors.map((error, index) => (
                    <div key={index} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="font-medium text-red-400">{error.identifier}</p>
                      <p className="text-sm text-muted-foreground">{error.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleClose}
              className="w-full phoenix-gradient text-obsidian hover:opacity-90"
            >
              بستن
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
