import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardData, getRecentOrders } from '@/api/getFetches';
import type { DashboardData, RecentOrder } from '@/types/api';
import { statusLabels, statusColors } from '@/components/orders/statuses';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Package, DollarSign, Clock, Plus, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHasPermission } from '@/hooks/useHasPermission';
import { Permission } from '@/config/routes';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<RecentOrder | null>(null);
    const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);

    const canViewOrders = useHasPermission(Permission.VIEW_ORDERS);

    const handleViewOrderDetails = (order: RecentOrder) => {
        setSelectedOrderForDetails(order);
        setOrderDetailsModalOpen(true);
    };

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [dashboardResponse, recentOrdersResponse] = await Promise.all([
                getDashboardData(),
                getRecentOrders()
            ]);
            setDashboardData(dashboardResponse.data);
            setRecentOrders(recentOrdersResponse.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos del dashboard');
            console.error('Error fetching dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-destructive font-medium">Error al cargar el dashboard</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <Button
                        onClick={fetchDashboardData}
                        variant="outline"
                        size="sm"
                        className="mt-4"
                    >
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    ¡Bienvenido de vuelta, {user?.name}!
                </h2>
                <p className="text-muted-foreground">
                    Aquí tienes un resumen de lo que está pasando en la lavandería hoy.
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Cargando dashboard...</span>
                        <Spinner variant="ellipsis" className="h-6 w-6 text-primary" />
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Pedidos de Hoy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-blue-600">
                                    {dashboardData?.orders_today.count || 0}
                                </p>
                                <CardDescription className="flex items-center gap-1">
                                    {dashboardData?.orders_today.increase_percentage !== undefined && (
                                        <>
                                            {dashboardData.orders_today.increase_percentage > 0 ? (
                                                <TrendingUp className="h-3 w-3 text-green-600" />
                                            ) : dashboardData.orders_today.increase_percentage < 0 ? (
                                                <TrendingDown className="h-3 w-3 text-red-600" />
                                            ) : null}
                                            <span className={dashboardData.orders_today.increase_percentage > 0 ? 'text-green-600' : dashboardData.orders_today.increase_percentage < 0 ? 'text-red-600' : ''}>
                                                {dashboardData.orders_today.increase_percentage > 0 ? '+' : ''}{dashboardData.orders_today.increase_percentage.toFixed(1)}% desde ayer
                                            </span>
                                        </>
                                    )}
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    Pedidos Pendientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-orange-600">
                                    {((dashboardData?.order_status_summary.pending || 0) + (dashboardData?.order_status_summary.in_progress || 0))}
                                </p>
                                <CardDescription>Pendientes + En proceso</CardDescription>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    Ingresos de Hoy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">
                                    {dashboardData?.revenue.today.formatted || '$0.00'}
                                </p>
                                <CardDescription>
                                    Este mes: {dashboardData?.revenue.month.formatted || '$0.00'}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {canViewOrders &&
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pedidos Recientes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {recentOrders.length > 0 ? (
                                            recentOrders.map((order) => (
                                                <div 
                                                    key={order.id} 
                                                    className="flex items-center justify-between p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                                                    onClick={() => handleViewOrderDetails(order)}
                                                    title="Hacer clic para ver detalles"
                                                >
                                                    <div>
                                                        <p className="font-medium">{order.order_number}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {order.client.forename} {order.client.surname}
                                                        </p>
                                                        <p className="text-sm font-medium text-green-600">
                                                            ${parseFloat(order.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[order.status]}`}>
                                                        {statusLabels[order.status]}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted-foreground py-4">
                                                No hay pedidos recientes
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>}

                        <Card>
                            <CardHeader>
                                <CardTitle>Acciones Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/orders/new?from=dashboard')}
                                        className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Plus className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-foreground">Nuevo Pedido</p>
                                                <p className="text-sm text-muted-foreground">Crear un nuevo pedido de lavandería</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => navigate('/orders/list')}
                                        className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <p className="font-medium text-foreground">Ver Pedidos</p>
                                                <p className="text-sm text-muted-foreground">Revisar y gestionar pedidos</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => navigate('/clients/new?from=dashboard')}
                                        className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Users className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-foreground">Agregar Cliente</p>
                                                <p className="text-sm text-muted-foreground">Registrar un nuevo cliente</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen de Estados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                            <span className="font-medium">Pendientes</span>
                                        </div>
                                        <span className="text-lg font-bold">
                                            {dashboardData?.order_status_summary.pending || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span className="font-medium">En Proceso</span>
                                        </div>
                                        <span className="text-lg font-bold">
                                            {dashboardData?.order_status_summary.in_progress || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="font-medium">Listos</span>
                                        </div>
                                        <span className="text-lg font-bold">
                                            {dashboardData?.order_status_summary.ready || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded border-2 border-primary/20">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-primary">Total Hoy</span>
                                        </div>
                                        <span className="text-xl font-bold text-primary">
                                            {dashboardData?.order_status_summary.total_today || 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
            
            <OrderDetailsModal
                order={selectedOrderForDetails}
                isOpen={orderDetailsModalOpen}
                onClose={() => setOrderDetailsModalOpen(false)}
                showStatusEdit={true}
                onStatusUpdate={(updatedOrder) => {
                    // Update the order in the recent orders list
                    setRecentOrders(prev => 
                        prev.map(order => 
                            order.id === updatedOrder.id 
                                ? { ...order, status: updatedOrder.status }
                                : order
                        )
                    );
                    // Refresh dashboard data to update metrics
                    fetchDashboardData();
                }}
            />
        </div>
    );
};

export default Dashboard;