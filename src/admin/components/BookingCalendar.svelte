<script lang="ts">
  import { dateLocale, translate, weekdayName } from '../i18n';
  import { toLocalInput } from '../dates';
  import type { Booking } from '../types';

  type CalendarDay = { date: string; day: number; inMonth: boolean };
  type CalendarEntry = { booking: Booking; start: string; end: string; startDate: string; lastDate: string };

  export let bookings: Booking[] = [];
  export let loading = false;
  export let month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  export let locale = 'en';
  export let statusLabel: (status: Booking['status']) => string;
  export let onMonthChange: (direction: number) => void;
  export let onToday: () => void;
  export let onSelectBooking: (booking: Booking) => void;

  let days: CalendarDay[] = [];
  let entries: CalendarEntry[] = [];
  let monthEntries: CalendarEntry[] = [];
  let eventsByDay = new Map<string, CalendarEntry[]>();
  let weekdays: string[] = [];
  let monthLabel = '';
  let todayKey = '';
  const tr = (key: string) => translate(locale, `PLUGIN_BOOKING.ADMIN.UI.${key}`);

  $: days = buildCalendarDays(month);
  $: entries = bookings.map(toCalendarEntry);
  $: monthEntries = entries
    .filter((entry) => entry.startDate < dateKey(new Date(month.getFullYear(), month.getMonth() + 1, 1))
      && entry.lastDate >= dateKey(new Date(month.getFullYear(), month.getMonth(), 1)))
    .sort((first, second) => first.start.localeCompare(second.start));
  $: eventsByDay = buildEventsByDay(days, entries);
  $: weekdays = Array.from({ length: 7 }, (_, index) => weekdayName(locale, index, true));
  $: monthLabel = new Intl.DateTimeFormat(dateLocale(locale), { month: 'long', year: 'numeric' }).format(month);
  $: todayKey = dateKey(new Date());

  function dateKey(date: Date): string {
    const year = date.getFullYear();
    const monthNumber = String(date.getMonth() + 1).padStart(2, '0');
    const dayNumber = String(date.getDate()).padStart(2, '0');
    return `${year}-${monthNumber}-${dayNumber}`;
  }

  function buildCalendarDays(value: Date): CalendarDay[] {
    const year = value.getFullYear();
    const monthIndex = value.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const monthLength = new Date(year, monthIndex + 1, 0).getDate();
    const cellCount = Math.ceil((mondayOffset + monthLength) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) => {
      const date = new Date(year, monthIndex, 1 - mondayOffset + index);
      return { date: dateKey(date), day: date.getDate(), inMonth: date.getMonth() === monthIndex };
    });
  }

  function localDateTime(value: string, timezone: string): string {
    try {
      return toLocalInput(value, timezone);
    } catch {
      return value.replace(/Z$/, '').slice(0, 16);
    }
  }

  function previousDateKey(value: string): string {
    const [year, monthNumber, dayNumber] = value.split('-').map(Number);
    return dateKey(new Date(year, monthNumber - 1, dayNumber - 1));
  }

  function toCalendarEntry(booking: Booking): CalendarEntry {
    const timezone = booking.timezone || 'UTC';
    const start = localDateTime(booking.start, timezone);
    const end = localDateTime(booking.end, timezone);
    const startDate = start.slice(0, 10);
    const endDate = end.slice(0, 10);
    const lastDate = end.slice(11, 16) === '00:00' && endDate > startDate
      ? previousDateKey(endDate)
      : endDate;
    return { booking, start, end, startDate, lastDate };
  }

  function buildEventsByDay(calendarDays: CalendarDay[], calendarEntries: CalendarEntry[]): Map<string, CalendarEntry[]> {
    const result = new Map<string, CalendarEntry[]>();
    for (const day of calendarDays) {
      result.set(day.date, calendarEntries
        .filter((entry) => entry.startDate <= day.date && entry.lastDate >= day.date)
        .sort((first, second) => first.start.localeCompare(second.start)));
    }
    return result;
  }

  function timeLabel(entry: CalendarEntry, date: string): string {
    if (entry.startDate === date && entry.lastDate === date) return `${entry.start.slice(11, 16)}–${entry.end.slice(11, 16)}`;
    if (entry.startDate === date) return `${entry.start.slice(11, 16)} →`;
    if (entry.lastDate === date) return `← ${entry.end.slice(11, 16)}`;
    return '↔';
  }

  function bookingTitle(entry: CalendarEntry): string {
    const booking = entry.booking;
    const place = booking.resource_name ? `${booking.facility_name} · ${booking.resource_name}` : booking.facility_name;
    return `${entry.start.slice(0, 16).replace('T', ' ')} – ${entry.end.slice(0, 16).replace('T', ' ')} · ${booking.customer_name} · ${place} · ${statusLabel(booking.status)}`;
  }

  function summaryDate(entry: CalendarEntry): string {
    const formatter = new Intl.DateTimeFormat(dateLocale(locale), {
      month: 'short', day: 'numeric', timeZone: entry.booking.timezone || 'UTC',
    });
    const start = formatter.format(new Date(entry.booking.start));
    const end = formatter.format(new Date(entry.booking.end));
    return start === end ? start : `${start} – ${end}`;
  }

  function bookingAriaLabel(entry: CalendarEntry, date: string): string {
    return `${bookingTitle(entry)} · ${date}`;
  }
</script>

<section class="booking-calendar" aria-label={tr('BOOKING_CALENDAR')}>
  <div class="booking-calendar__heading">
    <div class="booking-calendar__month-nav">
      <button class="btn btn-secondary" type="button" aria-label={tr('PREVIOUS_MONTH')} title={tr('PREVIOUS_MONTH')} onclick={() => onMonthChange(-1)}><i class="fa fa-chevron-left" aria-hidden="true"></i></button>
      <h3>{monthLabel}</h3>
      <button class="btn btn-secondary" type="button" aria-label={tr('NEXT_MONTH')} title={tr('NEXT_MONTH')} onclick={() => onMonthChange(1)}><i class="fa fa-chevron-right" aria-hidden="true"></i></button>
      <button class="btn btn-secondary" type="button" onclick={onToday}>{tr('TODAY')}</button>
    </div>
    <div class="booking-calendar__legend" aria-label={tr('BOOKING_STATUS_LEGEND')}>
      {#each ['confirmed', 'pending', 'verification_pending', 'rejected', 'cancelled'] as status}
        <span class="booking-calendar__legend-item"><span class="booking-calendar__legend-dot booking-calendar__legend-dot--{status}" aria-hidden="true"></span>{statusLabel(status as Booking['status'])}</span>
      {/each}
    </div>
  </div>
  {#if loading}<p class="booking-calendar__loading" role="status">{tr('LOADING_CALENDAR')}</p>{/if}
  {#if !loading && monthEntries.length}
    <section class="booking-calendar__month-bookings" aria-label={tr('BOOKINGS_THIS_MONTH')}>
      <div class="booking-calendar__month-bookings-heading"><strong>{tr('BOOKINGS_THIS_MONTH')}</strong><span>{monthEntries.length}</span></div>
      <div class="booking-calendar__month-bookings-list">
        {#each monthEntries as entry (entry.booking.id)}
          <button class="booking-calendar__summary-event booking-calendar__event--{entry.booking.status}" type="button" title={bookingTitle(entry)} aria-label={bookingTitle(entry)} onclick={() => onSelectBooking(entry.booking)}>
            <strong>{summaryDate(entry)}</strong>
            <span>{entry.booking.customer_name}</span>
            <span>{entry.booking.facility_name}{entry.booking.resource_name ? ` · ${entry.booking.resource_name}` : ''}</span>
            <span class="booking-calendar__event-status">{statusLabel(entry.booking.status)}</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}
  <div class="booking-calendar__scroll">
    <div class="booking-calendar__weekdays" aria-hidden="true">
      {#each weekdays as weekday}<span>{weekday}</span>{/each}
    </div>
    <div class="booking-calendar__grid">
      {#each days as day (day.date)}
        {@const dayBookings = eventsByDay.get(day.date) || []}
        <div class="booking-calendar__day" class:booking-calendar__day--outside={!day.inMonth} class:booking-calendar__day--today={day.date === todayKey}>
          <div class="booking-calendar__day-heading"><span>{day.day}</span>{#if dayBookings.length}<span class="booking-calendar__day-count">{dayBookings.length}</span>{/if}</div>
          {#if dayBookings.length}
            <div class="booking-calendar__events">
              {#each dayBookings as entry (entry.booking.id)}
                <button class="booking-calendar__event booking-calendar__event--{entry.booking.status}" type="button" title={bookingTitle(entry)} aria-label={bookingAriaLabel(entry, day.date)} onclick={() => onSelectBooking(entry.booking)}>
                  <span class="booking-calendar__event-title"><strong>{timeLabel(entry, day.date)}</strong> {entry.booking.customer_name}</span>
                  <span class="booking-calendar__event-place">{entry.booking.facility_name}{entry.booking.resource_name ? ` · ${entry.booking.resource_name}` : ''}</span>
                  <span class="booking-calendar__event-status">{statusLabel(entry.booking.status)}</span>
                </button>
              {/each}
            </div>
          {:else if day.inMonth && !loading}
            <span class="booking-calendar__empty-day">{tr('NO_BOOKINGS_DAY')}</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
