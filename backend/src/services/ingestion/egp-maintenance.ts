import { load } from "cheerio";

/* Detect e-GP maintenance notices returned as HTTP 200 HTML responses.
 * Treat the notice as unavailable upstream data, not a valid feed or archive. */

export class EgpMaintenanceError extends Error {
  constructor(public readonly notice: string) {
    super(`e-GP ปิดปรับปรุงระบบ — ${notice}`);
    this.name = "EgpMaintenanceError";
  }
}

/* Read plain text for notice detection, not HTML safe for rendering. */
function visibleText(html: string): string {
  const $ = load(html);
  $("script, style").remove();
  $("*").append(" ");
  return $.root().text().replace(/\s+/g, " ").trim();
}

/* The maintenance notice when `body` is e-GP's downtime page, else null.
 * Cheap enough to run on any non-JSON, non-ZIP response. */
export function maintenanceNotice(body: string): string | null {
  if (!/<html/i.test(body)) return null;
  const text = visibleText(body);
  if (!/ปิดระบบ|ปิดปรับปรุง/.test(text)) return null;
  // The sentence about reopening is the useful part; fall back to the start.
  // Not [^.] — the time itself has a dot ("18.01 น.").
  const reopen = text.match(/(จะเปิดใช้งาน.{0,120}?(เป็นต้นไป|น\.))/);
  return (reopen?.[1] ?? text.slice(0, 160)).trim();
}

/* Throw EgpMaintenanceError when `body` is the downtime page. */
export function assertNotMaintenance(body: string): void {
  const notice = maintenanceNotice(body);
  if (notice) throw new EgpMaintenanceError(notice);
}
