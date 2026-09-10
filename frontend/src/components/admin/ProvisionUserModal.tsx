/**
 * Acuity — ProvisionUserModal (TypeScript Definition & Re-export)
 * Aligned with Figures 3.23 and 3.39 of the Capstone Document.
 */

export interface PlatformUser {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  role: 'Faculty Adviser' | 'System Admin' | string
  tenant: string
  institution?: string
  status: 'Active' | 'Deactivated'
  createdAt: string
  lastActive?: string
}

export interface ProvisionUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export { default } from './ProvisionUserModal'

