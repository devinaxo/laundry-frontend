import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { OrdersPerMonth, YearlyComparison } from '@/types/api';
import { pdfStyles } from '@/lib/pdfStyles';
import { formatCurrency, formatPercentage } from '@/lib/pdfUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TrendsPDFReportProps {
    monthlyData: OrdersPerMonth;
    yearlyComparison: YearlyComparison;
    selectedYear: number;
}

export const TrendsPDFReport: React.FC<TrendsPDFReportProps> = ({
    monthlyData,
    yearlyComparison,
    selectedYear
}) => {
    const formatGrowth = (growth: number | null | undefined): string => {
        if (growth === null || growth === undefined || !isFinite(growth) || isNaN(growth)) {
            return 'N/A';
        }
        return formatPercentage(growth);
    };

    const getMaxValue = (data: OrdersPerMonth['data']) => {
        return Math.max(...data.map(d => d.total_orders));
    };

    const getMaxRevenue = (data: OrdersPerMonth['data']) => {
        return Math.max(...data.map(d => parseFloat(d.total_revenue)));
    };

    const maxOrders = getMaxValue(monthlyData.data);
    const maxRevenue = getMaxRevenue(monthlyData.data);

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                {/* Header */}
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Reporte de Tendencias</Text>
                    <Text style={pdfStyles.dateRange}>
                        Año: {selectedYear}
                    </Text>
                </View>

                {/* Monthly Orders */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Pedidos por Mes</Text>
                    <View style={pdfStyles.dailyStatsTable}>
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                            <Text style={pdfStyles.tableCellDate}>MES</Text>
                            <Text style={pdfStyles.tableCellOrders}>PEDIDOS</Text>
                            <Text style={pdfStyles.tableCellRevenue}>PROPORCIÓN</Text>
                        </View>
                        {monthlyData.data.map((month, index) => (
                            <View key={index} style={pdfStyles.tableRow}>
                                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellDate]}>
                                    {month.month_short}
                                </Text>
                                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellOrders]}>
                                    {month.total_orders}
                                </Text>
                                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellRevenue]}>
                                    <View style={[pdfStyles.progressBarContainer]}>
                                        <View 
                                            style={[
                                                pdfStyles.progressBarFill,
                                                { 
                                                    width: `${(month.total_orders / maxOrders) * 100}%`,
                                                    backgroundColor: '#3b82f6'
                                                }
                                            ]} 
                                        />
                                    </View>
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Monthly Revenue */}
                <View style={pdfStyles.section} break>
                    <Text style={pdfStyles.sectionTitle}>Ingresos por Mes</Text>
                    <View style={pdfStyles.dailyStatsTable}>
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                            <Text style={pdfStyles.tableCellDate}>MES</Text>
                            <Text style={pdfStyles.tableCellOrders}>INGRESOS</Text>
                            <Text style={pdfStyles.tableCellRevenue}>PROPORCIÓN</Text>
                        </View>
                        {monthlyData.data.map((month, index) => {
                            const revenue = parseFloat(month.total_revenue);
                            return (
                                <View key={index} style={pdfStyles.tableRow}>
                                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellDate]}>
                                        {month.month_short}
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellOrders]}>
                                        {formatCurrency(month.total_revenue)}
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, pdfStyles.tableCellRevenue]}>
                                        <View style={[pdfStyles.progressBarContainer]}>
                                            <View 
                                                style={[
                                                    pdfStyles.progressBarFill,
                                                    { 
                                                        width: `${(revenue / maxRevenue) * 100}%`,
                                                        backgroundColor: '#22c55e'
                                                    }
                                                ]} 
                                            />
                                        </View>
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Footer */}
                <Text style={pdfStyles.footer}>
                    Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </Text>
            </Page>

            {/* Second Page - Yearly Comparison */}
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Comparación Anual</Text>
                </View>

                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Métricas por Año</Text>
                    <View style={pdfStyles.metricsGrid}>
                        {yearlyComparison.comparison.map((yearData, index) => (
                            <View key={index} style={pdfStyles.yearComparisonCard}>
                                <Text style={pdfStyles.yearTitle}>{yearData.year}</Text>
                                <View style={{ marginTop: 10 }}>
                                    <View style={pdfStyles.yearMetricRow}>
                                        <Text style={pdfStyles.yearMetricLabel}>Total Pedidos:</Text>
                                        <Text style={pdfStyles.yearMetricValue}>{yearData.total_orders}</Text>
                                    </View>
                                    <View style={pdfStyles.yearMetricRow}>
                                        <Text style={pdfStyles.yearMetricLabel}>Ingresos Totales:</Text>
                                        <Text style={pdfStyles.yearMetricValue}>{formatCurrency(yearData.total_revenue)}</Text>
                                    </View>
                                    <View style={pdfStyles.yearMetricRow}>
                                        <Text style={pdfStyles.yearMetricLabel}>Valor Promedio:</Text>
                                        <Text style={pdfStyles.yearMetricValue}>{formatCurrency(yearData.average_order_value)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {yearlyComparison.comparison.length === 2 && yearlyComparison.growth && (
                    <View style={pdfStyles.section}>
                        <Text style={pdfStyles.sectionTitle}>
                            Crecimiento ({yearlyComparison.growth.from_year} - {yearlyComparison.growth.to_year})
                        </Text>
                        <View style={pdfStyles.metricsGrid}>
                            <View style={[pdfStyles.metricCard, { backgroundColor: '#dbeafe' }]}>
                                <Text style={pdfStyles.metricLabel}>Pedidos</Text>
                                <Text style={[pdfStyles.metricValue, { color: '#2563eb' }]}>
                                    {formatGrowth(yearlyComparison.growth.orders_growth_percentage)}
                                </Text>
                            </View>
                            <View style={[pdfStyles.metricCard, { backgroundColor: '#dcfce7' }]}>
                                <Text style={pdfStyles.metricLabel}>Ingresos</Text>
                                <Text style={[pdfStyles.metricValue, { color: '#16a34a' }]}>
                                    {formatGrowth(yearlyComparison.growth.revenue_growth_percentage)}
                                </Text>
                            </View>
                            <View style={[pdfStyles.metricCard, { backgroundColor: '#f3e8ff' }]}>
                                <Text style={pdfStyles.metricLabel}>Valor Promedio</Text>
                                <Text style={[pdfStyles.metricValue, { color: '#9333ea' }]}>
                                    {formatGrowth(yearlyComparison.growth.average_value_growth_percentage)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Summary */}
                <View style={pdfStyles.summaryBox}>
                    <View style={pdfStyles.summaryRow}>
                        <Text style={pdfStyles.summaryLabel}>Total Meses Analizados:</Text>
                        <Text style={pdfStyles.summaryValue}>
                            {monthlyData.data.length}
                        </Text>
                    </View>
                    <View style={pdfStyles.summaryRow}>
                        <Text style={pdfStyles.summaryLabel}>Año Seleccionado:</Text>
                        <Text style={pdfStyles.summaryValue}>
                            {selectedYear}
                        </Text>
                    </View>
                </View>

                <Text style={pdfStyles.footer}>
                    Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </Text>
            </Page>
        </Document>
    );
};
