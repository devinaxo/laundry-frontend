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

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Reporte de Tendencias</Text>
                    <Text style={pdfStyles.subtitle}>Lavandería del 13</Text>
                    <Text style={pdfStyles.dateRange}>Año: {selectedYear}</Text>
                </View>

                {/* Monthly Orders & Revenue in a single table */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Pedidos e Ingresos por Mes</Text>
                    <View style={pdfStyles.dailyStatsTable}>
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                            <Text style={pdfStyles.tableCellDate}>MES</Text>
                            <Text style={pdfStyles.tableCellOrders}>PEDIDOS</Text>
                            <Text style={pdfStyles.tableCellRevenue}>INGRESOS</Text>
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
                                    {formatCurrency(month.total_revenue)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

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
                    <View style={pdfStyles.dailyStatsTable}>
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                            <Text style={pdfStyles.tableCellDate}>AÑO</Text>
                            <Text style={pdfStyles.tableCellOrders}>PEDIDOS</Text>
                            <Text style={pdfStyles.tableCellRevenue}>INGRESOS</Text>
                        </View>
                        {yearlyComparison.comparison.map((yearData, index) => (
                            <View key={index} style={pdfStyles.tableRow}>
                                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellDate, { fontWeight: 'bold' }]}>
                                    {yearData.year}
                                </Text>
                                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellOrders]}>
                                    {yearData.total_orders}
                                </Text>
                                <Text style={[pdfStyles.tableCell, pdfStyles.tableCellRevenue]}>
                                    {formatCurrency(yearData.total_revenue)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {yearlyComparison.comparison.length === 2 && yearlyComparison.growth && (
                    <View style={pdfStyles.section}>
                        <Text style={pdfStyles.sectionTitle}>
                            Crecimiento ({yearlyComparison.growth.from_year} — {yearlyComparison.growth.to_year})
                        </Text>
                        <View style={pdfStyles.summaryBox}>
                            <View style={pdfStyles.summaryRow}>
                                <Text style={pdfStyles.summaryLabel}>Pedidos:</Text>
                                <Text style={pdfStyles.summaryValue}>
                                    {formatGrowth(yearlyComparison.growth.orders_growth_percentage)}
                                </Text>
                            </View>
                            <View style={pdfStyles.summaryRow}>
                                <Text style={pdfStyles.summaryLabel}>Ingresos:</Text>
                                <Text style={pdfStyles.summaryValue}>
                                    {formatGrowth(yearlyComparison.growth.revenue_growth_percentage)}
                                </Text>
                            </View>
                            <View style={pdfStyles.summaryRow}>
                                <Text style={pdfStyles.summaryLabel}>Valor Promedio:</Text>
                                <Text style={pdfStyles.summaryValue}>
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
                        <Text style={pdfStyles.summaryValue}>{monthlyData.data.length}</Text>
                    </View>
                    <View style={pdfStyles.summaryRow}>
                        <Text style={pdfStyles.summaryLabel}>Año Seleccionado:</Text>
                        <Text style={pdfStyles.summaryValue}>{selectedYear}</Text>
                    </View>
                </View>

                <Text style={pdfStyles.footer}>
                    Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </Text>
            </Page>
        </Document>
    );
};
