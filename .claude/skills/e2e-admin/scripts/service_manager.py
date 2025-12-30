# @spec T001-e2e-orchestrator
"""
开发服务器生命周期管理模块。

负责启动、停止和健康检查 C端/B端开发服务器。
"""

import subprocess
import socket
import time
import signal
from typing import Optional, Dict
from pathlib import Path

try:
    from .utils import load_yaml
except ImportError:
    from utils import load_yaml


class ServiceManager:
    """开发服务器管理器。"""

    def __init__(self, config_path: Optional[str] = None):
        """
        初始化服务管理器。

        Args:
            config_path: 配置文件路径（默认使用 default-config.yaml）
        """
        if config_path is None:
            config_path = str(
                Path(__file__).parent.parent / 'assets' / 'default-config.yaml'
            )

        self.config = load_yaml(config_path)
        self.services = self.config.get('services', {})
        self.processes: Dict[str, subprocess.Popen] = {}

    def check_port_available(self, port: int, timeout: int = 10) -> bool:
        """
        检查端口是否可用（TCP 连接检查）。

        Args:
            port: 端口号
            timeout: 超时时间（秒）

        Returns:
            bool: 端口是否可用（True = 已监听，False = 未监听）
        """
        start_time = time.time()

        while time.time() - start_time < timeout:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('localhost', port))
                sock.close()

                if result == 0:
                    return True  # 端口已监听

            except Exception:
                pass

            time.sleep(0.5)

        return False  # 超时，端口未监听

    def is_port_in_use(self, port: int) -> bool:
        """
        检查端口是否已被占用。

        Args:
            port: 端口号

        Returns:
            bool: 端口是否已被占用
        """
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            return result == 0  # 0 表示连接成功（端口被占用）
        except Exception:
            return False

    def start_service(self, system: str) -> subprocess.Popen:
        """
        启动开发服务器。

        Args:
            system: 系统标识 ('c-end' 或 'b-end')

        Returns:
            subprocess.Popen: 启动的进程对象

        Raises:
            RuntimeError: 如果端口已被占用或启动失败
        """
        if system not in self.services:
            raise ValueError(f"未知的系统: {system}，支持的系统: {list(self.services.keys())}")

        service_config = self.services[system]
        port = service_config['port']
        working_dir = service_config['working_dir']
        start_command = service_config['start_command']
        health_check_timeout = service_config.get('health_check_timeout', 10)

        # 检查端口是否已被占用
        if self.is_port_in_use(port):
            print(f"✅ {system} 服务已在端口 {port} 运行")
            return None  # 已启动，无需重复启动

        print(f"🚀 启动 {system} 服务 (端口 {port})...")

        # 构建命令
        # 使用 shell=True 以支持 npm run 等命令
        cmd = f"cd {working_dir} && {start_command}"

        try:
            # 启动进程
            process = subprocess.Popen(
                cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                preexec_fn=None if subprocess.os.name == 'nt' else lambda: signal.signal(signal.SIGINT, signal.SIG_IGN)
            )

            # 等待服务启动（端口监听检查）
            if self.check_port_available(port, timeout=health_check_timeout):
                print(f"✅ {system} 服务已就绪 (端口 {port})")
                self.processes[system] = process
                return process
            else:
                # 启动超时
                process.terminate()
                raise RuntimeError(
                    f"{system} 服务启动超时（{health_check_timeout}秒内端口 {port} 未监听）"
                )

        except Exception as e:
            raise RuntimeError(f"{system} 服务启动失败: {e}") from e

    def stop_service(self, system: str, graceful: bool = True) -> None:
        """
        停止开发服务器。

        Args:
            system: 系统标识 ('c-end' 或 'b-end')
            graceful: 是否优雅停止（先 SIGTERM，5秒后 SIGKILL）

        Raises:
            ValueError: 如果系统未启动
        """
        if system not in self.processes:
            print(f"⚠️  {system} 服务未启动或已停止")
            return

        process = self.processes[system]

        if process.poll() is not None:
            # 进程已结束
            print(f"✅ {system} 服务已停止")
            del self.processes[system]
            return

        print(f"🛑 停止 {system} 服务...")

        try:
            if graceful:
                # 优雅停止：先发送 SIGTERM
                process.terminate()
                try:
                    process.wait(timeout=5)
                    print(f"✅ {system} 服务已优雅停止")
                except subprocess.TimeoutExpired:
                    # 5秒后仍未退出，强制 SIGKILL
                    print(f"⚠️  {system} 服务未响应 SIGTERM，强制停止...")
                    process.kill()
                    process.wait()
                    print(f"✅ {system} 服务已强制停止")
            else:
                # 直接强制停止
                process.kill()
                process.wait()
                print(f"✅ {system} 服务已强制停止")

        except Exception as e:
            print(f"⚠️  停止 {system} 服务时出错: {e}")

        finally:
            del self.processes[system]

    def stop_all_services(self, graceful: bool = True) -> None:
        """
        停止所有已启动的服务。

        Args:
            graceful: 是否优雅停止
        """
        systems = list(self.processes.keys())  # 复制键列表，避免迭代时修改字典
        for system in systems:
            self.stop_service(system, graceful=graceful)

    def get_running_services(self) -> list:
        """
        获取当前运行的服务列表。

        Returns:
            list: 运行中的系统标识列表
        """
        running = []
        for system, process in self.processes.items():
            if process.poll() is None:  # 进程仍在运行
                running.append(system)
        return running
