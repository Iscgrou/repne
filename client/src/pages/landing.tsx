import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <Card className="w-full max-w-md obsidian-card gold-glow">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-4">
              <span className="text-obsidian font-bold text-2xl">P</span>
            </div>
            <h1 className="text-2xl font-bold phoenix-gradient-text mb-2">Phoenix Invoice System</h1>
            <p className="text-gray-400">سیستم فاکتور فنیکس</p>
          </div>

          <p className="text-gray-300 mb-6 text-sm leading-relaxed">
            سیستم جامع مدیریت فاکتور و نمایندگان با قابلیت پردازش خودکار فایل‌های JSON و محاسبات مالی پیشرفته
          </p>

          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full phoenix-gradient hover:opacity-90 text-obsidian font-semibold"
          >
            ورود به سیستم
          </Button>

          <div className="mt-6 text-xs text-gray-500">
            <p>© ۱۴۰۳ شرکت فنیکس. تمامی حقوق محفوظ است.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
