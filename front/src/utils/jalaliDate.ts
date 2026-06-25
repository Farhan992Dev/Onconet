/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

function isJalaliYear(year: number): boolean {
  return year >= 1300 && year <= 1500;
}

function parseGregorianDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const slashMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (slashMatch) {
    const year = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    const day = Number(slashMatch[3]);

    if (isJalaliYear(year)) {
      return null;
    }

    if (year >= 1900 && year <= 2100) {
      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function formatJalaliParts(year: string, month: string, day: string): string {
  return toPersianDigits(`${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`);
}

function formatExistingJalali(value: string): string {
  const match = value.trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) {
    return value;
  }

  return formatJalaliParts(match[1], match[2], match[3]);
}

export function formatJalaliDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  const jalaliMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (jalaliMatch && isJalaliYear(Number(jalaliMatch[1]))) {
    return formatExistingJalali(trimmed);
  }

  const gregorianDate = parseGregorianDate(trimmed);
  if (!gregorianDate) {
    return trimmed;
  }

  const parts = new Intl.DateTimeFormat('en-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(gregorianDate);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return trimmed;
  }

  return formatJalaliParts(year, month, day);
}
