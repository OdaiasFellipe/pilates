<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AppointmentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $appointmentId,
        private readonly int $patientId,
        private readonly string $patientName,
        private readonly string $startsAt,
        private readonly string $reminderWindow,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'appointment_reminder',
            'title' => 'Lembrete de consulta',
            'message' => sprintf(
                'Paciente %s com atendimento em %s (%s).',
                $this->patientName,
                $this->startsAt,
                $this->reminderWindow
            ),
            'appointment_id' => $this->appointmentId,
            'patient_id' => $this->patientId,
            'reminder_window' => $this->reminderWindow,
            'url' => '/appointments',
            'severity' => 'info',
        ];
    }
}
