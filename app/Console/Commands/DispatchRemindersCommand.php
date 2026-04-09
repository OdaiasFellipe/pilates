<?php

namespace App\Console\Commands;

use App\Enums\AppointmentStatus;
use App\Enums\PatientPackageStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\PatientPackage;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\AppointmentReminderNotification;
use App\Notifications\PackageExpiringNotification;
use App\Notifications\PendingPaymentNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

class DispatchRemindersCommand extends Command
{
    protected $signature = 'notifications:dispatch-reminders {--dry-run : Apenas simula os envios}';

    protected $description = 'Dispara lembretes de agenda, pagamentos pendentes e pacotes próximos ao vencimento';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $appointmentNotifications = $this->dispatchAppointmentReminders($dryRun);
        $pendingPaymentNotifications = $this->dispatchPendingPaymentNotifications($dryRun);
        $expiringPackageNotifications = $this->dispatchPackageExpiringNotifications($dryRun);

        $this->info(sprintf(
            'Resumo: %d lembrete(s) de agenda, %d alerta(s) de pendência, %d alerta(s) de vencimento.',
            $appointmentNotifications,
            $pendingPaymentNotifications,
            $expiringPackageNotifications
        ));

        return self::SUCCESS;
    }

    private function dispatchAppointmentReminders(bool $dryRun): int
    {
        $total = 0;

        $windows = [
            '2h' => [now()->addMinutes(115), now()->addMinutes(125)],
            '24h' => [now()->addHours(23)->addMinutes(55), now()->addHours(24)->addMinutes(5)],
        ];

        foreach ($windows as $windowLabel => [$start, $end]) {
            $appointments = Appointment::query()
                ->with(['patient:id,name', 'professional:id,name'])
                ->whereIn('status', [AppointmentStatus::Scheduled->value, AppointmentStatus::Confirmed->value])
                ->whereBetween('starts_at', [$start, $end])
                ->get();

            foreach ($appointments as $appointment) {
                $recipients = $this->appointmentRecipients($appointment->professional_id);

                foreach ($recipients as $recipient) {
                    if ($this->alreadyNotified(
                        $recipient,
                        AppointmentReminderNotification::class,
                        ['appointment_id' => $appointment->id, 'reminder_window' => $windowLabel]
                    )) {
                        continue;
                    }

                    $total++;

                    if ($dryRun) {
                        continue;
                    }

                    $recipient->notify(new AppointmentReminderNotification(
                        appointmentId: $appointment->id,
                        patientId: $appointment->patient_id,
                        patientName: $appointment->patient->name,
                        startsAt: $appointment->starts_at->format('d/m/Y H:i'),
                        reminderWindow: $windowLabel
                    ));
                }
            }
        }

        return $total;
    }

    private function dispatchPendingPaymentNotifications(bool $dryRun): int
    {
        $pendingCount = Payment::query()->where('status', PaymentStatus::Pending->value)->count();
        $pendingAmount = Payment::query()->where('status', PaymentStatus::Pending->value)->sum('amount');

        if ($pendingCount === 0) {
            return 0;
        }

        $total = 0;
        $amount = number_format((float) $pendingAmount, 2, ',', '.');
        $referenceDate = now()->toDateString();

        foreach ($this->administrativeRecipients() as $recipient) {
            if ($this->alreadyNotified(
                $recipient,
                PendingPaymentNotification::class,
                ['pending_count' => $pendingCount, 'date' => $referenceDate]
            )) {
                continue;
            }

            $total++;

            if ($dryRun) {
                continue;
            }

            $recipient->notify(new PendingPaymentNotification($pendingCount, $amount, $referenceDate));
        }

        return $total;
    }

    private function dispatchPackageExpiringNotifications(bool $dryRun): int
    {
        $expiringPackages = PatientPackage::query()
            ->with(['patient:id,name'])
            ->where('status', PatientPackageStatus::Active->value)
            ->whereDate('expires_at', '>=', now()->toDateString())
            ->whereDate('expires_at', '<=', now()->addDays(7)->toDateString())
            ->get();

        $total = 0;
        $referenceDate = now()->toDateString();

        foreach ($expiringPackages as $patientPackage) {
            foreach ($this->administrativeRecipients() as $recipient) {
                if ($this->alreadyNotified(
                    $recipient,
                    PackageExpiringNotification::class,
                    ['patient_package_id' => $patientPackage->id, 'date' => $referenceDate]
                )) {
                    continue;
                }

                $total++;

                if ($dryRun) {
                    continue;
                }

                $recipient->notify(new PackageExpiringNotification(
                    patientPackageId: $patientPackage->id,
                    patientId: $patientPackage->patient_id,
                    patientName: $patientPackage->patient->name,
                    expiresAt: $patientPackage->expires_at->format('d/m/Y'),
                    referenceDate: $referenceDate
                ));
            }
        }

        return $total;
    }

    /**
     * @return Collection<int, User>
     */
    private function appointmentRecipients(int $professionalId): Collection
    {
        return User::query()
            ->where('is_active', true)
            ->where(function ($query) use ($professionalId) {
                $query
                    ->where('id', $professionalId)
                    ->orWhere('role', UserRole::Admin->value)
                    ->orWhere('role', UserRole::Receptionist->value);
            })
            ->get();
    }

    /**
     * @return Collection<int, User>
     */
    private function administrativeRecipients(): Collection
    {
        return User::query()
            ->where('is_active', true)
            ->whereIn('role', [UserRole::Admin->value, UserRole::Receptionist->value])
            ->get();
    }

    /**
     * @param  array<string, int|string>  $criteria
     */
    private function alreadyNotified(User $user, string $notificationType, array $criteria): bool
    {
        $notifications = $user->notifications()
            ->where('type', $notificationType)
            ->whereDate('created_at', now()->toDateString())
            ->latest()
            ->limit(20)
            ->get();

        foreach ($notifications as $notification) {
            $data = is_array($notification->data) ? $notification->data : [];
            $matched = true;

            foreach ($criteria as $key => $value) {
                if (($data[$key] ?? null) !== $value) {
                    $matched = false;
                    break;
                }
            }

            if ($matched) {
                return true;
            }
        }

        return false;
    }
}
