import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, FileOutput } from "lucide-react";
import PageHeader from "@/components/page-header";
import RepresentativeCard from "@/components/representative-card";
import { useLocation } from "wouter";

export default function Representatives() {
  const [location, setLocation] = useLocation();

  const { data: representatives, isLoading } = useQuery({
    queryKey: ["/api/representatives"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت نمایندگان"
        description="مدیریت نمایندگان، تعرفه‌ها و موجودی‌ها"
        actions={
          <div className="flex gap-3">
            <Button className="phoenix-gradient text-obsidian hover:opacity-90">
              <UserPlus className="mr-2 h-4 w-4" />
              نماینده جدید
            </Button>
            <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-obsidian">
              <FileOutput className="mr-2 h-4 w-4" />
              خروجی اکسل
            </Button>
          </div>
        }
      />

      {/* Representatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {representatives?.length > 0 ? (
          representatives.map((representative: any) => (
            <RepresentativeCard
              key={representative.id}
              representative={representative}
              onClick={() => setLocation(`/representatives/${representative.id}`)}
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="obsidian-card">
              <CardContent className="py-12 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">هنوز نماینده‌ای اضافه نشده</h3>
                <p className="text-muted-foreground mb-6">
                  برای شروع، اولین نماینده خود را اضافه کنید
                </p>
                <Button className="phoenix-gradient text-obsidian hover:opacity-90">
                  <UserPlus className="mr-2 h-4 w-4" />
                  افزودن نماینده جدید
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
