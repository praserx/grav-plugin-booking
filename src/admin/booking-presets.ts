import type { BookingInterface, BookingEntryMode } from './types';

export function defaultBookingInterface(defaultMode: BookingEntryMode = 'custom', locale = 'en'): BookingInterface {
  const periods = locale.toLowerCase().startsWith('cs')
    ? ['Ráno', 'Odpoledne', 'Celý den']
    : ['Morning', 'Afternoon', 'Full day'];
  return {
    default_mode: defaultMode,
    whole_day_start_time: '12:00',
    whole_day_end_time: '12:00',
    resource_slots: [
      { id: 'morning', label: periods[0], start_time: '08:00', end_time: '12:00' },
      { id: 'afternoon', label: periods[1], start_time: '12:00', end_time: '18:00' },
      { id: 'full-day', label: periods[2], start_time: '08:00', end_time: '18:00' },
    ],
  };
}

export function bookingInterfaceFor(value?: BookingInterface, locale = 'en'): Required<BookingInterface> {
  const defaults = defaultBookingInterface('custom', locale);
  return {
    default_mode: value?.default_mode === 'simple' ? 'simple' : 'custom',
    whole_day_start_time: value?.whole_day_start_time || defaults.whole_day_start_time!,
    whole_day_end_time: value?.whole_day_end_time || defaults.whole_day_end_time!,
    resource_slots: Array.isArray(value?.resource_slots) && value.resource_slots.length > 0
      ? value.resource_slots
      : defaults.resource_slots!,
  };
}
