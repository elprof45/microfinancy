import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateString
  }
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(num)
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('fr-FR').format(num)
}

export function truncate(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return '-'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function getStatusColor(status: string | null | undefined): 'success' | 'error' | 'warning' | 'info' {
  if (!status) return 'info'
  const lower = String(status).toLowerCase()
  if (['valide', 'actif', 'active', 'approved', 'ok', 'success'].includes(lower)) return 'success'
  if (['invalide', 'inactif', 'inactive', 'rejected', 'error', 'failed'].includes(lower)) return 'error'
  if (['pending', 'en attente', 'en court', 'processing'].includes(lower)) return 'warning'
  return 'info'
}

export function getStatusBadgeClass(status: string | null | undefined): string {
  const color = getStatusColor(status)
  const baseClass = 'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold'
  const colorClasses = {
    success: 'bg-emerald-100 text-emerald-700',
    error: 'bg-rose-100 text-rose-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-slate-100 text-slate-700',
  }
  return `${baseClass} ${colorClasses[color]}`
}

