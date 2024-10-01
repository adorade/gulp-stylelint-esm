/**
 * Gulp plugin for Stylelint.
 *
 * @param {LinterOptions & PluginOptions} options - Combined Stylelint and plugin options
 * @returns {Transform} A transform stream for processing files
 */
export default function gStylelintEsm(options: LinterOptions & PluginOptions): Transform;
export type LinterOptions = import("stylelint").LinterOptions;
export type LinterResult = import("stylelint").LinterResult;
export type File = any;
export type PluginOptions = {
    /**
     * - Whether to fail the Gulp task after encountering lint errors
     */
    failAfterError?: boolean;
    /**
     * - Whether to automatically fix lint issues
     */
    fix?: boolean;
    /**
     * - Whether to enable debug mode
     */
    debug?: boolean;
    /**
     * - Configuration for custom reporters
     */
    reporters?: Array<any>;
};
import { Transform } from 'node:stream';
