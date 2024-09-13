/*!
 * Gulp Stylelint (v3.0.0-beta): test/stylish-formatter.test.js
 * Copyright (c) 2023-24 Adorade (https://github.com/adorade/gulp-stylelint-esm)
 * License under MIT
 * ========================================================================== */

import stylishFormatter from '../src/stylish-formatter.mjs';

import { cleanFormatterOutput } from './testUtils/cleanOutput.js';

xdescribe('stylishFormatter', () => {
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

  it('should outputs no errors or warnings', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [],
      },
    ];

    const returnValue = { ruleMetadata: {} }

    const output = stylishFormatter(results, returnValue);

    expect(output).toBe('');
  });
  it('should outputs no valid files', () => {
    const results = [];

    const returnValue = { ruleMetadata: {} }

    const output = stylishFormatter(results, returnValue);

    expect(output).toBe('');
  });
  it('should outputs warnings', () => {
    const results = [
      {
        source: 'path/to/file.css',
        warnings: [
          {
            line: 1,
            column: 1,
            rule: 'bar',
            severity: 'error',
            text: 'Unexpected foo',
          },
        ],
      },
    ];

    const expectedOutput = [
      'path/to/file.css',
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
					{
						line: 1,
						column: 1,
						rule: 'no-foo',
						severity: 'error',
						text: 'Unexpected foo',
					},
					{
						line: 2,
						column: 1,
						rule: 'no-bar',
						severity: 'error',
						text: 'Unexpected bar',
					},
					{
						line: 3,
						column: 1,
						rule: 'no-baz',
						severity: 'warning',
						text: 'Unexpected baz',
					},
				],
			},
		];

		const returnValue = {
			ruleMetadata: {
				'no-foo': { fixable: true },
				'no-bar': { fixable: false },
				'no-baz': { fixable: true },
			},
		};

    const expectedOutput = [
      'path/to/file.css',
      '  1:1  ×  Unexpected foo  √  no-foo',
      '  2:1  ×  Unexpected bar     no-bar',
      '  3:1  ‼  Unexpected baz  √  no-baz',
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
					{
						line: 1,
						column: 1,
						rule: 'no-foo',
						severity: 'error',
						text: 'Unexpected foo',
					},
					{
						line: 2,
						column: 1,
						rule: 'no-bar',
						severity: 'error',
						text: 'Unexpected bar',
					},
				],
			},
		];

		const returnValue = {
			ruleMetadata: {
				'no-foo': { fixable: true },
			},
		};

    const expectedOutput = [
      'path/to/file.css',
      '  1:1  ×  Unexpected foo  √  no-foo',
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
          {
            line: 1,
            column: 1,
            rule: 'no-foo',
            severity: 'error',
            text: 'Unexpected foo',
          },
          {
            line: 2,
            column: 1,
            rule: 'no-bar',
            severity: 'warning',
            text: 'Unexpected bar',
          },
        ],
      },
    ];

    const returnValue = {
      ruleMetadata: {
        'no-bar': { fixable: true },
      },
    };

    const expectedOutput = [
      'path/to/file.css',
      '  1:1  ×  Unexpected foo     no-foo',
      '  2:1  ‼  Unexpected bar  √  no-bar',
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
          {
            line: 1,
            column: 2,
            rule: 'no-foo',
            severity: 'error',
            text: 'Unexpected foo',
          },
          {
            line: 1,
            column: 2,
            rule: 'no-bar',
            severity: 'warning',
            text: 'Unexpected bar',
          },
          {
            line: 1,
            column: 2,
            rule: 'no-baz',
            severity: 'warning',
            text: 'Unexpected baz',
          },
        ],
      },
    ];

    const returnValue = {
      ruleMetadata: {
        'no-foo': {}, // fixable should exist
        'no-bar': { fixable: 900 }, // fixable should be a boolean
        'no-baz': { fixable: true },
      },
    };

    const expectedOutput = [
      'path/to/file.css',
      '  1:2  ×  Unexpected foo     no-foo',
      '  1:2  ‼  Unexpected bar     no-bar',
      '  1:2  ‼  Unexpected baz  √  no-baz',
      '',
      '× 3 problems (1 error, 2 warnings)',
      '  1 warning potentially fixable with the "fix: true" option.'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results, returnValue);

    expect(output).toBe(expectedOutput);
  });
  it('should outputs results with missing ruleMetadata object', () => {
		const results = [
			{
				source: 'path/to/file.css',
				warnings: [
					{
						line: 1,
						column: 2,
						rule: 'no-foo',
						severity: 'error',
						text: 'Unexpected foo',
					},
					{
						line: 1,
						column: 2,
						rule: 'no-bar',
						severity: 'warning',
						text: 'Unexpected bar',
					},
				],
			},
		];

		const returnValue = { ruleMetadata: null };

    const expectedOutput = [
      'path/to/file.css',
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
          {
            line: 1,
            column: 1,
            rule: 'bar',
            severity: 'warning',
            text: 'Unexpected foo',
          },
        ],
      }
    ];

    const expectedOutput = [
      'path/to/file.css',
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
          {
            line: 1,
            column: 2,
            rule: 'no-foo',
            severity: 'error',
            text: 'Unexpected foo',
          },
        ],
      },
      {
        source: 'path/to/file-b.css',
        warnings: [
          {
            line: 1,
            column: 2,
            rule: 'no-bar',
            severity: 'warning',
            text: 'Unexpected bar',
          },
        ],
      },
    ];

    const expectedOutput = [
      'path/to/file-a.css',
      '  1:2  ×  Unexpected foo    no-foo',
      '',
      'path/to/file-b.css',
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
					{
						line: 1,
						column: 1,
						rule: 'rule-name',
						severity: 'warning',
						text: 'Unexpected foo (rule-name)',
					},
				],
			},
		];

    const expectedOutput = [
      'path/to/file.css',
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
					{
						line: 1,
						column: 1,
						rule: 'bar',
						severity: 'error',
						text: 'Unexpected foo',
					},
				],
			},
		];

    const expectedOutput = [
      'path/to/file.css',
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
            reference: 'bar',
          },
        ],
        invalidOptionWarnings: [
          {
            text: 'Unexpected option for baz',
          },
        ],
        warnings: [],
      },
      {
        source: 'path/to/file2.css',
        deprecations: [
          {
            text: 'Deprecated foo.',
            reference: 'bar',
          },
        ],
        invalidOptionWarnings: [
          {
            text: 'Unexpected option for baz',
          },
        ],
        warnings: [],
      },
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
            reference: 'bar',
          },
        ],
        invalidOptionWarnings: [
          {
            text: 'Unexpected option for baz',
          },
        ],
        warnings: [
          {
            line: 1,
            column: 1,
            rule: 'bar',
            severity: 'warning',
            text: 'Unexpected foo',
          },
        ],
      },
      {
        source: 'path/to/file2.css',
        deprecations: [
          {
            text: 'Deprecated foo.',
            reference: 'bar',
          },
        ],
        invalidOptionWarnings: [
          {
            text: 'Unexpected option for baz',
          },
        ],
        warnings: [
          {
            line: 1,
            column: 1,
            rule: 'bar',
            severity: 'warning',
            text: 'Unexpected foo',
          },
        ],
      },
    ];

    const expectedOutput = [
      'Invalid Option: Unexpected option for baz',
      '',
      'Deprecation warnings:',
      ' - Deprecated foo. See: bar',
      '',
      'path/to/file.css',
      '  1:1  ‼  Unexpected foo    bar',
      '',
      'path/to/file2.css',
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
        ignored: true,
      },
    ];

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe('');
  });
	it('should handles empty messages', () => {
		const results = [
			{
				source: 'path/to/file.css',
				warnings: [
					{
						line: 1,
						column: 1,
						rule: 'bar',
						severity: 'error',
						text: '',
					},
				],
			},
		];

    const expectedOutput = [
      'path/to/file.css',
      '  1:1  ×      bar',
      '',
      '× 1 problem (1 error, 0 warnings)'
    ].join('\n');

    const output = cleanFormatterOutput(stylishFormatter, results);

    expect(output).toBe(expectedOutput);
  });
});
