import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  FileText, 
  Calculator, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Globe,
  Database
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="phoenix-gradient p-2 rounded-xl">
              <Flame className="h-8 w-8 text-obsidian" />
            </div>
            <div>
              <h1 className="text-2xl font-bold phoenix-gradient-text">Phoenix</h1>
              <p className="text-sm text-muted-foreground">سیستم مدیریت فاکتور</p>
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="phoenix-gradient hover:bg-gold-light text-obsidian font-semibold"
          >
            ورود به سیستم
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 border-gold text-gold">
            🚀 سیستم پیشرفته مدیریت فاکتور
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            <span className="phoenix-gradient-text">Phoenix</span>
            <br />
            <span className="text-foreground">سیستم مدیریت فاکتور و فروش</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            سیستم جامع مدیریت فاکتور با پردازش خودکار JSON، محاسبات ۱۲ سطحی قیمت‌گذاری، 
            ردیابی کمیسیون و پشتیبانی کامل از زبان فارسی
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="phoenix-gradient hover:bg-gold-light text-obsidian font-semibold text-lg px-8"
            >
              شروع کنید
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gold text-gold hover:bg-gold hover:text-obsidian text-lg px-8"
            >
              مشاهده ویژگی‌ها
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ویژگی‌های کلیدی سیستم</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="obsidian-card hover:gold-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <FileText className="h-6 w-6 text-gold" />
                  </div>
                  <CardTitle>پردازش خودکار JSON</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  پردازش خودکار فایل‌های JSON سیستم Marzban با تبدیل هوشمند داده‌ها و ایجاد خودکار نمایندگان
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="obsidian-card hover:gold-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <Calculator className="h-6 w-6 text-gold" />
                  </div>
                  <CardTitle>قیمت‌گذاری ۱۲ سطحی</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  سیستم پیشرفته قیمت‌گذاری با ۱۲ سطح مختلف و محاسبات خودکار مالیات و تخفیف
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="obsidian-card hover:gold-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <Users className="h-6 w-6 text-gold" />
                  </div>
                  <CardTitle>مدیریت نمایندگان</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  ردیابی کامل نمایندگان فروش با مدیریت اطلاعات تماس، موجودی و وضعیت فعالیت
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="obsidian-card hover:gold-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-gold" />
                  </div>
                  <CardTitle>سیستم کمیسیون</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  محاسبه خودکار کمیسیون همکاران فروش با ردیابی پرداخت‌ها و گزارش‌گیری دقیق
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="obsidian-card hover:gold-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <Shield className="h-6 w-6 text-gold" />
                  </div>
                  <CardTitle>امنیت پیشرفته</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  سیستم احراز هویت امن با نقش‌های کاربری و کنترل دسترسی سطح‌بندی شده
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="obsidian-card hover:gold-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <Globe className="h-6 w-6 text-gold" />
                  </div>
                  <CardTitle>پشتیبانی فارسی</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  رابط کاربری کاملاً فارسی با پشتیبانی RTL و فونت Vazirmatn برای تجربه بهینه
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold phoenix-gradient-text">12+</div>
              <div className="text-muted-foreground">سطح قیمت‌گذاری</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold phoenix-gradient-text">100%</div>
              <div className="text-muted-foreground">پردازش خودکار</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold phoenix-gradient-text">24/7</div>
              <div className="text-muted-foreground">دسترسی سیستم</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold phoenix-gradient-text">∞</div>
              <div className="text-muted-foreground">ظرفیت نمایندگان</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gold/10 to-obsidian/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">آماده شروع هستید؟</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            همین الان به سیستم Phoenix بپیوندید و تجربه مدیریت فاکتور پیشرفته را آغاز کنید
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="phoenix-gradient hover:bg-gold-light text-obsidian font-semibold text-lg px-12"
          >
            ورود به سیستم Phoenix
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="phoenix-gradient p-2 rounded-xl">
              <Flame className="h-6 w-6 text-obsidian" />
            </div>
            <span className="text-lg font-bold phoenix-gradient-text">Phoenix Invoice System</span>
          </div>
          <p className="text-muted-foreground">
            سیستم جامع مدیریت فاکتور و فروش با پشتیبانی کامل از زبان فارسی
          </p>
        </div>
      </footer>
    </div>
  );
}