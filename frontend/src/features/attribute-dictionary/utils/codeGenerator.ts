/**
 * Code Generation Utility
 * 
 * Generates unique codes from Chinese names using pinyin conversion
 * with conflict resolution.
 */

import { pinyin } from 'pinyin-pro';

/**
 * Generate base code from Chinese name
 * @param chineseName - Chinese name to convert
 * @returns Base code in uppercase with underscores
 */
function generateBaseCode(chineseName: string): string {
  const pinyinString = pinyin(chineseName, {
    toneType: 'none',
    separator: '_',
  });
  return pinyinString.toUpperCase();
}

/**
 * Resolve code conflicts by appending counter suffix
 * @param baseCode - Base code to check
 * @param existingCodes - Set of existing codes to check against
 * @returns Unique code with conflict resolution
 */
function resolveConflict(baseCode: string, existingCodes: Set<string>): string {
  if (!existingCodes.has(baseCode)) {
    return baseCode;
  }

  let counter = 2;
  let newCode: string;
  do {
    newCode = `${baseCode}_${counter}`;
    counter++;
  } while (existingCodes.has(newCode));

  return newCode;
}

/**
 * Generate unique code from Chinese name with conflict resolution
 * @param chineseName - Chinese name to convert
 * @param existingCodes - Set of existing codes to check against
 * @returns Unique code
 */
export function generateUniqueCode(
  chineseName: string,
  existingCodes: Set<string>
): string {
  const baseCode = generateBaseCode(chineseName);
  return resolveConflict(baseCode, existingCodes);
}

/**
 * Generate code from Chinese name without conflict checking
 * Useful for initial code generation before checking uniqueness
 * @param chineseName - Chinese name to convert
 * @returns Base code
 */
export function generateCode(chineseName: string): string {
  return generateBaseCode(chineseName);
}

/**
 * Validate code format
 * @param code - Code to validate
 * @returns true if valid, false otherwise
 */
export function isValidCode(code: string): boolean {
  // Alphanumeric with underscores, max 100 characters
  return /^[A-Z0-9_]+$/i.test(code) && code.length <= 100 && code.length > 0;
}

/**
 * Normalize code (uppercase, trim, replace spaces with underscores)
 * @param code - Code to normalize
 * @returns Normalized code
 */
export function normalizeCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');
}

