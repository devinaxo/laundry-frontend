import React, { useState, useEffect, useCallback } from 'react';
import { version } from '../../package.json';
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LogOut,
  Shirt,
  ChevronRight,
  Search,
} from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { getSidebarRoutes, getAllRoutes } from '@/config/routes';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { RouteConfig } from '@/config/routes';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Separator } from '@/components/ui/separator';
import { usePageTitle } from '@/hooks/usePageTitle';

interface BaseLayoutProps {
  children: React.ReactNode;
}

// Self-contained menu item — uses hooks so it must be a proper component
const MenuItem: React.FC<{ item: RouteConfig }> = ({ item }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const [expanded, setExpanded] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const hasPermission = (permissions: string[]): boolean => {
    if (!permissions || permissions.length === 0) return true;
    if (!user?.role?.permissions) return false;
    return permissions.every(required =>
      user.role.permissions?.some(p => p.name === required)
    );
  };

  if (!hasPermission(item.permissions)) return null;

  const hasChildren = item.isParent && item.children && item.children.length > 0;
  const isActive = hasChildren
    ? location.pathname.startsWith(item.path)
    : location.pathname === item.path;
  const isCollapsed = state === 'collapsed';

  // Collapsed sidebar + parent with children → flyout popover
  if (isCollapsed && hasChildren) {
    return (
      <SidebarMenuItem>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              isActive={isActive}
              className="transition-all duration-300 ease-in-out"
            >
              <item.icon className="h-4 w-4" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" sideOffset={8} className="w-52 p-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 py-1">
              {item.title}
            </p>
            <div className="mt-1 space-y-0.5">
              {item.children
                ?.filter(child => hasPermission(child.permissions))
                .map(child => (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={() => setPopoverOpen(false)}
                    className={cn(
                      'flex items-center gap-2 pl-3 pr-2 py-1.5 text-sm rounded-md border-l-2 border-primary transition-colors',
                      location.pathname === child.path
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <child.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{child.title}</span>
                  </Link>
                ))}
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    );
  }

  // Normal expanded sidebar rendering
  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild={!hasChildren}
          isActive={isActive}
          tooltip={item.title}
          className="transition-all duration-300 ease-in-out"
          onClick={hasChildren ? () => setExpanded(e => !e) : undefined}
        >
          {hasChildren ? (
            <>
              <item.icon className="h-4 w-4 flex-shrink-0 group-data-[collapsible=icon]:mx-auto" />
              <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-300 ease-in-out">
                {item.title}
              </span>
              <div className="ml-auto group-data-[collapsible=icon]:hidden">
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ease-in-out ${expanded ? 'rotate-90' : 'rotate-0'}`} />
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

      {hasChildren && expanded && (
        <div className="ml-2 border-l border-border group-data-[collapsible=icon]:hidden">
          {item.children?.map((child) => (
            <div key={child.path} className="ml-2">
              <MenuItem item={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  usePageTitle();
  const navigationItems = getSidebarRoutes();
  const allRoutes = getAllRoutes().filter(r => r.showInSidebar);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandOpen(open => !open);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="inset">
        {/* ── Logo / Brand ── */}
        <SidebarHeader className="h-14 px-4 py-0 justify-center group-data-[collapsible=icon]:px-2">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            {/* Icon badge */}
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md">
              <Shirt className="h-5 w-5 text-primary-foreground" />
            </div>
            {/* Name block */}
            <div className="group-data-[collapsible=icon]:hidden leading-tight">
              <p className="text-sm font-bold tracking-tight text-foreground">
                Lavandería
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-primary">del 13</p>
                <span className="text-[10px] text-muted-foreground/60 font-mono">
                  v{version}
                </span>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
              Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <MenuItem key={item.path} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          {/* Expanded footer */}
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ModeToggle />
              {isLoggingOut ? (
                <Spinner variant='ellipsis' />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Collapsed footer */}
          <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <ModeToggle />
            {isLoggingOut ? (
              <Spinner variant='ellipsis' />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* ── Site Header ── */}
        <header className="flex h-14 items-center gap-3 border-b border-sidebar-border bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-10">
          <SidebarTrigger className="h-8 w-8" />
          <Separator orientation="vertical" className="h-5" />

          {/* Command search trigger */}
          <button
            onClick={() => setCommandOpen(true)}
            className="flex flex-1 max-w-xs items-center gap-2 rounded-lg border border-border/60 bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:border-border transition-all duration-150 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/50 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Ctrl + K
            </kbd>
          </button>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto px-6 py-2">
          {children}
        </main>
      </SidebarInset>

      {/* ── Command Palette ── */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Buscar páginas y acciones..." />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Páginas">
            {allRoutes
              .filter(r => hasPermission(r.permissions))
              .map(route => (
                <CommandItem
                  key={route.path}
                  value={route.title}
                  onSelect={() => {
                    navigate(route.path);
                    setCommandOpen(false);
                  }}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.title}
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Acciones">
            <CommandItem
              value="cerrar sesion logout"
              onSelect={() => {
                setCommandOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
};

export default BaseLayout;