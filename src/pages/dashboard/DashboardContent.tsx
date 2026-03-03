import { getDashboardData, getRecentOrders } from '@/api/getFetches';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal';
import { statusColors, statusLabels } from '@/components/orders/statuses';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Permission } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';
import { useHasPermission } from '@/hooks/useHasPermission';
import { formatDateOnly } from '@/lib/utils';
import type { DashboardData, RecentOrder } from '@/types/api';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Package,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const canCreateOrders = useHasPermission(Permission.CREATE_ORDERS);
  const canCreateClients = useHasPermission(Permission.CREATE_CLIENTS);

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

  const pending = dashboardData?.order_status_summary.pending || 0;
  const inProgress = dashboardData?.order_status_summary.in_progress || 0;
  const ready = dashboardData?.order_status_summary.ready || 0;
  const pipelineTotal = pending + inProgress + ready;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Buen{new Date().getHours() < 12 ? 'os días' : new Date().getHours() < 19 ? 'as tardes' : 'as noches'}, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {/* Quick actions */}
        <div className="flex gap-2 flex-wrap">
          {canCreateOrders && (
            <Button size="sm" onClick={() => navigate('/orders/new?from=dashboard')}>
              <Plus className="h-4 w-4 mr-1.5" />
              Nuevo Pedido
            </Button>
          )}
          {canCreateClients && (
            <Button size="sm" variant="outline" onClick={() => navigate('/clients/new?from=dashboard')}>
              <Users className="h-4 w-4 mr-1.5" />
              Nuevo Cliente
            </Button>
          )}
          {canViewOrders && (
            <Button size="sm" variant="outline" onClick={() => navigate('/orders/list')}>
              <FileText className="h-4 w-4 mr-1.5" />
              Ver Pedidos
            </Button>
          )}
        </div>
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
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Orders today */}
            <Card>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pedidos hoy</span>
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData?.orders_today.count || 0}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {dashboardData?.orders_today.increase_percentage !== undefined && dashboardData.orders_today.increase_percentage !== 0 && (
                    <>
                      {dashboardData.orders_today.increase_percentage > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs font-medium ${dashboardData.orders_today.increase_percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dashboardData.orders_today.increase_percentage > 0 ? '+' : ''}{dashboardData.orders_today.increase_percentage.toFixed(0)}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">
                    vs. ayer ({dashboardData?.orders_today.yesterday_count ?? 0})
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pending + in progress */}
            <Card>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">En cola</span>
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {pending + inProgress}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pending} pendiente{pending !== 1 ? 's' : ''} · {inProgress} en proceso
                </p>
              </CardContent>
            </Card>

            {/* Revenue today */}
            <Card>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hoy</span>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData?.revenue.today.formatted || '$0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ingresos del día</p>
              </CardContent>
            </Card>

            {/* Revenue month */}
            <Card>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Este mes</span>
                  <CalendarDays className="h-4 w-4 text-violet-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData?.revenue.month.formatted || '$0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ingresos acumulados</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Pipeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estado de Pedidos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineTotal > 0 ? (
                <>
                  {/* Visual bar */}
                  <div className="flex h-3 rounded-full overflow-hidden bg-muted mb-4">
                    {pending > 0 && (
                      <div
                        className="bg-gray-400 dark:bg-gray-500 transition-all"
                        style={{ width: `${(pending / pipelineTotal) * 100}%` }}
                        title={`Pendientes: ${pending}`}
                      />
                    )}
                    {inProgress > 0 && (
                      <div
                        className="bg-yellow-400 dark:bg-yellow-500 transition-all"
                        style={{ width: `${(inProgress / pipelineTotal) * 100}%` }}
                        title={`En proceso: ${inProgress}`}
                      />
                    )}
                    {ready > 0 && (
                      <div
                        className="bg-primary transition-all"
                        style={{ width: `${(ready / pipelineTotal) * 100}%` }}
                        title={`Listos: ${ready}`}
                      />
                    )}
                  </div>
                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                        <span className="text-xs text-muted-foreground font-medium">Pendientes</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{pending}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 dark:bg-yellow-500" />
                        <span className="text-xs text-muted-foreground font-medium">En Proceso</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{inProgress}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="text-xs text-muted-foreground font-medium">Listos</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{ready}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
                  <p className="text-sm font-medium">No hay pedidos activos en este momento</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          {canViewOrders && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Pedidos Recientes</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/orders/list')}>
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="px-0">
                {recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sidebar-primary text-muted-foreground text-xs uppercase tracking-wide">
                          <th className="text-left font-medium px-6 py-2">Pedido</th>
                          <th className="text-left font-medium px-3 py-2">Cliente</th>
                          <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Fecha</th>
                          <th className="text-right font-medium px-3 py-2">Total</th>
                          <th className="text-center font-medium px-6 py-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr
                            key={order.id}
                            onClick={() => handleViewOrderDetails(order)}
                            className="border-b border-sidebar-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-3 font-medium text-foreground">
                              #{order.order_number}
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">
                              {order.client.forename} {order.client.surname}
                            </td>
                            <td className="px-3 py-3 text-muted-foreground hidden sm:table-cell">
                              {formatDateOnly(order.reception_date)}
                            </td>
                            <td className="px-3 py-3 text-right font-medium text-foreground">
                              ${parseFloat(order.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <Badge className={statusColors[order.status] + ' text-[11px]'}>
                                {statusLabels[order.status]}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6 text-sm">No hay pedidos recientes</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <OrderDetailsModal
        order={selectedOrderForDetails}
        isOpen={orderDetailsModalOpen}
        onClose={() => setOrderDetailsModalOpen(false)}
        showStatusEdit={true}
        onStatusUpdate={(updatedOrder) => {
          setRecentOrders(prev =>
            prev.map(order =>
              order.id === updatedOrder.id
                ? { ...order, status: updatedOrder.status }
                : order
            )
          );
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default Dashboard;