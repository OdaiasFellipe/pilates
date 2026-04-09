export type CalendarAppointment = {
    id: number;
    title: string;
    start: string;
    end: string;
    status: string;
    professional_id?: number;
    professional?: string;
    patient?: string;
    type: string;
    type_label?: string;
};

export type CalendarSlot = {
    start: string;
    end: string;
    available: boolean;
};

export type CalendarRange = {
    start: string;
    end: string;
};

export type CalendarViewType = 'day' | 'week' | 'month';
