# @spec T002-e2e-test-generator
"""
Template Renderer Module

Renders Jinja2 templates for generating test scripts and page objects.
"""

from jinja2 import Environment, FileSystemLoader, Template, TemplateError
from pathlib import Path
from typing import Dict, Any, Optional


class TemplateRenderError(Exception):
    """Custom exception for template rendering errors"""
    pass


def get_template_env() -> Environment:
    """
    Create and configure Jinja2 environment

    Returns:
        Configured Jinja2 Environment
    """
    # Get the templates directory
    skill_dir = Path(__file__).parent.parent
    templates_dir = skill_dir / "assets" / "templates"

    if not templates_dir.exists():
        raise TemplateRenderError(f"Templates directory not found: {templates_dir}")

    # Create Jinja2 environment
    env = Environment(
        loader=FileSystemLoader(str(templates_dir)),
        trim_blocks=True,
        lstrip_blocks=True,
        keep_trailing_newline=True
    )

    # Add custom filters
    env.filters['quote'] = lambda s: f"'{s}'"
    env.filters['doublequote'] = lambda s: f'"{s}"'

    return env


def render_template(template_name: str, context: Dict[str, Any]) -> str:
    """
    Render a Jinja2 template with given context

    Args:
        template_name: Name of the template file (e.g., 'playwright-test-template.ts.j2')
        context: Dictionary of variables to pass to the template

    Returns:
        Rendered template string

    Raises:
        TemplateRenderError: If template not found or rendering fails
    """
    try:
        env = get_template_env()
        template = env.get_template(template_name)
        rendered = template.render(**context)
        return rendered

    except TemplateError as e:
        raise TemplateRenderError(f"Template rendering failed for {template_name}: {str(e)}")
    except Exception as e:
        raise TemplateRenderError(f"Error rendering template {template_name}: {str(e)}")


def render_template_string(template_str: str, context: Dict[str, Any]) -> str:
    """
    Render a template from a string

    Args:
        template_str: Template string with Jinja2 syntax
        context: Dictionary of variables to pass to the template

    Returns:
        Rendered string

    Raises:
        TemplateRenderError: If rendering fails
    """
    try:
        template = Template(template_str)
        rendered = template.render(**context)
        return rendered

    except TemplateError as e:
        raise TemplateRenderError(f"Template string rendering failed: {str(e)}")
    except Exception as e:
        raise TemplateRenderError(f"Error rendering template string: {str(e)}")


def expand_placeholders(code_template: str, params: Dict[str, Any]) -> str:
    """
    Expand {{placeholder}} in code templates with actual values

    Args:
        code_template: Code string with {{placeholder}} syntax
        params: Dictionary of placeholder values

    Returns:
        Code string with placeholders replaced

    Example:
        >>> expand_placeholders("await page.click('{{selector}}')", {"selector": "#btn"})
        "await page.click('#btn')"
    """
    try:
        return render_template_string(code_template, params)
    except TemplateRenderError:
        # If rendering fails, return original template with TODO comment
        return f"// TODO: Failed to expand template - {code_template}"


def format_import_statements(page_objects: set, framework: str = 'playwright') -> str:
    """
    Generate import statements for page objects

    Args:
        page_objects: Set of page object class names
        framework: Target framework ('playwright', 'postman', 'restclient')

    Returns:
        Formatted import statements string
    """
    if framework == 'playwright':
        imports = []
        for page_object in sorted(page_objects):
            imports.append(f"import {{ {page_object} }} from './pages/{page_object}';")
        return '\n'.join(imports)
    else:
        return ""


def format_testdata_import(testdata_refs: set, framework: str = 'playwright') -> str:
    """
    Generate testdata import statement

    Args:
        testdata_refs: Set of testdata reference strings
        framework: Target framework

    Returns:
        Formatted import statement string
    """
    if framework == 'playwright' and testdata_refs:
        return "import { loadTestData } from '@/testdata/loader';"
    else:
        return ""


def add_code_attribution(code: str, spec_id: str = "T002-e2e-test-generator") -> str:
    """
    Add @spec attribution comment to generated code

    Args:
        code: Generated code string
        spec_id: Specification ID

    Returns:
        Code with attribution comment prepended
    """
    attribution = f"// @spec {spec_id}\n"
    return attribution + code


def add_auto_generated_marker(code: str, source_file: str = "") -> str:
    """
    Add AUTO-GENERATED marker to code

    Args:
        code: Generated code string
        source_file: Optional source file path

    Returns:
        Code with AUTO-GENERATED marker
    """
    marker = "// AUTO-GENERATED: Do not modify above this line\n"
    if source_file:
        marker += f"// Generated from: {source_file}\n"
    marker += "\n"

    return marker + code


def add_custom_code_section(code: str) -> str:
    """
    Add CUSTOM CODE START/END markers to code

    Args:
        code: Generated code string

    Returns:
        Code with CUSTOM CODE section
    """
    custom_section = """
    // CUSTOM CODE START
    // Add your custom test logic here
    // CUSTOM CODE END"""

    return code + custom_section
