/**
 * Writes the given text to a log file at the specified destination.
 *
 * @param {string} filePath - The destination path for the file
 * @param {string} content - The text content to write to the file
 * @returns {Promise<void>} A promise that resolves when the file is written
 */
export default function writeOutputLog(filePath: string, content: string): Promise<void>;
