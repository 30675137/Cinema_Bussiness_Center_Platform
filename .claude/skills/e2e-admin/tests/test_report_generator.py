# @spec T001-e2e-orchestrator
"""
Unit tests for report_generator.py module.
"""

import pytest
import json
import os
from pathlib import Path

from scripts.report_generator import ReportGenerator


class TestReportGenerator:
    """Test ReportGenerator class."""

    @pytest.mark.unit
    def test_init(self, temp_dir):
        """Test ReportGenerator initialization."""
        run_id = "20251230-120000-abcd1234"
        output_dir = temp_dir / "test-results" / f"run-{run_id}"

        generator = ReportGenerator(str(output_dir), run_id)

        assert generator.run_id == run_id
        assert generator.output_dir == output_dir
        assert output_dir.exists()

    @pytest.mark.unit
    def test_extract_playwright_stats_passed(self):
        """Test extracting stats from passed tests."""
        generator = ReportGenerator("output", "run-id")
        output = "5 passed (10.5s)"

        stats = generator.extract_playwright_stats(output)

        assert stats['total'] == 5
        assert stats['passed'] == 5
        assert stats['failed'] == 0
        assert stats['skipped'] == 0

    @pytest.mark.unit
    def test_extract_playwright_stats_mixed(self, mock_playwright_output):
        """Test extracting stats from mixed results."""
        generator = ReportGenerator("output", "run-id")

        stats = generator.extract_playwright_stats(mock_playwright_output)

        # Mock output has "4 passed, 1 failed, 1 flaky" = 6 total tests
        assert stats['total'] == 6
        assert stats['passed'] == 4
        assert stats['failed'] == 1
        assert stats['flaky'] == 1

    @pytest.mark.unit
    def test_extract_playwright_stats_with_skipped(self):
        """Test extracting stats with skipped tests."""
        generator = ReportGenerator("output", "run-id")
        output = "2 skipped, 8 passed (5.2s)"

        stats = generator.extract_playwright_stats(output)

        assert stats['total'] == 10
        assert stats['passed'] == 8
        assert stats['skipped'] == 2

    @pytest.mark.unit
    def test_generate_summary(self, temp_dir, mock_config_dict, mock_execution_times):
        """Test generating summary.json."""
        run_id = mock_config_dict['run_id']
        output_dir = temp_dir / "test-results" / f"run-{run_id}"
        output_dir.mkdir(parents=True)

        generator = ReportGenerator(str(output_dir), run_id)

        playwright_output = "5 passed (10.5s)"
        start, end = mock_execution_times
        scenarios = mock_config_dict['selected_scenarios']

        generator.generate_summary(
            playwright_output=playwright_output,
            execution_start=start,
            execution_end=end,
            config=mock_config_dict,
            selected_scenarios=scenarios
        )

        summary_file = output_dir / 'summary.json'
        assert summary_file.exists()

        with open(summary_file) as f:
            summary = json.load(f)

        assert summary['run_id'] == run_id
        assert summary['environment'] == 'dev'
        assert summary['summary']['total'] == 5
        assert summary['summary']['passed'] == 5

    @pytest.mark.unit
    def test_save_config_snapshot(self, temp_dir, mock_config_dict):
        """Test saving config.json snapshot."""
        run_id = mock_config_dict['run_id']
        output_dir = temp_dir / "test-results" / f"run-{run_id}"
        output_dir.mkdir(parents=True)

        generator = ReportGenerator(str(output_dir), run_id)

        generator.save_config_snapshot(mock_config_dict)

        config_file = output_dir / 'config.json'
        assert config_file.exists()

        with open(config_file) as f:
            config = json.load(f)

        assert config['run_id'] == run_id
        assert config['workers'] == 2

    @pytest.mark.unit
    def test_create_latest_symlink(self, temp_dir):
        """Test creating latest symlink."""
        run_id = "20251230-120000-abcd1234"
        test_results_dir = temp_dir / "test-results"
        output_dir = test_results_dir / f"run-{run_id}"
        output_dir.mkdir(parents=True)

        generator = ReportGenerator(str(output_dir), run_id)

        generator.create_latest_symlink()

        latest_link = test_results_dir / 'latest'
        assert latest_link.exists()
        assert latest_link.is_symlink()

        target = os.readlink(latest_link)
        assert target == f"run-{run_id}"

    @pytest.mark.unit
    def test_create_latest_symlink_overwrites(self, temp_dir):
        """Test symlink overwrites previous link."""
        test_results_dir = temp_dir / "test-results"

        # Create first run
        run_id_1 = "20251230-120000-aaaa1111"
        output_dir_1 = test_results_dir / f"run-{run_id_1}"
        output_dir_1.mkdir(parents=True)
        generator_1 = ReportGenerator(str(output_dir_1), run_id_1)
        generator_1.create_latest_symlink()

        # Create second run
        run_id_2 = "20251230-120001-bbbb2222"
        output_dir_2 = test_results_dir / f"run-{run_id_2}"
        output_dir_2.mkdir(parents=True)
        generator_2 = ReportGenerator(str(output_dir_2), run_id_2)
        generator_2.create_latest_symlink()

        latest_link = test_results_dir / 'latest'
        target = os.readlink(latest_link)

        assert target == f"run-{run_id_2}"

    @pytest.mark.unit
    def test_generate_text_summary(self, temp_dir, mock_config_dict):
        """Test generating text summary output."""
        run_id = mock_config_dict['run_id']
        output_dir = temp_dir / "test-results" / f"run-{run_id}"
        output_dir.mkdir(parents=True)

        generator = ReportGenerator(str(output_dir), run_id)

        summary_data = {
            'run_id': run_id,
            'environment': 'dev',
            'workers': 2,
            'duration_seconds': 12.5,
            'summary': {
                'total': 10,
                'passed': 8,
                'failed': 2,
                'skipped': 0,
                'flaky': 0,
                'retries': {
                    'total_retry_attempts': 3,
                    'scenarios_retried': 2
                }
            }
        }

        text = generator.generate_text_summary(summary_data)

        assert run_id in text
        assert '12.50 秒' in text or '12.5 seconds' in text  # Format uses 2 decimal places
        assert '总计: 10' in text or '10 个场景' in text
        assert '通过: 8' in text or '✅ 通过: 8' in text
        assert '失败: 2' in text or '❌ 失败: 2' in text

    @pytest.mark.unit
    def test_finalize_report(self, temp_dir, mock_config_dict, mock_execution_times):
        """Test complete report finalization."""
        run_id = mock_config_dict['run_id']
        output_dir = temp_dir / "test-results" / f"run-{run_id}"
        output_dir.mkdir(parents=True)

        generator = ReportGenerator(str(output_dir), run_id)

        playwright_output = "5 passed (10.5s)"
        start, end = mock_execution_times
        scenarios = mock_config_dict['selected_scenarios']

        generator.finalize_report(
            playwright_output=playwright_output,
            execution_start=start,
            execution_end=end,
            config=mock_config_dict,
            selected_scenarios=scenarios
        )

        # Verify all files created
        assert (output_dir / 'summary.json').exists()
        assert (output_dir / 'config.json').exists()
        assert (temp_dir / 'test-results' / 'latest').is_symlink()
