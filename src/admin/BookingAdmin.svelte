<script lang="ts">
  import { onMount } from 'svelte';
  import BookingDialog from './components/BookingDialog.svelte';
  import BookingCalendar from './components/BookingCalendar.svelte';
  import FacilityEditor from './components/FacilityEditor.svelte';
  import { api, confirmAction } from './api';
  import { defaultBookingInterface } from './booking-presets';
  import { dateLocale, getAdminLocale, translate, weekdayName } from './i18n';
  import { formatDate, toInstant } from './dates';
  import type { AvailabilityBlock, Booking, BookingEvent, BookingNotification, BookingTab, Facility, MigrationPreview, RecurringBlock } from './types';

  type NoticeKind = 'success' | 'info' | 'warning' | 'danger';
  type Notice = { message: string; kind: NoticeKind };
  type BookingDetails = { booking: Booking; events: BookingEvent[]; notifications: BookingNotification[] };

  let adminLocale = getAdminLocale();
  let activeTab: BookingTab = 'bookings';
  let facilities: Facility[] = [];
  let bookings: Booking[] = [];
  let calendarBookings: Booking[] = [];
  let blocks: AvailabilityBlock[] = [];
  let recurring: RecurringBlock[] = [];
  let migration: MigrationPreview | null = null;
  let notice: Notice | null = null;
  let facilityFilter = '';
  let statusFilter = '';
  let bookingView: 'table' | 'calendar' = 'table';
  let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let isLoadingCalendarBookings = false;
  let calendarRequestId = 0;
  let offset = 0;
  let totalBookings = 0;
  let isLoadingBookings = true;
  let isLoadingFacilities = true;
  let isLoadingBlocks = true;
  let editingFacility: Facility | null = null;
  let bookingDialogOpen = false;
  let activeBooking: Booking | null = null;
  let detailDialog: HTMLDialogElement;
  let details: BookingDetails | null = null;
  let fixedBlockForm: HTMLFormElement;
  let recurringBlockForm: HTMLFormElement;
  let fixedBlockFacility = '';
  let recurringBlockFacility = '';

  onMount(() => {
    const unsubscribe = window.__GRAV_I18N?.subscribe?.((locale) => { adminLocale = locale; });
    void refreshAll();
    return unsubscribe;
  });

  function tr(key: string, values?: Record<string, string | number>): string {
    return translate(adminLocale, `PLUGIN_BOOKING.ADMIN.UI.${key}`, values);
  }

  function statusLabel(status: Booking['status']): string {
    const key: Record<Booking['status'], string> = {
      verification_pending: 'STATUS_VERIFICATION_PENDING',
      pending: 'STATUS_PENDING', confirmed: 'STATUS_CONFIRMED', rejected: 'STATUS_REJECTED', cancelled: 'STATUS_CANCELLED',
    };
    return translate(adminLocale, `PLUGIN_BOOKING.ADMIN.${key[status]}`);
  }

  function modeLabel(mode: Facility['booking_mode'] | Facility['approval_mode']): string {
    const keys: Record<string, string> = {
      facility: 'MODE_FACILITY', resources: 'MODE_RESOURCES', both: 'MODE_BOTH', manual: 'APPROVAL_MANUAL', automatic: 'APPROVAL_AUTOMATIC',
    };
    return tr(keys[mode] || mode.toUpperCase());
  }

  function format(value: string, zone?: string): string {
    return formatDate(value, zone, dateLocale(adminLocale));
  }

  function weekday(index: number, short = false): string {
    return weekdayName(adminLocale, index, short);
  }

  function setNotice(message: string, kind: NoticeKind = 'info'): void {
    notice = { message, kind };
  }

  async function refreshAll(): Promise<void> {
    await Promise.allSettled([loadFacilities(), loadBookings(), loadBlocks(), loadMigration()]);
  }

  async function loadFacilities(): Promise<void> {
    isLoadingFacilities = true;
    try {
      const result = await api<{ facilities?: Facility[] }>('/admin/facilities');
      facilities = result.facilities || [];
    } catch (error) {
      setNotice(`${tr('LOAD_FACILITIES_FAILED')} ${errorMessage(error)}`, 'danger');
    } finally {
      isLoadingFacilities = false;
    }
  }

  async function loadBookings(): Promise<void> {
    isLoadingBookings = true;
    const query = new URLSearchParams({ limit: '100', offset: String(offset) });
    if (facilityFilter) query.set('facility_id', facilityFilter);
    if (statusFilter) query.set('status', statusFilter);
    try {
      const result = await api<{ bookings?: Booking[]; total?: number }>(`/admin/bookings?${query}`);
      bookings = result.bookings || [];
      totalBookings = Number(result.total ?? bookings.length);
    } catch (error) {
      bookings = [];
      totalBookings = 0;
      setNotice(`${tr('LOAD_BOOKINGS_FAILED')} ${errorMessage(error)}`, 'danger');
    } finally {
      isLoadingBookings = false;
      if (bookingView === 'calendar') void loadCalendarBookings();
    }
  }

  async function loadCalendarBookings(): Promise<void> {
    const requestId = ++calendarRequestId;
    isLoadingCalendarBookings = true;
    calendarBookings = [];

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const monthLength = new Date(year, month + 1, 0).getDate();
    const visibleDays = Math.ceil((firstDayOffset + monthLength) / 7) * 7;
    const firstVisibleDay = new Date(Date.UTC(year, month, 1 - firstDayOffset - 2));
    const dayAfterVisibleRange = new Date(Date.UTC(year, month, 1 - firstDayOffset + visibleDays + 2));
    const query = new URLSearchParams({
      limit: '200', offset: '0', from: firstVisibleDay.toISOString(), to: dayAfterVisibleRange.toISOString(),
    });
    if (facilityFilter) query.set('facility_id', facilityFilter);
    if (statusFilter) query.set('status', statusFilter);

    try {
      const result = await api<{ bookings?: Booking[]; total?: number }>(`/admin/bookings?${query}`);
      const allBookings = result.bookings || [];
      const total = Number(result.total ?? allBookings.length);
      for (let nextOffset = allBookings.length; nextOffset < total; nextOffset += 200) {
        const pageQuery = new URLSearchParams(query);
        pageQuery.set('offset', String(nextOffset));
        const page = await api<{ bookings?: Booking[] }>(`/admin/bookings?${pageQuery}`);
        if (requestId !== calendarRequestId) return;
        const pageBookings = page.bookings || [];
        if (pageBookings.length === 0) break;
        allBookings.push(...pageBookings);
      }
      if (requestId === calendarRequestId) calendarBookings = allBookings;
    } catch (error) {
      if (requestId === calendarRequestId) {
        calendarBookings = [];
        setNotice(`${tr('LOAD_BOOKINGS_FAILED')} ${errorMessage(error)}`, 'danger');
      }
    } finally {
      if (requestId === calendarRequestId) isLoadingCalendarBookings = false;
    }
  }

  function setBookingView(view: 'table' | 'calendar'): void {
    bookingView = view;
    if (view === 'calendar') void loadCalendarBookings();
  }

  function changeCalendarMonth(direction: number): void {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + direction, 1);
    void loadCalendarBookings();
  }

  function showCurrentCalendarMonth(): void {
    calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    void loadCalendarBookings();
  }

  async function loadBlocks(): Promise<void> {
    isLoadingBlocks = true;
    try {
      const result = await api<{ blocks?: AvailabilityBlock[]; recurring_blocks?: RecurringBlock[] }>('/admin/blocks');
      blocks = result.blocks || [];
      recurring = result.recurring_blocks || [];
    } catch (error) {
      setNotice(`${tr('LOAD_BLOCKS_FAILED')} ${errorMessage(error)}`, 'danger');
    } finally {
      isLoadingBlocks = false;
    }
  }

  async function loadMigration(): Promise<void> {
    try {
      const result = await api<{ migration?: MigrationPreview }>('/admin/migration/preview');
      migration = result.migration || null;
    } catch (error) {
      setNotice(`${tr('LOAD_MIGRATION_FAILED')} ${errorMessage(error)}`, 'warning');
    }
  }

  function migrationCount(): number {
    return Object.values(migration?.source_counts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  }

  function defaultFacility(): Facility {
    return {
      id: '', name: '', description: '', enabled: true, timezone: 'Europe/Prague', booking_mode: 'facility',
      approval_mode: 'manual', availability_windows: [{ start: 'mon 00:00', end: 'sun 23:59' }],
      booking_rules: {
        minimum_duration_seconds: 3600, maximum_duration_seconds: 259200, booking_interval_seconds: 1800,
        minimum_advance_notice_seconds: 0, maximum_horizon_seconds: 7776000, pending_blocks_availability: true,
      },
      resources: [], booking_interface: defaultBookingInterface('simple', adminLocale),
      access: { guest_requests: true, allowed_groups: [], instant_approval_groups: [] },
      notifications: { enabled: true, admin_recipients: [], facility_events: ['created'], requester_events: ['created', 'confirmed'] },
    };
  }

  function openFacility(id = ''): void {
    const existing = facilities.find((facility) => facility.id === id);
    editingFacility = existing ? structuredClone(existing) : defaultFacility();
    requestAnimationFrame(() => document.querySelector('.booking-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function parseFacility(values: FormData): Omit<Facility, 'id'> & { id: string } {
    const read = (name: string) => String(values.get(name) || '').trim();
    const checked = (name: string) => values.has(name);
    const csv = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
    const windows = read('windows').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const parts = line.split(/\s+-\s+/);
      if (parts.length !== 2) throw new Error(tr('INVALID_AVAILABILITY_WINDOW'));
      return { start: parts[0], end: parts[1] };
    });
    const resources = read('resources').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const [id, name, description = '', allowed = '', instant = '', enabled = 'true'] = line.split('|').map((part) => part.trim());
      if (!id || !name) throw new Error(tr('ROOM_ID_AND_NAME_REQUIRED'));
      return { id, name, description, enabled: enabled.toLowerCase() !== 'false', allowed_groups: csv(allowed), instant_approval_groups: csv(instant) };
    });
    const slotIds = values.getAll('simple_slot_id').map(String);
    const slotLabels = values.getAll('simple_slot_label').map(String);
    const slotStarts = values.getAll('simple_slot_start').map(String);
    const slotEnds = values.getAll('simple_slot_end').map(String);
    const resourceSlots = slotIds.map((id, index) => {
      const label = slotLabels[index]?.trim() || '';
      const start_time = slotStarts[index] || '';
      const end_time = slotEnds[index] || '';
      if (!id || !label || !/^([01]\d|2[0-3]):[0-5]\d$/.test(start_time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end_time) || end_time <= start_time) {
        throw new Error(tr('INVALID_SIMPLE_SLOT'));
      }
      return { id, label, start_time, end_time };
    });
    if (resourceSlots.length === 0) throw new Error(tr('AT_LEAST_ONE_SIMPLE_SLOT'));
    if (new Set(resourceSlots.map((slot) => slot.id)).size !== resourceSlots.length) throw new Error(tr('INVALID_SIMPLE_SLOT'));
    const wholeDayStartTime = read('whole_day_start_time');
    const wholeDayEndTime = read('whole_day_end_time');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(wholeDayStartTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(wholeDayEndTime)) {
      throw new Error(tr('INVALID_WHOLE_DAY_TIMES'));
    }
    const events = (name: string) => values.getAll(name).map(String);
    const minutes = (name: string, fallback: number) => Math.max(1, Number(read(name)) || fallback);
    return {
      id: read('id'), name: read('name'), description: read('description'), timezone: read('timezone'),
      enabled: checked('enabled'), booking_mode: read('booking_mode'), approval_mode: read('approval_mode'),
      booking_interface: {
        default_mode: read('booking_default_mode') === 'simple' ? 'simple' : 'custom',
        whole_day_start_time: wholeDayStartTime,
        whole_day_end_time: wholeDayEndTime,
        resource_slots: resourceSlots,
      },
      availability_windows: windows, resources,
      booking_rules: {
        minimum_duration_seconds: minutes('minimum_duration', 60) * 60,
        maximum_duration_seconds: minutes('maximum_duration', 4320) * 60,
        booking_interval_seconds: minutes('booking_interval', 30) * 60,
        minimum_advance_notice_seconds: Math.max(0, Number(read('minimum_notice')) || 0) * 3600,
        maximum_horizon_seconds: minutes('horizon', 90) * 86400,
        pending_blocks_availability: true,
      },
      access: { guest_requests: checked('guest_requests'), allowed_groups: csv(read('allowed_groups')), instant_approval_groups: csv(read('instant_groups')) },
      notifications: {
        enabled: checked('notifications_enabled'), admin_recipients: csv(read('recipients')),
        facility_events: events('facility_events'), requester_events: events('requester_events'),
        templates: Object.fromEntries([
          'email_layout_html', 'verification_subject', 'verification_body', 'created_admin_subject', 'created_admin_body',
          'created_requester_subject', 'created_requester_body', 'confirmed_subject', 'confirmed_body_html',
          'payment_subject', 'payment_body_html', 'rejected_subject', 'rejected_body',
          'cancelled_subject', 'cancelled_body', 'edited_subject', 'edited_body',
        ].map((key) => [key, String(values.get(`template_${key}`) || '')])),
      },
    };
  }

  async function saveFacility(values: FormData): Promise<void> {
    try {
      const body = parseFacility(values);
      const id = editingFacility?.id || '';
      await api(id ? `/admin/facilities/${encodeURIComponent(id)}` : '/admin/facilities', {
        method: id ? 'PUT' : 'POST', body,
      });
      editingFacility = null;
      setNotice(tr('FACILITY_SAVED'), 'success');
      await loadFacilities();
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  async function deleteFacility(id: string): Promise<void> {
    if (!await confirmAction({
      title: tr('DELETE_FACILITY_TITLE'), message: tr('DELETE_FACILITY_MESSAGE'),
      confirmLabel: tr('DELETE_FACILITY'), variant: 'destructive',
    })) return;
    try {
      await api(`/admin/facilities/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadFacilities();
      setNotice(tr('FACILITY_DELETED'), 'success');
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  function openBooking(booking: Booking | null = null): void {
    if (facilities.length === 0) {
      activeTab = 'facilities';
      setNotice(tr('ADD_FACILITY_BEFORE_BOOKING'), 'warning');
      return;
    }
    activeBooking = booking;
    bookingDialogOpen = true;
  }

  async function saveBooking(values: FormData): Promise<void> {
    try {
      const facilityId = String(values.get('facility_id') || '');
      const facility = facilities.find((item) => item.id === facilityId);
      if (!facility) throw new Error(tr('CHOOSE_FACILITY'));
      const body: Record<string, unknown> = {
        facility_id: facilityId, resource_id: String(values.get('resource_id') || '') || null,
        start: toInstant(String(values.get('start') || ''), facility.timezone, { missing: tr('ENTER_START_AND_END'), daylightSaving: tr('DAYLIGHT_SAVING_GAP') }),
        end: toInstant(String(values.get('end') || ''), facility.timezone, { missing: tr('ENTER_START_AND_END'), daylightSaving: tr('DAYLIGHT_SAVING_GAP') }),
        customer_name: String(values.get('customer_name') || ''), customer_email: String(values.get('customer_email') || ''),
        customer_phone: String(values.get('customer_phone') || '') || null,
        customer_note: String(values.get('customer_note') || '') || null,
      };
      if (activeBooking) {
        body.admin_note = String(values.get('admin_note') || '') || null;
        await api(`/admin/bookings/${encodeURIComponent(activeBooking.id)}`, { method: 'PATCH', body });
      } else {
        body.status = String(values.get('status') || 'pending');
        await api('/admin/bookings', { method: 'POST', body });
      }
      bookingDialogOpen = false;
      setNotice(activeBooking ? tr('BOOKING_UPDATED') : tr('BOOKING_CREATED'), 'success');
      activeBooking = null;
      await loadBookings();
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  async function changeStatus(booking: Booking, status: Booking['status']): Promise<void> {
    const keys: Record<string, { title: string; message: string; confirm: string }> = {
      confirmed: { title: 'APPROVE_BOOKING_TITLE', message: 'APPROVE_BOOKING_MESSAGE', confirm: 'APPROVE' },
      rejected: { title: 'REJECT_BOOKING_TITLE', message: 'REJECT_BOOKING_MESSAGE', confirm: 'REJECT' },
      cancelled: { title: 'REVOKE_BOOKING_TITLE', message: 'REVOKE_BOOKING_MESSAGE', confirm: 'REVOKE' },
    };
    const labels = keys[status];
    if (!await confirmAction({
      title: tr(labels.title), message: tr(labels.message), confirmLabel: tr(labels.confirm),
      variant: status === 'confirmed' ? 'default' : 'destructive',
    })) return;
    try {
      await api(`/admin/bookings/${encodeURIComponent(booking.id)}/status`, { method: 'PATCH', body: { status } });
      setNotice(tr('BOOKING_STATUS_UPDATED'), 'success');
      await loadBookings();
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  async function deleteBooking(booking: Booking): Promise<void> {
    if (!await confirmAction({
      title: tr('DELETE_BOOKING_TITLE'), message: tr('DELETE_BOOKING_MESSAGE'),
      confirmLabel: tr('DELETE_BOOKING'), variant: 'destructive',
    })) return;
    try {
      await api(`/admin/bookings/${encodeURIComponent(booking.id)}`, { method: 'DELETE' });
      setNotice(tr('BOOKING_DELETED'), 'success');
      await loadBookings();
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  async function showDetails(id: string): Promise<void> {
    try {
      details = await api<BookingDetails>(`/admin/bookings/${encodeURIComponent(id)}`);
      detailDialog?.showModal();
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  async function sendPaymentInformation(booking: Booking): Promise<void> {
    try {
      await api(`/admin/bookings/${encodeURIComponent(booking.id)}/payment-email`, { method: 'POST', body: {} });
      setNotice(tr('PAYMENT_EMAIL_SENT'), 'success');
      details = await api<BookingDetails>(`/admin/bookings/${encodeURIComponent(booking.id)}`);
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  async function importLegacy(): Promise<void> {
    if (!await confirmAction({
      title: tr('IMPORT_LEGACY_TITLE'), message: tr('IMPORT_LEGACY_MESSAGE'),
      confirmLabel: tr('IMPORT_DATA'),
    })) return;
    try {
      const result = await api<{ migration?: { imported?: Record<string, number> } }>('/admin/migration/import', { method: 'POST', body: {} });
      const imported = result.migration?.imported || {};
      setNotice(tr('LEGACY_IMPORTED', { facilities: imported.facilities || 0, bookings: imported.bookings || 0, blocks: imported.blocks || 0 }), 'success');
      await refreshAll();
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  async function submitFixedBlock(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const values = new FormData(fixedBlockForm);
    try {
      const facility = facilities.find((item) => item.id === String(values.get('facility_id')));
      if (!facility) throw new Error(tr('CHOOSE_FACILITY'));
      await api('/admin/blocks/fixed', { method: 'POST', body: {
        facility_id: values.get('facility_id'), resource_id: values.get('resource_id') || null,
        start: toInstant(String(values.get('start') || ''), facility.timezone, { missing: tr('ENTER_START_AND_END'), daylightSaving: tr('DAYLIGHT_SAVING_GAP') }), end: toInstant(String(values.get('end') || ''), facility.timezone, { missing: tr('ENTER_START_AND_END'), daylightSaving: tr('DAYLIGHT_SAVING_GAP') }),
        title: values.get('title'),
      } });
      fixedBlockForm.reset();
      fixedBlockFacility = '';
      setNotice(tr('BLOCK_ADDED'), 'success');
      await loadBlocks();
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  async function submitRecurringBlock(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const values = new FormData(recurringBlockForm);
    try {
      await api('/admin/blocks/recurring', { method: 'POST', body: {
        facility_id: values.get('facility_id'), resource_id: values.get('resource_id') || null,
        weekday: Number(values.get('weekday')), start_time: values.get('start_time'), end_time: values.get('end_time'),
        title: values.get('title'),
      } });
      recurringBlockForm.reset();
      recurringBlockFacility = '';
      setNotice(tr('RECURRING_BLOCK_ADDED'), 'success');
      await loadBlocks();
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  async function deleteBlock(kind: 'fixed' | 'recurring', id: string): Promise<void> {
    if (!await confirmAction({
      title: tr('REMOVE_BLOCK_TITLE'), message: tr('REMOVE_BLOCK_MESSAGE'),
      confirmLabel: tr('REMOVE_BLOCK'), variant: 'destructive',
    })) return;
    try {
      await api(`/admin/blocks/${kind}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadBlocks();
    } catch (error) {
      setNotice(errorMessage(error), 'danger');
    }
  }

  function facilityName(id: string): string {
    return facilities.find((facility) => facility.id === id)?.name || id || '—';
  }

  function resourceName(facilityId: string, resourceId?: string | null): string {
    return facilities.find((facility) => facility.id === facilityId)?.resources?.find((resource) => resource.id === resourceId)?.name || (resourceId || tr('ALL_ROOMS'));
  }

  function eventLabel(event: string): string {
    const key = `EVENT_${event.toUpperCase()}`;
    return tr(key);
  }

  function notificationStatus(status: string): string {
    const key: Record<string, string> = { pending: 'EMAIL_PENDING', sent: 'EMAIL_SENT', failed: 'EMAIL_FAILED' };
    return key[status] ? tr(key[status]) : status;
  }

  function hasBookingFilters(): boolean {
    return Boolean(facilityFilter || statusFilter);
  }

  function handleFilterChange(): void {
    offset = 0;
    void loadBookings();
  }

  function changePage(direction: -1 | 1): void {
    offset = Math.max(0, offset + direction * 100);
    void loadBookings();
  }

  function handleTabKey(event: KeyboardEvent): void {
    const target = event.currentTarget as HTMLButtonElement;
    const tabs: BookingTab[] = ['bookings', 'facilities', 'blocks'];
    const current = tabs.indexOf(target.dataset.tab as BookingTab);
    const rtl = (window.__GRAV_I18N?.dir || document.documentElement.dir) === 'rtl';
    let next = current;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else if (event.key === 'ArrowRight') next = (current + (rtl ? -1 : 1) + tabs.length) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (current + (rtl ? 1 : -1) + tabs.length) % tabs.length;
    else return;
    event.preventDefault();
    activeTab = tabs[next];
    document.getElementById(`booking-tab-${activeTab}`)?.focus();
  }

  function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
</script>

<main class="booking-admin" lang={adminLocale}>
  <p class="booking-page-description">{tr('HEADER_DESCRIPTION')}</p>

  {#if migration && (migrationCount() > 0 || migration.errors?.length)}
    <section class="booking-alert booking-alert--{migration.errors?.length ? 'warning' : 'info'}" aria-live="polite">
      <div class="booking-alert__content"><strong>{tr('LEGACY_DATA_IMPORT')}</strong><p>{tr('LEGACY_COUNTS', { facilities: migration.source_counts?.facilities || 0, bookings: migration.source_counts?.bookings || 0, blocks: migration.source_counts?.blocks || 0, recurring: migration.source_counts?.recurring_blocks || 0 })}</p>
        {#if migration.errors?.length}<p>{tr('IMPORT_NEEDS_ATTENTION')} {migration.errors.map((item) => `${item.source}: ${item.message}`).join('; ')}</p>{/if}
        {#if migration.already_imported}<p>{tr('LEGACY_ALREADY_IMPORTED')}</p>{/if}
        {#if migration.can_import && !migration.already_imported}<p class="booking-alert__note">{tr('LEGACY_FILES_PRESERVED')}</p>{/if}
      </div>
      {#if migration.can_import && !migration.already_imported}<button type="button" class="btn btn-secondary" onclick={importLegacy}><i class="fa fa-download" aria-hidden="true"></i> {tr('IMPORT_LEGACY_DATA')}</button>{/if}
    </section>
  {/if}

  {#if notice}<div class="booking-alert booking-alert--{notice.kind}" role="status">{notice.message}<button class="booking-alert__close" type="button" aria-label={tr('DISMISS_MESSAGE')} onclick={() => notice = null}>&times;</button></div>{/if}

  <div class="booking-tabs" role="tablist" aria-label={tr('BOOKING_ADMINISTRATION')}>
    <button id="booking-tab-bookings" class:active={activeTab === 'bookings'} class="booking-tab" role="tab" aria-selected={activeTab === 'bookings'} aria-controls="booking-panel-bookings" tabindex={activeTab === 'bookings' ? 0 : -1} data-tab="bookings" onclick={() => activeTab = 'bookings'} onkeydown={handleTabKey}>
      <i class="fa fa-list" aria-hidden="true"></i><span>{tr('BOOKINGS')}</span><span class="booking-tab__count">{isLoadingBookings ? '…' : totalBookings}</span>
    </button>
    <button id="booking-tab-facilities" class:active={activeTab === 'facilities'} class="booking-tab" role="tab" aria-selected={activeTab === 'facilities'} aria-controls="booking-panel-facilities" tabindex={activeTab === 'facilities' ? 0 : -1} data-tab="facilities" onclick={() => activeTab = 'facilities'} onkeydown={handleTabKey}>
      <i class="fa fa-building" aria-hidden="true"></i><span>{tr('FACILITIES')}</span><span class="booking-tab__count">{isLoadingFacilities ? '…' : facilities.length}</span>
    </button>
    <button id="booking-tab-blocks" class:active={activeTab === 'blocks'} class="booking-tab" role="tab" aria-selected={activeTab === 'blocks'} aria-controls="booking-panel-blocks" tabindex={activeTab === 'blocks' ? 0 : -1} data-tab="blocks" onclick={() => activeTab = 'blocks'} onkeydown={handleTabKey}>
      <i class="fa fa-ban" aria-hidden="true"></i><span>{tr('AVAILABILITY_BLOCKS')}</span>
    </button>
  </div>

  <div id="booking-panel-bookings" class="booking-panel" role="tabpanel" aria-labelledby="booking-tab-bookings" tabindex="0" hidden={activeTab !== 'bookings'}>
    <div class="booking-section-heading">
      <div><h2>{tr('ALL_BOOKINGS')}</h2><p>{tr('BOOKINGS_DESCRIPTION')}</p></div>
      <div class="booking-actions">
        <div class="booking-view-switch" role="group" aria-label={tr('BOOKING_VIEW')}>
          <button class:active={bookingView === 'table'} class="btn btn-secondary" type="button" aria-pressed={bookingView === 'table'} onclick={() => setBookingView('table')}><i class="fa fa-list" aria-hidden="true"></i> {tr('TABLE_VIEW')}</button>
          <button class:active={bookingView === 'calendar'} class="btn btn-secondary" type="button" aria-pressed={bookingView === 'calendar'} onclick={() => setBookingView('calendar')}><i class="fa fa-calendar" aria-hidden="true"></i> {tr('CALENDAR_VIEW')}</button>
        </div>
        <button class="btn btn-secondary" type="button" onclick={() => void loadBookings()}><i class="fa fa-refresh" aria-hidden="true"></i> {tr('REFRESH')}</button>
        <button class="btn btn-primary" type="button" onclick={() => openBooking()}><i class="fa fa-plus" aria-hidden="true"></i> {tr('NEW_BOOKING')}</button>
      </div>
    </div>
    <div class="booking-toolbar">
      <label class="booking-field">{tr('FACILITY')}
        <select class="form-select" bind:value={facilityFilter} onchange={handleFilterChange}><option value="">{tr('ALL_FACILITIES')}</option>{#each facilities as facility (facility.id)}<option value={facility.id}>{facility.name}</option>{/each}</select>
      </label>
      <label class="booking-field">{tr('STATUS')}
        <select class="form-select" bind:value={statusFilter} onchange={handleFilterChange}><option value="">{tr('ALL_STATUSES')}</option><option value="verification_pending">{statusLabel('verification_pending')}</option><option value="pending">{statusLabel('pending')}</option><option value="confirmed">{statusLabel('confirmed')}</option><option value="rejected">{statusLabel('rejected')}</option><option value="cancelled">{statusLabel('cancelled')}</option></select>
      </label>
      <p class="booking-toolbar__hint"><i class="fa fa-filter" aria-hidden="true"></i> {tr('FILTER_HINT')}</p>
    </div>
    {#if bookingView === 'calendar'}
      <BookingCalendar
        bookings={calendarBookings}
        loading={isLoadingCalendarBookings}
        month={calendarMonth}
        locale={adminLocale}
        {statusLabel}
        onMonthChange={changeCalendarMonth}
        onToday={showCurrentCalendarMonth}
        onSelectBooking={openBooking}
      />
    {:else}
    <div class="booking-table-wrap">
      <div class="booking-table-scroll"><table class="booking-table">
        <thead><tr><th>{tr('FACILITY')}</th><th>{tr('ROOM')}</th><th>{tr('REQUESTER')}</th><th>{tr('START')}</th><th>{tr('END')}</th><th>{tr('STATUS')}</th><th>{tr('ACTIONS')}</th></tr></thead>
        <tbody>
          {#if isLoadingBookings}<tr><td colspan="7" class="table-message">{tr('LOADING_BOOKINGS')}</td></tr>
          {:else if bookings.length === 0}<tr><td colspan="7" class="table-message"><strong>{hasBookingFilters() ? tr('NO_BOOKINGS_MATCH_FILTERS') : tr('NO_BOOKINGS_YET')}</strong>
            <p>{hasBookingFilters() ? tr('CHANGE_BOOKING_FILTERS') : tr('CREATE_OR_WAIT_BOOKING')}</p>
            {#if !hasBookingFilters()}<button type="button" class="btn btn-primary" onclick={() => openBooking()}><i class="fa fa-plus" aria-hidden="true"></i> {tr('CREATE_BOOKING')}</button>{/if}</td></tr>
          {:else}
            {#each bookings as booking (booking.id)}
              <tr>
                <td>{booking.facility_name}</td><td>{booking.resource_name || '—'}</td>
                <td><strong>{booking.customer_name}</strong><br /><a href="mailto:{booking.customer_email}">{booking.customer_email}</a></td>
                <td>{format(booking.start, booking.timezone)}</td><td>{format(booking.end, booking.timezone)}</td>
                <td><span class="status-badge status-badge--{booking.status}">{statusLabel(booking.status)}</span></td>
                <td><div class="booking-row-actions">
                  <button class="btn btn-sm btn-secondary" type="button" onclick={() => void showDetails(booking.id)}>{tr('DETAILS')}</button>
                  <button class="btn btn-sm btn-secondary" type="button" onclick={() => openBooking(booking)}>{tr('EDIT')}</button>
                  {#if booking.status === 'pending'}
                    <button class="btn btn-sm btn-success" type="button" onclick={() => void changeStatus(booking, 'confirmed')}>{tr('APPROVE')}</button>
                    <button class="btn btn-sm btn-warning" type="button" onclick={() => void changeStatus(booking, 'rejected')}>{tr('REJECT')}</button>
                  {/if}
                  {#if booking.status === 'pending' || booking.status === 'confirmed'}<button class="btn btn-sm btn-warning" type="button" onclick={() => void changeStatus(booking, 'cancelled')}>{tr('REVOKE')}</button>{/if}
                  <button class="btn btn-sm btn-danger" type="button" onclick={() => void deleteBooking(booking)}>{tr('DELETE')}</button>
                </div></td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table></div>
    </div>
    <footer class="booking-table-footer"><p>{totalBookings === 0 ? tr('NO_BOOKINGS_TO_SHOW') : tr('BOOKINGS_PAGINATION', { first: offset + 1, last: offset + bookings.length, total: totalBookings })}</p>
      <div class="booking-pagination">
        {#if offset > 0}<button class="btn btn-sm btn-secondary" type="button" onclick={() => changePage(-1)}><i class="fa fa-arrow-left" aria-hidden="true"></i> {tr('PREVIOUS')}</button>{/if}
        {#if offset + bookings.length < totalBookings}<button class="btn btn-sm btn-secondary" type="button" onclick={() => changePage(1)}>{tr('NEXT')} <i class="fa fa-arrow-right" aria-hidden="true"></i></button>{/if}
      </div>
    </footer>
    {/if}
  </div>

  <div id="booking-panel-facilities" class="booking-panel" role="tabpanel" aria-labelledby="booking-tab-facilities" tabindex="0" hidden={activeTab !== 'facilities'}>
    <div class="booking-section-heading">
      <div><h2>{tr('FACILITIES')}</h2><p>{tr('FACILITIES_DESCRIPTION')}</p></div>
      <button class="btn btn-primary" type="button" onclick={() => openFacility()}><i class="fa fa-plus" aria-hidden="true"></i> {tr('ADD_FACILITY')}</button>
    </div>
    <div class="booking-table-wrap"><div class="booking-table-scroll"><table class="booking-table">
      <thead><tr><th>{tr('FACILITY')}</th><th>{tr('MODE')}</th><th>{tr('APPROVAL')}</th><th>{tr('AVAILABILITY')}</th><th>{tr('ACTIONS')}</th></tr></thead>
      <tbody>
        {#if isLoadingFacilities}<tr><td colspan="5" class="table-message">{tr('LOADING_FACILITIES')}</td></tr>
        {:else if facilities.length === 0}<tr><td colspan="5" class="table-message"><strong>{tr('FIRST_FACILITY_TITLE')}</strong>
          <p>{tr('FIRST_FACILITY_DESCRIPTION')}</p>
          <button type="button" class="btn btn-primary" onclick={() => openFacility()}><i class="fa fa-plus" aria-hidden="true"></i> {tr('ADD_FACILITY')}</button></td></tr>
        {:else}
          {#each facilities as facility (facility.id)}
            <tr>
              <td><strong>{facility.name}</strong><br /><code>{facility.id}</code>{#if !facility.enabled}<span class="status-badge status-badge--disabled">{tr('DISABLED')}</span>{/if}</td>
              <td>{modeLabel(facility.booking_mode)}</td>
              <td><span class="status-badge status-badge--{facility.approval_mode}">{modeLabel(facility.approval_mode)}</span></td>
              <td>{#each facility.availability_windows as window}<span class="availability-window">{window.start} – {window.end}</span>{/each}</td>
              <td><div class="booking-row-actions"><button type="button" class="btn btn-sm btn-secondary" onclick={() => openFacility(facility.id)}>{tr('EDIT')}</button>
                <button type="button" class="btn btn-sm btn-danger" onclick={() => void deleteFacility(facility.id)}>{tr('DELETE')}</button></div></td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table></div></div>
    {#if editingFacility}<div class="booking-editor"><FacilityEditor facility={editingFacility} locale={adminLocale} onSave={saveFacility} onClose={() => editingFacility = null} /></div>{/if}
  </div>

  <div id="booking-panel-blocks" class="booking-panel" role="tabpanel" aria-labelledby="booking-tab-blocks" tabindex="0" hidden={activeTab !== 'blocks'}>
    <div class="booking-section-heading"><div><h2>{tr('AVAILABILITY_BLOCKS')}</h2><p>{tr('BLOCKS_DESCRIPTION')}</p></div></div>
    <div class="booking-card">
      <div class="booking-card__heading"><span class="booking-card__icon" aria-hidden="true"><i class="fa fa-calendar-times-o"></i></span><div><h3>{tr('BLOCK_DATE_TIME')}</h3><p>{tr('BLOCK_DATE_TIME_DESCRIPTION')}</p></div></div>
      <form class="block-form" bind:this={fixedBlockForm} onsubmit={submitFixedBlock}>
        <label>{tr('FACILITY')}<select class="form-select" name="facility_id" bind:value={fixedBlockFacility} required><option value="">{tr('CHOOSE_FACILITY')}</option>{#each facilities as facility (facility.id)}<option value={facility.id}>{facility.name}</option>{/each}</select></label>
        <label>{tr('ROOM')}<select class="form-select" name="resource_id"><option value="">{tr('ALL_ROOMS')}</option>{#each facilities.find((facility) => facility.id === fixedBlockFacility)?.resources || [] as resource (resource.id)}<option value={resource.id}>{resource.name}</option>{/each}</select></label>
        <label>{tr('START')}<input class="form-control" name="start" type="datetime-local" required /></label>
        <label>{tr('END')}<input class="form-control" name="end" type="datetime-local" required /></label>
        <label class="block-form__title">{tr('TITLE')}<input class="form-control" name="title" maxlength="255" required /></label>
        <button class="btn btn-primary" type="submit"><i class="fa fa-plus" aria-hidden="true"></i> {tr('ADD_BLOCK')}</button>
      </form>
    </div>
    <div class="booking-card">
      <div class="booking-card__heading"><span class="booking-card__icon" aria-hidden="true"><i class="fa fa-repeat"></i></span><div><h3>{tr('RECURRING_UNAVAILABLE')}</h3><p>{tr('RECURRING_UNAVAILABLE_DESCRIPTION')}</p></div></div>
      <form class="block-form" bind:this={recurringBlockForm} onsubmit={submitRecurringBlock}>
        <label>{tr('FACILITY')}<select class="form-select" name="facility_id" bind:value={recurringBlockFacility} required><option value="">{tr('CHOOSE_FACILITY')}</option>{#each facilities as facility (facility.id)}<option value={facility.id}>{facility.name}</option>{/each}</select></label>
        <label>{tr('ROOM')}<select class="form-select" name="resource_id"><option value="">{tr('ALL_ROOMS')}</option>{#each facilities.find((facility) => facility.id === recurringBlockFacility)?.resources || [] as resource (resource.id)}<option value={resource.id}>{resource.name}</option>{/each}</select></label>
        <label>{tr('WEEKDAY')}<select class="form-select" name="weekday">{#each [0, 1, 2, 3, 4, 5, 6] as index}<option value={index + 1}>{weekday(index)}</option>{/each}</select></label>
        <label>{tr('START')}<input class="form-control" name="start_time" type="time" required /></label>
        <label>{tr('END')}<input class="form-control" name="end_time" type="time" required /></label>
        <label class="block-form__title">{tr('TITLE')}<input class="form-control" name="title" maxlength="255" required /></label>
        <button class="btn btn-primary" type="submit"><i class="fa fa-plus" aria-hidden="true"></i> {tr('ADD_RECURRING_BLOCK')}</button>
      </form>
    </div>
    <div class="booking-card booking-block-list">
      <div class="booking-card__heading"><div><h3>{tr('CURRENT_BLOCKS')}</h3><p>{tr('CURRENT_BLOCKS_DESCRIPTION')}</p></div></div>
      <div class="booking-table-wrap"><div class="booking-table-scroll"><table class="booking-table">
        <thead><tr><th>{tr('TYPE')}</th><th>{tr('FACILITY')}</th><th>{tr('ROOM')}</th><th>{tr('TITLE')}</th><th>{tr('WHEN')}</th><th>{tr('ACTIONS')}</th></tr></thead>
        <tbody>
          {#if isLoadingBlocks}<tr><td colspan="6" class="table-message">{tr('LOADING_BLOCKS')}</td></tr>
          {:else if blocks.length === 0 && recurring.length === 0}<tr><td colspan="6" class="table-message">{tr('NO_BLOCKS_CONFIGURED')}</td></tr>
          {:else}
            {#each blocks as block (block.id)}
              <tr><td><span class="status-badge status-badge--disabled">{tr('ONE_TIME')}</span></td><td>{facilityName(block.facility_id)}</td><td>{resourceName(block.facility_id, block.resource_id)}</td><td>{block.title}</td>
                <td>{format(block.start, facilities.find((facility) => facility.id === block.facility_id)?.timezone)} – {format(block.end, facilities.find((facility) => facility.id === block.facility_id)?.timezone)}</td>
                <td><button class="btn btn-sm btn-danger" type="button" onclick={() => void deleteBlock('fixed', block.id)}>{tr('REMOVE')}</button></td></tr>
            {/each}
            {#each recurring as block (block.id)}
              <tr><td><span class="status-badge status-badge--disabled">{tr('WEEKLY')}</span></td><td>{facilityName(block.facility_id)}</td><td>{resourceName(block.facility_id, block.resource_id)}</td><td>{block.title}</td>
                <td>{weekday(Number(block.weekday) - 1, true)} {block.start_time}–{block.end_time}</td>
                <td><button class="btn btn-sm btn-danger" type="button" onclick={() => void deleteBlock('recurring', block.id)}>{tr('REMOVE')}</button></td></tr>
            {/each}
          {/if}
        </tbody>
      </table></div></div>
    </div>
  </div>

  <BookingDialog bind:open={bookingDialogOpen} booking={activeBooking} {facilities} locale={adminLocale} onSave={saveBooking} onClose={() => bookingDialogOpen = false} />

  <dialog class="booking-dialog booking-detail-dialog" bind:this={detailDialog} onclose={() => details = null}>
    {#if details}
      <div class="booking-dialog__heading"><div><p class="booking-eyebrow">{tr('BOOKING_RECORD')}</p><h2>{tr('BOOKING_DETAILS')}</h2></div>
        <button type="button" class="btn btn-icon btn-secondary" aria-label={tr('CLOSE')} onclick={() => detailDialog.close()}>&times;</button></div>
      <dl class="booking-detail-grid">
        <dt>{tr('FACILITY')}</dt><dd>{details.booking.facility_name}</dd>
        <dt>{tr('REQUESTER')}</dt><dd>{details.booking.customer_name} · {details.booking.customer_email}</dd>
        <dt>{tr('TIME')}</dt><dd>{format(details.booking.start, details.booking.timezone)} – {format(details.booking.end, details.booking.timezone)} ({details.booking.timezone})</dd>
        <dt>{tr('STATUS')}</dt><dd><span class="status-badge status-badge--{details.booking.status}">{statusLabel(details.booking.status)}</span></dd>
        <dt>{tr('REQUESTER_NOTE')}</dt><dd>{details.booking.customer_note || '—'}</dd>
        <dt>{tr('ADMINISTRATOR_NOTE')}</dt><dd>{details.booking.admin_note || '—'}</dd>
      </dl>
      <h3 class="booking-detail-subheading">{tr('HISTORY')}</h3>
      {#if details.events.length}<ul class="booking-detail-list">{#each details.events as item}<li><time>{format(item.happened_at)}</time> · {translate(adminLocale, 'PLUGIN_BOOKING.ADMIN.UI.EVENT_BY_ACTOR', { action: eventLabel(item.action), actor: item.actor })}</li>{/each}</ul>{:else}<p class="booking-detail-empty">{tr('NO_EVENTS_RECORDED')}</p>{/if}
      <h3 class="booking-detail-subheading">{tr('EMAIL_DELIVERY')}</h3>
      {#if details.notifications.length}<ul class="booking-detail-list">{#each details.notifications as item}<li><strong>{eventLabel(item.event)}</strong> {tr('TO')} {item.recipient || tr('REDACTED')}: {notificationStatus(item.status)}{#if item.last_error} — {item.last_error}{/if}</li>{/each}</ul>{:else}<p class="booking-detail-empty">{tr('NO_EMAIL_NOTIFICATIONS_QUEUED')}</p>{/if}
      <div class="booking-dialog__actions">
        {#if details.booking.status !== 'verification_pending'}<button type="button" class="btn btn-secondary" onclick={() => details && void sendPaymentInformation(details.booking)}>{tr('SEND_PAYMENT_INFORMATION')}</button>{/if}
        <button type="button" class="btn btn-secondary" onclick={() => detailDialog.close()}>{tr('CLOSE')}</button>
      </div>
    {/if}
  </dialog>
</main>
