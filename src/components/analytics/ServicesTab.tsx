import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shirt, Award, TrendingUp, Package, ListOrdered, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getPopularServices, getCategoryRevenue } from '@/api/getFetches';
import type { PopularServicesResponse, CategoryRevenueResponse } from '@/types/api';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { PDFPreviewModal } from '@/components/ui/PDFPreviewModal';
import { ServicesPDFReport } from './pdf/ServicesPDFReport';

const ServicesTab: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [limit, setLimit] = useState<number>(15);
  const [showPDFModal, setShowPDFModal] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Período de Análisis</CardTitle>
              <CardDescription>Selecciona el rango de fechas y cantidad de servicios a mostrar</CardDescription>
            </div>
            {dateRange?.from && dateRange?.to && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPDFModal(true)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Generar PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <div className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium text-foreground">Cantidad de servicios:</label>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="15">Top 15</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="25">Top 25</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <ServicesDataSection
        dateRange={dateRange}
        limit={limit}
        showPDFModal={showPDFModal}
        setShowPDFModal={setShowPDFModal}
      />
    </div>
  );
};

interface ServicesDataSectionProps {
  dateRange: DateRange | undefined;
  limit: number;
  showPDFModal: boolean;
  setShowPDFModal: (show: boolean) => void;
}

const ServicesDataSection: React.FC<ServicesDataSectionProps> = ({ dateRange, limit, showPDFModal, setShowPDFModal }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [popularServices, setPopularServices] = useState<PopularServicesResponse | null>(null);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenueResponse | null>(null);

  const loadData = React.useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      return;
    }

    setIsLoading(true);
    try {
      const params = {
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd')
      };

      const servicesParams = { ...params, limit: limit };

      const [services, categories] = await Promise.all([
        getPopularServices(servicesParams),
        getCategoryRevenue(params)
      ]);
      setPopularServices(services);
      setCategoryRevenue(categories);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Error al cargar los datos de servicios');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (value: string) => {
    return `$${parseFloat(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      { text: 'text-primary', bg: 'bg-primary', bgLight: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900' },
      { text: 'text-green-600', bg: 'bg-green-500', bgLight: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-900' },
      { text: 'text-purple-600', bg: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-900' },
      { text: 'text-orange-600', bg: 'bg-orange-500', bgLight: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-900' },
      { text: 'text-pink-600', bg: 'bg-pink-500', bgLight: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-900' },
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner variant="ellipsis" className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!popularServices || !categoryRevenue) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No hay datos disponibles
      </div>
    );
  }

  const totalRevenue = categoryRevenue.categories.reduce((sum: number, cat) => sum + parseFloat(cat.total_revenue), 0);
  const maxServiceCount = Math.max(...popularServices.popular_services.map(s => s.total_quantity));

  const pdfFileName = dateRange?.from && dateRange?.to
    ? `reporte-servicios-${format(dateRange.from, 'yyyy-MM-dd')}-${format(dateRange.to, 'yyyy-MM-dd')}.pdf`
    : 'reporte-servicios.pdf';

  return (
    <>
      {dateRange?.from && dateRange?.to && (
        <PDFPreviewModal
          open={showPDFModal}
          onOpenChange={setShowPDFModal}
          title="Vista Previa del Reporte de Servicios"
          description="Revisa el reporte antes de descargarlo"
          document={
            <ServicesPDFReport
              popularServices={popularServices}
              categoryRevenue={categoryRevenue}
              dateRange={{
                from: dateRange.from,
                to: dateRange.to
              }}
              limit={limit}
            />
          }
          fileName={pdfFileName}
        />
      )}
      <div className="space-y-6">
        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Servicios Más Populares
            </CardTitle>
            <CardDescription>Servicios más solicitados por cantidad de artículos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularServices.popular_services.map((service, index) => {
                const percentage = (service.total_quantity / maxServiceCount) * 100;
                return (
                  <div key={service.service_id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-foreground">
                            {service.category_name} - {service.service_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service.times_ordered} pedidos • {formatCurrency(service.total_revenue)} en ventas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{service.total_quantity}</p>
                        <p className="text-xs text-muted-foreground">artículos</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {popularServices.popular_services.length === 0 && (
                <div className="text-center text-muted-foreground py-6">
                  No hay servicios en el período seleccionado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5 text-green-600" />
              Ingresos por Categoría
            </CardTitle>
            <CardDescription>Distribución de ingresos según tipo de prenda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryRevenue.categories.map((category, index) => {
                const revenuePercentage = (parseFloat(category.total_revenue) / totalRevenue) * 100;
                const color = getCategoryColor(index);

                return (
                  <div key={category.category_id} className={`p-4 rounded-lg border ${color.bgLight} ${color.border}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Package className={`h-5 w-5 ${color.text}`} />
                        <div>
                          <h4 className="font-bold text-foreground">{category.category_name}</h4>
                          <p className="text-xs text-muted-foreground">{category.total_items} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${color.text}`}>
                          {formatCurrency(category.total_revenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">{revenuePercentage.toFixed(1)}% del total</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${color.bg} rounded-full transition-all duration-500`}
                        style={{ width: `${revenuePercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {categoryRevenue.categories.length === 0 && (
                <div className="text-center text-muted-foreground py-6">
                  No hay categorías con ingresos en el período seleccionado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Artículos</p>
                  <p className="text-3xl font-bold text-primary">
                    {popularServices.popular_services.reduce((sum, service) => sum + (Number(service.total_quantity) || 0), 0)}
                  </p>
                </div>
                <Shirt className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(totalRevenue.toFixed(2))}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Categorías Activas</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {categoryRevenue.categories.length}
                  </p>
                </div>
                <Package className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ServicesTab;
