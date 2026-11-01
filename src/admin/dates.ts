export function toInstant(localValue: string, zone: string, messages: { missing?: string; daylightSaving?: string } = {}): string {
  if (!localValue) throw new Error(messages.missing || 'Enter both start and end times.');
  const [date, time] = localValue.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const wallTime = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = wallTime;
  const format = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const partsAt = (instant: number) => format.formatToParts(new Date(instant)).reduce<Record<string, number>>((out, item) => {
    if (item.type !== 'literal') out[item.type] = Number(item.value);
    return out;
  }, {});
  for (let i = 0; i < 3; i += 1) {
    const parts = partsAt(candidate);
    candidate += wallTime - Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  }
  const parts = partsAt(candidate);
  if (parts.year !== year || parts.month !== month || parts.day !== day || parts.hour !== hour || parts.minute !== minute) {
    throw new Error(messages.daylightSaving || 'This local time does not exist because of a daylight saving time change.');
  }
  return new Date(candidate).toISOString();
}

export function toLocalInput(instant: string, zone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(instant)).reduce<Record<string, string>>((out, item) => {
    if (item.type !== 'literal') out[item.type] = item.value;
    return out;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatDate(value: string, zone?: string, locale = 'en-GB'): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: zone || undefined,
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleString(locale);
  }
}
