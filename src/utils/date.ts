/**
 * Persian Date and Time Utilities
 */

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

export function formatPersianTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${toPersianDigits(hours)}:${toPersianDigits(minutes)}`;
}

export function formatPersianRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 60) {
    return 'همین الان';
  }
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${toPersianDigits(mins)} دقیقه پیش`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${toPersianDigits(hours)} ساعت پیش`;
  }

  // Format with Persian date
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return formatter.format(new Date(timestamp));
  } catch {
    const d = new Date(timestamp);
    return `${toPersianDigits(d.getMonth() + 1)}/${toPersianDigits(d.getDate())}`;
  }
}

export function getPersianCurrentDateString(): { time: string; date: string } {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const time = `${toPersianDigits(hours)}:${toPersianDigits(minutes)}`;

  let date = '';
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    date = formatter.format(now);
  } catch {
    date = 'امروز';
  }

  return { time, date };
}
