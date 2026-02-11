import { useEffect, useState, useCallback } from "react";
import {
  ATTENDANCE_SCAN_CONTROL_STORAGE_KEY,
  getAttendanceScanControlStatus,
  readAttendanceScanControlLocal,
} from "../api/attendanceApi";

/**
 * Global scanner state hook for Admin-controlled attendance scanning.
 *
 * - Only Admin can toggle scanning ON/OFF
 * - User and Trainer pages use this hook to respect the global state
 * - State is synchronized across tabs via localStorage + storage events
 * - Fails CLOSED: defaults to OFF if state cannot be read
 *
 * @returns {Object} {
 *   isScanningEnabled: boolean - whether admin has enabled scanning globally
 *   isLoading: boolean - whether we're fetching the initial state
 *   error: string|null - any error message
 *   refresh: function - manually refresh the scanner status
 * }
 */
export function useGlobalScanner() {
  // Initialize from localStorage immediately to avoid flicker
  const getInitialState = () => {
    const cached = readAttendanceScanControlLocal();
    console.log("[useGlobalScanner] Initial localStorage value:", cached);
    return !!cached?.isActive;
  };

  const [isScanningEnabled, setIsScanningEnabled] = useState(getInitialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const result = await getAttendanceScanControlStatus();
      setIsScanningEnabled(!!result?.isActive);
      setError(null);
    } catch (e) {
      // On error, read from localStorage as fallback
      const cached = readAttendanceScanControlLocal();
      setIsScanningEnabled(!!cached?.isActive);
      setError("Failed to load scanner status");
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const loadScanControl = async () => {
      try {
        const result = await getAttendanceScanControlStatus();
        console.log("[useGlobalScanner] API result:", result);
        if (!alive) return;
        setIsScanningEnabled(!!result?.isActive);
      } catch {
        if (!alive) return;
        // On API error, keep the localStorage value (don't default to false)
        const cached = readAttendanceScanControlLocal();
        console.log("[useGlobalScanner] API failed, using localStorage:", cached);
        setIsScanningEnabled(!!cached?.isActive);
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    loadScanControl();

    // Poll every 3 seconds to sync with admin changes (faster sync)
    const intervalId = window.setInterval(loadScanControl, 3000);

    // Listen for storage events to sync across tabs
    const onStorage = (event) => {
      if (event.key !== ATTENDANCE_SCAN_CONTROL_STORAGE_KEY) return;
      console.log("[useGlobalScanner] Storage event received:", event.newValue);
      try {
        const next = event.newValue ? JSON.parse(event.newValue) : null;
        setIsScanningEnabled(!!next?.isActive);
      } catch {
        setIsScanningEnabled(false);
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      alive = false;
      window.clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return {
    isScanningEnabled,
    isLoading,
    error,
    refresh,
  };
}

export default useGlobalScanner;
