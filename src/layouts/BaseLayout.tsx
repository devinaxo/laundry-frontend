import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    LogOut,
    Shirt,
    ChevronRight,
} from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { getSidebarRoutes } from '@/config/routes';
import { Link, useLocation } from 'react-router-dom';
import type { RouteConfig } from '@/config/routes';
import { Spinner } from '@/components/ui/shadcn-io/spinner';

interface BaseLayoutProps {
    children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigationItems = getSidebarRoutes();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const hasPermission = (permissions: string[]): boolean => {
        if (!permissions || permissions.length === 0) return true;
        if (!user?.role?.permissions) return false;
        return permissions.every(required =>
            user.role.permissions?.some(p => p.name === required)
        );
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const toggleExpanded = (path: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedItems(newExpanded);
    };

    const isPathActive = (path: string, hasChildren: boolean = false): boolean => {
        if (hasChildren) {
            return location.pathname.startsWith(path);
        } else {
            return location.pathname === path;
        }
    };

    const renderMenuItem = (item: RouteConfig) => {
        if (!hasPermission(item.permissions)) {
            return null;
        }

        const isExpanded = expandedItems.has(item.path);
        const hasChildren = item.isParent && item.children && item.children.length > 0;
        const isActive = isPathActive(item.path, hasChildren);

        return (
            <div key={item.path}>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild={!hasChildren}
                        isActive={isActive}
                        tooltip={item.title}
                        className='transition-all duration-300 ease-in-out'
                        onClick={() => hasChildren ? toggleExpanded(item.path) : null}
                    >
                        {hasChildren ? (
                            <>
                                <item.icon className="h-4 w-4 flex-shrink-0 group-data-[collapsible=icon]:mx-auto" />
                                <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-300 ease-in-out">
                                    {item.title}
                                </span>
                                <div className="ml-auto group-data-[collapsible=icon]:hidden">
                                    <ChevronRight className={`h-4 w-4 transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                                </div>
                            </>
                        ) : (
                            <Link
                                to={item.path}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out"
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-300 ease-in-out">
                                    {item.title}
                                </span>
                            </Link>
                        )}
                    </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Render children if expanded */}
                {hasChildren && isExpanded && (
                    <div className="ml-2 border-l border-border group-data-[collapsible=icon]:hidden">
                        {item.children?.map((child) => (
                            <div key={child.path} className="ml-2">
                                {renderMenuItem(child)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full">
                <Sidebar collapsible="icon">
                    <SidebarHeader className="px-6 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
                        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                            <Shirt className="h-6 w-6 text-primary flex-shrink-0" />
                            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                                Lavandería del 13
                            </span>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                                Navegación
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navigationItems.map((item) => renderMenuItem(item))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-4">
                        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
                            <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden min-w-0 flex-1">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-medium text-primary-foreground">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <div className="group-data-[collapsible=icon]:hidden">
                                    <ModeToggle />
                                </div>
                                {isLoggingOut ? (
                                    <Spinner variant='ellipsis' />
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleLogout}
                                        className="text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:p-2"
                                        title="Logout"
                                    >
                                        <LogOut className="h-[1.2rem] w-[1.2rem]" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        {/* User avatar and controls when collapsed */}
                        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center justify-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-foreground">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <ModeToggle />
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset>
                    <header className="px-6 py-4 flex items-center gap-4">
                        <SidebarTrigger className="h-4 w-4" />
                    </header>

                    {/* Main content area */}
                    <main className="flex-1 overflow-auto px-6">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default BaseLayout;