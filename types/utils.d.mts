/**
 * @import {Severity} from 'stylelint'
 *
 * @param {Severity} severity
 * @param {Record<Severity, number>} counts
 * @returns {void}
 */
export function calcSeverityCounts(severity: Severity, counts: Record<Severity, number>): void;
/**
 * @param {import('stylelint').LintResult[]} results
 * @returns {string}
 */
export function deprecationsFormatter(results: import("stylelint").LintResult[]): string;
/**
 * @param {import('stylelint').LintResult[]} results
 * @return {string}
 */
export function invalidOptionsFormatter(results: import("stylelint").LintResult[]): string;
/**
 * Format the message text to be displayed in the console.
 *
 * @param {import('stylelint').Warning} message
 * @return {string}
 */
export function formatMessageText(message: import("stylelint").Warning): string;
/**
 * pluralize - Returns the plural form of the given word.
 *
 * @param {number} count
 * @returns {string}
 */
export function pluralize(count: number): string;
import type { Severity } from 'stylelint';
