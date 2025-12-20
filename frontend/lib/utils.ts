import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  let url =
    process.env?.NEXT_PUBLIC_BASE_URL ??
    process.env?.VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000'

  // Make sure to include `http` prefix if missing
  if (!url.startsWith('http')) {
    url = `https://${url}`
  }

  // Remove trailing slash
  return url.replace(/\/$/, '')
}
