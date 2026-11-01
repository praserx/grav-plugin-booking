<script lang="ts">
  import { tick } from 'svelte';
  import { bookingInterfaceFor } from '../booking-presets';
  import { translate } from '../i18n';
  import type { Facility } from '../types';

  export let facility: Facility;
  export let locale = 'en';
  export let onSave: (values: FormData) => void | Promise<void>;
  export let onClose: () => void;

  const events = ['created', 'confirmed', 'rejected', 'cancelled', 'edited'];
  const facilityEvents = facility.notifications?.facility_events || [];
  const requesterEvents = facility.notifications?.requester_events || [];
  const emailTemplates = facility.notifications?.templates || {};
  const tabs = [
    { id: 'general', label: 'TAB_GENERAL' },
    { id: 'booking', label: 'TAB_BOOKING' },
    { id: 'availability', label: 'TAB_AVAILABILITY' },
    { id: 'resources', label: 'TAB_RESOURCES' },
    { id: 'access', label: 'TAB_ACCESS' },
    { id: 'notifications', label: 'TAB_NOTIFICATIONS' },
  ] as const;
  type FacilityTab = (typeof tabs)[number]['id'];
  let activeTab: FacilityTab = 'general';
  const bookingInterface = bookingInterfaceFor(facility.booking_interface, locale);
  let simpleSlots = bookingInterface.resource_slots.map((slot) => ({ ...slot }));
  const groupLabel = (groups: string[] = []) => groups.join(', ');
  const tr = (key: string) => translate(locale, `PLUGIN_BOOKING.ADMIN.UI.${key}`);
  const eventLabel = (event: string) => tr(`EVENT_${event.toUpperCase()}`);
  const resourceText = (resources: Facility['resources'] = []) => resources.map((resource) => {
    const allowed = resource.allowed_groups || resource.access?.allowed_groups || [];
    const instant = resource.instant_approval_groups || resource.access?.instant_approval_groups || [];
    return `${resource.id} | ${resource.name} | ${resource.description || ''} | ${groupLabel(allowed)} | ${groupLabel(instant)} | ${resource.enabled === false ? 'false' : 'true'}`;
  }).join('\n');
  const templateValue = (key: string, fallback = '') => emailTemplates[key] || fallback;

  function addSimpleSlot(): void {
    simpleSlots = [...simpleSlots, {
      id: `slot-${Date.now().toString(36)}-${simpleSlots.length + 1}`,
      label: '', start_time: '09:00', end_time: '17:00',
    }];
  }

  function removeSimpleSlot(id: string): void {
    if (simpleSlots.length <= 1) return;
    simpleSlots = simpleSlots.filter((slot) => slot.id !== id);
  }

  function handleTabKeydown(event: KeyboardEvent, current: FacilityTab): void {
    const currentIndex = tabs.findIndex((tab) => tab.id === current);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = tabs[nextIndex].id;
    activeTab = nextTab;
    document.getElementById(`booking-facility-tab-${nextTab}`)?.focus();
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      const invalidControl = form.querySelector(':invalid') as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      const panel = invalidControl?.closest<HTMLElement>('[data-booking-tab]');
      const invalidTab = panel?.dataset.bookingTab as FacilityTab | undefined;
      if (invalidTab) {
        activeTab = invalidTab;
        await tick();
      }
      invalidControl?.reportValidity();
      return;
    }
    void onSave(new FormData(form));
  }
</script>

<form class="booking-facility-form" novalidate onsubmit={submit}>
  <div class="booking-editor__heading">
    <div>
      <p class="booking-eyebrow">{tr('FACILITY_SETTINGS')}</p>
      <h3>{facility.id ? tr('EDIT_FACILITY') : tr('NEW_FACILITY')}</h3>
    </div>
    <button type="button" class="btn btn-secondary" onclick={onClose}>{tr('CLOSE')}</button>
  </div>

  <div class="booking-tabs booking-facility-tabs" role="tablist" aria-label={tr('FACILITY_SETTINGS_TABS')}>
    {#each tabs as tab (tab.id)}
      <button
        id={`booking-facility-tab-${tab.id}`}
        type="button"
        class:active={activeTab === tab.id}
        class="booking-tab"
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={`booking-facility-panel-${tab.id}`}
        tabindex={activeTab === tab.id ? 0 : -1}
        onclick={() => (activeTab = tab.id)}
        onkeydown={(event) => handleTabKeydown(event, tab.id)}
      >{tr(tab.label)}</button>
    {/each}
  </div>

  <div id="booking-facility-panel-general" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-general" tabindex="0" data-booking-tab="general" hidden={activeTab !== 'general'}>
    <div class="form-grid">
      <label>{tr('FACILITY_ID')}
        <input class="form-control" name="id" value={facility.id} readonly={Boolean(facility.id)} required={!facility.id} pattern="[a-z0-9-]+" />
        {#if !facility.id}<small>{tr('FACILITY_ID_HELP')}</small>{/if}
      </label>
      <label>{tr('NAME')}<input class="form-control" name="name" value={facility.name} required maxlength="255" /></label>
      <label>{tr('DESCRIPTION')}<input class="form-control" name="description" value={facility.description || ''} maxlength="1000" /></label>
      <label>{tr('TIMEZONE')}<input class="form-control" name="timezone" value={facility.timezone} required placeholder="Europe/Prague" /></label>
      <label>{tr('BOOKING_MODE')}
        <select class="form-select" name="booking_mode" value={facility.booking_mode}>
          <option value="facility">{tr('MODE_FACILITY')}</option><option value="resources">{tr('MODE_RESOURCES')}</option><option value="both">{tr('MODE_BOTH')}</option>
        </select>
      </label>
      <label>{tr('DEFAULT_APPROVAL')}
        <select class="form-select" name="approval_mode" value={facility.approval_mode}>
          <option value="manual">{tr('APPROVAL_MANUAL')}</option><option value="automatic">{tr('APPROVAL_AUTOMATIC')}</option>
        </select>
      </label>
      <label class="form-check"><input class="form-check-input" type="checkbox" name="enabled" checked={facility.enabled} />{tr('ENABLED_FOR_BOOKING')}</label>
    </div>
  </div>

  <div id="booking-facility-panel-booking" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-booking" tabindex="0" data-booking-tab="booking" hidden={activeTab !== 'booking'}>
    <fieldset>
      <legend>{tr('SIMPLE_BOOKING_OPTIONS')}</legend>
      <div class="form-grid">
        <label>{tr('DEFAULT_BOOKING_ENTRY')}
          <select class="form-select" name="booking_default_mode" value={bookingInterface.default_mode}>
            <option value="simple">{tr('SIMPLE_MODE')}</option>
            <option value="custom">{tr('CUSTOM_MODE')}</option>
          </select>
          <small>{tr('DEFAULT_BOOKING_ENTRY_HELP')}</small>
        </label>
        <label>{tr('WHOLE_DAY_CHECK_IN')}
          <input class="form-control" type="time" name="whole_day_start_time" value={bookingInterface.whole_day_start_time} required />
        </label>
        <label>{tr('WHOLE_DAY_CHECK_OUT')}
          <input class="form-control" type="time" name="whole_day_end_time" value={bookingInterface.whole_day_end_time} required />
          <small>{tr('WHOLE_DAY_TIME_HELP')}</small>
        </label>
      </div>
      <div class="booking-simple-slots">
        <div class="booking-simple-slots__heading"><div><strong>{tr('ROOM_BOOKING_PERIODS')}</strong><small>{tr('ROOM_BOOKING_PERIODS_HELP')}</small></div>
          <button class="btn btn-sm btn-secondary" type="button" onclick={addSimpleSlot}><i class="fa fa-plus" aria-hidden="true"></i> {tr('ADD_PERIOD')}</button>
        </div>
        {#each simpleSlots as slot (slot.id)}
          <div class="booking-simple-slot">
            <input type="hidden" name="simple_slot_id" value={slot.id} />
            <label>{tr('PERIOD_NAME')}<input class="form-control" name="simple_slot_label" bind:value={slot.label} required maxlength="80" /></label>
            <label>{tr('START')}<input class="form-control" type="time" name="simple_slot_start" bind:value={slot.start_time} required /></label>
            <label>{tr('END')}<input class="form-control" type="time" name="simple_slot_end" bind:value={slot.end_time} required /></label>
            <button class="btn btn-sm btn-danger" type="button" onclick={() => removeSimpleSlot(slot.id)} disabled={simpleSlots.length <= 1}>{tr('REMOVE_PERIOD')}</button>
          </div>
        {/each}
      </div>
    </fieldset>

    <fieldset>
      <legend>{tr('BOOKING_RULES')}</legend>
      <div class="form-grid">
        <label>{tr('MINIMUM_DURATION')}<input class="form-control" type="number" name="minimum_duration" min="1" value={Math.max(1, Math.round((facility.booking_rules?.minimum_duration_seconds || 3600) / 60))} /></label>
        <label>{tr('MAXIMUM_DURATION')}<input class="form-control" type="number" name="maximum_duration" min="1" value={Math.max(1, Math.round((facility.booking_rules?.maximum_duration_seconds || 259200) / 60))} /></label>
        <label>{tr('BOOKING_INTERVAL')}<input class="form-control" type="number" name="booking_interval" min="1" value={Math.max(1, Math.round((facility.booking_rules?.booking_interval_seconds || 1800) / 60))} /></label>
        <label>{tr('MINIMUM_NOTICE')}<input class="form-control" type="number" name="minimum_notice" min="0" value={Math.round((facility.booking_rules?.minimum_advance_notice_seconds || 0) / 3600)} /></label>
        <label>{tr('BOOKING_HORIZON')}<input class="form-control" type="number" name="horizon" min="1" value={Math.max(1, Math.round((facility.booking_rules?.maximum_horizon_seconds || 7776000) / 86400))} /></label>
      </div>
      <p class="booking-muted">{tr('PENDING_BLOCKS')}</p>
    </fieldset>
  </div>

  <div id="booking-facility-panel-availability" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-availability" tabindex="0" data-booking-tab="availability" hidden={activeTab !== 'availability'}>
    <fieldset>
      <legend>{tr('AVAILABILITY_HOURS')}</legend>
      <label>{tr('ONE_RANGE_PER_LINE')}
        <textarea class="form-control" name="windows" rows="3" required>{facility.availability_windows.map((item) => `${item.start} - ${item.end}`).join('\n')}</textarea>
      </label>
      <small>{tr('AVAILABILITY_HELP')} <code>mon 08:00 - fri 18:00</code>.</small>
    </fieldset>
  </div>

  <div id="booking-facility-panel-resources" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-resources" tabindex="0" data-booking-tab="resources" hidden={activeTab !== 'resources'}>
    <fieldset>
      <legend>{tr('ROOMS_AND_RESOURCES')}</legend>
      <label>{tr('ONE_ROOM_PER_LINE')}
        <textarea class="form-control booking-resource-input" name="resources" rows="5">{resourceText(facility.resources)}</textarea>
      </label>
      <small><code>id | name | description | allowed groups | instant approval groups | enabled</code><br />{tr('ROOMS_HELP_PREFIX')} <code>false</code> {tr('ROOMS_HELP_SUFFIX')}</small>
    </fieldset>
  </div>

  <div id="booking-facility-panel-access" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-access" tabindex="0" data-booking-tab="access" hidden={activeTab !== 'access'}>
    <fieldset>
      <legend>{tr('MEMBER_ACCESS')}</legend>
      <label class="form-check booking-fieldset-toggle"><input class="form-check-input" type="checkbox" name="guest_requests" checked={facility.access?.guest_requests !== false} />{tr('ALLOW_GUEST_REQUESTS')}</label>
      <div class="form-grid">
        <label>{tr('ALLOWED_GROUPS')}
          <input class="form-control" name="allowed_groups" value={groupLabel(facility.access?.allowed_groups)} placeholder={tr('ANY_MEMBER_IF_EMPTY')} />
          <small>{tr('COMMA_SEPARATED_GROUPS')}</small>
        </label>
        <label>{tr('INSTANT_APPROVAL_GROUPS')}
          <input class="form-control" name="instant_groups" value={groupLabel(facility.access?.instant_approval_groups)} placeholder={tr('GROUPS_EXAMPLE')} />
          <small>{tr('INSTANT_APPROVAL_HELP')}</small>
        </label>
      </div>
    </fieldset>
  </div>

  <div id="booking-facility-panel-notifications" class="booking-facility-tabpanel" role="tabpanel" aria-labelledby="booking-facility-tab-notifications" tabindex="0" data-booking-tab="notifications" hidden={activeTab !== 'notifications'}>
    <fieldset class="booking-notification-card">
      <legend>{tr('EMAIL_NOTIFICATIONS')}</legend>
      <p class="booking-notification-language-note">{tr('EMAIL_SINGLE_LANGUAGE_NOTE')}</p>
      <div class="booking-notification-controls">
        <label class="form-check booking-fieldset-toggle"><input class="form-check-input" type="checkbox" name="notifications_enabled" checked={facility.notifications?.enabled || false} />{tr('SEND_EMAIL_NOTIFICATIONS')}</label>
        <label class="booking-recipient-field">{tr('FACILITY_ADMIN_EMAILS')}
          <input class="form-control" name="recipients" value={groupLabel(facility.notifications?.admin_recipients)} placeholder="facility@example.org, manager@example.org" />
          <small>{tr('ADMIN_EMAILS_HELP')}</small>
        </label>
      </div>
      <div class="booking-event-groups">
        <section class="booking-event-group">
          <h4>{tr('NOTIFY_FACILITY_CONTACTS')}</h4>
          <div class="booking-check-list">{#each events as event}<label class="form-check-inline"><input class="form-check-input" type="checkbox" name="facility_events" value={event} checked={facilityEvents.includes(event)} />{eventLabel(event)}</label>{/each}</div>
        </section>
        <section class="booking-event-group">
          <h4>{tr('NOTIFY_REQUESTER')}</h4>
          <p>{tr('REQUESTER_REQUIRED_EMAILS_HELP')}</p>
          <div class="booking-check-list">{#each events as event}<label class="form-check-inline"><input class="form-check-input" type="checkbox" name="requester_events" value={event} checked={['created', 'confirmed'].includes(event) || requesterEvents.includes(event)} disabled={['created', 'confirmed'].includes(event)} />{eventLabel(event)}</label>{/each}</div>
        </section>
      </div>
      <details class="booking-email-templates">
        <summary>{tr('CUSTOMIZE_EMAIL_TEMPLATES')}</summary>
        <div class="booking-email-templates__content">
          <p class="booking-email-format-note">{tr('EMAIL_TEMPLATE_HELP')}</p>
          <details class="booking-email-help">
            <summary>{tr('EMAIL_PLACEHOLDERS')}</summary>
            <div class="booking-email-placeholders">
              <code>{'{{ customer.name }}'}</code><code>{'{{ customer.email }}'}</code><code>{'{{ customer.phone }}'}</code>
              <code>{'{{ facility.name }}'}</code><code>{'{{ facility.description }}'}</code>
              <code>{'{{ booking.id }}'}</code><code>{'{{ booking.status }}'}</code><code>{'{{ booking.resource }}'}</code>
              <code>{'{{ booking.start }}'}</code><code>{'{{ booking.end }}'}</code><code>{'{{ booking.timezone }}'}</code><code>{'{{ booking.note }}'}</code>
              <code>{'{{ verification.code }}'}</code><code>{'{{ verification.expires_in_hours }}'}</code><code>{'{{ email.body }}'}</code>
            </div>
          </details>
          <details class="booking-email-layout">
            <summary>{tr('EMAIL_LAYOUT_OVERRIDE')}</summary>
            <p>{tr('EMAIL_LAYOUT_HELP')}</p>
            <label class="booking-email-field">
              <span>{tr('EMAIL_LAYOUT_HTML')}</span>
              <textarea class="form-control booking-email-html" name="template_email_layout_html" rows="10" maxlength="30000">{templateValue('email_layout_html')}</textarea>
            </label>
          </details>

          <h4 class="booking-email-messages-heading">{tr('EMAIL_MESSAGES')}</h4>
          <div class="booking-email-template-grid">
            <section class="booking-email-template-card">
              <h5>{tr('EMAIL_EVENT_VERIFICATION')}</h5>
              <label class="booking-email-field"><span>{tr('VERIFICATION_EMAIL_SUBJECT')}</span><input class="form-control" name="template_verification_subject" value={templateValue('verification_subject', 'Verify your booking request')} maxlength="255" /></label>
              <label class="booking-email-field"><span>{tr('VERIFICATION_EMAIL_BODY')}</span><textarea class="form-control booking-email-html" name="template_verification_body" rows="5" maxlength="30000">{templateValue('verification_body', '<p>Hello {{ customer.name }},</p><p>Enter this code within 24 hours:</p><p><strong>{{ verification.code }}</strong></p><p>Booking reference: {{ booking.id }}</p>')}</textarea></label>
            </section>
            <section class="booking-email-template-card">
              <h5>{tr('EMAIL_EVENT_NEW_REQUEST_ADMIN')}</h5>
              <label class="booking-email-field"><span>{tr('PENDING_ADMIN_EMAIL_SUBJECT')}</span><input class="form-control" name="template_created_admin_subject" value={templateValue('created_admin_subject', 'Booking request received')} maxlength="255" /></label>
              <label class="booking-email-field"><span>{tr('PENDING_ADMIN_EMAIL_BODY')}</span><textarea class="form-control booking-email-html" name="template_created_admin_body" rows="5" maxlength="30000">{templateValue('created_admin_body', '<p>A new verified booking request is waiting for approval.</p><ul><li>{{ facility.name }}</li><li>{{ booking.start }} – {{ booking.end }}</li><li>{{ customer.name }} · {{ customer.email }}</li><li>Booking reference: {{ booking.id }}</li></ul>')}</textarea></label>
            </section>
            <section class="booking-email-template-card">
              <h5>{tr('EMAIL_EVENT_NEW_REQUEST_REQUESTER')}</h5>
              <label class="booking-email-field"><span>{tr('PENDING_REQUESTER_EMAIL_SUBJECT')}</span><input class="form-control" name="template_created_requester_subject" value={templateValue('created_requester_subject', 'Booking request received')} maxlength="255" /></label>
              <label class="booking-email-field"><span>{tr('PENDING_REQUESTER_EMAIL_BODY')}</span><textarea class="form-control booking-email-html" name="template_created_requester_body" rows="5" maxlength="30000">{templateValue('created_requester_body', '<p>Hello {{ customer.name }},</p><p>Your email has been verified and your booking request is waiting for approval.</p><ul><li>{{ facility.name }}</li><li>{{ booking.start }} – {{ booking.end }}</li><li>Booking reference: {{ booking.id }}</li></ul>')}</textarea></label>
            </section>
            <section class="booking-email-template-card">
              <h5>{tr('EMAIL_EVENT_APPROVAL')}</h5>
              <label class="booking-email-field"><span>{tr('APPROVAL_EMAIL_SUBJECT')}</span><input class="form-control" name="template_confirmed_subject" value={templateValue('confirmed_subject')} maxlength="255" /></label>
              <label class="booking-email-field"><span>{tr('APPROVAL_EMAIL_BODY_HTML')}</span><textarea class="form-control booking-email-html" name="template_confirmed_body_html" rows="5" maxlength="30000">{templateValue('confirmed_body_html')}</textarea></label>
            </section>
            <section class="booking-email-template-card">
              <h5>{tr('EMAIL_EVENT_PAYMENT')}</h5>
              <label class="booking-email-field"><span>{tr('PAYMENT_EMAIL_SUBJECT')}</span><input class="form-control" name="template_payment_subject" value={templateValue('payment_subject', 'Payment information')} maxlength="255" /></label>
              <label class="booking-email-field"><span>{tr('PAYMENT_EMAIL_BODY_HTML')}</span><textarea class="form-control booking-email-html" name="template_payment_body_html" rows="5" maxlength="30000">{templateValue('payment_body_html')}</textarea></label>
            </section>
            {#each ['rejected', 'cancelled', 'edited'] as event}
              <section class="booking-email-template-card">
                <h5>{tr(`EMAIL_EVENT_${event.toUpperCase()}`)}</h5>
                <label class="booking-email-field"><span>{tr(`${event.toUpperCase()}_EMAIL_SUBJECT`)}</span><input class="form-control" name={`template_${event}_subject`} value={templateValue(`${event}_subject`)} maxlength="255" /></label>
                <label class="booking-email-field"><span>{tr(`${event.toUpperCase()}_EMAIL_BODY`)}</span><textarea class="form-control booking-email-html" name={`template_${event}_body`} rows="5" maxlength="30000">{templateValue(`${event}_body`)}</textarea></label>
              </section>
            {/each}
          </div>
        </div>
      </details>
    </fieldset>
  </div>

  <div class="booking-editor__actions">
    <button class="btn btn-primary" type="submit"><i class="fa fa-save" aria-hidden="true"></i> {tr('SAVE_FACILITY')}</button>
    <button class="btn btn-secondary" type="button" onclick={onClose}>{tr('CANCEL')}</button>
  </div>
</form>
