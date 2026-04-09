<?php

use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CheckInController;
use App\Http\Controllers\ClinicalReportsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentsController;
use App\Http\Controllers\EvaluationsController;
use App\Http\Controllers\FinancialDashboardController;
use App\Http\Controllers\PackagesController;
use App\Http\Controllers\PatientPackagesController;
use App\Http\Controllers\PatientsController;
use App\Http\Controllers\PaymentsController;
use App\Http\Controllers\PerformanceReportsController;
use App\Http\Controllers\ProfessionalsController;
use App\Http\Controllers\SessionsController;
use App\Http\Controllers\TreatmentPlansController;
use App\Models\Patient;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('patients', PatientsController::class);
    Route::resource('professionals', ProfessionalsController::class);
    Route::resource('appointments', AppointmentsController::class);
    Route::patch('appointments/{appointment}/move', [AppointmentsController::class, 'move'])->name('appointments.move');

    Route::prefix('clinical')->name('clinical.')->group(function () {
        Route::resource('evaluations', EvaluationsController::class)->only(['create', 'store', 'show']);
        Route::resource('treatment-plans', TreatmentPlansController::class)->only(['create', 'store', 'show']);
        Route::resource('sessions', SessionsController::class)->only(['create', 'store', 'show']);
    });

    Route::prefix('financial')->name('financial.')->group(function () {
        Route::get('/', [FinancialDashboardController::class, 'index'])->name('dashboard');
        Route::resource('packages', PackagesController::class)->except(['destroy']);
        Route::resource('patient-packages', PatientPackagesController::class)->only(['create', 'store', 'show']);
        Route::resource('payments', PaymentsController::class)->only(['index', 'create', 'store', 'show']);
    });

    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('clinical', [ClinicalReportsController::class, 'index'])->name('clinical.index');
        Route::get('clinical/patients/{patient}/progress', [ClinicalReportsController::class, 'patientProgress'])->name('clinical.patientProgress');
        Route::get('performance', [PerformanceReportsController::class, 'index'])->name('performance.index');
    });

    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::post('calendar/available-slots', [CalendarController::class, 'availableSlots'])->name('calendar.availableSlots');

    Route::get('checkin', [CheckInController::class, 'index'])->name('checkin.index');
    Route::post('checkin/{appointment}/check-in', [CheckInController::class, 'checkIn'])->name('checkin.checkIn');
    Route::post('checkin/{appointment}/no-show', [CheckInController::class, 'noShow'])->name('checkin.noShow');

    Route::prefix('patients')->name('patients.')->group(function () {
        Route::get('{patient}/documents', [DocumentsController::class, 'index'])->name('documents.index');
        Route::get('{patient}/documents/create', function (Patient $patient) {
            return Inertia::render('Documents/Create', ['patient' => $patient]);
        })->name('documents.create');
        Route::post('{patient}/documents', [DocumentsController::class, 'store'])->name('documents.store');
        Route::get('documents/{document}/download', [DocumentsController::class, 'download'])->name('documents.download');
        Route::delete('documents/{document}', [DocumentsController::class, 'destroy'])->name('documents.destroy');
    });
});

require __DIR__.'/settings.php';
