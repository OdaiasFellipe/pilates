import { Link } from '@inertiajs/react';
import { ActivitySquare, BookOpen, CalendarDays, DollarSign, LayoutGrid, Users, UserSquare2 } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Pacientes',
        href: '/patients',
        icon: Users,
    },
    {
        title: 'Profissionais',
        href: '/professionals',
        icon: UserSquare2,
    },
    {
        title: 'Agenda',
        href: '/appointments',
        icon: CalendarDays,
    },
    {
        title: 'Clínico',
        href: '/clinical/treatment-plans/create',
        icon: ActivitySquare,
    },
    {
        title: 'Financeiro',
        href: '/financial/payments',
        icon: DollarSign,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentação',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
