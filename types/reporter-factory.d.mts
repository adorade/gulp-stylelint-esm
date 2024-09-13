/**
 * @typedef {import('stylelint').LintResult} LintResult
 * @typedef {import('stylelint').Formatter} Formatter
 * @typedef {(formattedText: string, filePath: string) => Promise<void>} Writer
 *
 * @typedef {Object} Config
 * @property {string | Formatter} formatter
 * @property {boolean} [console]
 * @property {string} [save]
 */
/**
 * Creates a reporter function based on the provided configuration.
 *
 * @param {Config} config
 * @returns {(result: {results: LintResult[]}) => Promise<void[]>}
 */
export default function reporterFactory(config?: Config): (result: {
    results: LintResult[];
}) => Promise<void[]>;
export type LintResult = import("stylelint").LintResult;
export type Formatter = import("stylelint").Formatter;
export type Writer = (formattedText: string, filePath: string) => Promise<void>;
export type Config = {
    formatter: string | Formatter;
    console?: boolean;
    save?: string;
};
