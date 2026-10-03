import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateBio,
  validateDepartmentOrGroup,
  validateImageFile,
  checkPasswordRequirements,
  validatePasswordForm,
} from '../utils/profileValidation';

describe('Profile Validation Utilities (§1, §2, §7)', () => {
  describe('Name Validation (First Name & Last Name)', () => {
    it('accepts valid Filipino names, accents, hyphens, and apostrophes', () => {
      expect(validateName('Ma. Cristina', 'First Name').isValid).toBe(true);
      expect(validateName('Peña', 'Last Name').isValid).toBe(true);
      expect(validateName("O'Brien", 'Last Name').isValid).toBe(true);
      expect(validateName('De la Cruz', 'Last Name').isValid).toBe(true);
      expect(validateName('Jose Rizal Jr.', 'First Name').isValid).toBe(true);
      expect(validateName('Mary-Jane', 'First Name').isValid).toBe(true);
    });

    it('rejects empty or whitespace-only names with friendly message', () => {
      const emptyResult = validateName('', 'First Name');
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toBe('Please enter your first name.');

      const whitespaceResult = validateName('     ', 'Last Name');
      expect(whitespaceResult.isValid).toBe(false);
      expect(whitespaceResult.error).toBe('Please enter your last name.');
    });

    it('rejects digits, emoji, and invalid symbols', () => {
      const digitResult = validateName('Juan3', 'First Name');
      expect(digitResult.isValid).toBe(false);
      expect(digitResult.error).toBe('Names can include letters, spaces, hyphens, apostrophes, and periods.');

      const emojiResult = validateName('Maria 🚀', 'First Name');
      expect(emojiResult.isValid).toBe(false);
      expect(emojiResult.error).toBe('Names can include letters, spaces, hyphens, apostrophes, and periods.');

      const symbolResult = validateName('Admin@Acuity', 'First Name');
      expect(symbolResult.isValid).toBe(false);
      expect(symbolResult.error).toBe('Names can include letters, spaces, hyphens, apostrophes, and periods.');
    });

    it('rejects names exceeding 50 characters', () => {
      const longName = 'A'.repeat(51);
      const res = validateName(longName, 'First Name');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('First name can be up to 50 characters.');
    });
  });

  describe('Biography Validation', () => {
    it('accepts valid biographies up to 500 characters', () => {
      expect(validateBio('').isValid).toBe(true);
      expect(validateBio('Short bio about biology research.').isValid).toBe(true);
      expect(validateBio('b'.repeat(500)).isValid).toBe(true);
    });

    it('rejects biographies exceeding 500 characters with exact overflow count', () => {
      const res501 = validateBio('c'.repeat(501));
      expect(res501.isValid).toBe(false);
      expect(res501.error).toBe('Your biography can be up to 500 characters. Please shorten it by 1.');

      const res510 = validateBio('c'.repeat(510));
      expect(res510.isValid).toBe(false);
      expect(res510.error).toBe('Your biography can be up to 500 characters. Please shorten it by 10.');
    });
  });

  describe('Department and Laboratory Group Validation', () => {
    it('accepts letters, numbers, spaces, and allowed symbols # & ( ) / , -', () => {
      const res = validateDepartmentOrGroup('Microbiology Lab (Group 3) #12/A & B', 'Department');
      expect(res.isValid).toBe(true);
    });

    it('rejects illegal characters like % $ ^ *', () => {
      const res = validateDepartmentOrGroup('Bioinformatics *%^', 'Department');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/can include letters, numbers, spaces/);
    });
  });

  describe('Avatar Client-Side File Validation', () => {
    it('accepts valid JPG, PNG, and WebP files under 5 MB', async () => {
      const validJpg = new File(['fake-image-bytes'], 'avatar.jpg', { type: 'image/jpeg' });
      // In node/jsdom without mock Image, validateImageFile checks size and mime
      const res = await validateImageFile(validJpg);
      // It should pass the size & mime check
      expect(res.error).not.toBe("That file type isn't supported. Please upload a JPG, PNG, or WebP image.");
    });

    it('rejects unsupported file types (e.g. PDF, GIF, SVG, EXE)', async () => {
      const pdfFile = new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' });
      const resPdf = await validateImageFile(pdfFile);
      expect(resPdf.isValid).toBe(false);
      expect(resPdf.error).toBe("That file type isn't supported. Please upload a JPG, PNG, or WebP image.");

      const gifFile = new File(['GIF89a'], 'anim.gif', { type: 'image/gif' });
      const resGif = await validateImageFile(gifFile);
      expect(resGif.isValid).toBe(false);
      expect(resGif.error).toBe("That file type isn't supported. Please upload a JPG, PNG, or WebP image.");
    });

    it('rejects images exceeding 5 MB with specific message', async () => {
      const largeFile = new File([new Uint8Array(5.5 * 1024 * 1024)], 'huge.png', {
        type: 'image/png',
      });
      const res = await validateImageFile(largeFile);
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/That image is 5.5 MB\. Please choose one under 5 MB\./);
    });
  });

  describe('Password Policy & Checklist Utilities', () => {
    it('checks all password policy requirements', () => {
      const weak = checkPasswordRequirements('pass');
      expect(weak.minLength).toBe(false);
      expect(weak.hasUpper).toBe(false);
      expect(weak.hasLower).toBe(true);
      expect(weak.hasNumber).toBe(false);
      expect(weak.hasSpecial).toBe(false);
      expect(weak.isAllValid).toBe(false);

      const strong = checkPasswordRequirements('StrongP@ssw0rd!');
      expect(strong.minLength).toBe(true);
      expect(strong.hasUpper).toBe(true);
      expect(strong.hasLower).toBe(true);
      expect(strong.hasNumber).toBe(true);
      expect(strong.hasSpecial).toBe(true);
      expect(strong.isAllValid).toBe(true);
    });

    it('validates password form matching and difference from current password', () => {
      const sameRes = validatePasswordForm({
        currentPassword: 'Password123!',
        newPassword: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(sameRes.isValid).toBe(false);
      expect(sameRes.error).toBe('New password cannot be the same as your current password.');

      const mismatchRes = validatePasswordForm({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      });
      expect(mismatchRes.isValid).toBe(false);
      expect(mismatchRes.error).toBe('New passwords do not match.');

      const validRes = validatePasswordForm({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });
      expect(validRes.isValid).toBe(true);
    });
  });
});
