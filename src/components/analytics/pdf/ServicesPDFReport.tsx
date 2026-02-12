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
    const getCategoryColor = (index: number) => {
        const colors = ['#3b82f6', '#22c55e', '#9333ea', '#f97316', '#ec4899'];
        return colors[index % colors.length];
    };

    const totalRevenue = categoryRevenue.categories.reduce((sum, cat) => sum + parseFloat(cat.total_revenue), 0);
    const maxServiceCount = Math.max(...popularServices.popular_services.map(s => s.total_quantity));
    const totalItems = popularServices.popular_services.reduce((sum, service) => sum + service.total_quantity, 0);

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                {/* Header */}
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Reporte de Servicios</Text>
                    <Text style={pdfStyles.dateRange}>
                        Período: {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </Text>
                </View>

                {/* Popular Services */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Top {limit} Servicios Más Populares</Text>
                    <View style={pdfStyles.dailyStatsTable}>
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                            <Text style={{ width: '8%', fontSize: 9 }}>#</Text>
                            <Text style={{ width: '42%', fontSize: 9 }}>SERVICIO</Text>
                            <Text style={{ width: '20%', fontSize: 9, textAlign: 'center' }}>CANTIDAD</Text>
                            <Text style={{ width: '15%', fontSize: 9, textAlign: 'center' }}>PEDIDOS</Text>
                            <Text style={{ width: '15%', fontSize: 9, textAlign: 'right' }}>INGRESOS</Text>
                        </View>
                        {popularServices.popular_services.map((service, index) => {
                            // const percentage = (service.total_quantity / maxServiceCount) * 100;
                            return (
                                <View key={index} style={pdfStyles.tableRow}>
                                    <Text style={[pdfStyles.tableCell, { width: '8%', fontWeight: 'bold', color: '#2563eb' }]}>
                                        {index + 1}
                                    </Text>
                                    <View style={{ width: '42%' }}>
                                        <Text style={[pdfStyles.tableCell, { fontSize: 8, fontWeight: 'bold' }]}>
                                            {service.category_name} - {service.service_name}
                                        </Text>
                                        {/* <View style={[pdfStyles.progressBarContainer, { marginTop: 2, height: 6 }]}>
                                            <View 
                                                style={[
                                                    pdfStyles.progressBarFill,
                                                    { 
                                                        width: `${percentage}%`,
                                                        backgroundColor: '#3b82f6'
                                                    }
                                                ]} 
                                            />
                                        </View> */}
                                    </View>
                                    <Text style={[pdfStyles.tableCell, { width: '20%', textAlign: 'center', fontWeight: 'bold' }]}>
                                        {service.total_quantity}
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, { width: '15%', textAlign: 'center' }]}>
                                        {service.times_ordered}
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, { width: '15%', textAlign: 'right' }]}>
                                        {formatCurrency(service.total_revenue)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    {popularServices.popular_services.length === 0 && (
                        <Text style={pdfStyles.emptyMessage}>No hay servicios en el período seleccionado.</Text>
                    )}
                </View>

                {/* Footer */}
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
                    {categoryRevenue.categories.map((category, index) => {
                        const revenuePercentage = (parseFloat(category.total_revenue) / totalRevenue) * 100;
                        const color = getCategoryColor(index);

                        return (
                            <View key={index} style={[pdfStyles.serviceCard, { borderColor: color }]}>
                                <View style={pdfStyles.serviceHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={pdfStyles.categoryName}>{category.category_name}</Text>
                                        <Text style={pdfStyles.categoryItems}>{category.total_items} items</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[pdfStyles.categoryRevenue, { color }]}>
                                            {formatCurrency(category.total_revenue)}
                                        </Text>
                                        <Text style={pdfStyles.categoryPercentage}>
                                            {revenuePercentage.toFixed(1)}% del total
                                        </Text>
                                    </View>
                                </View>
                                <View style={[pdfStyles.progressBarContainer, { marginTop: 8 }]}>
                                    <View 
                                        style={[
                                            pdfStyles.progressBarFill,
                                            { 
                                                width: `${revenuePercentage}%`,
                                                backgroundColor: color
                                            }
                                        ]} 
                                    />
                                </View>
                            </View>
                        );
                    })}
                    {categoryRevenue.categories.length === 0 && (
                        <Text style={pdfStyles.emptyMessage}>No hay categorías con ingresos en el período seleccionado.</Text>
                    )}
                </View>

                {/* Summary */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Resumen</Text>
                    <View style={pdfStyles.metricsGrid}>
                        <View style={[pdfStyles.metricCard, { backgroundColor: '#dbeafe' }]}>
                            <Text style={pdfStyles.metricLabel}>Total de Artículos</Text>
                            <Text style={[pdfStyles.metricValue, { color: '#2563eb' }]}>
                                {totalItems.toLocaleString('es-AR')}
                            </Text>
                        </View>
                        <View style={[pdfStyles.metricCard, { backgroundColor: '#dcfce7' }]}>
                            <Text style={pdfStyles.metricLabel}>Ingresos Totales</Text>
                            <Text style={[pdfStyles.metricValue, { color: '#16a34a' }]}>
                                {formatCurrency(totalRevenue.toFixed(2))}
                            </Text>
                        </View>
                        <View style={[pdfStyles.metricCard, { backgroundColor: '#f3e8ff' }]}>
                            <Text style={pdfStyles.metricLabel}>Categorías Activas</Text>
                            <Text style={[pdfStyles.metricValue, { color: '#9333ea' }]}>
                                {categoryRevenue.categories.length}
                            </Text>
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
