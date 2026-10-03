const { z } = require('zod');

// Regex adhering strictly to spec:
// Must start with a Unicode letter, followed by Unicode letters/marks, spaces, periods, apostrophes, hyphens
const NAME_REGEX = /^\p{L}[\p{L}\p{M}\s.'’-]*$/u;

// Department / Lab group regex: letters, numbers, spaces, and # & ( ) / , -
const DEPT_GROUP_REGEX = /^[\p{L}\p{M}0-9\s#&()\/,\-]*$/u;

// Forbidden fields that cannot be modified by user profile updates
const FORBIDDEN_FIELDS = ['email', 'role', 'tenantId', 'isActive', 'cognitoId', 'id', 'createdAt', 'updatedAt', 'roleId'];

/**
 * Normalizes text: trims, collapses multiple spaces into single space, normalizes line endings
 */
function normalizeText(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Normalizes multiline bio: trims, normalizes CRLF to LF, removes ASCII control characters
 */
function normalizeBio(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Strip control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Zod Profile Schema
 */
const profileUpdateSchema = z.object({
  firstName: z
    .string({ required_error: 'Please enter your first name.' })
    .transform(normalizeText)
    .refine((val) => val.length > 0, { message: 'Please enter your first name.' })
    .refine((val) => val.length <= 50, { message: 'First name can be up to 50 characters.' })
    .refine((val) => NAME_REGEX.test(val), {
      message: 'Names can include letters, spaces, hyphens, apostrophes, and periods.',
    }),

  lastName: z
    .string({ required_error: 'Please enter your last name.' })
    .transform(normalizeText)
    .refine((val) => val.length > 0, { message: 'Please enter your last name.' })
    .refine((val) => val.length <= 50, { message: 'Last name can be up to 50 characters.' })
    .refine((val) => NAME_REGEX.test(val), {
      message: 'Names can include letters, spaces, hyphens, apostrophes, and periods.',
    }),

  biography: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? normalizeBio(val) : undefined))
    .superRefine((val, ctx) => {
      if (val && val.length > 500) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Your biography can be up to 500 characters. Please shorten it by ${val.length - 500}.`,
        });
      }
    }),

  bio: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? normalizeBio(val) : undefined))
    .superRefine((val, ctx) => {
      if (val && val.length > 500) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Your biography can be up to 500 characters. Please shorten it by ${val.length - 500}.`,
        });
      }
    }),

  department: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? normalizeText(val) : undefined))
    .refine((val) => !val || val.length <= 100, {
      message: 'Department can be up to 100 characters.',
    })
    .refine((val) => !val || DEPT_GROUP_REGEX.test(val), {
      message: 'Department can include letters, numbers, spaces, and # & ( ) / , - symbols.',
    }),

  laboratoryGroup: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? normalizeText(val) : undefined))
    .refine((val) => !val || val.length <= 100, {
      message: 'Laboratory group can be up to 100 characters.',
    })
    .refine((val) => !val || DEPT_GROUP_REGEX.test(val), {
      message: 'Laboratory group can include letters, numbers, spaces, and # & ( ) / , - symbols.',
    }),

  group: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? normalizeText(val) : undefined))
    .refine((val) => !val || val.length <= 100, {
      message: 'Laboratory group can be up to 100 characters.',
    })
    .refine((val) => !val || DEPT_GROUP_REGEX.test(val), {
      message: 'Laboratory group can include letters, numbers, spaces, and # & ( ) / , - symbols.',
    }),

  avatarUrl: z.string().optional(),
  displayName: z.string().optional(),
}).strict({ message: 'Unrecognized or non-editable field provided.' });

/**
 * Validates request body for forbidden fields and schema rules
 */
function validateProfileUpdate(body) {
  // 1. Check for strictly forbidden non-editable fields
  const forbiddenFound = FORBIDDEN_FIELDS.filter((field) => field in body);
  if (forbiddenFound.length > 0) {
    return {
      isValid: false,
      isForbidden: true,
      forbiddenFields: forbiddenFound,
      errorResponse: {
        code: 'FIELD_NOT_EDITABLE',
        error: `The following fields cannot be edited: ${forbiddenFound.join(', ')}`,
      },
    };
  }

  // 2. Validate with Zod
  const result = profileUpdateSchema.safeParse(body);
  if (!result.success) {
    const fieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] || 'general';
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      isValid: false,
      isForbidden: false,
      errorResponse: {
        code: 'VALIDATION_ERROR',
        message: 'Please fix the highlighted fields.',
        fieldErrors,
      },
    };
  }

  return {
    isValid: true,
    data: result.data,
  };
}

module.exports = {
  validateProfileUpdate,
  NAME_REGEX,
  DEPT_GROUP_REGEX,
  normalizeText,
  normalizeBio,
};
