/*!
 * Gulp Stylelint (v3.0.0): test/stylish-formatter.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import { sep } from 'node:path';
import stylishFormatter from '../src/stylish-formatter.mjs';

import { cleanFormatterOutput } from './testUtils/cleanOutput.js';

import colors from 'ansi-colors';
const { blue, dim, green, red, yellow } = colors;

describe('Stylish built-in formatter', () => {
  let actualTTY;
  let actualColumns;

  beforeAll(() => {
    actualTTY = process.stdout.isTTY;
    actualColumns = process.stdout.columns;
  });

  afterAll(() => {
    process.stdout.isTTY = actualTTY;
    process.stdout.columns = actualColumns;
  });

  it('should handle results with no warnings or errors gracefully', () => {
    const results = [
      { source: 'path/to/file1.css', warnings: [] },
      { source: 'path/to/file2.css', warnings: [] }
    ];

    const returnValue = { ruleMetadata: {} };

    const output = stylishFormatter(results, returnValue);

    expect(output).toBe('');
  });
  it('should handle empty results array without throwing errors', () => {
    const results = [];

    const returnValue = { ruleMetadata: {} };

    const output = stylishFormatter(results, returnValue);

    expect(output).toBe('');
  });
  it('should outputs warnings', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'error', line: 1, column: 1, text: 'Unexpected foo', rule: 'bar' }
        ]
      }
    ];

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:1  ×  Unexpected foo    bar',
      '',
      '× 1 problem (1 error, 0 warnings)'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe(expectedOutput);
  });
  it('should outputs fixable error and warning counts', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'error', line: 1, column: 1, text: 'Unexpected foo', rule: 'no-foo' },
          { severity: 'error', line: 2, column: 1, text: 'Unexpected bar', rule: 'no-bar' },
          { severity: 'warning', line: 3, column: 1, text: 'Unexpected baz', rule: 'no-baz' }
        ]
      }
    ];

    const returnValue = {
      ruleMetadata: {
        'no-foo': { fixable: true },
        'no-bar': { fixable: false },
        'no-baz': { fixable: true }
      }
    };

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:1  ×  Unexpected foo  o  no-foo',
      '  2:1  ×  Unexpected bar     no-bar',
      '  3:1  ‼  Unexpected baz  o  no-baz',
      '',
      '× 3 problems (2 errors, 1 warning)',
      '  1 error and 1 warning potentially fixable with the "fix: true" option.'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results, returnValue);

    expect(output).toBe(expectedOutput);
  });
  it('should outputs fixable error counts', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'error', line: 1, column: 1, text: 'Unexpected foo', rule: 'no-foo' },
          { severity: 'error', line: 2, column: 1, text: 'Unexpected bar', rule: 'no-bar' }
        ]
      }
    ];

    const returnValue = {
      ruleMetadata: {
        'no-foo': { fixable: true }
      }
    };

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:1  ×  Unexpected foo  o  no-foo',
      '  2:1  ×  Unexpected bar     no-bar',
      '',
      '× 2 problems (2 errors, 0 warnings)',
      '  1 error potentially fixable with the "fix: true" option.'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results, returnValue);

    expect(output).toBe(expectedOutput);
  });
  it('should outputs fixable warning counts', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'error', line: 1, column: 1, text: 'Unexpected foo', rule: 'no-foo' },
          { severity: 'warning', line: 2, column: 1, text: 'Unexpected bar', rule: 'no-bar' }
        ]
      }
    ];

    const returnValue = {
      ruleMetadata: {
        'no-bar': { fixable: true }
      }
    };

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:1  ×  Unexpected foo     no-foo',
      '  2:1  ‼  Unexpected bar  o  no-bar',
      '',
      '× 2 problems (1 error, 1 warning)',
      '  1 warning potentially fixable with the "fix: true" option.'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results, returnValue);

    expect(output).toBe(expectedOutput);
  });
  it('should outputs fixable warning counts with invalid or missing ruleMetadata', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'error', line: 1, column: 2, text: 'Unexpected foo', rule: 'no-foo' },
          { severity: 'warning', line: 1, column: 2, text: 'Unexpected bar', rule: 'no-bar' },
          { severity: 'warning', line: 1, column: 2, text: 'Unexpected baz', rule: 'no-baz' }
        ]
      }
    ];

    const returnValue = {
      ruleMetadata: {
        'no-foo': {}, // fixable should exist
        'no-bar': { fixable: 900 }, // fixable should be a boolean
        'no-baz': { fixable: true }
      }
    };

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:2  ×  Unexpected foo     no-foo',
      '  1:2  ‼  Unexpected bar     no-bar',
      '  1:2  ‼  Unexpected baz  o  no-baz',
      '',
      '× 3 problems (1 error, 2 warnings)',
      '  1 warning potentially fixable with the "fix: true" option.'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results, returnValue);

    expect(output).toBe(expectedOutput);
  });
  it('should correctly apply color formatting to error and warning messages', () => {
    const results = [
      {
        source: 'test.css',
        warnings: [
          { severity: 'error', line: 1, column: 1, text: 'Error message', rule: 'error-rule' },
          { severity: 'warning', line: 2, column: 2, text: 'Warning message', rule: 'warning-rule' }
        ]
      }
    ];

    const returnValue = {
      ruleMetadata: {
        'error-rule': { fixable: true },
        'warning-rule': { fixable: true }
      }
    };

    const output = stylishFormatter(results, returnValue);

    expect(output).toContain(blue('test.css'));
    expect(output).toContain(red('✖'));
    expect(output).toContain(yellow('⚠'));
    expect(output).toContain(green('♻'));
    expect(output).toContain(dim('error-rule'));
    expect(output).toContain(dim('warning-rule'));
    expect(output).toContain(red('1 error'));
    expect(output).toContain(yellow('1 warning'));
    expect(output).toContain(green('"fix: true"'));
  });
  it('should outputs results with missing ruleMetadata object', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'error', line: 1, column: 2, text: 'Unexpected foo', rule: 'no-foo' },
          { severity: 'warning', line: 1, column: 2, text: 'Unexpected bar', rule: 'no-bar' }
        ]
      }
    ];

    const returnValue = { ruleMetadata: null };

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:2  ×  Unexpected foo    no-foo',
      '  1:2  ‼  Unexpected bar    no-bar',
      '',
      '× 2 problems (1 error, 1 warning)'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results, returnValue);

    expect(output).toBe(expectedOutput);
  });
  it('should outputs warnings using the appropriate icon', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'warning', line: 1, column: 1, text: 'Unexpected foo', rule: 'bar' }
        ]
      }
    ];

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:1  ‼  Unexpected foo    bar',
      '',
      '‼ 1 problem (0 errors, 1 warning)'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe(expectedOutput);
  });
  it('should outputs warnings for multiple sources', () => {
    const results = [
      {
        source: 'path/to/file-a.css',
        warnings: [
          { severity: 'error', line: 1, column: 2, text: 'Unexpected foo', rule: 'no-foo' }
        ]
      },
      {
        source: 'path/to/file-b.css',
        warnings: [
          { severity: 'warning', line: 1, column: 2, text: 'Unexpected bar', rule: 'no-bar' }
        ]
      }
    ];

    const expectedOutput = [
      `path${sep}to${sep}file-a.css`,
      '  1:2  ×  Unexpected foo    no-foo',
      '',
      `path${sep}to${sep}file-b.css`,
      '  1:2  ‼  Unexpected bar    no-bar',
      '',
      '× 2 problems (1 error, 1 warning)'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe(expectedOutput);
  });
  it('should removes rule name from warning text', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'warning', line: 1, column: 1, text: 'Unexpected foo (rule-name)', rule: 'rule-name' }
        ]
      }
    ];

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:1  ‼  Unexpected foo    rule-name',
      '',
      '‼ 1 problem (0 errors, 1 warning)'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe(expectedOutput);
  });
  it('should outputs warnings without stdout `TTY`', () => {
    process.stdout.isTTY = false;

    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'error', line: 1, column: 1, text: 'Unexpected foo', rule: 'bar' }
        ]
      }
    ];

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:1  ×  Unexpected foo    bar',
      '',
      '× 1 problem (1 error, 0 warnings)'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe(expectedOutput);
  });
  it('should condenses deprecations and invalid option warnings', () => {
    const results = [
      {
        source: 'path/to/file.css',
        deprecations: [
          {
            text: 'Deprecated foo.',
            reference: 'bar'
          }
        ],
        invalidOptionWarnings: [
          {
            text: 'Unexpected option for baz'
          }
        ],
        warnings: []
      },
      {
        source: 'path/to/file2.css',
        deprecations: [
          {
            text: 'Deprecated foo.',
            reference: 'bar'
          }
        ],
        invalidOptionWarnings: [
          {
            text: 'Unexpected option for baz'
          }
        ],
        warnings: []
      }
    ];

    const expectedOutput = [
      'Invalid Option: Unexpected option for baz',
      '',
      'Deprecation warnings:',
      ' - Deprecated foo. See: bar'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe(expectedOutput);
  });
  it('should handles deprecations and invalid option warnings and outputs warnings', () => {
    const results = [
      {
        source: 'path/to/file.css',
        deprecations: [
          {
            text: 'Deprecated foo.',
            reference: 'bar'
          }
        ],
        invalidOptionWarnings: [
          {
            text: 'Unexpected option for baz'
          }
        ],
        warnings: [
          { severity: 'warning', line: 1, column: 1, text: 'Unexpected foo', rule: 'bar' }
        ]
      },
      {
        source: 'path/to/file2.css',
        deprecations: [
          {
            text: 'Deprecated foo.',
            reference: 'bar'
          }
        ],
        invalidOptionWarnings: [
          {
            text: 'Unexpected option for baz'
          }
        ],
        warnings: [
          { severity: 'warning', line: 1, column: 1, text: 'Unexpected foo', rule: 'bar' }
        ]
      }
    ];

    const expectedOutput = [
      'Invalid Option: Unexpected option for baz',
      '',
      'Deprecation warnings:',
      ' - Deprecated foo. See: bar',
      '',
      `path${sep}to${sep}file.css`,
      '  1:1  ‼  Unexpected foo    bar',
      '',
      `path${sep}to${sep}file2.css`,
      '  1:1  ‼  Unexpected foo    bar',
      '',
      '‼ 2 problems (0 errors, 2 warnings)'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe(expectedOutput);
  });
  it('should handles ignored file', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [],
        ignored: true
      }
    ];

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe('');
  });
  it('should handles empty messages', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          { severity: 'error', line: 1, column: 1, text: '', rule: 'bar' }
        ]
      }
    ];

    const expectedOutput = [
      `path${sep}to${sep}file.css`,
      '  1:1  ×      bar',
      '',
      '× 1 problem (1 error, 0 warnings)'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe(expectedOutput);
  });
  it('should correctly pluralize "problem" based on the total count', () => {
    const results = [
      {
        source: 'file1.css',
        warnings: [
          { severity: 'error', line: 1, column: 1, text: 'Error 1', rule: 'error-rule-1' }
        ]
      },
      {
        source: 'file2.css',
        warnings: [
          { severity: 'warning', line: 1, column: 1, text: 'Warning 1', rule: 'warning-rule-1' },
          { severity: 'error', line: 2, column: 2, text: 'Error 2', rule: 'error-rule-2' }
        ]
      }
    ];

    const returnValue = {
      ruleMetadata: {
        'error-rule-1': { },
        'warning-rule-1': { },
        'error-rule-2': { }
      }
    };

    const output = cleanFormatterOutput(stylishFormatter, results, returnValue);

    expect(output).toContain('3 problems (2 errors, 1 warning)');

    const singleResult = [
      {
        source: 'file1.css',
        warnings: [
          { severity: 'error', line: 1, column: 1, text: 'Error 1', rule: 'error-rule-1' }
        ]
      }
    ];

    const singleOutput = cleanFormatterOutput(stylishFormatter, singleResult, returnValue);

    expect(singleOutput).toContain('1 problem (1 error, 0 warnings)');
  });
});
