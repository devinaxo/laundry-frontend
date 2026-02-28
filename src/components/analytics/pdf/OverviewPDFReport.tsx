import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { OverviewMetrics, StatusDistributionResponse, DailyStats } from '@/types/api';
import { statusLabels } from '@/components/orders/statuses';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { pdfStyles } from '@/lib/pdfStyles';
import { formatCurrency, formatPercentage, getStatusColor, formatDate } from '@/lib/pdfUtils';

interface OverviewPDFReportProps {
    overview: OverviewMetrics;
    statusDist: StatusDistributionResponse;
    dailyStats: DailyStats;
    dateRange: {
        from: Date;
        to: Date;
    };
}

export const OverviewPDFReport: React.FC<OverviewPDFReportProps> = ({
    overview,
    statusDist,
    dailyStats,
    dateRange
}) => {
    const sortedDailyData = [...dailyStats.daily_data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Reporte de Resumen Ejecutivo</Text>
                    <Text style={pdfStyles.subtitle}>Lavandería del 13</Text>
                    <Text style={pdfStyles.dateRange}>
                        Período: {formatDate(dateRange.from)} — {formatDate(dateRange.to)}
                    </Text>
                </View>

                {/* Key Metrics */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Métricas Principales</Text>
                    <View style={pdfStyles.metricsGrid}>
                        <View style={pdfStyles.metricCard}>
                            <Text style={pdfStyles.metricLabel}>Total de Pedidos</Text>
                            <Text style={pdfStyles.metricValue}>
                                {overview.metrics.total_orders.toLocaleString('es-AR')}
                            </Text>
                            {overview.growth.orders_growth_percentage !== null && (
                                <Text style={[
                                    pdfStyles.metricGrowth,
                                    overview.growth.orders_growth_percentage >= 0
                                        ? pdfStyles.growthPositive
                                        : pdfStyles.growthNegative
                                ]}>
                                    {formatPercentage(overview.growth.orders_growth_percentage)} vs. período anterior
                                </Text>
                            )}
                        </View>

                        <View style={pdfStyles.metricCard}>
                            <Text style={pdfStyles.metricLabel}>Ingresos Totales</Text>
                            <Text style={pdfStyles.metricValue}>
                                {formatCurrency(overview.metrics.total_revenue)}
                            </Text>
                            {overview.growth.revenue_growth_percentage !== null && (
                                <Text style={[
                                    pdfStyles.metricGrowth,
                                    overview.growth.revenue_growth_percentage >= 0
                                        ? pdfStyles.growthPositive
                                        : pdfStyles.growthNegative
                                ]}>
                                    {formatPercentage(overview.growth.revenue_growth_percentage)} vs. período anterior
                                </Text>
                            )}
                        </View>

                        <View style={pdfStyles.metricCard}>
                            <Text style={pdfStyles.metricLabel}>Valor Promedio por Pedido</Text>
                            <Text style={pdfStyles.metricValue}>
                                {formatCurrency(overview.metrics.average_order_value)}
                            </Text>
                        </View>

                        <View style={pdfStyles.metricCard}>
                            <Text style={pdfStyles.metricLabel}>Clientes Únicos</Text>
                            <Text style={pdfStyles.metricValue}>
                                {overview.metrics.unique_clients.toLocaleString('es-AR')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Order Range */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Rango de Valores de Pedidos</Text>
                    <View style={pdfStyles.rangeContainer}>
                        <View style={pdfStyles.rangeCard}>
                            <Text style={pdfStyles.rangeLabel}>Pedido Más Alto</Text>
                            <Text style={pdfStyles.rangeValue}>
                                {formatCurrency(overview.metrics.highest_order)}
                            </Text>
                        </View>
                        <View style={pdfStyles.rangeCard}>
                            <Text style={pdfStyles.rangeLabel}>Pedido Más Bajo</Text>
                            <Text style={pdfStyles.rangeValue}>
                                {formatCurrency(overview.metrics.lowest_order)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Status Distribution */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Distribución por Estado</Text>
                    <View style={pdfStyles.statusTable}>
                        <View style={[pdfStyles.statusRow, pdfStyles.statusHeader]}>
                            <Text style={pdfStyles.statusName}>ESTADO</Text>
                            <Text style={pdfStyles.statusCount}>CANTIDAD</Text>
                            <Text style={pdfStyles.statusPercentage}>PORCENTAJE</Text>
                            <Text style={{ width: '20%' }}></Text>
                        </View>
                        {statusDist.distribution.map((item, index) => (
                            <View key={index} style={pdfStyles.statusRow}>
                                <Text style={pdfStyles.statusName}>
                                    {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                                </Text>
                                <Text style={pdfStyles.statusCount}>{item.count}</Text>
                                <Text style={pdfStyles.statusPercentage}>
                                    {item.percentage.toFixed(1)}%
                                </Text>
                                <View style={pdfStyles.statusBar}>
                                    <View
                                        style={[
                                            pdfStyles.statusBarFill,
                                            {
                                                width: `${item.percentage}%`,
                                                backgroundColor: getStatusColor(item.status)
                                            }
                                        ]}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={pdfStyles.summaryBox}>
                        <View style={pdfStyles.summaryRow}>
                            <Text style={pdfStyles.summaryLabel}>Total de Pedidos:</Text>
                            <Text style={pdfStyles.summaryValue}>
                                {statusDist.total_orders.toLocaleString('es-AR')}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={pdfStyles.footer}>
                    Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </Text>
            </Page>

            {/* Second Page - Daily Statistics */}
            {sortedDailyData.length > 0 && (
                <Page size="A4" style={pdfStyles.page}>
                    <View style={pdfStyles.header}>
                        <Text style={pdfStyles.title}>Estadísticas Diarias</Text>
                    </View>

                    <View style={pdfStyles.section}>
                        <Text style={pdfStyles.sectionTitle}>Resumen Diario</Text>
                        <View style={pdfStyles.dailyStatsTable}>
                            <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                                <Text style={pdfStyles.tableCellDate}>FECHA</Text>
                                <Text style={pdfStyles.tableCellOrders}>PEDIDOS</Text>
                                <Text style={pdfStyles.tableCellRevenue}>INGRESOS</Text>
                            </View>
                            {sortedDailyData.map((day, index) => (
                                <View key={index} style={pdfStyles.tableRow}>
                                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellDate]}>
                                        {format(new Date(day.date), "d 'de' MMM yyyy", { locale: es })}
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellOrders]}>
                                        {day.total_orders}
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellRevenue]}>
                                        {formatCurrency(day.total_revenue)}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <View style={pdfStyles.summaryBox}>
                            <View style={pdfStyles.summaryRow}>
                                <Text style={pdfStyles.summaryLabel}>Total de Días:</Text>
                                <Text style={pdfStyles.summaryValue}>
                                    {sortedDailyData.length}
                                </Text>
                            </View>
                            <View style={pdfStyles.summaryRow}>
                                <Text style={pdfStyles.summaryLabel}>Promedio de Pedidos/Día:</Text>
                                <Text style={pdfStyles.summaryValue}>
                                    {(overview.metrics.total_orders / sortedDailyData.length).toFixed(1)}
                                </Text>
                            </View>
                            <View style={pdfStyles.summaryRow}>
                                <Text style={pdfStyles.summaryLabel}>Promedio de Ingresos/Día:</Text>
                                <Text style={pdfStyles.summaryValue}>
                                    {formatCurrency(
                                        parseFloat(overview.metrics.total_revenue) / sortedDailyData.length
                                    )}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={pdfStyles.footer}>
                        Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                    </Text>
                </Page>
            )}
        </Document>
    );
};
