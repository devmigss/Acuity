import Swal from 'sweetalert2';

// Check user's motion preference
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Base custom classes matching Acuity design tokens
export const BASE_CUSTOM_CLASS = {
  popup: 'rounded-2xl border border-surface-200 shadow-xl bg-white p-6 font-sans text-surface-900',
  title: 'text-lg font-bold text-surface-900 mb-2 font-sans',
  htmlContainer: 'text-sm text-surface-600 mb-4 font-sans leading-relaxed',
  confirmButton:
    'px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all cursor-pointer mr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  cancelButton:
    'px-5 py-2.5 rounded-xl font-medium text-sm text-surface-700 bg-surface-100 hover:bg-surface-200 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-surface-400 focus:ring-offset-2',
  denyButton:
    'px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-danger-600 hover:bg-danger-700 active:scale-95 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2',
  input:
    'w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all',
};

// Base configuration matching Acuity design tokens
const baseSwal = Swal.mixin({
  animation: !prefersReducedMotion,
  buttonsStyling: false,
  customClass: BASE_CUSTOM_CLASS,
});

// Toast notification mixin
const ToastMixin = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  showCloseButton: true,
  timerProgressBar: true,
  animation: !prefersReducedMotion,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'rounded-xl border border-surface-200 shadow-lg bg-white p-3.5 text-surface-900 text-sm font-sans flex items-center',
    title: 'text-sm font-medium text-surface-900 ml-2',
    closeButton: 'text-surface-400 hover:text-surface-600 focus:outline-none',
  },
});

/**
 * Success toast (3 seconds)
 */
export function toastSuccess(message) {
  return ToastMixin.fire({
    icon: 'success',
    title: message,
    timer: 3000,
  });
}

/**
 * Error toast (5 seconds)
 */
export function toastError(message) {
  return ToastMixin.fire({
    icon: 'error',
    title: message,
    timer: 5000,
  });
}

/**
 * Information toast (3 seconds)
 */
export function toastInfo(message) {
  return ToastMixin.fire({
    icon: 'info',
    title: message,
    timer: 3000,
  });
}

/**
 * Standard confirmation modal (Action / Discard / Cancel)
 * @returns {Promise<boolean>} Resolves to true if confirmed, false otherwise
 */
export async function confirmAction({
  title = 'Are you sure?',
  text = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  triggerElement = null,
} = {}) {
  const result = await baseSwal.fire({
    title,
    text, // Never use html: for user text
    icon: danger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: danger,
    customClass: {
      ...BASE_CUSTOM_CLASS,
      confirmButton: danger
        ? 'px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-danger-600 hover:bg-danger-700 active:scale-95 transition-all cursor-pointer mr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2'
        : BASE_CUSTOM_CLASS.confirmButton,
    },
  });

  if (triggerElement && typeof triggerElement.focus === 'function') {
    triggerElement.focus();
  }

  return result.isConfirmed;
}

/**
 * Typed confirmation modal (e.g. for Account Deactivation)
 * Requires exact text match before the action completes
 * @returns {Promise<boolean>}
 */
export async function confirmTyped({
  title = 'Confirm Deactivation',
  text = 'This action cannot be undone.',
  expected = 'DEACTIVATE',
  confirmText = 'Deactivate Account',
  cancelText = 'Cancel',
} = {}) {
  const result = await baseSwal.fire({
    title,
    text: `${text}\n\nType "${expected}" below to proceed:`,
    icon: 'warning',
    input: 'text',
    inputPlaceholder: expected,
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off',
    },
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      ...BASE_CUSTOM_CLASS,
      confirmButton:
        'px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-danger-600 hover:bg-danger-700 active:scale-95 transition-all cursor-pointer mr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2',
    },
    preConfirm: (inputValue) => {
      if ((inputValue || '').trim() !== expected) {
        Swal.showValidationMessage(`Please type "${expected}" exactly to confirm.`);
        return false;
      }
      return true;
    },
  });

  return result.isConfirmed;
}

/**
 * Blocking error modal with optional retry button
 * @returns {Promise<boolean>} Resolves to true if retry clicked, false otherwise
 */
export async function errorModal({
  title = 'Something went wrong',
  text = 'An unexpected error occurred. Please try again.',
  retry = false,
  confirmText = 'OK',
  retryText = 'Try Again',
} = {}) {
  const result = await baseSwal.fire({
    icon: 'error',
    title,
    text,
    showCancelButton: retry,
    confirmButtonText: retry ? retryText : confirmText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Display a loading modal with spinner
 */
export function showLoading(title = 'Processing...') {
  return baseSwal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

/**
 * Close any active modal
 */
export function closeAlert() {
  Swal.close();
}
