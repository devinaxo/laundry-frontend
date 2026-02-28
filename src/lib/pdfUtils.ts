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
        case 'pending': return '#78909c';
        case 'in_progress': return '#f9a825';
        case 'ready': return '#1565c0';
        case 'delivered': return '#2e7d32';
        case 'cancelled': return '#b71c1c';
        default: return '#78909c';
    }
};

export const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
};
