import { StyleSheet } from '@react-pdf/renderer';

// Professional, print-optimized styles — minimal color, tight spacing
export const pdfStyles = StyleSheet.create({
    // ── Layout ──────────────────────────────────────────────
    page: {
        padding: 30,
        paddingBottom: 50,
        fontSize: 9,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        color: '#1a1a1a'
    },
    header: {
        marginBottom: 12,
        borderBottom: '1.5 solid #1e3a5f',
        paddingBottom: 6
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e3a5f',
        marginBottom: 2
    },
    subtitle: {
        fontSize: 9,
        color: '#555555',
        marginBottom: 2
    },
    dateRange: {
        fontSize: 9,
        color: '#333333',
        marginTop: 2
    },
    section: {
        marginTop: 4,
        marginBottom: 10
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e3a5f',
        marginBottom: 6,
        borderBottom: '0.5 solid #cccccc',
        paddingBottom: 3
    },

    // ── Metrics Grid ────────────────────────────────────────
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 0,
        marginBottom: 6
    },
    metricCard: {
        width: '50%',
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderBottom: '0.5 solid #e0e0e0'
    },
    metricLabel: {
        fontSize: 7,
        color: '#666666',
        marginBottom: 1,
        textTransform: 'uppercase'
    },
    metricValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 1
    },
    metricGrowth: {
        fontSize: 7,
        marginTop: 1
    },
    growthPositive: {
        color: '#2e7d32'
    },
    growthNegative: {
        color: '#c62828'
    },
    growthNeutral: {
        color: '#666666'
    },

    // ── Range Cards (overview high/low) ─────────────────────
    rangeContainer: {
        flexDirection: 'row',
        gap: 0,
        marginBottom: 6
    },
    rangeCard: {
        flex: 1,
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderBottom: '0.5 solid #e0e0e0'
    },
    rangeCardHigh: {},
    rangeCardLow: {},
    rangeLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#666666',
        marginBottom: 2,
        textTransform: 'uppercase'
    },
    rangeValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000'
    },

    // ── Status Table ────────────────────────────────────────
    statusTable: {
        marginTop: 4
    },
    statusRow: {
        flexDirection: 'row',
        paddingVertical: 3,
        paddingHorizontal: 4,
        borderBottom: '0.5 solid #e0e0e0',
        alignItems: 'center'
    },
    statusHeader: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        fontSize: 7,
        color: '#333333'
    },
    statusName: {
        width: '40%',
        fontSize: 8
    },
    statusCount: {
        width: '20%',
        fontSize: 8,
        textAlign: 'center'
    },
    statusPercentage: {
        width: '20%',
        fontSize: 8,
        textAlign: 'center'
    },
    statusBar: {
        width: '20%',
        height: 5,
        backgroundColor: '#e5e5e5',
        overflow: 'hidden'
    },
    statusBarFill: {
        height: '100%'
    },

    // ── Data Tables ─────────────────────────────────────────
    dailyStatsTable: {
        marginTop: 4
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 3,
        paddingHorizontal: 4,
        borderBottom: '0.5 solid #e0e0e0'
    },
    tableHeader: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        fontSize: 7,
        color: '#333333'
    },
    tableCell: {
        fontSize: 8,
        color: '#1a1a1a'
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

    // ── Footer ──────────────────────────────────────────────
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#999999',
        fontSize: 7,
        borderTop: '0.5 solid #cccccc',
        paddingTop: 6
    },

    // ── Summary Box ─────────────────────────────────────────
    summaryBox: {
        padding: 6,
        border: '0.5 solid #cccccc',
        marginTop: 6
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2
    },
    summaryLabel: {
        fontSize: 8,
        color: '#1e3a5f',
        fontWeight: 'bold'
    },
    summaryValue: {
        fontSize: 8,
        color: '#1e3a5f',
        fontWeight: 'bold'
    },

    // ── Progress Bars ───────────────────────────────────────
    progressBarContainer: {
        width: '100%',
        height: 6,
        backgroundColor: '#e5e5e5',
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%'
    },

    // ── Year Comparison ─────────────────────────────────────
    yearComparisonCard: {
        width: '48%',
        padding: 8,
        border: '0.5 solid #cccccc',
        marginBottom: 6
    },
    yearTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000000'
    },
    yearMetricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
        paddingVertical: 1
    },
    yearMetricLabel: {
        fontSize: 8,
        color: '#666666'
    },
    yearMetricValue: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000000'
    },

    // ── Client rows (table-based) ───────────────────────────
    clientCard: {
        paddingVertical: 4,
        paddingHorizontal: 4,
        marginBottom: 0,
        borderBottom: '0.5 solid #e0e0e0'
    },
    clientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    },
    rankBadge: {
        width: 14,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rankNumber: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000000'
    },
    clientName: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 1
    },
    clientPhone: {
        fontSize: 7,
        color: '#666666'
    },
    clientMetricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
        marginBottom: 2
    },
    clientMetric: {
        flex: 1
    },
    clientMetricLabel: {
        fontSize: 7,
        color: '#666666',
        marginBottom: 1
    },
    clientMetricValue: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000000'
    },
    clientFooter: {
        fontSize: 7,
        color: '#666666',
        marginTop: 1
    },
    clientDateRange: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 1
    },
    emptyMessage: {
        fontSize: 8,
        color: '#666666',
        textAlign: 'center',
        padding: 10
    },

    // ── Service / Category Cards ────────────────────────────
    serviceCard: {
        paddingVertical: 5,
        paddingHorizontal: 4,
        marginBottom: 0,
        borderBottom: '0.5 solid #e0e0e0'
    },
    serviceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    categoryName: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 1
    },
    categoryItems: {
        fontSize: 7,
        color: '#666666'
    },
    categoryRevenue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000'
    },
    categoryPercentage: {
        fontSize: 7,
        color: '#666666',
        marginTop: 1
    }
});
