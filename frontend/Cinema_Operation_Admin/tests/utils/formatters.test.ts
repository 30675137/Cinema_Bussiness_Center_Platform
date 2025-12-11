/**
 * 格式化工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPhone,
  formatPhoneNumber,
  formatIdCard,
  formatFileSize as formatFileSizeUtil,
  formatQuantity,
  formatDiscount,
  formatStatus,
  formatAddress,
  formatUserName,
  formatOrderNumber,
  formatSKU,
  formatProgressText,
  formatDuration,
  formatRatio,
  formatCurrencyChinese,
} from '@/utils/formatters';

describe('Formatters', () => {
  describe('数字和金额格式化', () => {
    it('formatCurrency 应该正确格式化金额', () => {
      expect(formatCurrency(1234.56)).toBe('¥1,234.56');
      expect(formatCurrency(1234.56, 'USD')).toBe('¥1,234.56');
      expect(formatCurrency(1234.56, 'CNY', false)).toBe('1,234.56');
      expect(formatCurrency(0)).toBe('¥0.00');
      expect(formatCurrency(null)).toBe('¥0.00');
      expect(formatCurrency(undefined)).toBe('¥0.00');
      expect(formatCurrency(NaN)).toBe('¥0.00');
    });

    it('formatNumber 应该正确格式化数字', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
      expect(formatNumber(1234567, 0)).toBe('1,234,567');
      expect(formatNumber('1234.56')).toBe('1,234.56');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(null, 2)).toBe('0');
      expect(formatNumber('', 2)).toBe('0');
      expect(formatNumber(NaN, 2)).toBe('0');
    });

    it('formatPercentage 应该正确格式化百分比', () => {
      expect(formatPercentage(0.1234, 2)).toBe('12.34%');
      expect(formatPercentage(0.5, 1)).toBe('50.0%');
      expect(formatPercentage(1, 0)).toBe('100%');
      expect(formatPercentage(0, 2)).toBe('0%');
      expect(formatPercentage(null, 2)).toBe('0%');
      expect(formatPercentage(undefined, 2)).toBe('0%');
    });

    it('formatDiscount 应该正确格式化折扣', () => {
      expect(formatDiscount(0)).toBe('无折扣');
      expect(formatDiscount(0.8)).toBe('8.0折');
      expect(formatDiscount(0.95)).toBe('9.5折');
      expect(formatDiscount(1)).toBe('10.0折');
      expect(formatDiscount(null)).toBe('-');
      expect(formatDiscount(undefined)).toBe('-');
      expect(formatDiscount(NaN)).toBe('-');
    });
  });

  describe('日期时间格式化', () => {
    it('formatDate 应该正确格式化日期', () => {
      const date = '2024-01-15T10:30:00Z';
      expect(formatDate(date)).toBe('2024-01-15');
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/01/15');
      expect(formatDate('2024-01-15')).toBe('2024-01-15');
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
    });

    it('formatDateTime 应该正确格式化日期时间', () => {
      const date = '2024-01-15T10:30:00Z';
      expect(formatDateTime(date)).toBe('2024-01-15 10:30:00');
      expect(formatDateTime('2024-01-15')).toBe('2024-01-15 00:00:00');
    });

    it('formatRelativeTime 应该正确格式化相对时间', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 60 * 60 * 1000); // 1小时前
      const pastString = past.toISOString();

      expect(formatRelativeTime(pastString)).toMatch(/小时前/);
      expect(formatRelativeTime('')).toBe('');
      expect(formatRelativeTime(null)).toBe('');
    });

    it('formatDuration 应该正确格式化时长', () => {
      expect(formatDuration(0)).toBe('0秒');
      expect(formatDuration(60)).toBe('1分钟');
      expect(formatDuration(3661)).toBe('1小时1分钟1秒');
      expect(formatDuration(86400)).toBe('1天');
      expect(formatDuration(90061)).toBe('1天1小时1分钟1秒');
      expect(formatDuration(null)).toBe('0秒');
    });
  });

  describe('字符串格式化', () => {
    it('formatPhone/formatPhoneNumber 应该正确格式化手机号', () => {
      expect(formatPhone('13800138000')).toBe('138 0013 8000');
      expect(formatPhone('01012345678')).toBe('010-1234-5678');
      expect(formatPhone('02187654321')).toBe('021-8765-4321');
      expect(formatPhone('4008008000')).toBe('4008-008-000');
      expect(formatPhone('')).toBe('');
      expect(formatPhone(null)).toBe('');

      // 测试别名函数
      expect(formatPhoneNumber('13800138000')).toBe('138 0013 8000');
    });

    it('formatIdCard 应该正确格式化身份证号', () => {
      expect(formatIdCard('110101199001011234')).toBe('110101********1234');
      expect(formatIdCard('12345678')).toBe('12345678'); // 太短，不脱敏
      expect(formatIdCard('')).toBe('');
      expect(formatIdCard(null)).toBe('');
    });

    it('formatOrderNumber 应该正确格式化订单号', () => {
      expect(formatOrderNumber('ord123')).toBe('ORD123');
      expect(formatOrderNumber('ORD456')).toBe('ORD456');
      expect(formatOrderNumber('')).toBe('');
      expect(formatOrderNumber(null)).toBe('');
    });

    it('formatSKU 应该正确格式化SKU', () => {
      expect(formatSKU('sku123')).toBe('SKU123');
      expect(formatSKU('SKU456')).toBe('SKU456');
      expect(formatSKU('')).toBe('');
      expect(formatSKU(null)).toBe('');
    });

    it('formatUserName 应该正确格式化用户名', () => {
      expect(formatUserName({ name: '张三', username: 'zhangsan' })).toBe('张三');
      expect(formatUserName({ username: 'zhangsan' })).toBe('zhangsan');
      expect(formatUserName({ name: '李四' })).toBe('李四');
      expect(formatUserName({})).toBe('未知用户');
    });
  });

  describe('文件和单位格式化', () => {
    it('formatFileSize 应该正确格式化文件大小', () => {
      expect(formatFileSizeUtil(0)).toBe('0 B');
      expect(formatFileSizeUtil(1024)).toBe('1 KB');
      expect(formatFileSizeUtil(1048576)).toBe('1 MB');
      expect(formatFileSizeUtil(1073741824)).toBe('1 GB');
      expect(formatFileSizeUtil(1099511627776)).toBe('1 TB');
      expect(formatFileSizeUtil(1536)).toBe('1.5 KB');
    });

    it('formatQuantity 应该正确格式化数量', () => {
      expect(formatQuantity(100)).toBe('100');
      expect(formatQuantity(100, '个')).toBe('100个');
      expect(formatQuantity(0, 'kg', true)).toBe('0kg');
      expect(formatQuantity(0, 'kg')).toBe('');
      expect(formatQuantity(null)).toBe('');
    });

    it('formatProgressText 应该正确格式化进度文本', () => {
      expect(formatProgressText(50, 100)).toBe('50% (50/100)');
      expect(formatProgressText(0, 100)).toBe('0% (0/100)');
      expect(formatProgressText(100, 100)).toBe('100% (100/100)');
      expect(formatProgressText(0, 0)).toBe('0% (0/0)');
    });

    it('formatRatio 应该正确格式化比率', () => {
      expect(formatRatio(3, 4)).toBe('3:4');
      expect(formatRatio(1, 2)).toBe('1:2');
      expect(formatRatio(2, 1)).toBe('2:1');
      expect(formatRatio(1, 1)).toBe('1');
      expect(formatRatio(0, 1)).toBe('0:1');
    });
  });

  describe('地址格式化', () => {
    it('formatAddress 应该正确格式化地址', () => {
      const address = {
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '建国路1号',
      };

      expect(formatAddress(address)).toBe('北京市朝阳区建国路1号');

      const address2 = {
        province: '上海市',
        city: '上海市',
        detail: '浦东大道1号',
      };

      expect(formatAddress(address2)).toBe('上海市上海市浦东大道1号');

      const address3 = {
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技路1号',
      };

      expect(formatAddress(address3)).toBe('广东省深圳市南山区科技路1号');
    });
  });

  describe('特殊格式化', () => {
    it('formatStatus 应该正确格式化状态', () => {
      const statusMap = {
        active: '激活',
        inactive: '未激活',
        pending: '待审核',
      };

      expect(formatStatus('active', statusMap)).toBe('激活');
      expect(formatStatus('pending', statusMap)).toBe('待审核');
      expect(formatStatus('unknown', statusMap)).toBe('unknown');
    });

    it('formatCurrencyChinese 应该正确格式化中文金额', () => {
      expect(formatCurrencyChinese(0)).toBe('零元整');
      expect(formatCurrencyChinese(100)).toBe('壹佰元整');
      expect(formatCurrencyChinese(123.45)).toContain('壹佰贰拾叁元');
      expect(formatCurrencyChinese(-100)).toBe('负壹佰元整');
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该正确处理null和undefined输入', () => {
      expect(formatCurrency(null)).toBe('¥0.00');
      expect(formatCurrency(undefined)).toBe('¥0.00');
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatPercentage(null)).toBe('0%');
      expect(formatPercentage(undefined)).toBe('0%');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatPhone(null)).toBe('');
      expect(formatPhone(undefined)).toBe('');
    });

    it('应该正确处理NaN输入', () => {
      expect(formatCurrency(NaN)).toBe('¥0.00');
      expect(formatNumber(NaN)).toBe('0');
      expect(formatPercentage(NaN)).toBe('0%');
      expect(formatDiscount(NaN)).toBe('-');
    });

    it('应该正确处理空字符串输入', () => {
      expect(formatPhone('')).toBe('');
      expect(formatDate('')).toBe('');
      expect(formatOrderNumber('')).toBe('');
      expect(formatSKU('')).toBe('');
    });

    it('应该正确处理无效日期', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDateTime('invalid-date')).toBe('');
    });
  });

  describe('国际化测试', () => {
    it('formatDate 应该支持中文日期格式', () => {
      const date = '2024-01-15';
      expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2024年01月15日');
      expect(formatDate(date, 'MM-DD')).toBe('01-15');
    });

    it('formatPhone 应该正确处理国际号码', () => {
      // 测试一些特殊情况
      expect(formatPhone('8613800138000')).toBe('861 3800 13800');
      expect(formatPhone('12345678901')).toBe('123 4567 8901');
    });

    it('formatCurrencyChinese 应该处理大额金额', () => {
      expect(formatCurrencyChinese(100000000)).toContain('亿元');
      expect(formatCurrencyChinese(10000000)).toContain('仟万元');
    });
  });

  describe('性能测试', () => {
    it('大量数据格式化应该在合理时间内完成', () => {
      const start = performance.now();

      // 测试大量数字格式化
      for (let i = 0; i < 10000; i++) {
        formatCurrency(i * 100.99);
        formatNumber(i * 1000.123, 2);
        formatPercentage(i / 100, 2);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('重复调用相同输入应该有合理的性能', () => {
      const testValue = 1234567.89;

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        formatCurrency(testValue);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // 重复调用应该很快
    });
  });

  describe('类型安全性测试', () => {
    it('函数应该返回正确的类型', () => {
      const currencyResult = formatCurrency(123.45);
      expect(typeof currencyResult).toBe('string');

      const numberResult = formatNumber(123.45);
      expect(typeof numberResult).toBe('string');

      const dateResult = formatDate('2024-01-01');
      expect(typeof dateResult).toBe('string');

      const phoneResult = formatPhone('13800138000');
      expect(typeof phoneResult).toBe('string');
    });

    it('函数应该处理类型转换', () => {
      expect(formatCurrency('123.45' as any)).toBe('¥123.45');
      expect(formatNumber('123.45' as any)).toBe('123.45');
      expect(formatPercentage(0.123 as any)).toBe('12.30%');
    });
  });

  describe('特殊用例测试', () => {
    it('formatProgressText 应该处理除零情况', () => {
      expect(formatProgressText(5, 0)).toBe('0% (5/0)');
      expect(formatProgressText(0, 0)).toBe('0% (0/0)');
    });

    it('formatRatio 应该处理零分母', () => {
      expect(formatRatio(5, 0)).toBe('0:0');
      expect(formatRatio(0, 0)).toBe('0:0');
    });

    it('formatDiscount 应该处理边界值', () => {
      expect(formatDiscount(0.1)).toBe('1.0折');
      expect(formatDiscount(0.01)).toBe('0.1折');
      expect(formatDiscount(1.5)).toBe('15.0折'); // 超过1的情况
    });

    it('formatCurrencyChinese 应该处理分数', () => {
      const result = formatCurrencyChinese(123.45);
      expect(result).toContain('壹佰贰拾叁元');
      expect(result).toContain('角');
      expect(result).toContain('分');
    });

    it('formatRelativeTime 应该处理未来的时间', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1小时后
      const futureString = future.toISOString();

      const result = formatRelativeTime(futureString);
      // 未来时间的具体表述可能因实现而异，但不应该为空
      expect(result).toBeTruthy();
    });
  });
});