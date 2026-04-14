import { RecurrenceFrequency } from '@prisma/client';
import dayjs from 'dayjs';

export function toDate(value?: string | Date | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  return dayjs(value).toDate();
}

export function addFrequency(
  date: dayjs.Dayjs,
  frequency: RecurrenceFrequency,
  interval = 1,
) {
  switch (frequency) {
    case RecurrenceFrequency.DAILY:
      return date.add(interval, 'day');
    case RecurrenceFrequency.WEEKLY:
      return date.add(interval, 'week');
    case RecurrenceFrequency.MONTHLY:
      return date.add(interval, 'month');
    case RecurrenceFrequency.YEARLY:
      return date.add(interval, 'year');
  }
}
