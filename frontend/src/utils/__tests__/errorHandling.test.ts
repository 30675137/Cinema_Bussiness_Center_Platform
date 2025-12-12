/**
 * 错误处理工具测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler, handleError, handleNetworkError, handleBusinessError } from '../errorHandling';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearErrorHistory();
    errorHandler.clearErrorCount();
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('handleError', () => {
    it('should handle generic error', () => {
      const error = new Error('Test error');
      const consoleSpy = vi.spyOn(console, 'error');

      errorHandler.handleError(error);

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle error with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };

      expect(() => errorHandler.handleError(error, context)).not.toThrow();
    });

    it('should handle string error', () => {
      expect(() => errorHandler.handleError('String error')).not.toThrow();
    });
  });

  describe('handleNetworkError', () => {
    it('should handle 401 error', () => {
      const error = {
        response: { status: 401 },
        message: 'Unauthorized'
      } as any;

      expect(() => errorHandler.handleNetworkError(error)).not.toThrow();
    });

    it('should handle 403 error', () => {
      const error = {
        response: { status: 403 },
        message: 'Forbidden'
      } as any;

      expect(() => errorHandler.handleNetworkError(error)).not.toThrow();
    });

    it('should handle network connection error', () => {
      const error = {
        message: 'fetch failed'
      } as any;

      expect(() => errorHandler.handleNetworkError(error)).not.toThrow();
    });
  });

  describe('handleBusinessError', () => {
    it('should handle business error with details', () => {
      expect(() => {
        errorHandler.handleBusinessError('Business logic failed', 'Detailed error message');
      }).not.toThrow();
    });

    it('should handle business error with context', () => {
      const context = { operation: 'create', data: { id: 1 } };

      expect(() => {
        errorHandler.handleBusinessError('Business error', undefined, context);
      }).not.toThrow();
    });
  });

  describe('handleValidationError', () => {
    it('should handle validation errors', () => {
      const errors = {
        name: 'Name is required',
        email: 'Invalid email format'
      };

      expect(() => errorHandler.handleValidationError(errors)).not.toThrow();
    });
  });

  describe('handlePermissionError', () => {
    it('should handle permission error with custom message', () => {
      expect(() => {
        errorHandler.handlePermissionError('Custom permission message');
      }).not.toThrow();
    });

    it('should handle default permission error', () => {
      expect(() => {
        errorHandler.handlePermissionError();
      }).not.toThrow();
    });
  });

  describe('error history', () => {
    it('should maintain error history', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);

      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0].message).toBe('Test error');
    });

    it('should clear error history', () => {
      errorHandler.handleError(new Error('Test error'));
      errorHandler.clearErrorHistory();

      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('error frequency limiting', () => {
    it('should limit error frequency', () => {
      const error = new Error('Repeated error');

      // Trigger same error multiple times
      for (let i = 0; i < 10; i++) {
        errorHandler.handleError(error);
      }

      // Should not exceed max error count
      const history = errorHandler.getErrorHistory();
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('configuration', () => {
    it('should allow configuration updates', () => {
      const newConfig = {
        enableLogging: false,
        maxErrorCount: 3
      };

      expect(() => errorHandler.configure(newConfig)).not.toThrow();
    });
  });
});

describe('Convenience Functions', () => {
  beforeEach(() => {
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  describe('handleError', () => {
    it('should call error manager handle error', () => {
      const error = new Error('Test error');
      expect(() => handleError(error)).not.toThrow();
    });
  });

  describe('handleNetworkError', () => {
    it('should call error manager handle network error', () => {
      const error = {
        response: { status: 500 },
        message: 'Server error'
      } as any;

      expect(() => handleNetworkError(error)).not.toThrow();
    });
  });

  describe('handleBusinessError', () => {
    it('should call error manager handle business error', () => {
      expect(() => handleBusinessError('Business error')).not.toThrow();
    });
  });
});