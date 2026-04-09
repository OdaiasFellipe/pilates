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

## Roadmap Resumido (Fase 1 — MVP)

| Sprint | Semana | Entrega | Status |
|---|---|---|---|
| 0 | 1 | Fundação, roles, layout responsivo | ✅ |
| 1 | 2 | CRUD de Pacientes + upload de arquivos | ✅ |
| 2 | 3 | CRUD de Profissionais + grade de horários | ✅ |
| 3 | 4–5 | Agendamento com calendário e anti-conflito | ✅ |
| 4 | 6 | Atendimento clínico (avaliação + evolução + plano) | ✅ |
| 5 | 7 | Módulo financeiro (pacotes, pagamentos, recibos) | ✅ |
| 6 | 8 | Relatórios e dashboards | ✅ |
| 7 | 9 | Notificações automáticas (WhatsApp/SMS) | ✅ |
| 8 | 10 | Testes, LGPD, performance e backup | ✅ |
| 9 | 10 | Dashboard executivo + perfil completo do paciente | ✅ |
| 10 | 10 | Notificações e lembretes automáticos | ✅ |
| — | — | Layout moderno (teal/indigo, sidebar dark) | ✅ |

---

## Fase 2 — Funcionalidades Avançadas (Sprints 11–22)

### Sprint 11 — Agenda Visual Interativa (Semana 11–12)

**Objetivo:** Calendário semanal/diário com drag-and-drop, visualização por profissional e encaixe rápido.

**Backend:**
- `AvailabilitySlotsController` — retorna intervalos livres por profissional + dia
- `AppointmentsController@calendarData` — retorna agendamentos formatados para calendário (com cores por profissional)
- `AppointmentMoveRequest` — validação de reagendamento via drag-and-drop

**Frontend (`resources/js/pages/appointments/`):**
- `calendar.tsx` — visualização semanal/diária com `react-big-calendar`
- Cores automáticas por profissional (paleta consistente)
- Drag-and-drop para mover agendamento → `PATCH /appointments/{id}/move`
- Click em slot vazio → modal de agendamento rápido
- Filtro por profissional, tipo de atendimento e status

**Componentes:**
- `CalendarEvent` — card de evento com avatar do profissional + status
- `QuickBookModal` — formulário simplificado de agendamento inline
- `ProfessionalFilter` — toggle de profissionais visíveis

**Dependências:** `react-big-calendar`, `date-fns`

**Testes:**
- Drag-and-drop não cria conflito (reutiliza `AppointmentConflictService`)
- Filtro por profissional retorna apenas dados corretos
- Renderização correta de eventos multi-dia

---

### Sprint 12 — Check-in de Pacientes (Semana 13)

**Objetivo:** Tela de recepção para marcar presença/falta com um clique, consumo automático de sessão do pacote.

**Backend:**
- `CheckInController@today` — lista agendamentos do dia com status de check-in
- `CheckInController@checkIn` — marca presença, consome sessão do pacote ativo, cria registro de Session
- `CheckInController@noShow` — marca falta, não consome sessão
- `CheckInService` — lógica de consumo de pacote (decrementa `sessions_used`, alerta quando restam ≤ 2)

**Frontend (`resources/js/pages/checkin/`):**
- `index.tsx` — lista de pacientes do dia em cards grandes (touch-friendly)
- Cada card: foto/avatar, nome, horário, tipo, profissional, botão "Check-in" / "Falta"
- Badge de "últimas X sessões" quando pacote está acabando
- Filtro por período (manhã/tarde/noite) e busca por nome
- Feedback visual instantâneo (animação de confirmação)

**Modelo de dados:**
- Adicionar `checked_in_at` (nullable datetime) à tabela `appointments`
- Migration: `add_checked_in_at_to_appointments_table`

**Testes:**
- Check-in decrementa sessão corretamente
- Falta não consome sessão
- Alerta disparado quando pacote ≤ 2 sessões restantes
- Profissional só vê seus pacientes (salvo admin/recepcionista)

---

### Sprint 13 — Evolução Clínica Estruturada (Semana 14–15)

**Objetivo:** Registro detalhado por sessão com histórico visual de progresso.

**Backend:**
- `SessionsController@store` — formulário estruturado (SOAP + exercícios + dor)
- `PatientProgressController@show` — dados agregados para gráficos de evolução
- Adicionar campos à tabela `sessions`:
  - `subjective` (text) — queixa/relato do paciente
  - `objective` (text) — achados do profissional
  - `assessment` (text) — análise/interpretação
  - `plan` (text) — conduta/plano
  - `mobility_score` (tinyint, 0–10) — escala de mobilidade
  - `exercises` → migrar de JSON para tabela `session_exercises` (exercício, séries, repetições, carga)

**Frontend:**
- `sessions/create.tsx` — formulário SOAP com abas (Subjetivo, Objetivo, Avaliação, Plano)
- `sessions/create.tsx` — seção de exercícios: adicionar/remover linhas (exercício, séries, reps, carga, observação)
- `patients/show.tsx` → tab "Clínico" → gráfico de evolução (dor + mobilidade ao longo do tempo)
- Componente `ProgressChart` com `recharts` (LineChart: eixo X = datas, eixo Y = dor/mobilidade)

**Modelo de dados:**
```
session_exercises
  ├─ id, session_id
  ├─ exercise_name, sets, reps, load_kg
  └─ notes
```

**Testes:**
- Sessão criada com dados SOAP completos
- Exercícios vinculados corretamente
- Gráfico de progresso retorna dados ordenados por data
- Validação de escalas (0–10)

---

### Sprint 14 — Integração WhatsApp/SMS (Semana 16–17)

**Objetivo:** Lembretes automáticos de agendamento e mensagens configuráveis.

**Backend:**
- `NotificationChannelService` — abstração de canal (WhatsApp via Evolution API, SMS via Twilio, Email via SMTP)
- `WhatsAppChannel` — implementa Laravel Notification channel customizado
- `SmsChannel` — implementa canal SMS
- Atualizar `DispatchRemindersCommand` para enviar via canal configurado (além de database)
- `MessageTemplateController` — CRUD de templates de mensagem (variáveis: `{paciente}`, `{data}`, `{horario}`, `{profissional}`)
- `BirthdayGreetingCommand` — job diário para mensagens de aniversário

**Frontend (`resources/js/pages/settings/`):**
- `notifications.tsx` — configuração de canais (ativar/desativar WhatsApp, SMS, Email)
- `templates.tsx` — editor de templates com preview e variáveis disponíveis

**Configuração (`config/notifications.php`):**
```php
'channels' => ['database', 'whatsapp', 'sms', 'email'],
'whatsapp' => [
    'driver' => env('WHATSAPP_DRIVER', 'evolution'), // evolution | twilio
    'api_url' => env('EVOLUTION_API_URL'),
    'api_key' => env('EVOLUTION_API_KEY'),
    'instance' => env('EVOLUTION_INSTANCE'),
],
'sms' => [
    'driver' => env('SMS_DRIVER', 'twilio'),
    'sid' => env('TWILIO_SID'),
    'token' => env('TWILIO_TOKEN'),
    'from' => env('TWILIO_FROM'),
],
'reminders' => [
    'hours_before' => [24, 2],
    'birthday_enabled' => true,
],
```

**Testes:**
- Templates renderizam variáveis corretamente
- Canal WhatsApp envia payload correto (mock HTTP)
- Aniversário só envia 1x por dia
- Configuração de canais persiste corretamente

---

### Sprint 15 — Relatórios Avançados com Gráficos (Semana 18–19)

**Objetivo:** Dashboards analíticos com gráficos interativos e exportação.

**Backend:**
- `ReportsController@occupancy` — taxa de ocupação por profissional/horário
- `ReportsController@attendance` — taxa de faltas por período e paciente
- `ReportsController@revenue` — receita por tipo de serviço, forma de pagamento, período
- `ReportsController@retention` — retenção e churn (pacientes ativos vs inativos por mês)
- `ReportsController@export` — exportação CSV/Excel via `maatwebsite/excel`

**Frontend (`resources/js/pages/reports/`):**
- `occupancy.tsx` — heatmap de ocupação (dias × horários) + barras por profissional
- `attendance.tsx` — gráfico de faltas + tabela com ranking de pacientes faltosos
- `revenue.tsx` — gráfico de barras comparativo mensal + pizza por forma de pagamento
- `retention.tsx` — line chart de pacientes ativos ao longo do tempo + funil de churn

**Componentes:**
- `DateRangePicker` — seletor de período para todos os relatórios
- `ExportButton` — botão de exportação CSV/PDF
- `ChartCard` — wrapper reutilizável para gráficos com título + loading

**Dependências:** `recharts`, `@tanstack/react-table`, `maatwebsite/excel`

**Testes:**
- Query de ocupação retorna percentuais corretos
- Filtro por período funciona em todos os relatórios
- Exportação gera arquivo válido
- Dados de churn calculados corretamente

---

### Sprint 16 — Recorrência e Renovação de Pacotes (Semana 20)

**Objetivo:** Alertas automáticos de vencimento, sugestão de renovação e análise de cancelamento.

**Backend:**
- `PackageRenewalController@suggestions` — pacotes expirando em 7/15/30 dias
- `PackageRenewalController@renew` — cria novo `patient_package` com dados pré-preenchidos
- `CancellationReasonController@store` — registra motivo de cancelamento
- `ChurnAnalysisService` — calcula taxa de churn por período/motivo
- Adicionar tabela: `cancellation_reasons` (id, patient_package_id, reason, category: price|schedule|health|other, notes, cancelled_at)
- `PackageExpiryAlertCommand` — notificação 30d, 15d, 7d antes do vencimento (configurable)

**Frontend:**
- `financial/renewals.tsx` — painel de renovações pendentes com ação rápida
- Modal de cancelamento com select de motivo + campo de observação
- Dashboard: widget "Pacotes a vencer" com contagem regressiva
- Relatório: gráfico de pizza com motivos de cancelamento

**Testes:**
- Renovação cria pacote com dados corretos
- Alertas disparados nos intervalos corretos
- Motivos de cancelamento persistem e aparecem no relatório
- Churn calculado corretamente

---

### Sprint 17 — Agenda Online para Pacientes (Semana 21–22)

**Objetivo:** Link público/autenticado onde paciente visualiza, confirma e remarca agendamentos.

**Backend:**
- `PatientPortalController` — autenticação separada via token/magic link
- `PatientPortalController@appointments` — lista agendamentos do paciente
- `PatientPortalController@confirm` — confirmação de presença
- `PatientPortalController@reschedule` — remarcação com regras (mínimo 24h antes, máx 2 por mês)
- `RescheduleRulesService` — valida regras configuráveis de remarcação
- Migration: `patient_portal_tokens` (token, patient_id, expires_at)

**Frontend (`resources/js/pages/portal/`):**
- `login.tsx` — login com CPF + código enviado por WhatsApp/SMS
- `appointments.tsx` — lista de agendamentos com botões Confirmar / Remarcar / Cancelar
- `reschedule.tsx` — seletor de nova data/horário entre slots livres
- Layout mobile-first com design limpo e acessível

**Regras de negócio:**
- Remarcação disponível até 24h antes (configurável)
- Máximo de 2 remarcações por mês por paciente
- Cancelamento via portal notifica recepção/profissional

**Testes:**
- Magic link expira corretamente
- Remarcação respeita regras de antecedência
- Limite mensal de remarcações funciona
- Confirmação atualiza status do agendamento

---

### Sprint 18 — Controle de Salas e Equipamentos (Semana 23)

**Objetivo:** Gestão de recursos físicos com prevenção de conflitos.

**Backend:**
- `RoomsController` — CRUD de salas
- `EquipmentController` — CRUD de equipamentos (Reformer, Cadillac, Chair, Barrel, etc.)
- `ResourceConflictService` — verifica disponibilidade de sala + equipamento no agendamento
- Migration: `rooms` (id, name, capacity, is_active) e `equipment` (id, name, room_id nullable, type, is_available)
- Migration: adicionar `room_id` e `equipment_ids` (JSON) à tabela `appointments`

**Frontend:**
- `settings/rooms.tsx` — gestão de salas com capacidade
- `settings/equipment.tsx` — gestão de equipamentos com status
- Agendamento: seletor de sala e equipamentos com verificação de disponibilidade em tempo real
- Dashboard: indicador de ocupação de salas

**Testes:**
- Agendamento não criado se sala lotada (capacidade excedida)
- Equipamento indisponível bloqueia agendamento
- Múltiplos agendamentos na mesma sala até capacidade máxima

---

### Sprint 19 — Anamnese e Avaliação Digital (Semana 24–25)

**Objetivo:** Formulários personalizáveis de anamnese com upload de fotos e comparativo visual.

**Backend:**
- `AnamnesisTemplateController` — CRUD de templates de anamnese (campos configuráveis)
- `AnamnesisController` — preenchimento de anamnese baseado em template
- `PosturalPhotoController` — upload de fotos posturais (frente, lateral, costas)
- `PosturalComparisonController@show` — retorna pares de fotos por data para comparação
- Migration: `anamnesis_templates` (id, name, fields JSON), `anamneses` (id, patient_id, template_id, data JSON, filled_at)
- Migration: `postural_photos` (id, patient_id, evaluation_id, position: front|side|back, photo_path, taken_at)

**Frontend:**
- `clinical/anamnesis/templates.tsx` — editor de templates com drag-and-drop de campos
- `clinical/anamnesis/fill.tsx` — preenchimento dinâmico baseado no template
- `clinical/posture/upload.tsx` — upload de fotos por posição com preview
- `clinical/posture/compare.tsx` — slider before/after com duas fotos lado a lado

**Componentes:**
- `DynamicForm` — renderiza formulário baseado em JSON schema
- `PostureSlider` — comparação visual antes/depois com slider interativo
- `PhotoUpload` — upload com preview, crop e compressão client-side

**Testes:**
- Template cria formulário dinâmico corretamente
- Upload de foto com validação de tipo/tamanho
- Comparação retorna pares corretos por data/posição

---

### Sprint 20 — Assinatura Digital de Termos (Semana 26)

**Objetivo:** Termos e contratos assinados digitalmente com geração de PDF.

**Backend:**
- `ConsentTemplateController` — CRUD de modelos de termos (consentimento, contrato, LGPD)
- `ConsentSignatureController@sign` — registra assinatura (canvas signature, IP, user-agent, timestamp)
- `ConsentPdfService` — gera PDF com termo + assinatura + metadados
- Migration: `consent_templates` (id, title, body_html, type, is_active)
- Migration: `consent_signatures` (id, patient_id, template_id, signature_image_path, ip_address, user_agent, signed_at)

**Frontend:**
- `documents/consents.tsx` — lista de termos e status de assinatura por paciente
- `documents/sign.tsx` — visualização do termo + canvas de assinatura (touch-friendly)
- `documents/signed.tsx` — PDF gerado para download

**Componentes:**
- `SignatureCanvas` — canvas HTML5 para assinatura com dedo/mouse
- `ConsentViewer` — renderiza HTML do termo em iframe/div seguro

**Segurança:**
- Hash SHA-256 do conteúdo do termo no momento da assinatura
- IP + User-Agent registrados (LGPD compliance)
- PDFs armazenados em `storage/app/private/consents/`

**Testes:**
- Assinatura registra IP e timestamp corretos
- PDF gerado contém assinatura e metadados
- Termo não pode ser alterado após assinatura existente

---

### Sprint 21 — Dashboard de Metas (Semana 27)

**Objetivo:** Metas configuráveis com indicadores de progresso e comparativo mensal.

**Backend:**
- `GoalsController` — CRUD de metas (tipo: atendimentos, receita, novos_pacientes, retenção)
- `GoalProgressService` — calcula progresso atual vs meta
- Migration: `goals` (id, type, target_value, period: monthly|weekly, starts_at, ends_at, created_by)

**Frontend:**
- `dashboard.tsx` → novo widget "Metas do Mês" com barras de progresso circulares
- `settings/goals.tsx` — configuração de metas por período
- Comparativo: indicador de variação vs mês anterior (↑12% ou ↓5%)

**Componentes:**
- `GoalRing` — progresso circular com porcentagem e cor dinâmica (verde > 80%, amarelo > 50%, vermelho < 50%)
- `TrendIndicator` — seta com porcentagem de variação

**Testes:**
- Progresso calculado corretamente para cada tipo de meta
- Meta mensal reseta no início do mês
- Comparativo calcula variação percentual correta

---

### Sprint 22 — PWA/Mobile para Profissionais (Semana 28–29)

**Objetivo:** Interface mobile-optimizada para uso no studio (tablet/celular).

**Backend:**
- Reutiliza controllers existentes (sem API separada, Inertia serve mobile)
- `ServiceWorkerController` — serve manifest.json e sw.js

**Frontend:**
- `vite-plugin-pwa` — configura PWA com manifest, icons, offline cache
- Layout alternativo mobile-first para pages críticas:
  - `mobile/today.tsx` — agenda do dia com swipe entre pacientes
  - `mobile/session.tsx` — registro de evolução simplificado (formulário touch-friendly)
  - `mobile/checkin.tsx` — check-in com cards grandes
- Detecção de viewport → redireciona para layout mobile quando `< 768px` em pages específicas
- Notificações push via Service Worker (Web Push API)

**Configuração PWA:**
```json
{
  "name": "Pilates Studio",
  "short_name": "Pilates",
  "theme_color": "#0d9488",
  "background_color": "#f0fdfa",
  "display": "standalone",
  "start_url": "/dashboard",
  "icons": [...]
}
```

**Testes:**
- Manifest.json acessível e válido
- Service Worker registra corretamente
- Layout mobile renderiza em viewport pequeno
- Push notification payload correto

---

## Roadmap Atualizado

| Sprint | Semana | Entrega | Prioridade |
|---|---|---|---|
| 0 | 1 | Fundação, roles, layout responsivo | ✅ Concluído |
| 1 | 2 | CRUD de Pacientes + upload de arquivos | ✅ Concluído |
| 2 | 3 | CRUD de Profissionais + grade de horários | ✅ Concluído |
| 3 | 4–5 | Agendamento com calendário e anti-conflito | ✅ Concluído |
| 4 | 6 | Atendimento clínico (avaliação + evolução + plano) | ✅ Concluído |
| 5 | 7 | Módulo financeiro (pacotes, pagamentos, recibos) | ✅ Concluído |
| 6 | 8 | Relatórios e dashboards | ✅ Concluído |
| 7 | 9 | Notificações automáticas (database) | ✅ Concluído |
| 8 | 10 | Testes, LGPD, performance e backup | ✅ Concluído |
| 9 | 10 | Dashboard executivo + perfil completo do paciente | ✅ Concluído |
| 10 | 10 | Notificações e lembretes automáticos | ✅ Concluído |
| — | — | **Layout moderno (teal/indigo, sidebar dark, responsivo)** | ✅ Concluído |
| 11 | 11–12 | Agenda visual interativa (drag-and-drop) | 🔴 Alta |
| 12 | 13 | Check-in de pacientes | 🔴 Alta |
| 13 | 14–15 | Evolução clínica estruturada (SOAP + gráficos) | 🔴 Alta |
| 14 | 16–17 | Integração WhatsApp/SMS | 🔴 Alta |
| 15 | 18–19 | Relatórios avançados com gráficos | 🟡 Média |
| 16 | 20 | Recorrência e renovação de pacotes | 🟡 Média |
| 17 | 21–22 | Agenda online para pacientes (portal) | 🟡 Média |
| 18 | 23 | Controle de salas e equipamentos | 🟡 Média |
| 19 | 24–25 | Anamnese e avaliação digital (fotos posturais) | 🟢 Diferencial |
| 20 | 26 | Assinatura digital de termos | 🟢 Diferencial |
| 21 | 27 | Dashboard de metas | 🟢 Diferencial |
| 22 | 28–29 | PWA/Mobile para profissionais | 🟢 Diferencial |

---

## Dependências Adicionais (Fase 2)

### Composer
```bash
composer require maatwebsite/excel              # Exportação Excel/CSV
```

### NPM
```bash
npm install react-big-calendar date-fns         # Calendário interativo (Sprint 11)
npm install recharts                            # Gráficos (Sprint 13, 15, 21)
npm install @tanstack/react-table               # Tabelas avançadas (Sprint 15)
npm install react-dropzone                      # Upload de arquivos (Sprint 19)
npm install signature_pad                       # Assinatura digital (Sprint 20)
npm install vite-plugin-pwa                     # PWA (Sprint 22)
```

---

## Dependências Existentes (Fase 1)

### Composer
```bash
composer require spatie/laravel-permission      # Roles e permissões
composer require spatie/laravel-activitylog     # Auditoria LGPD
composer require spatie/laravel-backup          # Backup automático
composer require barryvdh/laravel-dompdf        # Geração de PDF (recibos)
composer require twilio/sdk                     # SMS / WhatsApp
```
