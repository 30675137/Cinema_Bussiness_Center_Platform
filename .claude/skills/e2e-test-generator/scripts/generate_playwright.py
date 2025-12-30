# @spec T002-e2e-test-generator
"""
Playwright Code Generator

Generates Playwright TypeScript test scripts from E2E scenario YAML files.
"""

from pathlib import Path
from typing import Dict, Any, Set
import yaml_parser
import schema_validator
import config_loader
import template_renderer
import file_utils


class PlaywrightGenerationError(Exception):
    """Custom exception for Playwright generation errors"""
    pass


def generate_step_code(step: Dict[str, Any], action_mappings: Dict[str, Any]) -> str:
    """
    Generate Playwright code for a single test step

    Args:
        step: Step dictionary from scenario YAML
        action_mappings: Action to code mappings

    Returns:
        Generated code string for the step
    """
    action_name = step.get('action')

    if not action_name:
        return "// TODO: Missing action name"

    try:
        action_mapping = config_loader.get_action_mapping(action_name, 'playwright')
    except config_loader.ConfigLoadError:
        return f"// TODO: Unknown action '{action_name}' - implement manually"

    code_template = action_mapping.get('code', '')
    params = step.get('params', {})

    # Expand placeholders in the code template
    try:
        code = template_renderer.expand_placeholders(code_template, params)
    except template_renderer.TemplateRenderError:
        code = f"// TODO: Failed to generate code for action '{action_name}'"

    return code


def generate_assertion_code(assertion: Dict[str, Any], assertion_mappings: Dict[str, Any]) -> str:
    """
    Generate Playwright code for a single assertion

    Args:
        assertion: Assertion dictionary from scenario YAML
        assertion_mappings: Assertion to code mappings

    Returns:
        Generated code string for the assertion
    """
    check_type = assertion.get('check')

    if not check_type:
        return "// TODO: Missing assertion check type"

    try:
        assertion_mapping = config_loader.get_assertion_mapping(check_type, 'playwright')
    except config_loader.ConfigLoadError:
        return f"// TODO: Unknown assertion '{check_type}' - implement manually"

    code_template = assertion_mapping.get('code', '')
    params = assertion.get('params', {})

    # Expand placeholders in the code template
    try:
        code = template_renderer.expand_placeholders(code_template, params)
    except template_renderer.TemplateRenderError:
        code = f"// TODO: Failed to generate code for assertion '{check_type}'"

    return code


def extract_page_objects_from_steps(
    steps: list,
    action_mappings: Dict[str, Any]
) -> Set[str]:
    """
    Extract required page objects from scenario steps

    Args:
        steps: List of step dictionaries
        action_mappings: Action mappings configuration

    Returns:
        Set of page object class names
    """
    page_objects = set()

    for step in steps:
        action_name = step.get('action')
        if action_name and action_name in action_mappings:
            action_config = action_mappings.get(action_name, {})
            playwright_config = action_config.get('playwright', {})
            imports = playwright_config.get('imports', [])
            page_objects.update(imports)

    return page_objects


def generate_playwright_test(scenario_filepath: str) -> str:
    """
    Generate Playwright TypeScript test script from scenario YAML

    Args:
        scenario_filepath: Path to the scenario YAML file

    Returns:
        Generated Playwright test script content

    Raises:
        PlaywrightGenerationError: If generation fails
    """
    try:
        # Parse and validate scenario YAML
        scenario_data = yaml_parser.parse_scenario_with_validation(scenario_filepath)
        schema_validator.validate_scenario_schema(scenario_data)

        # Load action and assertion mappings
        action_mappings = config_loader.load_action_mappings()
        assertion_mappings = config_loader.load_assertion_mappings()

        # Generate code for each step
        for step in scenario_data.get('steps', []):
            step['generated_code'] = generate_step_code(step, action_mappings)

        # Generate code for each assertion
        for assertion in scenario_data.get('assertions', []):
            assertion['generated_code'] = generate_assertion_code(assertion, assertion_mappings)

        # Extract required page objects
        page_objects = extract_page_objects_from_steps(
            scenario_data.get('steps', []),
            action_mappings
        )

        # Extract testdata references
        testdata_refs = yaml_parser.extract_testdata_refs(scenario_data)

        # Prepare template context
        context = {
            'scenario': scenario_data,
            'page_objects': page_objects,
            'testdata_refs': testdata_refs,
            'source_file': scenario_filepath
        }

        # Render Playwright test template
        test_code = template_renderer.render_template(
            'playwright-test-template.ts.j2',
            context
        )

        return test_code

    except yaml_parser.YAMLParseError as e:
        raise PlaywrightGenerationError(f"YAML parsing failed: {str(e)}")
    except schema_validator.SchemaValidationError as e:
        raise PlaywrightGenerationError(f"Schema validation failed: {str(e)}")
    except config_loader.ConfigLoadError as e:
        raise PlaywrightGenerationError(f"Configuration loading failed: {str(e)}")
    except template_renderer.TemplateRenderError as e:
        raise PlaywrightGenerationError(f"Template rendering failed: {str(e)}")
    except Exception as e:
        raise PlaywrightGenerationError(f"Unexpected error: {str(e)}")


def save_playwright_test(
    scenario_filepath: str,
    output_filepath: str,
    force: bool = False
) -> Dict[str, Any]:
    """
    Generate and save Playwright test script

    Args:
        scenario_filepath: Path to the scenario YAML file
        output_filepath: Path where to save the generated test
        force: If True, overwrite existing files without checking

    Returns:
        Dict with generation result info

    Raises:
        PlaywrightGenerationError: If generation or save fails
    """
    # Generate test code
    test_code = generate_playwright_test(scenario_filepath)

    # Check if file already exists
    if Path(output_filepath).exists() and not force:
        # Load metadata to check modification
        scenario_id = yaml_parser.parse_scenario_yaml(scenario_filepath)['scenario_id']
        metadata = file_utils.load_file_metadata(scenario_id)

        if metadata:
            current_hash = file_utils.calculate_file_hash(output_filepath)
            current_content = file_utils.read_file(output_filepath)

            mod_level = file_utils.detect_modification_level(
                metadata['original_hash'],
                current_hash,
                current_content
            )

            if mod_level == 'high':
                # High modification - generate .new file
                new_filepath = output_filepath.replace('.spec.ts', '.spec.new.ts')
                file_utils.write_file(new_filepath, test_code)

                return {
                    'status': 'generated_new_file',
                    'filepath': new_filepath,
                    'message': f'High modification detected. Generated {new_filepath} for manual merge.'
                }
            elif mod_level == 'low':
                # Low modification - merge custom code
                custom_code = file_utils.extract_custom_code(current_content)
                if custom_code:
                    test_code = file_utils.merge_custom_code(test_code, custom_code)

    # Write file
    file_utils.write_file(output_filepath, test_code)

    # Store metadata
    scenario_id = yaml_parser.parse_scenario_yaml(scenario_filepath)['scenario_id']
    file_hash = file_utils.calculate_file_hash(output_filepath)
    file_utils.store_file_metadata(scenario_id, output_filepath, file_hash, 'playwright')

    return {
        'status': 'created' if not Path(output_filepath).exists() else 'updated',
        'filepath': output_filepath,
        'message': f'Successfully generated {output_filepath}'
    }


def generate_for_scenario(scenario_id: str, module: str = None) -> Dict[str, Any]:
    """
    Generate Playwright test for a scenario by ID

    Args:
        scenario_id: Scenario ID (e.g., 'E2E-INVENTORY-001')
        module: Optional module name (e.g., 'inventory')

    Returns:
        Dict with generation result

    Raises:
        PlaywrightGenerationError: If scenario not found or generation fails
    """
    # Determine module from scenario_id if not provided
    if not module:
        parts = scenario_id.split('-')
        if len(parts) >= 2:
            module = parts[1].lower()
        else:
            raise PlaywrightGenerationError(f"Cannot determine module from {scenario_id}")

    # Construct paths
    scenario_filepath = f"scenarios/{module}/{scenario_id}.yaml"
    output_filepath = f"scenarios/{module}/{scenario_id}.spec.ts"

    if not Path(scenario_filepath).exists():
        raise PlaywrightGenerationError(f"Scenario file not found: {scenario_filepath}")

    return save_playwright_test(scenario_filepath, output_filepath)
