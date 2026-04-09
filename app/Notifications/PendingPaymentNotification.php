<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PendingPaymentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $pendingCount,
        private readonly string $pendingAmount,
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
            'kind' => 'pending_payment',
            'title' => 'Pagamentos pendentes',
            'message' => sprintf(
                '%d pagamento(s) pendente(s), total de R$ %s.',
                $this->pendingCount,
                $this->pendingAmount
            ),
            'pending_count' => $this->pendingCount,
            'pending_amount' => $this->pendingAmount,
            'date' => $this->referenceDate,
            'url' => '/financial/payments',
            'severity' => 'warning',
        ];
    }
}
