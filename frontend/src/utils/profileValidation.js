/**
 * Profile & Account Settings Client Validation
 * Strictly matches server-side rules in utils/validation.js
 */

export const NAME_REGEX = /^\p{L}[\p{L}\p{M}\s.'’-]*$/u;
export const DEPT_GROUP_REGEX = /^[\p{L}\p{M}0-9\s#&(),/-]*$/u;

/**
 * Validates First Name
 * @param {string} value
 * @returns {string|null} Error message or null if valid
 */
export function validateFirstName(value) {
  const trimmed = (value || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return 'Please enter your first name.';
  }
  if (trimmed.length > 50) {
    return 'First name can be up to 50 characters.';
  }
  if (!NAME_REGEX.test(trimmed)) {
    return 'Names can include letters, spaces, hyphens, apostrophes, and periods.';
  }
  return null;
}

/**
 * Validates Last Name
 * @param {string} value
 * @returns {string|null} Error message or null if valid
 */
export function validateLastName(value) {
  const trimmed = (value || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return 'Please enter your last name.';
  }
  if (trimmed.length > 50) {
    return 'Last name can be up to 50 characters.';
  }
  if (!NAME_REGEX.test(trimmed)) {
    return 'Names can include letters, spaces, hyphens, apostrophes, and periods.';
  }
  return null;
}

/**
 * Validates Biography
 * @param {string} value
 * @returns {string|null} Error message or null if valid
 */
export function validateBiography(value) {
  if (!value) return null;
  if (value.length > 500) {
    const diff = value.length - 500;
    return `Your biography can be up to 500 characters. Please shorten it by ${diff}.`;
  }
  return null;
}

/**
 * Validates Department or Laboratory Group
 * @param {string} value
 * @param {string} fieldLabel
 * @returns {string|null} Error message or null if valid
 */
export function validateDeptOrGroup(value, fieldLabel = 'Field') {
  if (!value) return null;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;

  if (trimmed.length > 100) {
    return `${fieldLabel} can be up to 100 characters.`;
  }
  if (!DEPT_GROUP_REGEX.test(trimmed)) {
    return `${fieldLabel} can include letters, numbers, spaces, and # & ( ) / , - symbols.`;
  }
  return null;
}

/**
 * Validates Avatar File client-side before upload
 * @param {File} file
 * @returns {Promise<{ isValid: boolean, error?: string, width?: number, height?: number, dataUrl?: string }>}
 */
export function validateAvatarFile(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ isValid: false, error: 'Please choose an image file.' });
      return;
    }

    // 1. Check MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = (file.name || '').toLowerCase();
    const hasValidExt = validExts.some((ext) => fileName.endsWith(ext));

    if (!validMimes.includes(file.type) || !hasValidExt) {
      resolve({
        isValid: false,
        error: "That file type isn't supported. Please upload a JPG, PNG, or WebP image.",
      });
      return;
    }

    // 2. Check file size (5 MB max)
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      resolve({
        isValid: false,
        error: `That image is ${sizeMB} MB. Please choose one under 5 MB.`,
      });
      return;
    }

    // 3. Real image decode & dimensions check
    const reader = new FileReader();
    reader.onerror = () => {
      resolve({
        isValid: false,
        error: "We couldn't read that image. Please try a different file.",
      });
    };

    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();

      img.onerror = () => {
        resolve({
          isValid: false,
          error: "We couldn't read that image. Please try a different file.",
        });
      };

      img.onload = () => {
        const { width, height } = img;
        if (width < 128 || height < 128) {
          resolve({
            isValid: false,
            error: 'That image is too small (minimum 128×128).',
            width,
            height,
          });
          return;
        }

        if (width > 4096 || height > 4096) {
          resolve({
            isValid: false,
            error: 'That image is too large (maximum 4096×4096).',
            width,
            height,
          });
          return;
        }

        resolve({
          isValid: true,
          dataUrl,
          width,
          height,
        });
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Password strength and policy checklist
 */
export function checkPasswordPolicy(password) {
  const minLength = (password || '').length >= 8;
  const hasUpper = /[A-Z]/.test(password || '');
  const hasLower = /[a-z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const hasSpecial = /[^A-Za-z0-9]/.test(password || '');
  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isAllValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
  };
}

export const checkPasswordRequirements = checkPasswordPolicy;

export function validateName(value, fieldLabel = 'First Name') {
  const err = fieldLabel.toLowerCase().includes('last') ? validateLastName(value) : validateFirstName(value);
  return {
    isValid: !err,
    error: err,
  };
}

export function validateBio(value) {
  const err = validateBiography(value);
  return {
    isValid: !err,
    error: err,
  };
}

export function validateDepartmentOrGroup(value, fieldLabel = 'Department') {
  const err = validateDeptOrGroup(value, fieldLabel);
  return {
    isValid: !err,
    error: err,
  };
}

export async function validateImageFile(file) {
  if (!file) return { isValid: false, error: 'Please choose an image file.' };

  const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const fileName = (file.name || '').toLowerCase();
  const hasValidExt = validExts.some((ext) => fileName.endsWith(ext));

  if (!validMimes.includes(file.type) || !hasValidExt) {
    return {
      isValid: false,
      error: "That file type isn't supported. Please upload a JPG, PNG, or WebP image.",
    };
  }

  const MAX_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `That image is ${sizeMB} MB. Please choose one under 5 MB.`,
    };
  }

  return { isValid: true };
}

export function validatePasswordForm({ currentPassword, newPassword, confirmPassword }) {
  if (!currentPassword) {
    return { isValid: false, error: 'Please enter your current password.' };
  }
  if (!newPassword) {
    return { isValid: false, error: 'Please enter a new password.' };
  }
  if (newPassword === currentPassword) {
    return { isValid: false, error: 'New password cannot be the same as your current password.' };
  }
  const policy = checkPasswordPolicy(newPassword);
  if (!policy.isAllValid) {
    return { isValid: false, error: 'Password does not meet the security requirements.' };
  }
  if (newPassword !== confirmPassword) {
    return { isValid: false, error: 'New passwords do not match.' };
  }
  return { isValid: true };
}
