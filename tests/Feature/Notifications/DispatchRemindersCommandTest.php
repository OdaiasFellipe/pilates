<?php

namespace Tests\Feature\Notifications;

use App\Enums\PatientPackageStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\PatientPackage;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\AppointmentReminderNotification;
use App\Notifications\PackageExpiringNotification;
use App\Notifications\PendingPaymentNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class DispatchRemindersCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_dispatches_notifications_for_all_scenarios(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $receptionist = User::factory()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'starts_at' => now()->addHours(2),
            'ends_at' => now()->addHours(2)->addMinutes(50),
            'status' => 'confirmed',
        ]);

        Payment::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'pending',
            'amount' => '200.00',
        ]);

        PatientPackage::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'status' => PatientPackageStatus::Active,
            'expires_at' => now()->addDays(5),
        ]);

        $this->artisan('notifications:dispatch-reminders')->assertSuccessful();

        Notification::assertSentTo($professional, AppointmentReminderNotification::class);
        Notification::assertSentTo($admin, AppointmentReminderNotification::class);
        Notification::assertSentTo($receptionist, AppointmentReminderNotification::class);

        Notification::assertSentTo($admin, PendingPaymentNotification::class);
        Notification::assertSentTo($receptionist, PendingPaymentNotification::class);

        Notification::assertSentTo($admin, PackageExpiringNotification::class);
        Notification::assertSentTo($receptionist, PackageExpiringNotification::class);
    }

    public function test_command_does_not_duplicate_notifications_on_same_day(): void
    {
        $admin = User::factory()->admin()->create();
        $receptionist = User::factory()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'starts_at' => now()->addHours(2),
            'ends_at' => now()->addHours(2)->addMinutes(50),
            'status' => 'confirmed',
        ]);

        Payment::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'pending',
            'amount' => '100.00',
        ]);

        PatientPackage::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'status' => PatientPackageStatus::Active,
            'expires_at' => now()->addDays(3),
        ]);

        $this->artisan('notifications:dispatch-reminders')->assertSuccessful();
        $this->artisan('notifications:dispatch-reminders')->assertSuccessful();

        $this->assertSame(3, $admin->notifications()->count());
        $this->assertSame(3, $receptionist->notifications()->count());
        $this->assertSame(1, $professional->notifications()->count());

        $this->assertNotNull($appointment->fresh());
    }
}
