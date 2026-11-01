<script lang="ts">
  import { bookingInterfaceFor } from '../booking-presets';
  import { toInstant, toLocalInput } from '../dates';
  import { translate } from '../i18n';
  import type { Booking, BookingEntryMode, BookingInterface, Facility, ResourceBookingSlot } from '../types';

  export let open = false;
  export let booking: Booking | null = null;
  export let facilities: Facility[] = [];
  export let locale = 'en';
  export let onSave: (values: FormData) => void | Promise<void>;
  export let onClose: () => void;

  let dialog: HTMLDialogElement;
  let formElement: HTMLFormElement;
  let hydratedBooking = '';
  let facilityId = '';
  let resourceId = '';
  let start = '';
  let end = '';
  let entryMode: BookingEntryMode = 'custom';
  let checkInDate = '';
  let checkOutDate = '';
  let resourceSlotId = '';
  let selectedFacility: Facility | undefined;
  let bookingInterface: Required<BookingInterface> = bookingInterfaceFor();
  let usesResourceSlots = false;
  let selectedSlot: ResourceBookingSlot | undefined;
  let simpleRange = { start: '', end: '' };
  let simpleError = '';
  const tr = (key: string) => translate(locale, `PLUGIN_BOOKING.ADMIN.UI.${key}`);

  $: selectedFacility = facilities.find((facility) => facility.id === facilityId);
  $: bookingInterface = bookingInterfaceFor(selectedFacility?.booking_interface, locale);
  $: usesResourceSlots = selectedFacility?.booking_mode === 'resources'
    || (selectedFacility?.booking_mode === 'both' && Boolean(resourceId));
  $: selectedSlot = bookingInterface.resource_slots.find((slot) => slot.id === resourceSlotId);
  $: simpleRange = makeSimpleRange(selectedFacility, bookingInterface, usesResourceSlots, checkInDate, checkOutDate, selectedSlot);
  $: simpleError = entryMode === 'simple' ? validateSimpleRange(simpleRange, selectedFacility) : '';

  $: if (dialog && formElement && open && hydratedBooking !== (booking?.id || 'new')) {
    hydratedBooking = booking?.id || 'new';
    formElement.reset();
    facilityId = booking?.facility_id || facilities[0]?.id || '';
    resourceId = booking?.resource_id || '';
    const facility = facilities.find((item) => item.id === facilityId);
    const config = bookingInterfaceFor(facility?.booking_interface, locale);
    const timeZone = booking?.timezone || facility?.timezone || 'UTC';
    if (booking) {
      start = toLocalInput(booking.start, timeZone);
      end = toLocalInput(booking.end, timeZone);
      checkInDate = start.slice(0, 10);
      checkOutDate = end.slice(0, 10);
      resourceSlotId = '';
      const usesRoom = isResourceBooking(facility, resourceId);
      const matchingSlot = usesRoom && checkInDate === checkOutDate
        ? config.resource_slots.find((slot) => slot.start_time === start.slice(11, 16) && slot.end_time === end.slice(11, 16))
        : undefined;
      if (matchingSlot) {
        resourceSlotId = matchingSlot.id;
        entryMode = 'simple';
      } else if (!usesRoom && checkOutDate > checkInDate
        && start.slice(11, 16) === config.whole_day_start_time
        && end.slice(11, 16) === config.whole_day_end_time) {
        entryMode = 'simple';
      } else {
        resourceSlotId = config.resource_slots[0]?.id || '';
        entryMode = 'custom';
      }
    } else {
      start = '';
      end = '';
      checkInDate = '';
      checkOutDate = '';
      resourceSlotId = config.resource_slots[0]?.id || '';
      entryMode = config.default_mode;
    }
  }
  $: if (dialog && open && !dialog.open) dialog.showModal();
  $: if (dialog && !open && dialog.open) dialog.close();

  function isResourceBooking(facility: Facility | undefined, selectedResource: string): boolean {
    return facility?.booking_mode === 'resources'
      || (facility?.booking_mode === 'both' && Boolean(selectedResource));
  }

  function makeSimpleRange(
    facility: Facility | undefined,
    config: Required<BookingInterface>,
    resourceBooking: boolean,
    firstDate: string,
    lastDate: string,
    slot?: ResourceBookingSlot,
  ): { start: string; end: string } {
    if (!facility || !firstDate) return { start: '', end: '' };
    if (resourceBooking) {
      if (!slot) return { start: '', end: '' };
      return { start: `${firstDate}T${slot.start_time}`, end: `${firstDate}T${slot.end_time}` };
    }
    if (!lastDate) return { start: '', end: '' };
    return {
      start: `${firstDate}T${config.whole_day_start_time}`,
      end: `${lastDate}T${config.whole_day_end_time}`,
    };
  }

  function validateSimpleRange(range: { start: string; end: string }, facility?: Facility): string {
    if (!range.start || !range.end || !facility) return '';
    try {
      const startInstant = toInstant(range.start, facility.timezone, {
        missing: tr('ENTER_START_AND_END'), daylightSaving: tr('DAYLIGHT_SAVING_GAP'),
      });
      const endInstant = toInstant(range.end, facility.timezone, {
        missing: tr('ENTER_START_AND_END'), daylightSaving: tr('DAYLIGHT_SAVING_GAP'),
      });
      const duration = (Date.parse(endInstant) - Date.parse(startInstant)) / 1000;
      if (duration <= 0) return tr('CHECKOUT_AFTER_CHECKIN');
      const rules = facility.booking_rules;
      if (rules?.minimum_duration_seconds && duration < rules.minimum_duration_seconds) return tr('SIMPLE_SLOT_TOO_SHORT');
      if (rules?.maximum_duration_seconds && duration > rules.maximum_duration_seconds) return tr('SIMPLE_SLOT_TOO_LONG');
    } catch (error) {
      return error instanceof Error ? error.message : tr('INVALID_SIMPLE_TIME');
    }
    return '';
  }

  function nextDate(date: string): string {
    if (!date) return '';
    const [year, month, day] = date.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  }

  function facilityChanged(event: Event): void {
    facilityId = (event.currentTarget as HTMLSelectElement).value;
    resourceId = '';
    checkInDate = '';
    checkOutDate = '';
    start = '';
    end = '';
    const facility = facilities.find((item) => item.id === facilityId);
    const config = bookingInterfaceFor(facility?.booking_interface, locale);
    resourceSlotId = config.resource_slots[0]?.id || '';
    entryMode = config.default_mode;
  }

  function close(): void {
    hydratedBooking = '';
    onClose();
  }

  function submit(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    void onSave(new FormData(form));
  }
</script>

<dialog class="booking-dialog" lang={locale} bind:this={dialog} onclose={close}>
  <form class="booking-dialog__form" bind:this={formElement} onsubmit={submit}>
    <div class="booking-dialog__heading">
      <div><p class="booking-eyebrow">{tr('BOOKING')}</p><h2>{booking ? tr('EDIT_BOOKING') : tr('NEW_BOOKING')}</h2></div>
      <button type="button" class="btn btn-icon btn-secondary" aria-label={tr('CLOSE')} onclick={close}>&times;</button>
    </div>
    <div class="booking-form-grid">
      <label>{tr('FACILITY')}
        <select class="form-select" name="facility_id" value={facilityId} onchange={facilityChanged} required>
          <option value="">{tr('CHOOSE_FACILITY')}</option>
          {#each facilities as facility (facility.id)}<option value={facility.id}>{facility.name}</option>{/each}
        </select>
      </label>
      {#if selectedFacility?.booking_mode !== 'facility'}
        <label>{tr('ROOM_OR_RESOURCE')}
          <select class="form-select" name="resource_id" bind:value={resourceId} required={selectedFacility?.booking_mode === 'resources'}>
            <option value="">{selectedFacility?.booking_mode === 'resources' ? tr('CHOOSE_ROOM') : tr('FACILITY_BOOKING')}</option>
            {#each selectedFacility?.resources || [] as resource (resource.id)}
              {#if resource.enabled !== false}<option value={resource.id}>{resource.name}</option>{/if}
            {/each}
          </select>
        </label>
      {:else}
        <input type="hidden" name="resource_id" value="" />
      {/if}
    </div>

    <fieldset class="booking-entry-mode">
      <legend>{tr('BOOKING_TIME_MODE')}</legend>
      <label class="form-check"><input class="form-check-input" type="radio" name="entry_mode" value="simple" checked={entryMode === 'simple'} onchange={() => entryMode = 'simple'} />{tr('SIMPLE_MODE')}</label>
      <label class="form-check"><input class="form-check-input" type="radio" name="entry_mode" value="custom" checked={entryMode === 'custom'} onchange={() => entryMode = 'custom'} />{tr('CUSTOM_MODE')}</label>
    </fieldset>

    {#if entryMode === 'simple'}
      <div class="booking-form-grid">
        {#if usesResourceSlots}
          <label>{tr('BOOKING_DATE')}<input class="form-control" type="date" bind:value={checkInDate} required /></label>
          <label>{tr('BOOKING_PERIOD')}
            <select class="form-select" bind:value={resourceSlotId} required>
              <option value="">{tr('CHOOSE_PERIOD')}</option>
              {#each bookingInterface.resource_slots as slot (slot.id)}
                <option value={slot.id}>{slot.label} ({slot.start_time}–{slot.end_time})</option>
              {/each}
            </select>
          </label>
        {:else}
          <label>{tr('CHECK_IN_DATE')}<input class="form-control" type="date" bind:value={checkInDate} required /></label>
          <label>{tr('CHECK_OUT_DATE')}<input class="form-control" type="date" bind:value={checkOutDate} min={nextDate(checkInDate)} required /></label>
          {#if selectedFacility}<p class="booking-form-grid__wide booking-simple-help">{tr('WHOLE_DAY_TIME_HELP')} {bookingInterface.whole_day_start_time} – {bookingInterface.whole_day_end_time}</p>{/if}
        {/if}
      </div>
      {#if simpleError}<p class="booking-alert booking-alert--warning" role="alert">{simpleError}</p>{/if}
      <input type="hidden" name="start" value={simpleRange.start} />
      <input type="hidden" name="end" value={simpleRange.end} />
    {:else}
      <div class="booking-form-grid">
        <label>{tr('START')}<input class="form-control" name="start" type="datetime-local" bind:value={start} required /></label>
        <label>{tr('END')}<input class="form-control" name="end" type="datetime-local" bind:value={end} required /></label>
      </div>
    {/if}

    <div class="booking-form-grid">
      <label>{tr('REQUESTER_NAME')}<input class="form-control" name="customer_name" value={booking?.customer_name || ''} maxlength="255" required /></label>
      <label>{tr('REQUESTER_EMAIL')}<input class="form-control" name="customer_email" type="email" value={booking?.customer_email || ''} maxlength="255" required /></label>
      <label>{tr('PHONE')}<input class="form-control" name="customer_phone" value={booking?.customer_phone || ''} maxlength="50" /></label>
      {#if !booking}
        <label>{tr('STATUS')}
          <select class="form-select" name="status"><option value="pending">{tr('PENDING_APPROVAL')}</option><option value="confirmed">{translate(locale, 'PLUGIN_BOOKING.ADMIN.STATUS_CONFIRMED')}</option></select>
        </label>
      {/if}
      <label class="booking-form-grid__wide">{tr('REQUESTER_NOTE')}<textarea class="form-control" name="customer_note" maxlength="5000">{booking?.customer_note || ''}</textarea></label>
      {#if booking}
        <label class="booking-form-grid__wide">{tr('ADMINISTRATOR_NOTE')}<textarea class="form-control" name="admin_note" maxlength="5000">{booking.admin_note || ''}</textarea></label>
      {/if}
    </div>
    <div class="booking-dialog__actions">
      <button type="button" class="btn btn-secondary" onclick={close}>{tr('CANCEL')}</button>
      <button class="btn btn-primary" type="submit" disabled={entryMode === 'simple' && (!simpleRange.start || !simpleRange.end || Boolean(simpleError))}><i class="fa fa-check" aria-hidden="true"></i> {tr('SAVE_BOOKING')}</button>
    </div>
  </form>
</dialog>
