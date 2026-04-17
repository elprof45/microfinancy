'use client'

import { ReactNode } from 'react'

export type WorkflowStatus = 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'ANNULE' | 'REMBOURSE'

interface StatusBadgeProps {
  status: WorkflowStatus
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const statusConfig: Record<WorkflowStatus, { label: string; bgColor: string; textColor: string; icon: ReactNode }> = {
  EN_ATTENTE: {
    label: 'En attente',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: '⏳',
  },
  VALIDE: {
    label: 'Validé',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: '✓',
  },
  REJETE: {
    label: 'Rejeté',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '✕',
  },
  ANNULE: {
    label: 'Annulé',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: '○',
  },
  REMBOURSE: {
    label: 'Remboursé',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: '✓✓',
  },
}

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

export function WorkflowStatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizeClass = sizeConfig[size]

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded ${config.bgColor} ${config.textColor} ${sizeClass}`}>
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  )
}

/**
 * Get color class for status (for use in other components)
 */
export function getStatusColor(status: WorkflowStatus): string {
  return statusConfig[status].bgColor
}

/**
 * Get label for status
 */
export function getStatusLabel(status: WorkflowStatus): string {
  return statusConfig[status].label
}
