<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PackageExpiringNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $patientPackageId,
        private readonly int $patientId,
        private readonly string $patientName,
        private readonly string $expiresAt,
        private readonly string $referenceDate,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'package_expiring',
            'title' => 'Pacote próximo do vencimento',
            'message' => sprintf(
                'Paciente %s com pacote vencendo em %s.',
                $this->patientName,
                $this->expiresAt
            ),
            'patient_package_id' => $this->patientPackageId,
            'patient_id' => $this->patientId,
            'date' => $this->referenceDate,
            'url' => sprintf('/financial/patient-packages/%d', $this->patientPackageId),
            'severity' => 'warning',
        ];
    }
}
