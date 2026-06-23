import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n))
}

export function pct(n: number) {
  return `${Math.round(clamp(n))}%`
}
