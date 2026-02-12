import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { TopClientsResponse, FrequentClientsResponse } from '@/types/api';
import { pdfStyles } from '@/lib/pdfStyles';
import { formatCurrency, formatDate } from '@/lib/pdfUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientsPDFReportProps {
    topClients: TopClientsResponse;
    frequentClients: FrequentClientsResponse;
    dateRange: {
        from: Date;
        to: Date;
    };
    limit: number;
}

export const ClientsPDFReport: React.FC<ClientsPDFReportProps> = ({
    topClients,
    frequentClients,
    dateRange,
    limit
}) => {
    const getRankStyle = (rank: number) => {
        if (rank === 1) return { backgroundColor: '#dbeafe', borderColor: '#93c5fd' };
        if (rank === 2) return { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' };
        if (rank === 3) return { backgroundColor: '#f0f9ff', borderColor: '#e0f2fe' };
        return { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' };
    };

    const formatSafeDate = (dateString: string, formatStr: string = "d 'de' MMM yyyy") => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Fecha no disponible';
            }
            return format(date, formatStr, { locale: es });
        } catch {
            return 'Fecha no disponible';
        }
    };

    const totalRevenueTop = topClients.top_clients.reduce((sum, client) => sum + parseFloat(client.total_spent), 0);
    const totalOrdersFrequent = frequentClients.frequent_clients.reduce((sum, client) => sum + client.total_orders, 0);

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                {/* Header */}
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Reporte de Clientes</Text>
                    <Text style={pdfStyles.dateRange}>
                        Período: {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </Text>
                </View>

                {/* Top Clients by Revenue */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Top {limit} Clientes por Ingresos</Text>
                    {topClients.top_clients.map((client, index) => (
                        <View 
                            key={index} 
                            style={[
                                pdfStyles.clientCard,
                                getRankStyle(client.rank)
                            ]}
                        >
                            <View style={pdfStyles.clientHeader}>
                                <View style={pdfStyles.rankBadge}>
                                    <Text style={pdfStyles.rankNumber}>{client.rank}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={pdfStyles.clientName}>{client.client_name}</Text>
                                    <Text style={pdfStyles.clientPhone}>{client.phone}</Text>
                                </View>
                            </View>
                            <View style={pdfStyles.clientMetricsGrid}>
                                <View style={pdfStyles.clientMetric}>
                                    <Text style={pdfStyles.clientMetricLabel}>Total Gastado</Text>
                                    <Text style={[pdfStyles.clientMetricValue, { color: '#16a34a' }]}>
                                        {formatCurrency(client.total_spent)}
                                    </Text>
                                </View>
                                <View style={pdfStyles.clientMetric}>
                                    <Text style={pdfStyles.clientMetricLabel}>Total Pedidos</Text>
                                    <Text style={pdfStyles.clientMetricValue}>
                                        {client.total_orders}
                                    </Text>
                                </View>
                                <View style={pdfStyles.clientMetric}>
                                    <Text style={pdfStyles.clientMetricLabel}>Promedio</Text>
                                    <Text style={[pdfStyles.clientMetricValue, { color: '#2563eb' }]}>
                                        {formatCurrency(client.average_order_value)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={pdfStyles.clientFooter}>
                                Último pedido: {formatSafeDate(client.last_delivery_date)}
                            </Text>
                        </View>
                    ))}
                    {topClients.top_clients.length === 0 && (
                        <Text style={pdfStyles.emptyMessage}>No hay clientes en el período seleccionado.</Text>
                    )}
                </View>

                {/* Footer */}
                <Text style={pdfStyles.footer}>
                    Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </Text>
            </Page>

            {/* Second Page - Most Frequent Clients */}
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Clientes Más Frecuentes</Text>
                </View>

                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Top {limit} Clientes Frecuentes</Text>
                    {frequentClients.frequent_clients.map((client, index) => (
                        <View 
                            key={index} 
                            style={[
                                pdfStyles.clientCard,
                                getRankStyle(client.rank)
                            ]}
                        >
                            <View style={pdfStyles.clientHeader}>
                                <View style={pdfStyles.rankBadge}>
                                    <Text style={pdfStyles.rankNumber}>{client.rank}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={pdfStyles.clientName}>{client.client_name}</Text>
                                    <Text style={pdfStyles.clientPhone}>{client.phone}</Text>
                                </View>
                            </View>
                            <View style={pdfStyles.clientMetricsGrid}>
                                <View style={pdfStyles.clientMetric}>
                                    <Text style={pdfStyles.clientMetricLabel}>Total Pedidos</Text>
                                    <Text style={[pdfStyles.clientMetricValue, { color: '#9333ea' }]}>
                                        {client.total_orders}
                                    </Text>
                                </View>
                                <View style={pdfStyles.clientMetric}>
                                    <Text style={pdfStyles.clientMetricLabel}>Total Gastado</Text>
                                    <Text style={[pdfStyles.clientMetricValue, { color: '#16a34a' }]}>
                                        {formatCurrency(client.total_spent)}
                                    </Text>
                                </View>
                                <View style={pdfStyles.clientMetric}>
                                    <Text style={pdfStyles.clientMetricLabel}>Cliente desde</Text>
                                    <Text style={pdfStyles.clientMetricValue}>
                                        {Math.floor(client.customer_since_days)} días
                                    </Text>
                                </View>
                            </View>
                            <View style={pdfStyles.clientDateRange}>
                                <Text style={pdfStyles.clientFooter}>
                                    Primer pedido: {formatSafeDate(client.first_order_date, "d/MM/yyyy")}
                                </Text>
                                <Text style={pdfStyles.clientFooter}>
                                    Último pedido: {formatSafeDate(client.last_order_date, "d/MM/yyyy")}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {frequentClients.frequent_clients.length === 0 && (
                        <Text style={pdfStyles.emptyMessage}>No hay clientes en el período seleccionado.</Text>
                    )}
                </View>

                {/* Summary */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Resumen</Text>
                    <View style={pdfStyles.summaryBox}>
                        <View style={pdfStyles.summaryRow}>
                            <Text style={pdfStyles.summaryLabel}>Ingresos Top {limit}:</Text>
                            <Text style={[pdfStyles.summaryValue, { color: '#16a34a' }]}>
                                {formatCurrency(totalRevenueTop.toFixed(2))}
                            </Text>
                        </View>
                        <View style={pdfStyles.summaryRow}>
                            <Text style={pdfStyles.summaryLabel}>Pedidos Top {limit}:</Text>
                            <Text style={[pdfStyles.summaryValue, { color: '#9333ea' }]}>
                                {totalOrdersFrequent}
                            </Text>
                        </View>
                        <View style={pdfStyles.summaryRow}>
                            <Text style={pdfStyles.summaryLabel}>Clientes Analizados:</Text>
                            <Text style={pdfStyles.summaryValue}>
                                {limit}
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
