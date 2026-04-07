export type UserRole = 'admin' | 'professional' | 'receptionist';

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role: UserRole;
    cpf?: string | null;
    phone?: string | null;
    specialty?: string | null;
    working_hours?: WorkingHourSlot[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type WorkingHourSlot = {
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    slots: { start: string; end: string }[];
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
