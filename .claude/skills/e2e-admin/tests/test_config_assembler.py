# @spec T001-e2e-orchestrator
"""
Unit tests for config_assembler.py module.
"""

import pytest
from argparse import Namespace

from scripts.config_assembler import (
    RunConfig,
    validate_config,
    assemble_config_from_args
)


class TestRunConfig:
    """Test RunConfig dataclass."""

    @pytest.mark.unit
    def test_default_config(self):
        """Test creating default config."""
        config = RunConfig.default_config('dev')

        assert config.environment == 'dev'
        assert config.workers == 1
        assert config.retries == 0
        assert config.timeout == 30000
        assert config.project == 'chromium'
        assert config.base_urls['c-end'] == 'http://localhost:10086'
        assert config.base_urls['b-end'] == 'http://localhost:3000'

    @pytest.mark.unit
    def test_staging_environment(self):
        """Test staging environment baseURLs."""
        config = RunConfig.default_config('staging')

        assert config.environment == 'staging'
        assert 'staging' in config.base_urls['c-end']
        assert 'staging' in config.base_urls['b-end']

    @pytest.mark.unit
    def test_output_dir_format(self):
        """Test output directory includes run_id."""
        config = RunConfig.default_config('dev')

        assert config.output_dir.startswith('test-results/run-')
        assert config.run_id in config.output_dir

    @pytest.mark.unit
    def test_to_dict(self):
        """Test converting RunConfig to dict."""
        config = RunConfig.default_config('dev')

        data = config.to_dict()

        assert isinstance(data, dict)
        assert data['run_id'] == config.run_id
        assert data['environment'] == 'dev'
        assert data['workers'] == 1


class TestValidateConfig:
    """Test config validation."""

    @pytest.mark.unit
    def test_valid_config(self):
        """Test validation passes for valid config."""
        config = RunConfig.default_config('dev')

        # Should not raise
        validate_config(config)

    @pytest.mark.unit
    def test_invalid_workers_too_low(self):
        """Test validation fails for workers < 1."""
        config = RunConfig.default_config('dev')
        config.workers = 0

        with pytest.raises(ValueError) as exc_info:
            validate_config(config)

        assert "Workers must be between 1 and 10" in str(exc_info.value)

    @pytest.mark.unit
    def test_invalid_workers_too_high(self):
        """Test validation fails for workers > 10."""
        config = RunConfig.default_config('dev')
        config.workers = 11

        with pytest.raises(ValueError) as exc_info:
            validate_config(config)

        assert "Workers must be between 1 and 10" in str(exc_info.value)

    @pytest.mark.unit
    def test_invalid_retries_too_low(self):
        """Test validation fails for retries < 0."""
        config = RunConfig.default_config('dev')
        config.retries = -1

        with pytest.raises(ValueError) as exc_info:
            validate_config(config)

        assert "Retries must be between 0 and 3" in str(exc_info.value)

    @pytest.mark.unit
    def test_invalid_retries_too_high(self):
        """Test validation fails for retries > 3."""
        config = RunConfig.default_config('dev')
        config.retries = 4

        with pytest.raises(ValueError) as exc_info:
            validate_config(config)

        assert "Retries must be between 0 and 3" in str(exc_info.value)

    @pytest.mark.unit
    def test_invalid_timeout(self):
        """Test validation fails for timeout < 1000ms."""
        config = RunConfig.default_config('dev')
        config.timeout = 500

        with pytest.raises(ValueError) as exc_info:
            validate_config(config)

        assert "Timeout must be at least 1000ms" in str(exc_info.value)

    @pytest.mark.unit
    def test_invalid_environment(self):
        """Test validation fails for invalid environment."""
        config = RunConfig.default_config('dev')
        config.environment = 'invalid'

        with pytest.raises(ValueError) as exc_info:
            validate_config(config)

        assert "Environment must be one of" in str(exc_info.value)

    @pytest.mark.unit
    def test_invalid_project(self):
        """Test validation fails for non-chromium project."""
        config = RunConfig.default_config('dev')
        config.project = 'firefox'

        with pytest.raises(ValueError) as exc_info:
            validate_config(config)

        assert "Project must be 'chromium'" in str(exc_info.value)

    @pytest.mark.unit
    def test_invalid_artifact_strategy(self):
        """Test validation fails for invalid artifact strategy."""
        config = RunConfig.default_config('dev')
        config.artifacts['trace'] = 'invalid'

        with pytest.raises(ValueError) as exc_info:
            validate_config(config)

        assert "Artifact strategy" in str(exc_info.value)


class TestAssembleConfigFromArgs:
    """Test config assembly from CLI arguments."""

    @pytest.mark.unit
    def test_assemble_default_config(self):
        """Test assembling config with defaults."""
        args = Namespace(env='dev')

        config = assemble_config_from_args(args)

        assert config.environment == 'dev'
        assert config.workers == 1
        assert config.retries == 0

    @pytest.mark.unit
    def test_assemble_with_workers(self):
        """Test assembling config with custom workers."""
        args = Namespace(env='dev', workers=4, retries=None, timeout=None)

        config = assemble_config_from_args(args)

        assert config.workers == 4

    @pytest.mark.unit
    def test_assemble_with_retries(self):
        """Test assembling config with custom retries."""
        args = Namespace(env='dev', workers=None, retries=2, timeout=None)

        config = assemble_config_from_args(args)

        assert config.retries == 2

    @pytest.mark.unit
    def test_assemble_with_timeout(self):
        """Test assembling config with custom timeout."""
        args = Namespace(env='dev', workers=None, retries=None, timeout=60000)

        config = assemble_config_from_args(args)

        assert config.timeout == 60000

    @pytest.mark.unit
    def test_assemble_with_skip_flags(self):
        """Test assembling config with skip flags."""
        args = Namespace(
            env='dev',
            workers=None,
            retries=None,
            timeout=None,
            skip_scenario_validation=True,
            skip_data_validation=True,
            skip_generation=False,
            skip_report_config=False,
            skip_artifacts_config=False
        )

        config = assemble_config_from_args(args)

        assert config.skip_flags['scenario_validation'] is True
        assert config.skip_flags['data_validation'] is True
        assert config.skip_flags['generation'] is False

    @pytest.mark.unit
    def test_assemble_invalid_config_raises(self):
        """Test assembling invalid config raises ValueError."""
        args = Namespace(env='dev', workers=20, retries=None, timeout=None)

        with pytest.raises(ValueError):
            assemble_config_from_args(args)
