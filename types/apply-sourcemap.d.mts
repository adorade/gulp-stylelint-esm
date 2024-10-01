/**
 * @typedef {Object} Warning
 * @property {number} line
 * @property {number} column
 *
 * @typedef {Object} Result
 * @property {string} source
 * @property {Warning[]} warnings
 *
 * @typedef {Object} LintResult
 * @property {Result[]} results
 */
/**
 * Applies source map to the lint result.
 *
 * @param {LintResult} lintResult - The result of the linting process
 * @param {Object} sourceMap - The source map object
 * @returns {Promise<LintResult>} The lint result with applied source map
 */
export default function applySourcemap(lintResult: LintResult, sourceMap: any): Promise<LintResult>;
export type Warning = {
    line: number;
    column: number;
};
export type Result = {
    source: string;
    warnings: Warning[];
};
export type LintResult = {
    results: Result[];
};
