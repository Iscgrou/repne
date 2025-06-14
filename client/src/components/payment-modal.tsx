import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CreditCard, X } from "lucide-react";

const paymentSchema = z.object({
  amount: z.string().min(1, "مبلغ الزامی است").transform((val) => parseFloat(val)),
  paymentMethod: z.string().min(1, "روش پرداخت الزامی است"),
  referenceNumber: z.string().optional(),
  description: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void;
  isLoading?: boolean;
}

const paymentMethods = [
  { value: "BANK_TRANSFER", label: "انتقال بانکی" },
  { value: "CASH", label: "نقدی" },
  { value: "CHEQUE", label: "چک" },
  { value: "CREDIT_CARD", label: "کارت اعتباری" },
  { value: "DIGITAL_WALLET", label: "کیف پول دیجیتال" },
];

export default function PaymentModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: PaymentModalProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "",
      referenceNumber: "",
      description: "",
    },
  });

  const handleSubmit = (data: PaymentFormData) => {
    onSubmit(data);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="obsidian-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 phoenix-gradient-text">
            <CreditCard className="h-5 w-5" />
            ثبت پرداخت جدید
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مبلغ پرداخت (تومان)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="مثال: 1000000"
                      {...field}
                      className="ltr text-right"
                      data-testid="payment-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>روش پرداخت</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="payment-method">
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شماره مرجع</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="شماره تراکنش یا مرجع"
                      {...field}
                      data-testid="payment-reference"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="توضیحات اضافی..."
                      rows={3}
                      {...field}
                      data-testid="payment-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 phoenix-gradient text-obsidian hover:opacity-90"
                data-testid="submit-payment"
              >
                {isLoading ? "در حال ثبت..." : "ثبت پرداخت"}
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
      </DialogContent>
    </Dialog>
  );
}
