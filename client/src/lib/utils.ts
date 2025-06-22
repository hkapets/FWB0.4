import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { uk, enUS, pl } from "date-fns/locale";

const locales: { [key: string]: Locale } = { uk, en: enUS, pl };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMultilingualValue(
  field: unknown,
  lang: string,
  fallback = ""
): string {
  if (typeof field === "string") {
    return field;
  }
  if (typeof field === "object" && field !== null) {
    const typedField = field as Record<string, string>;
    return typedField[lang] || typedField.uk || typedField.en || fallback;
  }
  return fallback;
}

export function formatTimeAgo(
  date: string | Date,
  lang: string = "uk"
): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffInMs < minute) {
    return "Just now";
  } else if (diffInMs < hour) {
    const minutes = Math.floor(diffInMs / minute);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else if (diffInMs < day) {
    const hours = Math.floor(diffInMs / hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (diffInMs < week) {
    const days = Math.floor(diffInMs / day);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (diffInMs < month) {
    const weeks = Math.floor(diffInMs / week);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else if (diffInMs < year) {
    const months = Math.floor(diffInMs / month);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  } else {
    const years = Math.floor(diffInMs / year);
    return `${years} year${years === 1 ? "" : "s"} ago`;
  }
}

export function getDangerLevelColor(
  dangerLevel: string | undefined | null
): string {
  if (!dangerLevel || typeof dangerLevel !== "string") {
    return "danger-safe";
  }
  switch (dangerLevel.toLowerCase()) {
    case "safe":
      return "danger-safe";
    case "protected":
      return "danger-protected";
    case "dangerous":
      return "danger-dangerous";
    default:
      return "danger-safe";
  }
}
