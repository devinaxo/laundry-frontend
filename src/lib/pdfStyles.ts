import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff'
    },
    header: {
        marginBottom: 20,
        borderBottom: '2 solid #2563eb',
        paddingBottom: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 5
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 3
    },
    dateRange: {
        fontSize: 11,
        color: '#475569',
        fontWeight: 'bold',
        marginTop: 5
    },
    section: {
        marginTop: 20,
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
        borderBottom: '1 solid #e2e8f0',
        paddingBottom: 5
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10
    },
    metricCard: {
        width: '48%',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 5,
        border: '1 solid #e2e8f0',
        marginBottom: 10
    },
    metricLabel: {
        fontSize: 9,
        color: '#64748b',
        marginBottom: 5,
        textTransform: 'uppercase'
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4
    },
    metricGrowth: {
        fontSize: 8,
        marginTop: 3
    },
    growthPositive: {
        color: '#16a34a'
    },
    growthNegative: {
        color: '#dc2626'
    },
    growthNeutral: {
        color: '#64748b'
    },
    rangeContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10
    },
    rangeCard: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        border: '1 solid #e2e8f0'
    },
    rangeCardHigh: {
        backgroundColor: '#dcfce7'
    },
    rangeCardLow: {
        backgroundColor: '#dbeafe'
    },
    rangeLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 5
    },
    rangeValue: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    statusTable: {
        marginTop: 10
    },
    statusRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderBottom: '1 solid #e2e8f0',
        alignItems: 'center'
    },
    statusHeader: {
        backgroundColor: '#f1f5f9',
        fontWeight: 'bold',
        fontSize: 9,
        color: '#475569'
    },
    statusName: {
        width: '40%',
        fontSize: 9
    },
    statusCount: {
        width: '20%',
        fontSize: 9,
        textAlign: 'center'
    },
    statusPercentage: {
        width: '20%',
        fontSize: 9,
        textAlign: 'center'
    },
    statusBar: {
        width: '20%',
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
        marginLeft: 5
    },
    statusBarFill: {
        height: '100%',
        borderRadius: 4
    },
    dailyStatsTable: {
        marginTop: 10
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderBottom: '1 solid #e2e8f0'
    },
    tableHeader: {
        backgroundColor: '#f1f5f9',
        fontWeight: 'bold',
        fontSize: 9,
        color: '#475569'
    },
    tableCell: {
        fontSize: 8,
        color: '#334155'
    },
    tableCellDate: {
        width: '33%'
    },
    tableCellOrders: {
        width: '33%',
        textAlign: 'center'
    },
    tableCellRevenue: {
        width: '34%',
        textAlign: 'right'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 8,
        borderTop: '1 solid #e2e8f0',
        paddingTop: 10
    },
    summaryBox: {
        backgroundColor: '#eff6ff',
        padding: 12,
        borderRadius: 5,
        border: '1 solid #93c5fd',
        marginTop: 10
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    summaryLabel: {
        fontSize: 10,
        color: '#1e40af',
        fontWeight: 'bold'
    },
    summaryValue: {
        fontSize: 10,
        color: '#1e40af',
        fontWeight: 'bold'
    }
});
