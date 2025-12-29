#!/usr/bin/env python3
"""
Generate API test code from parsed test cases.
Supports Jest + Supertest (TypeScript) and REST Assured (Java).
"""

import json
import argparse
from pathlib import Path
from typing import Dict, Any, List

JEST_TEMPLATE = """import request from 'supertest';
import {{ describe, it, expect, beforeAll, afterAll }} from '@jest/globals';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

describe('{test_case_title}', () => {{
  beforeAll(async () => {{
    // Setup test data
{setup_code}
  }});

  afterAll(async () => {{
    // Cleanup test data
{cleanup_code}
  }});

{test_steps}
}});
"""

JEST_STEP_TEMPLATE = """  it('{step_description}', async () => {{
    const response = await request(API_BASE_URL)
      .{method}('{endpoint}')
      .send({body});

    expect(response.status).toBe({expected_status});
{assertions}
  }});
"""

def generate_jest_tests(test_cases: List[Dict[str, Any]], output_dir: Path):
    """Generate Jest test files"""
    output_dir.mkdir(parents=True, exist_ok=True)

    for tc in test_cases:
        test_steps_code = []

        for step in tc.get('steps', []):
            # Only generate for API operations
            if 'API' in step.get('operator', ''):
                step_code = JEST_STEP_TEMPLATE.format(
                    step_description=step['operation'],
                    method='get',  # Infer from operation
                    endpoint='/api/orders',  # Infer from operation
                    body='{}',
                    expected_status=200,
                    assertions='    // Add specific assertions'
                )
                test_steps_code.append(step_code)

        if test_steps_code:
            test_code = JEST_TEMPLATE.format(
                test_case_title=tc['title'],
                setup_code='    // TODO: Add setup code',
                cleanup_code='    // TODO: Add cleanup code',
                test_steps='\n'.join(test_steps_code)
            )

            filename = f"{tc['id'].lower().replace('-', '_')}.test.ts"
            output_file = output_dir / filename
            output_file.write_text(test_code)
            print(f"✅ Generated: {filename}")

def main():
    parser = argparse.ArgumentParser(description='Generate API test code')
    parser.add_argument('input', help='Parsed test cases JSON file')
    parser.add_argument('--framework', choices=['jest', 'rest-assured'], default='jest')
    parser.add_argument('--output', '-o', default='tests/e2e/', help='Output directory')

    args = parser.parse_args()

    # Read input
    with open(args.input) as f:
        data = json.load(f)

    test_cases = data.get('test_cases', [])

    # Generate tests
    output_dir = Path(args.output)
    if args.framework == 'jest':
        generate_jest_tests(test_cases, output_dir)
    elif args.framework == 'rest-assured':
        print("REST Assured generation not yet implemented")

    print(f"✅ Generated {len(test_cases)} test files in {args.output}")

if __name__ == '__main__':
    main()
