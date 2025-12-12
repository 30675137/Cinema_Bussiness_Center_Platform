/**
 * 语言选择器组件测试
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageDropdown, LanguageToggle, LanguageSelector } from '../common/LanguageSelector';

// Mock i18n hooks
vi.mock('@/i18n/hooks', () => ({
  useLanguageSelector: () => ({
    currentLanguage: 'zh-CN',
    supportedLanguages: [
      { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', rtl: false },
      { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false }
    ],
    changeLanguage: vi.fn(),
    nextLanguage: vi.fn(),
    setFromBrowser: vi.fn()
  })
}));

// Mock antd components
vi.mock('antd', () => ({
  Select: ({ children, onChange, value, ...props }: any) => (
    <select
      data-testid="language-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      {children}
    </select>
  ),
  Space: ({ children }: any) => <div data-testid="space">{children}</div>,
  Typography: {
    Text: ({ children }: any) => <span data-testid="text">{children}</span>
  }
}));

vi.mock('@ant-design/icons', () => ({
  GlobalOutlined: () => <span data-testid="global-icon">🌐</span>
}));

describe('LanguageDropdown', () => {
  const mockChangeLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(require('@/i18n/hooks').useLanguageSelector).mockReturnValue({
      currentLanguage: 'zh-CN',
      supportedLanguages: [
        { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', rtl: false },
        { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false }
      ],
      changeLanguage: mockChangeLanguage,
      nextLanguage: vi.fn(),
      setFromBrowser: vi.fn()
    });
  });

  it('should render select component', () => {
    render(<LanguageDropdown />);

    expect(screen.getByTestId('language-select')).toBeInTheDocument();
    expect(screen.getByTestId('global-icon')).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    render(<LanguageDropdown size="large" />);

    const select = screen.getByTestId('language-select');
    expect(select).toHaveAttribute('size', 'large');
  });

  it('should render with custom className', () => {
    render(<LanguageDropdown className="custom-class" />);

    const select = screen.getByTestId('language-select');
    expect(select).toHaveClass('custom-class');
  });

  it('should render with custom style', () => {
    const customStyle = { color: 'red' };
    render(<LanguageDropdown style={customStyle} />);

    const select = screen.getByTestId('language-select');
    expect(select).toHaveStyle('color: red');
  });

  it('should show text when showText is true', () => {
    render(<LanguageDropdown showText={true} />);

    expect(screen.getByTestId('text')).toBeInTheDocument();
  });

  it('should call changeLanguage when value changes', async () => {
    render(<LanguageDropdown />);

    const select = screen.getByTestId('language-select');
    fireEvent.change(select, { target: { value: 'en-US' } });

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('en-US');
    });
  });

  it('should render with correct current value', () => {
    render(<LanguageDropdown />);

    const select = screen.getByTestId('language-select');
    expect(select).toHaveValue('zh-CN');
  });
});

describe('LanguageToggle', () => {
  const mockNextLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(require('@/i18n/hooks').useLanguageSelector).mockReturnValue({
      currentLanguage: 'zh-CN',
      supportedLanguages: [
        { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', rtl: false },
        { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false }
      ],
      changeLanguage: vi.fn(),
      nextLanguage: mockNextLanguage,
      setFromBrowser: vi.fn()
    });
  });

  it('should render toggle button', () => {
    render(<LanguageToggle />);

    const toggle = screen.getByText('🇨🇳');
    expect(toggle).toBeInTheDocument();
    expect(toggle.closest('div')).toHaveAttribute('title', '切换语言 (当前: 简体中文)');
  });

  it('should render with custom className', () => {
    render(<LanguageToggle className="custom-class" />);

    const toggle = screen.getByText('🇨🇳');
    expect(toggle.closest('div')).toHaveClass('custom-class');
  });

  it('should render with custom style', () => {
    const customStyle = { backgroundColor: 'blue' };
    render(<LanguageToggle style={customStyle} />);

    const toggle = screen.getByText('🇨🇳');
    expect(toggle.closest('div')).toHaveStyle('background-color: blue');
  });

  it('should call nextLanguage when clicked', () => {
    render(<LanguageToggle />);

    const toggle = screen.getByText('🇨🇳');
    fireEvent.click(toggle);

    expect(mockNextLanguage).toHaveBeenCalled();
  });

  it('should show correct flag for current language', () => {
    vi.mocked(require('@/i18n/hooks').useLanguageSelector).mockReturnValue({
      currentLanguage: 'en-US',
      supportedLanguages: [
        { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', rtl: false },
        { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false }
      ],
      changeLanguage: vi.fn(),
      nextLanguage: mockNextLanguage,
      setFromBrowser: vi.fn()
    });

    render(<LanguageToggle />);

    const toggle = screen.getByText('🇺🇸');
    expect(toggle).toBeInTheDocument();
    expect(toggle.closest('div')).toHaveAttribute('title', '切换语言 (当前: English)');
  });
});

describe('LanguageSelector', () => {
  it('should render LanguageDropdown component', () => {
    render(<LanguageSelector />);

    expect(screen.getByTestId('language-select')).toBeInTheDocument();
    expect(screen.getByTestId('global-icon')).toBeInTheDocument();
  });

  it('should pass props to LanguageDropdown', () => {
    const customClass = 'custom-selector';
    render(<LanguageSelector className={customClass} />);

    const select = screen.getByTestId('language-select');
    expect(select).toHaveClass(customClass);
  });
});

describe('Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(require('@/i18n/hooks').useLanguageSelector).mockReturnValue({
      currentLanguage: 'zh-CN',
      supportedLanguages: [
        { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', rtl: false },
        { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false }
      ],
      changeLanguage: vi.fn(),
      nextLanguage: vi.fn(),
      setFromBrowser: vi.fn()
    });
  });

  it('should have proper title for accessibility', () => {
    render(<LanguageToggle />);

    const toggle = screen.getByText('🇨🇳');
    expect(toggle.closest('div')).toHaveAttribute('title');
  });

  it('should be keyboard accessible for LanguageToggle', () => {
    render(<LanguageToggle />);

    const toggle = screen.getByText('🇨🇳').closest('div');
    expect(toggle).toHaveStyle('cursor: pointer');
  });

  it('should support role for select component', () => {
    render(<LanguageDropdown />);

    const select = screen.getByTestId('language-select');
    expect(select.tagName).toBe('SELECT');
  });
});

describe('Integration', () => {
  it('should work with different language configurations', () => {
    vi.mocked(require('@/i18n/hooks').useLanguageSelector).mockReturnValue({
      currentLanguage: 'en-US',
      supportedLanguages: [
        { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false }
      ],
      changeLanguage: vi.fn(),
      nextLanguage: vi.fn(),
      setFromBrowser: vi.fn()
    });

    render(<LanguageDropdown />);

    const select = screen.getByTestId('language-select');
    expect(select).toHaveValue('en-US');
  });

  it('should handle empty supported languages', () => {
    vi.mocked(require('@/i18n/hooks').useLanguageSelector).mockReturnValue({
      currentLanguage: 'zh-CN',
      supportedLanguages: [],
      changeLanguage: vi.fn(),
      nextLanguage: vi.fn(),
      setFromBrowser: vi.fn()
    });

    expect(() => render(<LanguageDropdown />)).not.toThrow();
  });
});