import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `$${numValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#6b7280';
        case 'in_progress': return '#eab308';
        case 'ready': return '#3b82f6';
        case 'delivered': return '#22c55e';
        case 'cancelled': return '#ef4444';
        default: return '#6b7280';
    }
};

export const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
};
