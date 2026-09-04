import { prisma } from "@/src/lib/prisma";

const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateOnly(value: string): Date | null {
  if (!DATE_REGEX.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (date.toISOString().slice(0, 10) !== value) {
    return null;
  }

  return date;
}

export function isValidTime(value: string) {
  return TIME_REGEX.test(value);
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function validateTimeRange(
  startTime: string,
  endTime: string
) {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }

  return timeToMinutes(startTime) < timeToMinutes(endTime);
}

export function validateWorkingHours(
  workingHours: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive?: boolean;
  }>
) {
  for (const item of workingHours) {
    if (
      !Number.isInteger(item.dayOfWeek) ||
      item.dayOfWeek < 0 ||
      item.dayOfWeek > 6
    ) {
      return "dayOfWeek must be between 0 and 6";
    }

    if (!validateTimeRange(item.startTime, item.endTime)) {
      return `Invalid time range: ${item.startTime} - ${item.endTime}`;
    }
  }

  for (let day = 0; day <= 6; day++) {
    const periods = workingHours
      .filter(
        (item) =>
          item.dayOfWeek === day &&
          item.isActive !== false
      )
      .sort(
        (a, b) =>
          timeToMinutes(a.startTime) -
          timeToMinutes(b.startTime)
      );

    for (let i = 1; i < periods.length; i++) {
      const previous = periods[i - 1];
      const current = periods[i];

      if (
        timeToMinutes(current.startTime) <
        timeToMinutes(previous.endTime)
      ) {
        return `Overlapping working hours on day ${day}`;
      }
    }
  }

  return null;
}

export async function isDateBlocked(
  doctorId: string,
  date: Date
) {
  const [doctorBlock, clinicBlock] = await Promise.all([
    prisma.doctorScheduleBlock.findUnique({
      where: {
        doctorId_date: {
          doctorId,
          date,
        },
      },
    }),

    prisma.clinicScheduleBlock.findUnique({
      where: {
        date,
      },
    }),
  ]);

  return Boolean(doctorBlock || clinicBlock);
}