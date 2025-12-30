# @spec T001-e2e-orchestrator
"""
Unit tests for scenario_filter.py module.
"""

import pytest
from pathlib import Path

from scripts.scenario_filter import (
    TestScenario,
    load_scenarios,
    detect_required_systems,
    parse_tag_expression,
    filter_by_tags,
    _parse_single_tag,
    _matches_single_condition,
    _matches_filter
)


class TestLoadScenarios:
    """Test scenario loading from YAML files."""

    @pytest.mark.unit
    def test_load_scenarios_success(self, sample_scenarios_dir):
        """Test loading scenarios from directory."""
        scenarios = load_scenarios(str(sample_scenarios_dir))

        assert len(scenarios) == 3
        assert all(isinstance(s, TestScenario) for s in scenarios)
        assert scenarios[0].scenario_id == "E2E-TEST-001"

    @pytest.mark.unit
    def test_load_scenarios_nonexistent_dir(self, temp_dir):
        """Test loading from non-existent directory raises error."""
        with pytest.raises(FileNotFoundError):
            load_scenarios(str(temp_dir / "nonexistent"))

    @pytest.mark.unit
    def test_load_scenarios_empty_dir(self, temp_dir):
        """Test loading from empty directory returns empty list."""
        empty_dir = temp_dir / "empty"
        empty_dir.mkdir()

        scenarios = load_scenarios(str(empty_dir))

        assert scenarios == []

    @pytest.mark.unit
    def test_scenario_attributes(self, sample_scenarios_dir):
        """Test loaded scenario has all expected attributes."""
        scenarios = load_scenarios(str(sample_scenarios_dir))
        scenario = scenarios[0]

        assert scenario.scenario_id == "E2E-TEST-001"
        assert scenario.spec_ref == "T001"
        assert scenario.title == "测试场景"
        assert 'test' in scenario.tags['module']
        assert scenario.tags['priority'] == 'p1'
        assert len(scenario.steps) == 2
        assert len(scenario.assertions) == 2


class TestDetectRequiredSystems:
    """Test system detection from scenarios."""

    @pytest.mark.unit
    def test_detect_single_system(self, sample_scenarios_dir):
        """Test detecting single system."""
        scenarios = load_scenarios(str(sample_scenarios_dir))

        systems = detect_required_systems(scenarios)

        assert 'b-end' in systems
        assert len(systems) == 1

    @pytest.mark.unit
    def test_detect_multiple_systems(self):
        """Test detecting multiple systems."""
        scenario1 = TestScenario(
            scenario_id='S1',
            spec_ref='T1',
            title='Test',
            description='',
            tags={},
            preconditions={},
            steps=[
                {'action': 'login', 'system': 'c-end'},
                {'action': 'click', 'system': 'b-end'}
            ],
            assertions=[],
            artifacts={},
            metadata={},
            file_path=''
        )

        systems = detect_required_systems([scenario1])

        assert systems == {'c-end', 'b-end'}

    @pytest.mark.unit
    def test_detect_no_systems(self):
        """Test detecting no systems (pure API test)."""
        scenario = TestScenario(
            scenario_id='S1',
            spec_ref='T1',
            title='Test',
            description='',
            tags={},
            preconditions={},
            steps=[
                {'action': 'api_call'},
                {'action': 'verify'}
            ],
            assertions=[],
            artifacts={},
            metadata={},
            file_path=''
        )

        systems = detect_required_systems([scenario])

        assert systems == set()


class TestParseTagExpression:
    """Test tag expression parsing."""

    @pytest.mark.unit
    def test_parse_single_tag(self):
        """Test parsing single tag."""
        result = parse_tag_expression("module:inventory")

        assert result['type'] == 'single'
        assert result['condition']['tag_type'] == 'module'
        assert result['condition']['tag_value'] == 'inventory'

    @pytest.mark.unit
    def test_parse_and_expression(self):
        """Test parsing AND expression."""
        result = parse_tag_expression("module:inventory AND priority:p1")

        assert result['type'] == 'and'
        assert len(result['conditions']) == 2
        assert result['conditions'][0]['tag_type'] == 'module'
        assert result['conditions'][1]['tag_type'] == 'priority'

    @pytest.mark.unit
    def test_parse_or_expression(self):
        """Test parsing OR expression."""
        result = parse_tag_expression("module:inventory OR module:order")

        assert result['type'] == 'or'
        assert len(result['conditions']) == 2

    @pytest.mark.unit
    def test_parse_empty_expression(self):
        """Test parsing empty expression."""
        result = parse_tag_expression("")

        assert result['type'] == 'all'

    @pytest.mark.unit
    def test_parse_tag_without_colon(self):
        """Test parsing tag without colon defaults to module."""
        result = _parse_single_tag("inventory")

        assert result['tag_type'] == 'module'
        assert result['tag_value'] == 'inventory'


class TestFilterByTags:
    """Test scenario filtering by tags."""

    @pytest.mark.unit
    def test_filter_single_tag(self, sample_scenarios_dir):
        """Test filtering with single tag."""
        scenarios = load_scenarios(str(sample_scenarios_dir))

        filtered = filter_by_tags(scenarios, "module:test")

        assert len(filtered) == 3

    @pytest.mark.unit
    def test_filter_priority_tag(self, sample_scenarios_dir):
        """Test filtering by priority tag."""
        scenarios = load_scenarios(str(sample_scenarios_dir))

        filtered = filter_by_tags(scenarios, "priority:p1")

        assert len(filtered) == 2

    @pytest.mark.unit
    def test_filter_and_logic(self, sample_scenarios_dir):
        """Test filtering with AND logic."""
        scenarios = load_scenarios(str(sample_scenarios_dir))

        filtered = filter_by_tags(scenarios, "module:test AND priority:p1")

        assert len(filtered) == 2

    @pytest.mark.unit
    def test_filter_or_logic(self, sample_scenarios_dir):
        """Test filtering with OR logic."""
        scenarios = load_scenarios(str(sample_scenarios_dir))

        filtered = filter_by_tags(scenarios, "priority:p1 OR priority:p2")

        assert len(filtered) == 3

    @pytest.mark.unit
    def test_filter_no_matches(self, sample_scenarios_dir):
        """Test filtering with no matches."""
        scenarios = load_scenarios(str(sample_scenarios_dir))

        filtered = filter_by_tags(scenarios, "module:nonexistent")

        assert len(filtered) == 0

    @pytest.mark.unit
    def test_filter_empty_expression(self, sample_scenarios_dir):
        """Test filtering with empty expression returns all."""
        scenarios = load_scenarios(str(sample_scenarios_dir))

        filtered = filter_by_tags(scenarios, "")

        assert len(filtered) == len(scenarios)


class TestMatchesSingleCondition:
    """Test single condition matching."""

    @pytest.mark.unit
    def test_matches_list_tag(self):
        """Test matching tag in list."""
        scenario = TestScenario(
            scenario_id='S1',
            spec_ref='T1',
            title='Test',
            description='',
            tags={'module': ['inventory', 'order']},
            preconditions={},
            steps=[],
            assertions=[],
            artifacts={},
            metadata={},
            file_path=''
        )

        condition = {'tag_type': 'module', 'tag_value': 'inventory'}

        assert _matches_single_condition(scenario, condition) is True

    @pytest.mark.unit
    def test_matches_string_tag(self):
        """Test matching string tag."""
        scenario = TestScenario(
            scenario_id='S1',
            spec_ref='T1',
            title='Test',
            description='',
            tags={'priority': 'p1'},
            preconditions={},
            steps=[],
            assertions=[],
            artifacts={},
            metadata={},
            file_path=''
        )

        condition = {'tag_type': 'priority', 'tag_value': 'p1'}

        assert _matches_single_condition(scenario, condition) is True

    @pytest.mark.unit
    def test_no_match_missing_tag(self):
        """Test no match when tag missing."""
        scenario = TestScenario(
            scenario_id='S1',
            spec_ref='T1',
            title='Test',
            description='',
            tags={},
            preconditions={},
            steps=[],
            assertions=[],
            artifacts={},
            metadata={},
            file_path=''
        )

        condition = {'tag_type': 'module', 'tag_value': 'test'}

        assert _matches_single_condition(scenario, condition) is False
