/**
 * Build version utility for cache-busting and preventing old menu flashing.
 * Detects version mismatches and triggers a one-time reload to stabilize on the latest build.
 */

const CURRENT_BUILD_VERSION = '27';
const STORAGE_KEY = 'app_build_version';
const RELOAD_FLAG_KEY = 'app_build_reload_attempted';

/**
 * Get the build version from URL parameter or use current default
 */
export function getBuildVersion(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const urlVersion = urlParams.get('v');
  return urlVersion || CURRENT_BUILD_VERSION;
}

/**
 * Get the last seen build version from storage
 */
function getStoredVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Store the current build version
 */
function storeVersion(version: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, version);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if a reload has already been attempted this session
 */
function hasReloadBeenAttempted(): boolean {
  try {
    return sessionStorage.getItem(RELOAD_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark that a reload has been attempted
 */
function markReloadAttempted(): void {
  try {
    sessionStorage.setItem(RELOAD_FLAG_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check for version mismatch and perform one-time reload if needed
 * Returns true if a reload was triggered, false otherwise
 */
export function checkAndReloadIfNeeded(): boolean {
  // Don't reload if we've already tried this session
  if (hasReloadBeenAttempted()) {
    return false;
  }

  const currentVersion = getBuildVersion();
  const storedVersion = getStoredVersion();

  // If versions don't match, trigger a one-time reload
  if (storedVersion && storedVersion !== currentVersion) {
    console.log(`Build version mismatch detected: stored=${storedVersion}, current=${currentVersion}. Reloading...`);
    
    // Mark that we're attempting a reload
    markReloadAttempted();
    
    // Store the new version
    storeVersion(currentVersion);
    
    // Perform hard reload to clear cache
    window.location.reload();
    
    return true;
  }

  // Store the current version if not already stored
  if (!storedVersion) {
    storeVersion(currentVersion);
  }

  return false;
}

/**
 * Get the active build version for display
 */
export function getActiveBuildVersion(): string {
  return getBuildVersion();
}
