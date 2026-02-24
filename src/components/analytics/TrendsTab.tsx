import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getOrdersPerMonth, getYearlyComparison } from '@/api/getFetches';
import type { OrdersPerMonth, YearlyComparison } from '@/types/api';
import { PDFPreviewModal } from '@/components/ui/PDFPreviewModal';
import { TrendsPDFReport } from './pdf/TrendsPDFReport';

const TrendsTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<OrdersPerMonth | null>(null);
  const [yearlyComparison, setYearlyComparison] = useState<YearlyComparison | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [monthly, comparison] = await Promise.all([
        getOrdersPerMonth({ year: selectedYear }),
        getYearlyComparison({ years: [selectedYear - 1, selectedYear] })
      ]);
      setMonthlyData(monthly);
      setYearlyComparison(comparison);
    } catch (error) {
      console.error('Error loading trends:', error);
      toast.error('Error al cargar los datos de tendencias');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (value: string) => {
    return `$${parseFloat(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatGrowth = (growth: number | null | undefined): string => {
    if (growth === null || growth === undefined || !isFinite(growth) || isNaN(growth)) {
      return 'N/A';
    }
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const getMaxValue = (data: OrdersPerMonth['data']) => {
    return Math.max(...data.map(d => d.total_orders));
  };

  const getMaxRevenue = (data: OrdersPerMonth['data']) => {
    return Math.max(...data.map(d => parseFloat(d.total_revenue)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner variant="ellipsis" className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!monthlyData || !yearlyComparison) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No hay datos disponibles
      </div>
    );
  }

  const maxOrders = getMaxValue(monthlyData.data);
  const maxRevenue = getMaxRevenue(monthlyData.data);

  const pdfFileName = `reporte-tendencias-${selectedYear}.pdf`;

  return (
    <div className="space-y-6">
      {monthlyData && yearlyComparison && (
        <PDFPreviewModal
          open={showPDFModal}
          onOpenChange={setShowPDFModal}
          title="Vista Previa del Reporte de Tendencias"
          description="Revisa el reporte antes de descargarlo"
          document={
            <TrendsPDFReport
              monthlyData={monthlyData}
              yearlyComparison={yearlyComparison}
              selectedYear={selectedYear}
            />
          }
          fileName={pdfFileName}
        />
      )}
      {/* Year Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tendencias Mensuales</CardTitle>
              <CardDescription>Análisis de pedidos e ingresos por mes</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPDFModal(true)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Generar PDF
              </Button>
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Orders Bar Chart */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Pedidos por Mes
              </h4>
              <div className="space-y-3">
                {monthlyData.data.map((month) => (
                  <div key={month.month} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{month.month_short}</span>
                      <span className="font-bold text-foreground">{month.total_orders}</span>
                    </div>
                    <Progress
                      value={(month.total_orders / maxOrders) * 100}
                      className="h-6 bg-muted"
                      indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Bar Chart */}
            <div className="pt-6 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ingresos por Mes
              </h4>
              <div className="space-y-3">
                {monthlyData.data.map((month) => {
                  const revenue = parseFloat(month.total_revenue);
                  return (
                    <div key={month.month} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{month.month_short}</span>
                        <span className="font-bold text-foreground">{formatCurrency(month.total_revenue)}</span>
                      </div>
                      <Progress
                        value={(revenue / maxRevenue) * 100}
                        className="h-6 bg-muted"
                        indicatorClassName="bg-gradient-to-r from-green-500 to-green-600"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación Anual</CardTitle>
          <CardDescription>Rendimiento año contra año</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {yearlyComparison.comparison.map((yearData) => (
              <div key={yearData.year} className="space-y-4 p-4 rounded-lg border border-border">
                <h3 className="text-2xl font-bold text-foreground">{yearData.year}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Pedidos</span>
                    <span className="text-lg font-bold text-foreground">{yearData.total_orders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ingresos Totales</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(yearData.total_revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valor Promedio</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(yearData.average_order_value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {yearlyComparison.comparison.length === 2 && yearlyComparison.growth && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Crecimiento ({yearlyComparison.growth.from_year} → {yearlyComparison.growth.to_year})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-blue-900 dark:text-blue-100 mb-1">Pedidos</p>
                  <p className="text-2xl font-bold text-primary dark:text-blue-400">
                    {formatGrowth(yearlyComparison.growth.orders_growth_percentage)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <p className="text-sm text-green-900 dark:text-green-100 mb-1">Ingresos</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatGrowth(yearlyComparison.growth.revenue_growth_percentage)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                  <p className="text-sm text-purple-900 dark:text-purple-100 mb-1">Valor Promedio</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatGrowth(yearlyComparison.growth.average_value_growth_percentage)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendsTab;
