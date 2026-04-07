export type CalendarAppointment = {
    id: number;
    title: string;
    start: string;
    end: string;
    status: string;
    professional?: string;
    patient?: string;
    type: string;
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
