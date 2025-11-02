import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Package, Calendar } from 'lucide-react';
import OverviewTab from '@/components/analytics/OverviewTab';
import TrendsTab from '@/components/analytics/TrendsTab';
import ClientsTab from '@/components/analytics/ClientsTab';
import ServicesTab from '@/components/analytics/ServicesTab';

const Analytics: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    Analíticas y Reportes
                </h1>
                <p className="text-muted-foreground mt-2">
                    Análisis integral del negocio y métricas de rendimiento
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Resumen
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Tendencias
                    </TabsTrigger>
                    <TabsTrigger value="clients" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Clientes
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Servicios
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <OverviewTab />
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                    <TrendsTab />
                </TabsContent>

                <TabsContent value="clients" className="space-y-6">
                    <ClientsTab />
                </TabsContent>

                <TabsContent value="services" className="space-y-6">
                    <ServicesTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Analytics;
