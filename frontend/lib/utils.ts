import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  let url =
    process.env?.NEXT_PUBLIC_BASE_URL ??
    process.env?.VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  // Make sure to remove trailing `/`.
  if (url.endsWith('/')) url = url.slice(0, -1)
  return url
}
