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

  // If it's a localhost or 127.0.0.1, ensure it's http unless specified
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    if (!url.startsWith('http')) {
      url = `http://${url}`
    }
  } else if (!url.startsWith('http')) {
    url = `https://${url}`
  }

  // Remove trailing slash
  return url.replace(/\/$/, '')
}
