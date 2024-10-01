/** @type {FormatterDictionary} */
export const gFormatters: FormatterDictionary;
export type Formatter = import("stylelint").Formatter;
export type FormatterDictionary = Record<string, Formatter>;
