import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Users, Phone, Clock, DollarSign, ListOrdered } from 'lucide-react';
import { toast } from 'sonner';
import { getTopClients, getFrequentClients } from '@/api/getFetches';
import type { TopClientsResponse, FrequentClientsResponse } from '@/types/api';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

const ClientsTab: React.FC = () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [limit, setLimit] = useState<number>(10);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Período de Análisis</CardTitle>
                    <CardDescription>Selecciona el rango de fechas y cantidad de clientes a mostrar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                    <div className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-foreground">Cantidad de clientes:</label>
                        <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">Top 5</SelectItem>
                                <SelectItem value="10">Top 10</SelectItem>
                                <SelectItem value="15">Top 15</SelectItem>
                                <SelectItem value="20">Top 20</SelectItem>
                                <SelectItem value="25">Top 25</SelectItem>
                                <SelectItem value="50">Top 50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <ClientsDataSection dateRange={dateRange} limit={limit} />
        </div>
    );
};

interface ClientsDataSectionProps {
    dateRange: DateRange | undefined;
    limit: number;
}

const ClientsDataSection: React.FC<ClientsDataSectionProps> = ({ dateRange, limit }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [topClients, setTopClients] = useState<TopClientsResponse | null>(null);
    const [frequentClients, setFrequentClients] = useState<FrequentClientsResponse | null>(null);

    const loadData = React.useCallback(async () => {
        if (!dateRange?.from || !dateRange?.to) {
            return;
        }

        setIsLoading(true);
        try {
            const params = {
                limit: limit,
                start_date: format(dateRange.from, 'yyyy-MM-dd'),
                end_date: format(dateRange.to, 'yyyy-MM-dd')
            };

            const [top, frequent] = await Promise.all([
                getTopClients(params),
                getFrequentClients(params)
            ]);
            setTopClients(top);
            setFrequentClients(frequent);
        } catch (error) {
            console.error('Error loading clients:', error);
            toast.error('Error al cargar los datos de clientes');
        } finally {
            setIsLoading(false);
        }
    }, [dateRange, limit]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatCurrency = (value: string) => {
        return `$${parseFloat(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-blue-700 bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800';
        if (rank === 2) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900';
        if (rank === 3) return 'text-blue-500 bg-blue-25 dark:bg-blue-950/10 border-blue-100 dark:border-blue-950';
        return 'text-foreground bg-background border-border';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner variant="ellipsis" className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!topClients || !frequentClients) {
        return (
            <div className="text-center text-muted-foreground py-12">
                No hay datos disponibles
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Clients by Revenue */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        Top Clientes por Ingresos
                    </CardTitle>
                    <CardDescription>Clientes que más han gastado</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {topClients.top_clients.map((client) => (
                            <div
                                key={client.client_id}
                                className={`p-4 rounded-lg border transition-all hover:shadow-md ${getRankColor(client.rank)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 font-bold">
                                                {client.rank}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">{client.client_name}</h4>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    {client.phone}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Gastado</p>
                                                <p className="text-lg font-bold text-green-600">{formatCurrency(client.total_spent)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Pedidos</p>
                                                <p className="text-lg font-bold text-foreground">{client.total_orders}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Promedio</p>
                                                <p className="text-lg font-bold text-blue-600">{formatCurrency(client.average_order_value)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Último pedido: {new Date(client.last_order_date).toLocaleDateString('es-AR')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topClients.top_clients.length === 0 && (
                            <div className="text-center text-muted-foreground py-6">
                                No hay clientes en el período seleccionado.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Most Frequent Clients */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Clientes Más Frecuentes
                    </CardTitle>
                    <CardDescription>Clientes con mayor número de pedidos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {frequentClients.frequent_clients.map((client) => (
                            <div
                                key={client.client_id}
                                className={`p-4 rounded-lg border transition-all hover:shadow-md ${getRankColor(client.rank)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 font-bold">
                                                {client.rank}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">{client.client_name}</h4>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    {client.phone}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Pedidos</p>
                                                <p className="text-lg font-bold text-purple-600">{client.total_orders}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Gastado</p>
                                                <p className="text-lg font-bold text-green-600">{formatCurrency(client.total_spent)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Cliente desde hace
                                                </p>
                                                <p className="text-lg font-bold text-foreground">{Math.floor(client.customer_since_days)} días</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Primer pedido: {new Date(client.first_order_date).toLocaleDateString('es-AR')}</span>
                                            <span>Último pedido: {new Date(client.last_order_date).toLocaleDateString('es-AR')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {frequentClients.frequent_clients.length === 0 && (
                            <div className="text-center text-muted-foreground py-6">
                                No hay clientes en el período seleccionado.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-900 dark:text-green-100 mb-1">Ingresos Top {limit}</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(
                                            topClients.top_clients.reduce((sum, client) => sum + parseFloat(client.total_spent), 0).toFixed(2)
                                        )}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-900 dark:text-purple-100 mb-1">Pedidos Top {limit}</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {frequentClients.frequent_clients.reduce((sum, client) => sum + client.total_orders, 0)}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientsTab;
