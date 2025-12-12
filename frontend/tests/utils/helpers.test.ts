/**
 * 工具函数测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateId,
  generateOrderNumber,
  deepClone,
  debounce,
  throttle,
  randomInt,
  randomString,
  randomColor,
  isEmpty,
  safeJsonParse,
  safeJsonStringify,
  getFileExtension,
  getFileName,
  formatFileSize,
  arrayAverage,
  arraySum,
  arrayUnique,
  arrayGroupBy,
  arraySort,
  generateUUID,
  delay,
  retry,
  withErrorHandling,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isDate,
  isObjectEmpty,
  safeGet,
  safeSet,
} from '@/utils/helpers';

describe('Utils', () => {
  describe('ID生成函数', () => {
    it('generateId 应该生成唯一的ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('generateOrderNumber 应该生成指定前缀的订单号', () => {
      const orderNumber1 = generateOrderNumber('ORD');
      const orderNumber2 = generateOrderNumber();

      expect(orderNumber1).toMatch(/^ORD\d+/);
      expect(orderNumber2).toMatch(/^ORD\d+/);
      expect(orderNumber1).not.toBe(orderNumber2);
    });

    it('generateUUID 应该生成有效的UUID格式', () => {
      const uuid = generateUUID();

      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('数据操作函数', () => {
    it('deepClone 应该正确深拷贝对象', () => {
      const original = {
        name: 'test',
        nested: {
          value: 42,
          array: [1, 2, 3],
        },
        date: new Date('2024-01-01'),
      };

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.nested).not.toBe(original.nested);
      expect(cloned.nested.array).not.toBe(original.nested.array);
      expect(cloned.date).not.toBe(original.date);
      expect(cloned.date.getTime()).toBe(original.date.getTime());
    });

    it('deepClone 应该处理 null 和 undefined', () => {
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
      expect(deepClone(42)).toBe(42);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(true)).toBe(true);
    });

    it('isEmpty 应该正确判断空值', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty('test')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('字符串和数据处理函数', () => {
    it('getFileExtension 应该正确获取文件扩展名', () => {
      expect(getFileExtension('test.txt')).toBe('txt');
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
      expect(getFileExtension('filename')).toBe('');
      expect(getFileExtension('')).toBe('');
      expect(getFileExtension('.hidden')).toBe('hidden');
    });

    it('getFileName 应该正确获取文件名（不含扩展名）', () => {
      expect(getFileName('/path/to/file.txt')).toBe('file');
      expect(getFileName('document.pdf')).toBe('document');
      expect(getFileName('/path/to/nested/filename')).toBe('filename');
      expect(getFileName('file')).toBe('file');
      expect(getFileName('/path/to/.hidden')).toBe('.hidden');
    });

    it('formatFileSize 应该正确格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1099511627776)).toBe('1 TB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2500000)).toBe('2.38 MB');
    });

    it('randomString 应该生成指定长度的随机字符串', () => {
      const str1 = randomString(10);
      const str2 = randomString();

      expect(str1).toHaveLength(10);
      expect(str2).toHaveLength(8); // 默认长度
      expect(str1).toMatch(/^[A-Za-z0-9]+$/);
      expect(str2).toMatch(/^[A-Za-z0-9]+$/);
      expect(str1).not.toBe(str2);
    });

    it('randomInt 应该生成指定范围内的随机整数', () => {
      for (let i = 0; i < 100; i++) {
        const num = randomInt(1, 10);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
        expect(Number.isInteger(num)).toBe(true);
      }
    });

    it('randomColor 应该返回预定义的颜色', () => {
      const color = randomColor();
      const colors = [
        '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
        '#13c2c2', '#eb2f96', '#fa541c', '#a0d911', '#2f54eb'
      ];

      expect(colors).toContain(color);
    });
  });

  describe('数组操作函数', () => {
    it('arrayAverage 应该计算数组平均值', () => {
      expect(arrayAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(arrayAverage([10, 20, 30])).toBe(20);
      expect(arrayAverage([0])).toBe(0);
      expect(arrayAverage([-2, 0, 2])).toBe(0);
      expect(arrayAverage([])).toBe(0);
    });

    it('arraySum 应该计算数组总和', () => {
      expect(arraySum([1, 2, 3, 4, 5])).toBe(15);
      expect(arraySum([10, 20, 30])).toBe(60);
      expect(arraySum([0])).toBe(0);
      expect(arraySum([-2, 5, -3])).toBe(0);
      expect(arraySum([])).toBe(0);
    });

    it('arrayUnique 应该数组去重', () => {
      expect(arrayUnique([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
      expect(arrayUnique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(arrayUnique([1, 1, 1])).toEqual([1]);
      expect(arrayUnique([])).toEqual([]);
    });

    it('arrayGroupBy 应该按指定属性分组', () => {
      const data = [
        { id: 1, category: 'A', value: 10 },
        { id: 2, category: 'B', value: 20 },
        { id: 3, category: 'A', value: 30 },
        { id: 4, category: 'B', value: 40 },
      ];

      const grouped = arrayGroupBy(data, 'category');

      expect(Object.keys(grouped)).toEqual(['A', 'B']);
      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(2);
      expect(grouped.A[0].id).toBe(1);
      expect(grouped.A[1].id).toBe(3);
    });

    it('arraySort 应该按指定属性排序', () => {
      const data = [
        { id: 3, name: 'Charlie' },
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];

      const sortedAsc = arraySort(data, 'id');
      expect(sortedAsc.map(item => item.id)).toEqual([1, 2, 3]);

      const sortedDesc = arraySort(data, 'name', 'desc');
      expect(sortedDesc.map(item => item.name)).toEqual(['Charlie', 'Bob', 'Alice']);
    });
  });

  describe('JSON操作函数', () => {
    it('safeJsonParse 应该安全解析JSON', () => {
      expect(safeJsonParse('{"key": "value"}', {})).toEqual({ key: 'value' });
      expect(safeJsonParse('invalid json', { default: true })).toEqual({ default: true });
      expect(safeJsonParse('', null)).toBe(null);
      expect(safeJsonParse('123', 0)).toBe(123);
    });

    it('safeJsonStringify 应该安全序列化JSON', () => {
      expect(safeJsonStringify({ key: 'value' })).toBe('{\n  "key": "value"\n}');
      expect(safeJsonStringify('invalid', '{}')).toBe('{}');
      expect(safeJsonStringify(null, 'null')).toBe('null');
      expect(safeJsonStringify(123)).toBe('123');
    });
  });

  describe('函数式编程工具', () => {
    it('debounce 应该延迟函数执行', (done) => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // 快速调用多次
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // 函数不应该立即执行
      expect(mockFn).not.toHaveBeenCalled();

      // 等待 debounce 延迟后执行
      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    it('throttle 应该限制函数执行频率', (done) => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      // 快速调用多次
      throttledFn();
      throttledFn();
      throttledFn();

      // 第一次调用应该立即执行
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 后续调用在时间窗口内不应该执行
      setTimeout(() => {
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        // 等待时间窗口后可以再次执行
        setTimeout(() => {
          throttledFn();
          expect(mockFn).toHaveBeenCalledTimes(2);
          done();
        }, 150);
      }, 50);
    });

    it('withErrorHandling 应该包装函数错误处理', () => {
      const successFn = vi.fn(() => 'success');
      const errorFn = vi.fn(() => {
        throw new Error('test error');
      });

      const wrappedSuccess = withErrorHandling(successFn);
      const wrappedError = withErrorHandling(errorFn, vi.fn());

      expect(wrappedSuccess()).toBe('success');
      expect(() => wrappedError()).toThrow('test error');
    });
  });

  describe('异步工具函数', () => {
    it('delay 应该延迟执行', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(100);
    }, 200);

    it('retry 应该重试失败的函数', async () => {
      const failTwice = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success');

      const result = await retry(failTwice, 3, 10);
      expect(result).toBe('success');
      expect(failTwice).toHaveBeenCalledTimes(3);
    });

    it('retry 超过最大重试次数应该抛出错误', async () => {
      const alwaysFail = vi.fn().mockRejectedValue(new Error('always fail'));

      await expect(retry(alwaysFail, 2, 10)).rejects.toThrow('always fail');
      expect(alwaysFail).toHaveBeenCalledTimes(2);
    });
  });

  describe('类型检查函数', () => {
    it('isString 应该正确检查字符串类型', () => {
      expect(isString('test')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
    });

    it('isNumber 应该正确检查数字类型', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-45.67)).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber('123')).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });

    it('isBoolean 应该正确检查布尔类型', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });

    it('isObject 应该正确检查对象类型', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject('string')).toBe(false);
    });

    it('isArray 应该正确检查数组类型', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray('array')).toBe(false);
    });

    it('isFunction 应该正确检查函数类型', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function() {})).toBe(true);
      expect(isFunction(()).toString()).toBe(false);
      expect(isFunction({})).toBe(false);
    });

    it('isDate 应该正确检查日期类型', () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date('2024-01-01'))).toBe(true);
      expect(isDate('2024-01-01')).toBe(false);
      expect(isDate({})).toBe(false);
      expect(isDate(Date.now())).toBe(false);
    });

    it('isObjectEmpty 应该正确检查空对象', () => {
      expect(isObjectEmpty({})).toBe(true);
      expect(isObjectEmpty({ key: 'value' })).toBe(false);
      expect(isObjectEmpty(Object.create(null))).toBe(true);
    });
  });

  describe('安全访问函数', () => {
    const obj = {
      user: {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'New York'
        }
      }
    };

    it('safeGet 应该安全获取嵌套属性', () => {
      expect(safeGet(obj, 'user.name', 'default')).toBe('John');
      expect(safeGet(obj, 'user.address.city', 'default')).toBe('New York');
      expect(safeGet(obj, 'user.nonexistent', 'default')).toBe('default');
      expect(safeGet(obj, 'nonexistent.path', 'default')).toBe('default');
      expect(safeGet(null, 'user.name', 'default')).toBe('default');
      expect(safeGet(undefined, 'user.name', 'default')).toBe('default');
    });

    it('safeSet 应该安全设置嵌套属性', () => {
      const testObj = {};

      safeSet(testObj, 'user.name', 'John');
      expect(testObj.user.name).toBe('John');

      safeSet(testObj, 'user.address.city', 'New York');
      expect(testObj.user.address.city).toBe('New York');

      // 覆盖已存在的属性
      safeSet(testObj, 'user.name', 'Jane');
      expect(testObj.user.name).toBe('Jane');

      // 处理null路径
      const testObj2 = { existing: 'value' };
      safeSet(testObj2, 'existing.nested', 'test');
      expect(testObj2.existing.nested).toBe('test');
    });
  });

  describe('性能测试', () => {
    it('deepClone 应该能处理大型对象', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        nested: { value: i, data: new Array(100).fill(i) }
      }));

      const largeObj = { items: largeArray, metadata: { count: largeArray.length } };

      const start = performance.now();
      const cloned = deepClone(largeObj);
      const end = performance.now();

      expect(cloned).toEqual(largeObj);
      expect(cloned).not.toBe(largeObj);
      expect(end - start).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('arraySort 应该高效处理大数组', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: Math.floor(Math.random() * 10000),
        value: Math.random()
      }));

      const start = performance.now();
      const sorted = arraySort(largeArray, 'id');
      const end = performance.now();

      expect(sorted).toHaveLength(10000);
      // 验证排序正确性
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i-1].id).toBeLessThanOrEqual(sorted[i].id);
      }
      expect(end - start).toBeLessThan(500); // 应该在500ms内完成
    });
  });

  describe('边界情况测试', () => {
    it('应该正确处理循环引用', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;

      // deepClone 应该能处理循环引用或至少不会无限递归
      expect(() => {
        const cloned = deepClone(obj);
        expect(cloned.name).toBe('test');
      }).not.toThrow();
    });

    it('应该正确处理特殊数值', () => {
      expect(arrayAverage([Infinity, -Infinity, 0])).toBeNaN();
      expect(arraySum([Infinity, 1])).toBe(Infinity);
      expect(arraySum([-Infinity, 1])).toBe(-Infinity);
      expect(isNumber(Infinity)).toBe(false);
      expect(isNumber(-Infinity)).toBe(false);
    });

    it('应该正确处理极值', () => {
      expect(arrayAverage([Number.MAX_VALUE, Number.MIN_VALUE])).toBeGreaterThan(0);
      expect(arraySum([Number.MAX_VALUE, Number.MAX_VALUE])).toBe(Infinity);
      expect(randomInt(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toBeGreaterThanOrEqual(Number.MIN_SAFE_INTEGER);
    });
  });
});