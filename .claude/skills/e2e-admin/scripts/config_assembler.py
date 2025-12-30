# @spec T001-e2e-orchestrator
"""
Configuration assembly and validation for E2E test orchestrator.

This module defines the RunConfig dataclass and provides functions
to assemble configuration from CLI arguments and default values.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any
from pathlib import Path
import yaml

try:
    from .utils import generate_run_id, load_yaml
except ImportError:
    from utils import generate_run_id, load_yaml


@dataclass
class RunConfig:
    """
    Test run configuration.

    Represents the complete configuration for a single E2E test execution,
    including run identification, environment settings, execution parameters,
    and selected scenarios.
    """

    run_id: str
    environment: str  # dev, staging, prod
    base_urls: Dict[str, str]  # c-end, b-end
    workers: int  # 1-10
    retries: int  # 0-3
    timeout: int  # milliseconds
    project: str  # fixed: chromium
    selected_scenarios: List[Dict[str, str]]
    skip_flags: Dict[str, bool]
    artifacts: Dict[str, str]  # trace, video, screenshot strategies
    output_dir: str

    @staticmethod
    def default_config(environment: str = 'dev') -> 'RunConfig':
        """
        Create default RunConfig.

        Args:
            environment: Target environment (dev/staging/prod)

        Returns:
            RunConfig with default values loaded from default-config.yaml
        """
        run_id = generate_run_id()

        # Load default configuration
        config_path = Path(__file__).parent.parent / 'assets' / 'default-config.yaml'
        defaults = load_yaml(str(config_path))

        # Get environment-specific baseURLs
        env_config = defaults['environments'].get(environment, defaults['environments']['dev'])

        return RunConfig(
            run_id=run_id,
            environment=environment,
            base_urls={
                'c-end': env_config['c-end'],
                'b-end': env_config['b-end']
            },
            workers=defaults['execution']['workers'],
            retries=defaults['execution']['retries'],
            timeout=defaults['execution']['timeout'],
            project=defaults['execution']['project'],
            selected_scenarios=[],
            skip_flags=defaults['skip_flags'].copy(),
            artifacts=defaults['artifacts'].copy(),
            output_dir=f"test-results/run-{run_id}"
        )

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert RunConfig to dictionary for JSON serialization.

        Returns:
            Dict representation of RunConfig
        """
        return {
            'run_id': self.run_id,
            'environment': self.environment,
            'base_urls': self.base_urls,
            'workers': self.workers,
            'retries': self.retries,
            'timeout': self.timeout,
            'project': self.project,
            'selected_scenarios': self.selected_scenarios,
            'skip_flags': self.skip_flags,
            'artifacts': self.artifacts,
            'output_dir': self.output_dir
        }


def validate_config(config: RunConfig) -> None:
    """
    Validate RunConfig values are within acceptable ranges.

    Args:
        config: RunConfig to validate

    Raises:
        ValueError: If any configuration value is invalid
    """
    # Validate workers
    if not (1 <= config.workers <= 10):
        raise ValueError(f"Workers must be between 1 and 10, got {config.workers}")

    # Validate retries
    if not (0 <= config.retries <= 3):
        raise ValueError(f"Retries must be between 0 and 3, got {config.retries}")

    # Validate timeout
    if config.timeout < 1000:
        raise ValueError(f"Timeout must be at least 1000ms (1 second), got {config.timeout}")

    # Validate environment
    valid_envs = ['dev', 'staging', 'prod']
    if config.environment not in valid_envs:
        raise ValueError(f"Environment must be one of {valid_envs}, got {config.environment}")

    # Validate project (fixed to chromium)
    if config.project != 'chromium':
        raise ValueError(f"Project must be 'chromium', got {config.project}")

    # Validate artifact strategies
    valid_strategies = ['on-failure', 'always', 'off']
    for artifact_type, strategy in config.artifacts.items():
        if strategy not in valid_strategies:
            raise ValueError(
                f"Artifact strategy for {artifact_type} must be one of {valid_strategies}, "
                f"got {strategy}"
            )


def assemble_config_from_args(args: Any) -> RunConfig:
    """
    Assemble RunConfig from CLI arguments, merging with defaults.

    Args:
        args: argparse Namespace containing CLI arguments

    Returns:
        RunConfig assembled from args and defaults

    Raises:
        ValueError: If configuration values are invalid
    """
    # Start with default config for the specified environment
    config = RunConfig.default_config(environment=getattr(args, 'env', 'dev'))

    # Override with CLI arguments if provided
    if hasattr(args, 'workers') and args.workers is not None:
        config.workers = args.workers

    if hasattr(args, 'retries') and args.retries is not None:
        config.retries = args.retries

    if hasattr(args, 'timeout') and args.timeout is not None:
        config.timeout = args.timeout

    # Update skip flags from CLI arguments
    if hasattr(args, 'skip_scenario_validation') and args.skip_scenario_validation:
        config.skip_flags['scenario_validation'] = True

    if hasattr(args, 'skip_data_validation') and args.skip_data_validation:
        config.skip_flags['data_validation'] = True

    if hasattr(args, 'skip_generation') and args.skip_generation:
        config.skip_flags['generation'] = True

    if hasattr(args, 'skip_report_config') and args.skip_report_config:
        config.skip_flags['report_config'] = True

    if hasattr(args, 'skip_artifacts_config') and args.skip_artifacts_config:
        config.skip_flags['artifacts_config'] = True

    # Validate the assembled configuration
    validate_config(config)

    return config
