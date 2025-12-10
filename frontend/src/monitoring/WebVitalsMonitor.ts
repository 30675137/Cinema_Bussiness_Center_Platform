import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { WebVitals } from './types';

export interface WebVitalsConfig {
  onReport?: (metric: any) => void;
  onThresholdExceeded?: (metric: any, threshold: number) => void;
  thresholds?: {
    fcp?: number;    // First Contentful Paint (Good: < 1.8s)
    lcp?: number;    // Largest Contentful Paint (Good: < 2.5s)
    fid?: number;    // First Input Delay (Good: < 100ms)
    ttfb?: number;   // Time to First Byte (Good: < 800ms)
    cls?: number;    // Cumulative Layout Shift (Good: < 0.1)
  };
}

export class WebVitalsMonitor {
  private static instance: WebVitalsMonitor;
  private config: WebVitalsConfig;
  private metrics: WebVitals = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  };

  private constructor(config: WebVitalsConfig = {}) {
    this.config = {
      thresholds: {
        fcp: 1800,
        lcp: 2500,
        fid: 100,
        ttfb: 800,
        cls: 0.1,
        ...config.thresholds,
      },
      ...config,
    };

    this.initializeMetrics();
  }

  public static getInstance(config?: WebVitalsConfig): WebVitalsMonitor {
    if (!WebVitalsMonitor.instance) {
      WebVitalsMonitor.instance = new WebVitalsMonitor(config);
    }
    return WebVitalsMonitor.instance;
  }

  private initializeMetrics(): void {
    try {
      // First Contentful Paint
      getFCP((metric) => {
        this.metrics.fcp = metric.value;
        this.handleMetric('fcp', metric);
      });

      // Largest Contentful Paint
      getLCP((metric) => {
        this.metrics.lcp = metric.value;
        this.handleMetric('lcp', metric);
      });

      // First Input Delay
      getFID((metric) => {
        this.metrics.fid = metric.value;
        this.handleMetric('fid', metric);
      });

      // Time to First Byte
      getTTFB((metric) => {
        this.metrics.ttfb = metric.value;
        this.handleMetric('ttfb', metric);
      });

      // Cumulative Layout Shift
      getCLS((metric) => {
        this.metrics.cls = metric.value;
        this.handleMetric('cls', metric);
      });

    } catch (error) {
      console.warn('Failed to initialize Web Vitals monitoring:', error);
    }
  }

  private handleMetric(name: string, metric: any): void {
    // 调用报告回调
    this.config.onReport?.(metric);

    // 检查阈值
    const threshold = this.config.thresholds?.[name as keyof typeof this.metrics];
    if (threshold && metric.value > threshold) {
      this.config.onThresholdExceeded?.(metric, threshold);
    }

    // 在开发环境中输出详细信息
    if (process.env.NODE_ENV === 'development') {
      this.logMetricDetails(name, metric, threshold);
    }
  }

  private logMetricDetails(name: string, metric: any, threshold?: number): void {
    const rating = this.getRating(name, metric.value);
    const emoji = this.getRatingEmoji(rating);
    const thresholdInfo = threshold ? ` (阈值: ${this.formatValue(name, threshold)})` : '';

    console.log(
      `%c${emoji} Web Vitals: ${name.toUpperCase()} = ${this.formatValue(name, metric.value)}${thresholdInfo}`,
      `color: ${this.getRatingColor(rating)}; font-weight: bold;`
    );

    // 输出详细建议
    if (rating === 'poor') {
      console.warn(`⚠️ ${name.toUpperCase()} 需要优化建议:`, this.getOptimizationTips(name));
    }
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    switch (name) {
      case 'fcp':
        if (value < 1000) return 'good';
        if (value < 3000) return 'needs-improvement';
        return 'poor';

      case 'lcp':
        if (value < 2500) return 'good';
        if (value < 4000) return 'needs-improvement';
        return 'poor';

      case 'fid':
        if (value < 100) return 'good';
        if (value < 300) return 'needs-improvement';
        return 'poor';

      case 'ttfb':
        if (value < 800) return 'good';
        if (value < 1800) return 'needs-improvement';
        return 'poor';

      case 'cls':
        if (value < 0.1) return 'good';
        if (value < 0.25) return 'needs-improvement';
        return 'poor';

      default:
        return 'good';
    }
  }

  private getRatingEmoji(rating: string): string {
    switch (rating) {
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  }

  private getRatingColor(rating: string): string {
    switch (rating) {
      case 'good': return '#52c41a';
      case 'needs-improvement': return '#faad14';
      case 'poor': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  }

  private formatValue(name: string, value: number): string {
    if (name === 'cls') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  }

  private getOptimizationTips(name: string): string[] {
    switch (name) {
      case 'fcp':
        return [
          '减少服务器响应时间',
          '优化资源加载顺序',
          '启用资源压缩',
          '使用CDN加速',
        ];

      case 'lcp':
        return [
          '优化关键资源加载',
          '压缩图片',
          '使用现代图片格式',
          '预加载重要资源',
        ];

      case 'fid':
        return [
          '减少JavaScript执行时间',
          '分割代码块',
          '使用Web Workers',
          '减少第三方脚本影响',
        ];

      case 'ttfb':
        return [
          '优化服务器性能',
          '使用HTTP/2',
          '启用缓存',
          '优化数据库查询',
        ];

      case 'cls':
        return [
          '为图片和广告设置明确尺寸',
          '为动态内容预留空间',
          '避免插入内容到现有内容上方',
          '使用transform动画代替改变布局的动画',
        ];

      default:
        return ['无特定建议'];
    }
  }

  public getMetrics(): WebVitals {
    return { ...this.metrics };
  }

  public getRatingSummary(): {
    good: number;
    needsImprovement: number;
    poor: number;
    overall: 'good' | 'needs-improvement' | 'poor';
  } {
    const metrics = Object.entries(this.metrics);
    const summary = {
      good: 0,
      needsImprovement: 0,
      poor: 0,
      overall: 'good' as 'good' | 'needs-improvement' | 'poor',
    };

    metrics.forEach(([name, value]) => {
      const rating = this.getRating(name, value);
      switch (rating) {
        case 'good':
          summary.good++;
          break;
        case 'needs-improvement':
          summary.needsImprovement++;
          break;
        case 'poor':
          summary.poor++;
          break;
      }
    });

    // 确定总体评级
    if (summary.poor > 0) {
      summary.overall = 'poor';
    } else if (summary.needsImprovement > 0) {
      summary.overall = 'needs-improvement';
    }

    return summary;
  }

  public getPerformanceScore(): number {
    const summary = this.getRatingSummary();
    const totalMetrics = summary.good + summary.needsImprovement + summary.poor;

    if (totalMetrics === 0) return 0;

    // 加权计算分数
    const weights = {
      good: 100,
      needsImprovement: 50,
      poor: 0,
    };

    const weightedSum = (summary.good * weights.good +
                        summary.needsImprovement * weights.needsImprovement +
                        summary.poor * weights.poor);

    return Math.round(weightedSum / totalMetrics);
  }

  public exportReport(): {
    metrics: WebVitals;
    summary: any;
    score: number;
    timestamp: number;
    userAgent: string;
    url: string;
  } {
    return {
      metrics: this.getMetrics(),
      summary: this.getRatingSummary(),
      score: this.getPerformanceScore(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }
}

// 导出单例实例
export const webVitalsMonitor = WebVitalsMonitor.getInstance();

// React Hook for Web Vitals
export const useWebVitals = () => {
  const [metrics, setMetrics] = useState<WebVitals>(() => webVitalsMonitor.getMetrics());
  const [summary, setSummary] = useState(() => webVitalsMonitor.getRatingSummary());
  const [score, setScore] = useState(() => webVitalsMonitor.getPerformanceScore());

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(webVitalsMonitor.getMetrics());
      setSummary(webVitalsMonitor.getRatingSummary());
      setScore(webVitalsMonitor.getPerformanceScore());
    };

    // 定期更新指标
    const interval = setInterval(updateMetrics, 1000);
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    summary,
    score,
    exportReport: webVitalsMonitor.exportReport.bind(webVitalsMonitor),
  };
};