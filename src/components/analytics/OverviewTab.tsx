import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, ArrowUpRight, ArrowDownRight, BarChart3, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getOverview, getStatusDistribution, getDailyStats } from '@/api/getFetches';
import type { OverviewMetrics, StatusDistributionResponse, DailyStats } from '@/types/api';
import { statusLabels } from '@/components/orders/statuses';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import { format, eachDayOfInterval } from 'date-fns';
import { ZoomableChart } from '@/components/ui/zoomableChart';
import { PDFPreviewModal } from '@/components/ui/PDFPreviewModal';
import { OverviewPDFReport } from './pdf/OverviewPDFReport';

const OverviewTab: React.FC = () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [showPDFModal, setShowPDFModal] = useState(false);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Período de Análisis</CardTitle>
                            <CardDescription>Selecciona el rango de fechas para ver los datos</CardDescription>
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
                <CardContent>
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                </CardContent>
            </Card>
            <OverviewDataSection 
                dateRange={dateRange} 
                showPDFModal={showPDFModal}
                setShowPDFModal={setShowPDFModal}
            />
        </div>
    );
};

interface OverviewDataSectionProps {
    dateRange: DateRange | undefined;
    showPDFModal: boolean;
    setShowPDFModal: (show: boolean) => void;
}

const OverviewDataSection: React.FC<OverviewDataSectionProps> = ({ dateRange, showPDFModal, setShowPDFModal }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [overview, setOverview] = useState<OverviewMetrics | null>(null);
    const [statusDist, setStatusDist] = useState<StatusDistributionResponse | null>(null);
    const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);

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

            const [overviewData, statusData, dailyData] = await Promise.all([
                getOverview(params),
                getStatusDistribution(params),
                getDailyStats(params)
            ]);
            setOverview(overviewData);
            setStatusDist(statusData);
            setDailyStats(dailyData);
        } catch (error) {
            console.error('Error loading overview:', error);
            toast.error('Error al cargar los datos de resumen');
        } finally {
            setIsLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const chartDataOrders = React.useMemo(() => {
        if (!dateRange?.from || !dateRange?.to || !dailyStats) {
            return [];
        }

        const allDates = eachDayOfInterval({
            start: dateRange.from,
            end: dateRange.to
        });

        const dataMap = new Map(
            dailyStats.daily_data.map(day => [day.date, day])
        );

        return allDates.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const existingData = dataMap.get(dateStr);

            // Create date at noon to avoid timezone issues
            return {
                date: `${dateStr}T12:00:00`,
                events: existingData ? existingData.total_orders : 0
            };
        });
    }, [dateRange, dailyStats]);

    const chartDataRevenue = React.useMemo(() => {
        if (!dateRange?.from || !dateRange?.to || !dailyStats) {
            return [];
        }

        const allDates = eachDayOfInterval({
            start: dateRange.from,
            end: dateRange.to
        });

        const dataMap = new Map(
            dailyStats.daily_data.map(day => [day.date, day])
        );

        return allDates.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const existingData = dataMap.get(dateStr);

            // Create date at noon to avoid timezone issues
            return {
                date: `${dateStr}T12:00:00`,
                events: existingData ? Math.round(parseFloat(existingData.total_revenue)) : 0
            };
        });
    }, [dateRange, dailyStats]);

    const formatCurrency = (value: string) => {
        return `$${parseFloat(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatPercentage = (value: number | null) => {
        if (value === null) return 'N/A';
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner variant="ellipsis" className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!overview || !statusDist || !dailyStats) {
        return (
            <div className="text-center text-muted-foreground py-12">
                No hay datos disponibles
            </div>
        );
    }

    const pdfFileName = dateRange?.from && dateRange?.to
        ? `reporte-resumen-${format(dateRange.from, 'yyyy-MM-dd')}-${format(dateRange.to, 'yyyy-MM-dd')}.pdf`
        : 'reporte-resumen.pdf';

    return (
        <>
            {dateRange?.from && dateRange?.to && (
                <PDFPreviewModal
                    open={showPDFModal}
                    onOpenChange={setShowPDFModal}
                    title="Vista Previa del Reporte"
                    description="Revisa el reporte antes de descargarlo"
                    document={
                        <OverviewPDFReport
                            overview={overview}
                            statusDist={statusDist}
                            dailyStats={dailyStats}
                            dateRange={{
                                from: dateRange.from,
                                to: dateRange.to
                            }}
                        />
                    }
                    fileName={pdfFileName}
                />
            )}
            <div className="space-y-6">
                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Orders Zoomable Chart */}
                    <div className="h-[500px]">
                        <ZoomableChart 
                            data={chartDataOrders} 
                            title="Pedidos Diarios"
                            bottomLabel="Pedidos"
                            description="Cantidad de pedidos por día en el período seleccionado"
                            valueLabel="Total Pedidos"
                        />
                    </div>
                    
                    {/* Revenue Zoomable Chart */}
                    <div className="h-[500px]">
                        <ZoomableChart 
                            data={chartDataRevenue} 
                            title="Ingresos Diarios"
                            bottomLabel="Ingresos"
                            description="Ingresos generados por día en el período seleccionado"
                            valueLabel="Total Ingresos"
                            formatValue={(value) => `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                            formatYAxis={(value) => {
                                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                                if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                                return `$${value}`;
                            }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total de Pedidos
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {overview.metrics.total_orders.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                {overview.growth.orders_growth_percentage !== null && overview.growth.orders_growth_percentage > 0 ? (
                                    <>
                                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-600 font-medium">
                                            {formatPercentage(overview.growth.orders_growth_percentage)}
                                        </span>
                                    </>
                                ) : overview.growth.orders_growth_percentage !== null && overview.growth.orders_growth_percentage < 0 ? (
                                    <>
                                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-600 font-medium">
                                            {formatPercentage(overview.growth.orders_growth_percentage)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm text-muted-foreground font-medium">
                                        {overview.growth.orders_growth_percentage === null ? 'Sin comparación' : 'Sin cambios'}
                                    </span>
                                )}
                                {overview.growth.orders_growth_percentage !== null && (
                                    <span className="text-sm text-muted-foreground">vs. período anterior</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    {/* Total Revenue */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Ingresos Totales
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {formatCurrency(overview.metrics.total_revenue)}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                {overview.growth.revenue_growth_percentage !== null && overview.growth.revenue_growth_percentage > 0 ? (
                                    <>
                                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-600 font-medium">
                                            {formatPercentage(overview.growth.revenue_growth_percentage)}
                                        </span>
                                    </>
                                ) : overview.growth.revenue_growth_percentage !== null && overview.growth.revenue_growth_percentage < 0 ? (
                                    <>
                                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-600 font-medium">
                                            {formatPercentage(overview.growth.revenue_growth_percentage)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm text-muted-foreground font-medium">
                                        {overview.growth.revenue_growth_percentage === null ? 'Sin comparación' : 'Sin cambios'}
                                    </span>
                                )}
                                {overview.growth.revenue_growth_percentage !== null && (
                                    <span className="text-sm text-muted-foreground">vs. período anterior</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    {/* Average Order Value */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Valor Promedio
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {formatCurrency(overview.metrics.average_order_value)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                por pedido
                            </p>
                        </CardContent>
                    </Card>
                    {/* Unique Clients */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Clientes Únicos
                            </CardTitle>
                            <Users className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {overview.metrics.unique_clients.toLocaleString()}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                clientes activos
                            </p>
                        </CardContent>
                    </Card>
                </div>
                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Range */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Rango de Pedidos</CardTitle>
                            <CardDescription>Valores máximo y mínimo de pedidos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                                <div>
                                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Pedido Más Alto</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(overview.metrics.highest_order)}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Pedido Más Bajo</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(overview.metrics.lowest_order)}
                                    </p>
                                </div>
                                <TrendingDown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    {/* Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribución de Estados</CardTitle>
                            <CardDescription>Pedidos por estado actual</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {statusDist.distribution.map((item) => (
                                    <div key={item.status} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium capitalize text-foreground">
                                                {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground">{item.count}</span>
                                                <span className="text-muted-foreground">({item.percentage.toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-500 ${item.status === 'pending' ? 'bg-gray-500' :
                                                        item.status === 'in_progress' ? 'bg-yellow-500' :
                                                            item.status === 'ready' ? 'bg-blue-500' :
                                                                item.status === 'delivered' ? 'bg-green-500' :
                                                                    'bg-red-500'
                                                    }`}
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Total de Pedidos</span>
                                    <span className="text-lg font-bold text-foreground">{statusDist.total_orders}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default OverviewTab;
