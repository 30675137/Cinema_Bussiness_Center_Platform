"""Environment variable management module."""

import os
import re
from pathlib import Path
from typing import List, Optional, Tuple
from utils.file_ops import read_file_safe, write_file_safe
from utils.logger import log_info, log_warning, log_error, log_debug


def detect_config_file() -> Optional[Path]:
    """
    检测 shell 配置文件（优先 ~/.zshrc，其次 ~/.zshenv）
    
    Returns:
        配置文件路径，如果都不存在返回 None
    """
    home = Path.home()
    config_files = [
        home / ".zshrc",
        home / ".zshenv",
    ]
    
    for config_file in config_files:
        if config_file.exists() and config_file.is_file():
            log_debug(f"检测到配置文件: {config_file}")
            return config_file
    
    return None


def cleanup_env_vars_from_files() -> bool:
    """
    从 shell 配置文件中移除 Claude 相关的环境变量和 alias
    
    支持清理以下格式的 ANTHROPIC_* 变量：
    1. export ANTHROPIC_* 语句（整行或行内）
    2. 函数内部的 ANTHROPIC_* 变量
    3. alias 定义中的 ANTHROPIC_* 变量
    4. 多行变量定义（反斜杠续行）
    
    Returns:
        如果清理成功返回 True，否则返回 False
    """
    config_file = detect_config_file()
    
    if not config_file:
        log_info("未找到 shell 配置文件，跳过环境变量清理")
        return True
    
    try:
        content = read_file_safe(config_file)
        if content is None:
            log_warning(f"无法读取配置文件: {config_file}")
            return False
        
        original_content = content
        lines = content.split('\n')
        removed_vars: List[Tuple[str, int, str]] = []  # (var_name, line_num, var_type)
        new_lines = []
        
        # 状态跟踪
        in_function = False
        function_start_line = -1
        function_name = ""
        function_lines = []
        brace_count = 0
        
        for line_num, line in enumerate(lines, start=1):
            original_line = line
            stripped = line.strip()
            
            # 跳过注释行（不处理，直接保留）
            if stripped.startswith('#'):
                if not in_function:
                    new_lines.append(line)
                else:
                    function_lines.append(line)
                continue
            
            # 检测函数开始: function_name() {
            func_match = re.match(r'^(\w+)\s*\(\)\s*\{', stripped)
            if func_match and not in_function:
                in_function = True
                function_name = func_match.group(1)
                function_start_line = line_num
                function_lines = [line]
                brace_count = 1
                continue
            
            # 如果在函数体内
            if in_function:
                function_lines.append(line)
                # 计算大括号平衡
                brace_count += stripped.count('{') - stripped.count('}')
                
                # 检查函数是否结束
                if brace_count == 0:
                    # 函数结束，处理函数体
                    function_content = '\n'.join(function_lines)
                    function_removed = []
                    processed_function_lines = []
                    
                    # 处理函数体内的每一行
                    for func_line_idx, func_line in enumerate(function_lines):
                        func_stripped = func_line.strip()
                        
                        # 跳过函数定义行和结束行
                        if func_line_idx == 0 or func_stripped == '}':
                            processed_function_lines.append(func_line)
                            continue
                        
                        # 在函数体内查找 ANTHROPIC 变量
                        var_match = re.search(r'(?:^|\s)(?:export\s+)?(ANTHROPIC_[A-Z_]+)=', func_line)
                        if var_match:
                            var_name = var_match.group(1)
                            func_actual_line = function_start_line + func_line_idx
                            function_removed.append((var_name, func_actual_line, 'function'))
                            
                            # 如果整行只有这个变量，跳过
                            if re.match(r'^\s*(export\s+)?ANTHROPIC_[A-Z_]+=.*$', func_stripped):
                                continue  # 跳过这一行
                            else:
                                # 行中还有其他内容，只删除变量部分
                                func_line = re.sub(r'\s*(export\s+)?ANTHROPIC_[A-Z_]+=[^\s;]*', '', func_line)
                        
                        processed_function_lines.append(func_line)
                    
                    # 检查函数是否只剩下空内容
                    remaining = '\n'.join(processed_function_lines[1:-1]).strip()  # 排除函数定义和结束行
                    remaining = re.sub(r'^\s*\{?\s*\}?\s*$', '', remaining, flags=re.MULTILINE)
                    if not remaining:
                        # 删除整个函数
                        log_info(f"  删除函数 {function_name}() (仅包含 ANTHROPIC 变量)")
                        removed_vars.extend(function_removed)
                        # 不添加任何行（跳过整个函数）
                    else:
                        # 保留函数，但移除变量
                        new_lines.extend(processed_function_lines)
                        removed_vars.extend(function_removed)
                    
                    # 重置函数状态
                    in_function = False
                    function_lines = []
                    continue
                
                # 函数未结束，继续收集
                continue
            
            # 处理 export 语句（不在函数内，不是注释）
            export_match = re.search(r'export\s+(ANTHROPIC_[A-Z_]+)=', line)
            if export_match:
                var_name = export_match.group(1)
                removed_vars.append((var_name, line_num, 'export'))
                # 如果整行只有 export 语句，删除整行
                if re.match(r'^\s*export\s+ANTHROPIC_[A-Z_]+=.*$', stripped):
                    continue  # 跳过这一行
                else:
                    # 行中还有其他内容，只删除 export 部分
                    line = re.sub(r'\s*export\s+ANTHROPIC_[A-Z_]+=[^\s;]*', '', line)
            
            # 处理 alias 定义
            alias_match = re.match(r'^alias\s+(\w+)=(".*"|\'.*\')', line)
            if alias_match:
                alias_name = alias_match.group(1)
                alias_value_full = alias_match.group(2)
                quote_char = alias_value_full[0]
                alias_value = alias_value_full.strip(quote_char)
                
                # 在 alias 值中查找 ANTHROPIC 变量
                var_matches = list(re.finditer(r'(ANTHROPIC_[A-Z_]+)=[^\s;]*', alias_value))
                if var_matches:
                    for var_match in var_matches:
                        var_name = var_match.group(1)
                        removed_vars.append((var_name, line_num, 'alias'))
                        # 从 alias 值中移除该变量
                        alias_value = re.sub(rf'{re.escape(var_match.group(0))}\s*', '', alias_value)
                    
                    # 更新 alias
                    if alias_value.strip():
                        line = f'alias {alias_name}={quote_char}{alias_value}{quote_char}'
                    else:
                        # alias 值变空，删除整个 alias
                        log_info(f"  删除 alias {alias_name} (仅包含 ANTHROPIC 变量)")
                        continue
            
            new_lines.append(line)
        
        # 合并处理后的内容
        content = '\n'.join(new_lines)
        
        # 移除空行（连续多个空行保留一个）
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # 记录删除的变量详情
        if removed_vars:
            log_info(f"从配置文件 {config_file} 中移除 ANTHROPIC 变量:")
            for var_name, line_num, var_type in removed_vars:
                log_info(f"  - 删除变量: {var_name} (行 {line_num}, 类型: {var_type})")
            log_info(f"共删除 {len(removed_vars)} 个 ANTHROPIC 变量")
        
        if content != original_content:
            if write_file_safe(config_file, content):
                log_info(f"成功更新配置文件: {config_file}")
                return True
            else:
                log_error(f"更新配置文件失败: {config_file}")
                return False
        else:
            log_info(f"配置文件中没有 Claude 相关环境变量: {config_file}")
            return True
            
    except Exception as e:
        log_error(f"清理环境变量时出错: {config_file}, 错误: {e}")
        return False


def cleanup_session_env_vars() -> bool:
    """
    清理当前终端会话的环境变量（ANTHROPIC_*, SILICONFLOW_*）
    
    注意：此函数只能清理当前 Python 进程的环境变量，无法影响父 shell。
    要清理父 shell 的环境变量，需要用户手动执行 unset 命令或重新打开终端。
    
    Returns:
        如果清理成功返回 True，否则返回 False
    """
    env_vars_to_remove = []
    
    # 查找所有 ANTHROPIC_* 和 SILICONFLOW_* 环境变量
    for key in list(os.environ.keys()):  # 使用 list() 避免迭代时修改字典
        if key.startswith("ANTHROPIC_") or key.startswith("SILICONFLOW_"):
            env_vars_to_remove.append(key)
    
    if not env_vars_to_remove:
        log_info("当前会话中没有 Claude 相关环境变量")
        return True
    
    try:
        for key in env_vars_to_remove:
            log_info(f"从当前会话中移除环境变量: {key}")
            os.environ.pop(key, None)
        
        log_info(f"成功清理 {len(env_vars_to_remove)} 个环境变量")
        log_warning("注意：此操作仅影响当前 Python 进程")
        log_warning("要清理父 shell 的环境变量，请在终端中执行：")
        log_warning("  unset ANTHROPIC_API_KEY ANTHROPIC_BASE_URL ANTHROPIC_MODEL")
        log_warning("或重新打开终端")
        return True
    except Exception as e:
        log_error(f"清理会话环境变量时出错: {e}")
        return False


def set_api_key(api_key: str, config_file: Optional[Path] = None, update_existing: bool = True) -> bool:
    """
    设置 API key 到环境变量配置文件
    
    Args:
        api_key: API key 值
        config_file: 配置文件路径，如果为 None 则自动检测
        update_existing: 如果已存在则更新
        
    Returns:
        如果设置成功返回 True，否则返回 False
    """
    if not config_file:
        config_file = detect_config_file()
        if not config_file:
            log_error("未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）")
            return False
    
    try:
        content = read_file_safe(config_file)
        if content is None:
            # 如果文件不存在，创建新文件
            content = ""
        
        # 检查是否已存在 ANTHROPIC_API_KEY
        pattern = r'export\s+ANTHROPIC_API_KEY=["\']?([^"\'\n]+)["\']?'
        match = re.search(pattern, content)
        
        if match:
            if update_existing:
                # 更新现有的 API key
                content = re.sub(pattern, f'export ANTHROPIC_API_KEY="{api_key}"', content)
                log_info(f"更新现有 API key: {config_file}")
            else:
                log_warning(f"API key 已存在，跳过更新: {config_file}")
                return False
        else:
            # 追加新的 API key
            if content and not content.endswith('\n'):
                content += '\n'
            content += f'export ANTHROPIC_API_KEY="{api_key}"\n'
            log_info(f"添加新 API key: {config_file}")
        
        if write_file_safe(config_file, content):
            log_info(f"成功设置 API key: {config_file}")
            log_info("请运行 'source ~/.zshrc' 或重新打开终端以使环境变量生效")
            return True
        else:
            log_error(f"写入配置文件失败: {config_file}")
            return False
            
    except Exception as e:
        log_error(f"设置 API key 时出错: {config_file}, 错误: {e}")
        return False
