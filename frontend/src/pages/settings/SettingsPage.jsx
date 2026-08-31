/**
 * Acuity — Shared Account Settings Page
 *
 * Reusable account settings interface for Student, Faculty, and Admin roles.
 * Purely frontend UI demonstration with placeholders for future Cognito/PostgreSQL integration.
 */

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saveNotice, setSaveNotice] = useState('')

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    institution: user?.tenant || 'University of Santo Tomas',
    group: user?.group || 'Department of Biological Sciences',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    defaultPetriDishDiameter: '90mm',
    measurementUnit: 'millimeters',
    notifyOnRemarks: true,
    notifyOnValidation: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (saveNotice) setSaveNotice('')
  }

  const handleMockSave = (e) => {
    e.preventDefault()
    setSaveNotice('Settings placeholder saved (Frontend demo state).')
    setTimeout(() => setSaveNotice(''), 4000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your profile, authentication preferences, and calibration defaults."
      />

      {/* Tabs Navigation */}
      <div className="flex border-b border-surface-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'profile'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'account'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Account & Security
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'preferences'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Preferences & Calibration
        </button>
      </div>

      {/* Feedback Banner */}
      {saveNotice && (
        <div className="p-3.5 rounded-xl bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-800 flex items-center justify-between">
          <span>{saveNotice}</span>
          <button
            type="button"
            onClick={() => setSaveNotice('')}
            className="text-primary-600 hover:text-primary-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 1. Profile Tab ── */}
      {activeTab === 'profile' && (
        <Card title="User Profile" subtitle="Information visible within your research cohort and adviser review.">
          <form onSubmit={handleMockSave} className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-surface-100">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-full object-cover border border-surface-200 shadow-2xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl border border-primary-200">
                  {user?.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-surface-900">{user?.displayName}</h3>
                <p className="text-xs text-surface-500">{user?.title || user?.role}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-100 text-[11px] font-medium text-surface-600">
                  Role: <span className="font-semibold text-primary-700 capitalize">{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Your Full Name"
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@university.edu"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Academic Institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="University / Institute"
              />
              <Input
                label="Department / Thesis Group"
                name="group"
                value={formData.group}
                onChange={handleChange}
                placeholder="Department or Group Name"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── 2. Account & Security Tab ── */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <Card title="Password & Security" subtitle="Credentials managed via backend-mediated AWS Cognito authentication.">
            <form onSubmit={handleMockSave} className="space-y-4">
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                placeholder="••••••••••••"
                value={formData.currentPassword}
                onChange={handleChange}
                helpText="Enter your current password to confirm changes."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary">
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Multi-Factor Authentication (MFA)" subtitle="Protects your research datasets and audit trail integrity.">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 border border-surface-200">
              <div>
                <div className="text-sm font-semibold text-surface-900">Email OTP Verification</div>
                <div className="text-xs text-surface-500">6-digit verification code sent during sensitive logins</div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                Active
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* ── 3. Preferences & Calibration Tab ── */}
      {activeTab === 'preferences' && (
        <Card title="Analysis & Measurement Preferences" subtitle="Default spatial parameters and notification thresholds.">
          <form onSubmit={handleMockSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Standard Petri Dish Calibration Base
              </label>
              <select
                name="defaultPetriDishDiameter"
                value={formData.defaultPetriDishDiameter}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 rounded-lg border border-surface-300 bg-white text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="90mm">Standard 90mm Petri Dish (Standard Microbiology Reference)</option>
                <option value="60mm">60mm Petri Dish (Small Batch)</option>
                <option value="150mm">150mm Large Plate Format</option>
              </select>
              <p className="mt-1 text-xs text-surface-500">
                Spatial calibration converts pixel diameter coordinates to real millimeters.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Preferred Measurement Unit
              </label>
              <select
                name="measurementUnit"
                value={formData.measurementUnit}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 rounded-lg border border-surface-300 bg-white text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="millimeters">Millimeters (mm & mm²)</option>
                <option value="micrometers">Micrometers (µm)</option>
                <option value="pixels">Raw Pixels (px)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-surface-100 space-y-3">
              <div className="text-sm font-semibold text-surface-900">Email Notifications</div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifyOnRemarks"
                  checked={formData.notifyOnRemarks}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-700">Notify me when faculty advisers submit review remarks</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifyOnValidation"
                  checked={formData.notifyOnValidation}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-700">Notify me when a project batch is approved and data is frozen</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary">
                Save Preferences
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
