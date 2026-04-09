import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-1.5 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-bold tracking-tight">
                    Pilates Studio
                </span>
                <span className="truncate text-[10px] leading-tight text-sidebar-foreground/60">
                    Gestão Clínica
                </span>
            </div>
        </>
    );
}
