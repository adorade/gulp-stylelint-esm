/**
 * Writes the given text to a log file at the specified destination.
 *
 * @param {string} filePath - The destination path for the file
 * @param {string} content - The text content to write to the file
 * @returns {Promise<void>} A promise that resolves when the file is written
 */
export function writeOutputLog(filePath: string, content: string): Promise<void>;
/**
 * Overwrites the source file with the given content.
 *
 * @param {string} file - The source file
 * @param {string} content - The content to overwrite the source with
 * @returns {Promise<void>} A promise that resolves when the file is overwritten
 */
export function overwriteSource(file: string, content: string): Promise<void>;
