# Plano de Desenvolvimento — Studio de Pilates & Fisioterapia

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 13 (PHP 8.3) |
| Autenticação | Laravel Fortify |
| SPA Bridge | Inertia.js v3 |
| Frontend | React 19 + TypeScript |
| Estilo | Tailwind CSS v4 + Radix UI |
| Roteamento | Laravel Wayfinder |
| Banco de Dados | MySQL 8 |
| Testes | PHPUnit 12 + Pest |
| Build | Vite |

---

## Modelo de Dados

### Entidades e Relacionamentos

```
users (profissionais/admins/recepcionistas)
  ├─ id, name, email, password, role, cpf, phone, specialty
  ├─ working_hours (JSON)
  └─ two_factor_*

patients
  ├─ id, name, cpf, rg, birth_date, phone, email
  ├─ address (JSON: street, number, city, state, zip)
  ├─ health_insurance, health_insurance_number
  ├─ emergency_contact (JSON)
  └─ is_active

appointments (agendamentos)
  ├─ id, patient_id, professional_id
  ├─ starts_at, ends_at (default: 50 min)
  ├─ type (pilates | physiotherapy | evaluation)
  ├─ status (scheduled | confirmed | completed | cancelled | missed)
  ├─ notes, cancellation_reason
  └─ reminder_sent_at

treatment_plans (planos de tratamento)
  ├─ id, patient_id, professional_id
  ├─ diagnosis, goals, observations
  ├─ started_at, expires_at
  └─ status (active | completed | cancelled)

sessions (atendimentos/evoluções)
  ├─ id, appointment_id, patient_id, professional_id
  ├─ treatment_plan_id
  ├─ evolution_notes (texto clínico)
  ├─ exercises (JSON)
  ├─ pain_scale (0–10)
  └─ attended_at

evaluations (avaliação inicial)
  ├─ id, patient_id, professional_id
  ├─ chief_complaint, medical_history
  ├─ physical_exam (JSON)
  ├─ diagnosis, goals
  └─ evaluated_at

patient_files (laudos / exames anexados)
  ├─ id, patient_id, uploaded_by
  ├─ type (laudo | exam | image | other)
  ├─ filename, path, mime_type, size_bytes
  └─ description

packages (pacotes de sessões)
  ├─ id, name, description
  ├─ session_count, price
  └─ validity_days

patient_packages (pacotes adquiridos pelo paciente)
  ├─ id, patient_id, package_id
  ├─ sessions_used, sessions_total
  ├─ amount_paid, paid_at
  ├─ expires_at
  └─ status (active | expired | cancelled)

payments
  ├─ id, patient_id, professional_id (nullable)
  ├─ patient_package_id (nullable)
  ├─ amount, payment_method (cash | pix | card | transfer)
  ├─ status (pending | paid | overdue | refunded)
  ├─ due_date, paid_at
  ├─ receipt_number, notes
  └─ session_id (nullable — avulso)

notifications (lembretes)
  ├─ id, patient_id, appointment_id
  ├─ channel (whatsapp | sms | email)
  ├─ message, status (pending | sent | failed)
  └─ scheduled_at, sent_at
```

---

## Perfis de Acesso (Roles)

| Role | Permissões |
|---|---|
| `admin` | Acesso total |
| `professional` | Agenda própria, atendimentos, pacientes |
| `receptionist` | Agendamentos, cadastro de pacientes, financeiro básico |
| `patient` | Portal do paciente (futuro) |

---

## Fases de Desenvolvimento

### Fase 0 — Fundação (Semana 1)

**Objetivo:** Infraestrutura base do projeto.

- [ ] Configurar roles/permissões (Gate/Policy ou Spatie Laravel-Permission)
- [ ] Migration: `patients`
- [ ] Migration: `users` — adicionar campos `role`, `cpf`, `phone`, `specialty`, `working_hours`
- [ ] Seeders: admin padrão, especialidades de exemplo
- [ ] Layout base autenticado com menu lateral (sidebar) responsivo
- [ ] Configurar paginação padrão (Inertia + React)
- [ ] Definir convenções de componente (formulários, tabelas, badges)

**Entregas:**
- Login funcional com controle de role
- Layout responsivo com sidebar
- Base de componentes compartilhados (`DataTable`, `FormField`, `Badge`, `Modal`)

---

### Fase 1 — Cadastro de Pacientes (Semana 2)

**Requisitos cobertos:** RF01, RF02, RF03, RF04

**Backend:**
- `PatientsController` (CRUD completo)
- `PatientFileController` (upload/download de laudos)
- Validação de CPF único
- Soft Delete para exclusão lógica

**Frontend (`resources/js/pages/patients/`):**
- `index.tsx` — listagem com busca, filtros e paginação
- `create.tsx` — formulário de cadastro
- `edit.tsx` — edição
- `show.tsx` — perfil completo: histórico, arquivos, pacotes, pagamentos

**Rotas (`routes/web.php`):**
```php
Route::resource('patients', PatientsController::class);
Route::post('patients/{patient}/files', [PatientFileController::class, 'store']);
Route::delete('patients/{patient}/files/{file}', [PatientFileController::class, 'destroy']);
Route::get('patients/{patient}/files/{file}/download', [PatientFileController::class, 'download']);
```

**RNF:** Validação LGPD — campos sensíveis mascarados na UI (CPF, telefone)

---

### Fase 2 — Gestão de Profissionais (Semana 3)

**Requisitos cobertos:** RF18, RF19, RF20

**Backend:**
- `ProfessionalsController` (gerencia usuários com role `professional`)
- `WorkingHoursController` — define grade de horários disponíveis (dias + horários)

**Frontend (`resources/js/pages/professionals/`):**
- `index.tsx` — lista de profissionais
- `create.tsx` / `edit.tsx` — cadastro com grade de horários
- `show.tsx` — perfil + produtividade (sessões no período)

**Lógica de horários:**
```typescript
// WorkingHours: Array de slots por dia da semana
type WorkingHours = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6   // 0 = domingo
  slots: { start: string; end: string }[]
}[]
```

---

### Fase 3 — Agendamento (Semanas 4–5)

**Requisitos cobertos:** RF05, RF06, RF07, RF08, RF09 | RN01, RN02, RN03

**Backend:**
- `AppointmentsController` — CRUD
- `AppointmentConflictService` — verifica conflitos de horário RN01/RN02
- `ReminderJob` — fila para envio de lembretes (RF09)
- Regra: duração padrão de 50 min (RN03) configurável por tipo

**Frontend (`resources/js/pages/appointments/`):**
- `index.tsx` — visão de agenda (calendário semanal + lista)
- `create.tsx` — agendamento com seletor de profissional, data e horário disponível
- `edit.tsx` — edição/cancelamento/remarcação

**Componentes:**
- `WeekCalendar` — grade semanal com slots ocupados/livres
- `AppointmentCard` — card de agendamento com status colorido

**Regras de Negócio:**
```php
// AppointmentConflictService
public function hasConflict(Professional $professional, Carbon $start, Carbon $end, ?int $excludeId = null): bool

public function patientHasConflict(Patient $patient, Carbon $start, Carbon $end, ?int $excludeId = null): bool
```

---

### Fase 4 — Atendimento Clínico (Semana 6)

**Requisitos cobertos:** RF10, RF11, RF12, RF13

**Backend:**
- `EvaluationsController` — avaliação inicial (RF10)
- `SessionsController` — evolução por sessão (RF11)
- `TreatmentPlansController` — plano de tratamento (RF12)

**Frontend (`resources/js/pages/clinical/`):**
- `evaluations/create.tsx` — formulário de avaliação inicial
- `sessions/create.tsx` — evolução clínica (SOAP ou texto livre)
- `treatment-plans/show.tsx` — plano com lista de sessões vinculadas

**Componente de evolução:**
```tsx
// Formulário de Evolução (Nota SOAP opcional)
// S — Subjetivo, O — Objetivo, A — Análise, P — Plano
```

---

### Fase 5 — Financeiro (Semana 7)

**Requisitos cobertos:** RF14, RF15, RF16, RF17 | RN04, RN05

**Backend:**
- `PackagesController` — CRUD de pacotes/planos
- `PatientPackagesController` — associa pacote ao paciente
- `PaymentsController` — registra pagamentos
- `ReceiptService` — gera PDF de recibo (RF17)
- `OverdueJob` — job agendado para marcar inadimplência (RF16)

**Frontend (`resources/js/pages/financial/`):**
- `packages/index.tsx` — gestão de pacotes
- `payments/index.tsx` — listagem de pagamentos com filtros
- `payments/create.tsx` — novo pagamento (avulso ou vinculado a pacote)
- `overdue/index.tsx` — painel de inadimplência

**Recibo:** gerado via `barryvdh/laravel-dompdf` ou `spatie/browsershot`

---

### Fase 6 — Relatórios (Semana 8)

**Requisitos cobertos:** RF21, RF22, RF23

**Backend:**
- `ReportsController` com actions separadas:
  - `financial` — faturamento por período, formas de pagamento, inadimplência
  - `patients` — frequência, faltas, taxa de retenção
  - `performance` — sessões por profissional, ocupação de agenda

**Frontend (`resources/js/pages/reports/`):**
- `financial.tsx` — gráficos de receita + tabela exportável
- `patients.tsx` — frequência e engajamento
- `performance.tsx` — produtividade por profissional

**Bibliotecas:**
- `recharts` — gráficos React
- `@tanstack/react-table` — tabelas com export CSV

---

### Fase 7 — Notificações e Lembretes (Semana 9)

**Requisitos cobertos:** RF09

**Backend:**
- `NotificationService` — abstrai canal (WhatsApp / SMS / Email)
- Integration com **Twilio** (SMS/WhatsApp) via `twilio/sdk` ou webhook Evolution API
- `SendAppointmentReminder` — Job agendado via Laravel Scheduler
  - D-1: lembrete 24h antes
  - H-2: lembrete 2h antes

**Config (`config/notifications.php`):**
```php
'channels' => ['whatsapp', 'sms', 'email'],
'reminder_hours' => [24, 2],
'default_channel' => env('NOTIFICATION_CHANNEL', 'whatsapp'),
```

---

### Fase 8 — Qualidade, Testes e Segurança (Semana 10)

**RNF cobertos:** RNF01–RNF06

#### Testes
- Feature tests para cada controller (autenticação + autorização por role)
- Testes de conflito de agendamento (`AppointmentConflictService`)
- Testes do pipeline financeiro (criação de pacote → pagamento → recibo)

#### Segurança (LGPD / OWASP)
- Mascaramento de CPF e telefone em respostas de API
- Auditoria de acesso a dados sensíveis (`spatie/laravel-activitylog`)
- Rate limiting nas rotas de autenticação
- CSP headers via middleware
- Sanitização de uploads (validação de MIME + tamanho)

#### Performance (RNF05)
- Cache de queries frequentes (`Cache::remember`)
- Eager loading para evitar N+1
- Índices: `appointments(professional_id, starts_at)`, `payments(patient_id, status, due_date)`

#### Backup (RNF04)
- `spatie/laravel-backup` agendado diariamente

---

## Estrutura de Diretórios Alvo

```
app/
  Actions/
    Appointments/
      CreateAppointment.php
      CheckConflict.php
      CancelAppointment.php
    Payments/
      RegisterPayment.php
      GenerateReceipt.php
    Notifications/
      SendAppointmentReminder.php
  Http/
    Controllers/
      AppointmentsController.php
      EvaluationsController.php
      PackagesController.php
      PatientFilesController.php
      PatientsController.php
      PaymentsController.php
      ProfessionalsController.php
      ReportsController.php
      SessionsController.php
      TreatmentPlansController.php
  Models/
    Appointment.php
    Evaluation.php
    Package.php
    Patient.php
    PatientFile.php
    PatientPackage.php
    Payment.php
    Session.php
    TreatmentPlan.php
    User.php (+ role enum)
  Policies/
    AppointmentPolicy.php
    PatientPolicy.php
    PaymentPolicy.php

resources/js/
  pages/
    patients/
    professionals/
    appointments/
    clinical/
      evaluations/
      sessions/
      treatment-plans/
    financial/
      packages/
      payments/
      overdue/
    reports/
  components/
    ui/          ← Radix/shadcn primitivos
    app/         ← componentes do domínio
      DataTable.tsx
      WeekCalendar.tsx
      AppointmentCard.tsx
      PatientBadge.tsx
      StatusBadge.tsx
  types/
    patient.ts
    appointment.ts
    payment.ts
    professional.ts
```

---

## Roadmap Resumido

| Sprint | Semana | Entrega |
|---|---|---|
| 0 | 1 | Fundação, roles, layout responsivo |
| 1 | 2 | CRUD de Pacientes + upload de arquivos |
| 2 | 3 | CRUD de Profissionais + grade de horários |
| 3 | 4–5 | Agendamento com calendário e anti-conflito |
| 4 | 6 | Atendimento clínico (avaliação + evolução + plano) |
| 5 | 7 | Módulo financeiro (pacotes, pagamentos, recibos) |
| 6 | 8 | Relatórios e dashboards |
| 7 | 9 | Notificações automáticas (WhatsApp/SMS) |
| 8 | 10 | Testes, LGPD, performance e backup |

---

## Diferenciais Futuros (Pós-MVP)

| Feature | Tecnologia sugerida |
|---|---|
| Portal do paciente (app) | React Native + API Laravel Sanctum |
| Check-in via QR Code | `chillerlan/php-qrcode` + câmera no app |
| Integração WhatsApp nativa | Evolution API (self-hosted) |
| Pesquisa de satisfação | Formulário pós-sessão via email/WhatsApp |
| Controle de estoque | Módulo adicional no mesmo sistema |
| BI avançado | Apache Superset conectado ao banco |

---

## Dependências a Instalar

### Composer
```bash
composer require spatie/laravel-permission      # Roles e permissões
composer require spatie/laravel-activitylog     # Auditoria LGPD
composer require spatie/laravel-backup          # Backup automático
composer require barryvdh/laravel-dompdf        # Geração de PDF (recibos)
composer require twilio/sdk                     # SMS / WhatsApp
```

### NPM
```bash
npm install recharts                            # Gráficos
npm install @tanstack/react-table               # Tabelas avançadas
npm install react-big-calendar date-fns         # Calendário de agendamentos
npm install react-dropzone                      # Upload de arquivos
```
