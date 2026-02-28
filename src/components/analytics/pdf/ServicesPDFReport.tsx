import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { PopularServicesResponse, CategoryRevenueResponse } from '@/types/api';
import { pdfStyles } from '@/lib/pdfStyles';
import { formatCurrency, formatDate } from '@/lib/pdfUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServicesPDFReportProps {
    popularServices: PopularServicesResponse;
    categoryRevenue: CategoryRevenueResponse;
    dateRange: {
        from: Date;
        to: Date;
    };
    limit: number;
}

export const ServicesPDFReport: React.FC<ServicesPDFReportProps> = ({
    popularServices,
    categoryRevenue,
    dateRange,
    limit
}) => {
    const totalRevenue = categoryRevenue.categories.reduce((sum, cat) => sum + parseFloat(cat.total_revenue), 0);
    const totalItems = popularServices.popular_services.reduce((sum, service) => sum + (Number(service.total_quantity) || 0), 0);

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Reporte de Servicios</Text>
                    <Text style={pdfStyles.subtitle}>Lavandería del 13</Text>
                    <Text style={pdfStyles.dateRange}>
                        Período: {formatDate(dateRange.from)} — {formatDate(dateRange.to)}
                    </Text>
                </View>

                {/* Popular Services */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Top {limit} Servicios Más Populares</Text>
                    <View style={pdfStyles.dailyStatsTable}>
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                            <Text style={{ width: '6%', fontSize: 7 }}>#</Text>
                            <Text style={{ width: '40%', fontSize: 7 }}>SERVICIO</Text>
                            <Text style={{ width: '18%', fontSize: 7, textAlign: 'center' }}>CANTIDAD</Text>
                            <Text style={{ width: '18%', fontSize: 7, textAlign: 'center' }}>PEDIDOS</Text>
                            <Text style={{ width: '18%', fontSize: 7, textAlign: 'right' }}>INGRESOS</Text>
                        </View>
                        {popularServices.popular_services.map((service, index) => (
                            <View key={index} style={pdfStyles.tableRow}>
                                <Text style={[pdfStyles.tableCell, { width: '6%', fontWeight: 'bold' }]}>
                                    {index + 1}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '40%' }]}>
                                    {service.category_name} — {service.service_name}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '18%', textAlign: 'center', fontWeight: 'bold' }]}>
                                    {service.total_quantity}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '18%', textAlign: 'center' }]}>
                                    {service.times_ordered}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '18%', textAlign: 'right' }]}>
                                    {formatCurrency(service.total_revenue)}
                                </Text>
                            </View>
                        ))}
                    </View>
                    {popularServices.popular_services.length === 0 && (
                        <Text style={pdfStyles.emptyMessage}>No hay servicios en el período seleccionado.</Text>
                    )}
                </View>

                <Text style={pdfStyles.footer}>
                    Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </Text>
            </Page>

            {/* Second Page - Category Revenue */}
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Ingresos por Categoría</Text>
                </View>

                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Categorías</Text>
                    <View style={pdfStyles.dailyStatsTable}>
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                            <Text style={{ width: '40%', fontSize: 7 }}>CATEGORÍA</Text>
                            <Text style={{ width: '15%', fontSize: 7, textAlign: 'center' }}>ITEMS</Text>
                            <Text style={{ width: '25%', fontSize: 7, textAlign: 'right' }}>INGRESOS</Text>
                            <Text style={{ width: '20%', fontSize: 7, textAlign: 'right' }}>% DEL TOTAL</Text>
                        </View>
                        {categoryRevenue.categories.map((category, index) => {
                            const revenuePercentage = totalRevenue > 0
                                ? (parseFloat(category.total_revenue) / totalRevenue) * 100
                                : 0;

                            return (
                                <View key={index} style={pdfStyles.tableRow}>
                                    <Text style={[pdfStyles.tableCell, { width: '40%', fontWeight: 'bold' }]}>
                                        {category.category_name}
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, { width: '15%', textAlign: 'center' }]}>
                                        {category.total_items}
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, { width: '25%', textAlign: 'right', fontWeight: 'bold' }]}>
                                        {formatCurrency(category.total_revenue)}
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, { width: '20%', textAlign: 'right' }]}>
                                        {revenuePercentage.toFixed(1)}%
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    {categoryRevenue.categories.length === 0 && (
                        <Text style={pdfStyles.emptyMessage}>No hay categorías con ingresos en el período seleccionado.</Text>
                    )}
                </View>

                {/* Summary */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Resumen</Text>
                    <View style={pdfStyles.summaryBox}>
                        <View style={pdfStyles.summaryRow}>
                            <Text style={pdfStyles.summaryLabel}>Total de Artículos:</Text>
                            <Text style={pdfStyles.summaryValue}>{totalItems}</Text>
                        </View>
                        <View style={pdfStyles.summaryRow}>
                            <Text style={pdfStyles.summaryLabel}>Ingresos Totales:</Text>
                            <Text style={pdfStyles.summaryValue}>{formatCurrency(totalRevenue.toFixed(2))}</Text>
                        </View>
                        <View style={pdfStyles.summaryRow}>
                            <Text style={pdfStyles.summaryLabel}>Categorías Activas:</Text>
                            <Text style={pdfStyles.summaryValue}>{categoryRevenue.categories.length}</Text>
                        </View>
                    </View>
                </View>

                <Text style={pdfStyles.footer}>
                    Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </Text>
            </Page>
        </Document>
    );
};
