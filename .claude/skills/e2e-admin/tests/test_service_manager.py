# @spec T001-e2e-orchestrator
"""
Unit tests for service_manager.py module.
"""

import pytest
import socket
import subprocess
from unittest.mock import Mock, MagicMock, patch, call
from pathlib import Path

from scripts.service_manager import ServiceManager


class TestServiceManager:
    """Test ServiceManager class."""

    @pytest.mark.unit
    def test_init_with_default_config(self, temp_dir):
        """Test ServiceManager initialization with default config."""
        # Create a mock config file
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("""
services:
  c-end:
    port: 10086
    working_dir: ./hall-reserve-taro
    start_command: npm run dev:h5
  b-end:
    port: 3000
    working_dir: ./frontend
    start_command: npm run dev
""")

        manager = ServiceManager(str(config_file))

        assert 'c-end' in manager.services
        assert 'b-end' in manager.services
        assert manager.services['c-end']['port'] == 10086
        assert manager.services['b-end']['port'] == 3000

    @pytest.mark.unit
    @patch('socket.socket')
    def test_is_port_in_use_true(self, mock_socket_class, temp_dir):
        """Test port in use detection (port is in use)."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Mock socket to return 0 (success - port in use)
        mock_socket = Mock()
        mock_socket.connect_ex.return_value = 0
        mock_socket_class.return_value = mock_socket

        result = manager.is_port_in_use(3000)

        assert result is True
        mock_socket.connect_ex.assert_called_once_with(('localhost', 3000))
        mock_socket.close.assert_called_once()

    @pytest.mark.unit
    @patch('socket.socket')
    def test_is_port_in_use_false(self, mock_socket_class, temp_dir):
        """Test port in use detection (port is available)."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Mock socket to return non-zero (failure - port available)
        mock_socket = Mock()
        mock_socket.connect_ex.return_value = 1
        mock_socket_class.return_value = mock_socket

        result = manager.is_port_in_use(3000)

        assert result is False
        mock_socket.close.assert_called_once()

    @pytest.mark.unit
    @patch('socket.socket')
    def test_is_port_in_use_exception(self, mock_socket_class, temp_dir):
        """Test port in use detection handles socket exceptions."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Mock socket to raise exception
        mock_socket = Mock()
        mock_socket.connect_ex.side_effect = socket.error("Connection failed")
        mock_socket_class.return_value = mock_socket

        result = manager.is_port_in_use(3000)

        assert result is False

    @pytest.mark.unit
    @patch('socket.socket')
    @patch('time.sleep')
    def test_check_port_available_success(self, mock_sleep, mock_socket_class, temp_dir):
        """Test successful port availability check."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Mock port becomes available on first check
        mock_socket = Mock()
        mock_socket.connect_ex.return_value = 0
        mock_socket_class.return_value = mock_socket

        result = manager.check_port_available(3000, timeout=5)

        assert result is True

    @pytest.mark.unit
    @patch('socket.socket')
    @patch('time.sleep')
    @patch('time.time')
    def test_check_port_available_timeout(self, mock_time, mock_sleep, mock_socket_class, temp_dir):
        """Test port availability check timeout."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Mock time to simulate timeout
        mock_time.side_effect = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]  # Exceeds 2 second timeout

        # Mock port never becomes available
        mock_socket = Mock()
        mock_socket.connect_ex.return_value = 1  # Port always unavailable
        mock_socket_class.return_value = mock_socket

        result = manager.check_port_available(3000, timeout=2)

        assert result is False

    @pytest.mark.unit
    @patch('subprocess.Popen')
    @patch.object(ServiceManager, 'is_port_in_use', return_value=False)
    @patch.object(ServiceManager, 'check_port_available', return_value=True)
    @patch('builtins.print')
    def test_start_service_success(self, mock_print, mock_check, mock_is_port, mock_popen, temp_dir):
        """Test successful service startup."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("""
services:
  c-end:
    port: 10086
    working_dir: ./hall-reserve-taro
    start_command: npm run dev:h5
    health_check_timeout: 10
""")
        manager = ServiceManager(str(config_file))

        # Mock process
        mock_process = Mock()
        mock_process.poll.return_value = None  # Process is running
        mock_popen.return_value = mock_process

        result = manager.start_service('c-end')

        assert result == mock_process
        assert 'c-end' in manager.processes
        mock_popen.assert_called_once()

    @pytest.mark.unit
    @patch.object(ServiceManager, 'is_port_in_use', return_value=True)
    @patch('builtins.print')
    def test_start_service_already_running(self, mock_print, mock_is_port, temp_dir):
        """Test service startup when port already in use."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("""
services:
  c-end:
    port: 10086
    working_dir: ./hall-reserve-taro
    start_command: npm run dev:h5
""")
        manager = ServiceManager(str(config_file))

        result = manager.start_service('c-end')

        assert result is None  # Should return None if already running

    @pytest.mark.unit
    @patch('subprocess.Popen')
    @patch.object(ServiceManager, 'is_port_in_use', return_value=False)
    @patch.object(ServiceManager, 'check_port_available', return_value=False)
    @patch('builtins.print')
    def test_start_service_timeout(self, mock_print, mock_check, mock_is_port, mock_popen, temp_dir):
        """Test service startup timeout."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("""
services:
  c-end:
    port: 10086
    working_dir: ./hall-reserve-taro
    start_command: npm run dev:h5
    health_check_timeout: 1
""")
        manager = ServiceManager(str(config_file))

        # Mock process
        mock_process = Mock()
        mock_popen.return_value = mock_process

        with pytest.raises(RuntimeError) as exc_info:
            manager.start_service('c-end')

        assert "启动超时" in str(exc_info.value)
        mock_process.terminate.assert_called_once()

    @pytest.mark.unit
    def test_start_service_invalid_system(self, temp_dir):
        """Test service startup with invalid system name."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("""
services:
  c-end:
    port: 10086
    working_dir: ./hall-reserve-taro
    start_command: npm run dev:h5
""")
        manager = ServiceManager(str(config_file))

        with pytest.raises(ValueError) as exc_info:
            manager.start_service('invalid-system')

        assert "未知的系统" in str(exc_info.value)

    @pytest.mark.unit
    @patch('builtins.print')
    def test_stop_service_graceful(self, mock_print, temp_dir):
        """Test graceful service shutdown."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Mock running process
        mock_process = Mock()
        mock_process.poll.return_value = None  # Process is running
        manager.processes['c-end'] = mock_process

        manager.stop_service('c-end', graceful=True)

        mock_process.terminate.assert_called_once()
        mock_process.wait.assert_called_once()
        assert 'c-end' not in manager.processes

    @pytest.mark.unit
    @patch('builtins.print')
    def test_stop_service_force_kill(self, mock_print, temp_dir):
        """Test force kill when graceful shutdown fails."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Mock stubborn process that doesn't terminate
        mock_process = Mock()
        mock_process.poll.return_value = None  # Never exits
        mock_process.wait.side_effect = [subprocess.TimeoutExpired(cmd="", timeout=5), None]
        manager.processes['c-end'] = mock_process

        manager.stop_service('c-end', graceful=True)

        mock_process.terminate.assert_called_once()
        mock_process.kill.assert_called_once()
        assert 'c-end' not in manager.processes

    @pytest.mark.unit
    @patch('builtins.print')
    def test_stop_service_not_running(self, mock_print, temp_dir):
        """Test stopping a service that isn't running."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Should not raise error
        manager.stop_service('c-end')

        # Verify no services running
        assert 'c-end' not in manager.processes

    @pytest.mark.unit
    @patch('builtins.print')
    def test_stop_all_services(self, mock_print, temp_dir):
        """Test stopping all running services."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Mock processes
        mock_process_1 = Mock()
        mock_process_1.poll.return_value = None

        mock_process_2 = Mock()
        mock_process_2.poll.return_value = None

        manager.processes['c-end'] = mock_process_1
        manager.processes['b-end'] = mock_process_2

        manager.stop_all_services(graceful=True)

        assert len(manager.processes) == 0
        mock_process_1.terminate.assert_called_once()
        mock_process_2.terminate.assert_called_once()

    @pytest.mark.unit
    def test_get_running_services(self, temp_dir):
        """Test getting list of running services."""
        config_file = temp_dir / "test-config.yaml"
        config_file.write_text("services: {}")
        manager = ServiceManager(str(config_file))

        # Add some processes
        mock_running = Mock()
        mock_running.poll.return_value = None  # Running

        mock_stopped = Mock()
        mock_stopped.poll.return_value = 0  # Stopped

        manager.processes['c-end'] = mock_running
        manager.processes['b-end'] = mock_stopped

        running = manager.get_running_services()

        assert 'c-end' in running
        assert 'b-end' not in running
        assert len(running) == 1
