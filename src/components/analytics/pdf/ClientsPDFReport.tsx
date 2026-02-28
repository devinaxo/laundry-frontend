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
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.title}>Reporte de Clientes</Text>
                    <Text style={pdfStyles.subtitle}>Lavandería del 13</Text>
                    <Text style={pdfStyles.dateRange}>
                        Período: {formatDate(dateRange.from)} — {formatDate(dateRange.to)}
                    </Text>
                </View>

                {/* Top Clients by Revenue — table layout */}
                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Top {limit} Clientes por Ingresos</Text>
                    <View style={pdfStyles.dailyStatsTable}>
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                            <Text style={{ width: '6%', fontSize: 7 }}>#</Text>
                            <Text style={{ width: '28%', fontSize: 7 }}>CLIENTE</Text>
                            <Text style={{ width: '16%', fontSize: 7 }}>TELÉFONO</Text>
                            <Text style={{ width: '16%', fontSize: 7, textAlign: 'right' }}>GASTADO</Text>
                            <Text style={{ width: '12%', fontSize: 7, textAlign: 'center' }}>PEDIDOS</Text>
                            <Text style={{ width: '14%', fontSize: 7, textAlign: 'right' }}>PROMEDIO</Text>
                            <Text style={{ width: '8%', fontSize: 7 }}></Text>
                        </View>
                        {topClients.top_clients.map((client, index) => (
                            <View key={index} style={pdfStyles.tableRow}>
                                <Text style={[pdfStyles.tableCell, { width: '6%', fontWeight: 'bold' }]}>
                                    {client.rank}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '28%', fontWeight: 'bold' }]}>
                                    {client.client_name}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '16%' }]}>
                                    {client.phone}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '16%', textAlign: 'right', fontWeight: 'bold' }]}>
                                    {formatCurrency(client.total_spent)}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '12%', textAlign: 'center' }]}>
                                    {client.total_orders}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '14%', textAlign: 'right' }]}>
                                    {formatCurrency(client.average_order_value)}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '8%' }]}></Text>
                            </View>
                        ))}
                    </View>
                    {topClients.top_clients.length === 0 && (
                        <Text style={pdfStyles.emptyMessage}>No hay clientes en el período seleccionado.</Text>
                    )}
                </View>

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
                    <View style={pdfStyles.dailyStatsTable}>
                        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                            <Text style={{ width: '6%', fontSize: 7 }}>#</Text>
                            <Text style={{ width: '26%', fontSize: 7 }}>CLIENTE</Text>
                            <Text style={{ width: '14%', fontSize: 7 }}>TELÉFONO</Text>
                            <Text style={{ width: '12%', fontSize: 7, textAlign: 'center' }}>PEDIDOS</Text>
                            <Text style={{ width: '14%', fontSize: 7, textAlign: 'right' }}>GASTADO</Text>
                            <Text style={{ width: '14%', fontSize: 7, textAlign: 'center' }}>DESDE (DÍAS)</Text>
                            <Text style={{ width: '14%', fontSize: 7, textAlign: 'right' }}>ÚLT. PEDIDO</Text>
                        </View>
                        {frequentClients.frequent_clients.map((client, index) => (
                            <View key={index} style={pdfStyles.tableRow}>
                                <Text style={[pdfStyles.tableCell, { width: '6%', fontWeight: 'bold' }]}>
                                    {client.rank}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '26%', fontWeight: 'bold' }]}>
                                    {client.client_name}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '14%' }]}>
                                    {client.phone}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '12%', textAlign: 'center', fontWeight: 'bold' }]}>
                                    {client.total_orders}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '14%', textAlign: 'right' }]}>
                                    {formatCurrency(client.total_spent)}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '14%', textAlign: 'center' }]}>
                                    {Math.floor(client.customer_since_days)}
                                </Text>
                                <Text style={[pdfStyles.tableCell, { width: '14%', textAlign: 'right' }]}>
                                    {formatSafeDate(client.last_order_date, "d/MM/yyyy")}
                                </Text>
                            </View>
                        ))}
                    </View>
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
                            <Text style={pdfStyles.summaryValue}>
                                {formatCurrency(totalRevenueTop.toFixed(2))}
                            </Text>
                        </View>
                        <View style={pdfStyles.summaryRow}>
                            <Text style={pdfStyles.summaryLabel}>Pedidos Top {limit}:</Text>
                            <Text style={pdfStyles.summaryValue}>
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
