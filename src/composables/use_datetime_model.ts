import moment from "moment-timezone";
import { computed } from "vue";

// The value format expected by <input type="datetime-local">.
const WALL_TIME_FORMAT = "YYYY-MM-DD[T]HH:mm";

/**
 * Converts an ISO 8601 datetime string to the wall-clock time string expected
 * by <input type="datetime-local"> in the given timezone.
 * Returns an empty string when iso_datetime is null.
 */
export function to_wall_time(
  iso_datetime: string | null,
  timezone: string,
): string {
  return iso_datetime !== null
    ? moment.parseZone(iso_datetime).tz(timezone).format(WALL_TIME_FORMAT)
    : "";
}

/**
 * Converts a wall-clock time string (as produced by <input type="datetime-local">)
 * back to an ISO 8601 string in the given timezone.
 * Returns null when wall_time is empty.
 */
export function to_iso(wall_time: string, timezone: string): string | null {
  return wall_time !== ""
    ? moment.tz(wall_time, WALL_TIME_FORMAT, timezone).format()
    : null;
}

/**
 * Returns a writable computed ref that bridges a reactive ISO 8601 datetime field
 * to the string format used by <input type="datetime-local">.
 *
 * @param get_iso - Returns the current ISO datetime value (or null if unset).
 * @param set_iso - Writes back an ISO datetime value (or null to clear it).
 * @param get_timezone - Returns the IANA timezone name to use for conversion.
 */
export function use_datetime_model(
  get_iso: () => string | null,
  set_iso: (value: string | null) => void,
  get_timezone: () => string,
) {
  return computed({
    get(): string {
      return to_wall_time(get_iso(), get_timezone());
    },
    set(wall_time: string) {
      set_iso(to_iso(wall_time, get_timezone()));
    },
  });
}
