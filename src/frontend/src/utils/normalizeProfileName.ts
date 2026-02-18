/**
 * Normalizes a user profile name by trimming leading/trailing whitespace.
 * This ensures consistent profile name handling across the application.
 */
export function normalizeProfileName(name: string): string {
  return name.trim();
}
