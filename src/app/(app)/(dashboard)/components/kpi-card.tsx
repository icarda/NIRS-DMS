import { ChartColumn } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  value: string | number;
}

export function KPICard({ title, description, icon, value }: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
