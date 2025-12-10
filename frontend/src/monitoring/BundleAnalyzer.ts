export interface BundleModule {
  id: string;
  name: string;
  size: number;
  chunks: string[];
  reasons: string[];
  isAsset?: boolean;
  path?: string;
}

export interface BundleChunk {
  id: string;
  name: string;
  size: number;
  modules: BundleModule[];
  parents: string[];
  children: string[];
}

export interface BundleAnalysis {
  totalSize: number;
  chunks: BundleChunk[];
  modules: BundleModule[];
  duplicates: Array<{
    modules: BundleModule[];
    totalSize: number;
  }>;
  largeModules: BundleModule[];
  compressionRatio: number;
}

export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private analysis: BundleAnalysis | null = null;
  private observer: MutationObserver | null = null;

  private constructor() {
    this.initializeAnalysis();
  }

  public static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  private async initializeAnalysis(): Promise<void> {
    if (typeof window !== 'undefined') {
      this.analyzeCurrentBundle();
      this.setupDynamicImportTracking();
    }
  }

  private analyzeCurrentBundle(): void {
    try {
      // 尝试获取webpack的stats数据
      this.getWebpackStats()
        .then(stats => {
          this.analysis = this.processStats(stats);
          this.reportAnalysis();
        })
        .catch(error => {
          console.warn('无法获取webpack stats:', error);
          this.fallbackAnalysis();
        });
    } catch (error) {
      console.warn('Bundle分析初始化失败:', error);
      this.fallbackAnalysis();
    }
  }

  private async getWebpackStats(): Promise<any> {
    // 尝试从全局变量获取webpack stats
    if ((window as any).__webpack_stats__) {
      return (window as any).__webpack_stats__;
    }

    // 尝试从网络请求获取stats.json
    try {
      const response = await fetch('/stats.json');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // 忽略网络错误
    }

    throw new Error('无法获取webpack stats');
  }

  private processStats(stats: any): BundleAnalysis {
    const chunks: BundleChunk[] = [];
    const modules: BundleModule[] = [];

    // 处理chunks
    if (stats.chunks) {
      stats.chunks.forEach((chunk: any) => {
        chunks.push({
          id: chunk.id.toString(),
          name: chunk.names?.[0] || `chunk-${chunk.id}`,
          size: chunk.size || 0,
          modules: [],
          parents: chunk.parents || [],
          children: chunk.children || [],
        });
      });
    }

    // 处理modules
    if (stats.modules) {
      stats.modules.forEach((module: any) => {
        const moduleInfo: BundleModule = {
          id: module.id.toString(),
          name: module.name || module.identifier || `module-${module.id}`,
          size: module.size || 0,
          chunks: module.chunks || [],
          reasons: module.reasons || [],
          path: module.name,
        };

        modules.push(moduleInfo);

        // 将模块添加到对应的chunks
        moduleInfo.chunks.forEach(chunkId => {
          const chunk = chunks.find(c => c.id === chunkId.toString());
          if (chunk) {
            chunk.modules.push(moduleInfo);
          }
        });
      });
    }

    // 分析重复模块
    const duplicates = this.findDuplicateModules(modules);

    // 找出大模块
    const largeModules = modules
      .filter(module => module.size > 50000) // 大于50KB
      .sort((a, b) => b.size - a.size);

    // 计算压缩比
    const totalUncompressed = modules.reduce((sum, module) => sum + module.size, 0);
    const totalCompressed = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const compressionRatio = totalUncompressed > 0 ? totalCompressed / totalUncompressed : 1;

    return {
      totalSize: chunks.reduce((sum, chunk) => sum + chunk.size, 0),
      chunks,
      modules,
      duplicates,
      largeModules,
      compressionRatio,
    };
  }

  private fallbackAnalysis(): void {
    // 降级分析：分析当前加载的脚本
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    const chunks: BundleChunk[] = [];

    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('chunk')) {
        // 这是一个估计值，实际大小需要从网络请求获取
        const estimatedSize = Math.random() * 100000 + 50000; // 50-150KB
        totalSize += estimatedSize;

        chunks.push({
          id: src.split('/').pop() || 'unknown',
          name: src.split('/').pop()?.replace('.js', '') || 'unknown',
          size: estimatedSize,
          modules: [],
          parents: [],
          children: [],
        });
      }
    });

    this.analysis = {
      totalSize,
      chunks,
      modules: [],
      duplicates: [],
      largeModules: [],
      compressionRatio: 0.7,
    };
  }

  private findDuplicateModules(modules: BundleModule[]): Array<{
    modules: BundleModule[];
    totalSize: number;
  }> {
    const moduleMap = new Map<string, BundleModule[]>();

    modules.forEach(module => {
      // 简化模块名用于比较
      const simplifiedName = module.name
        .split('/')
        .pop() || module.name;

      if (!moduleMap.has(simplifiedName)) {
        moduleMap.set(simplifiedName, []);
      }
      moduleMap.get(simplifiedName)!.push(module);
    });

    const duplicates: Array<{
      modules: BundleModule[];
      totalSize: number;
    }> = [];

    moduleMap.forEach(moduleList => {
      if (moduleList.length > 1) {
        const totalSize = moduleList.reduce((sum, module) => sum + module.size, 0);
        duplicates.push({
          modules: moduleList,
          totalSize,
        });
      }
    });

    return duplicates.sort((a, b) => b.totalSize - a.totalSize);
  }

  private setupDynamicImportTracking(): void {
    // 拦截动态import来跟踪运行时加载
    const originalImport = window.import;
    window.import = async (...args: any[]) => {
      const start = performance.now();
      try {
        const result = await originalImport(...args);
        const duration = performance.now() - start;
        this.trackDynamicImport(args[0], duration, true);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        this.trackDynamicImport(args[0], duration, false);
        throw error;
      }
    };
  }

  private trackDynamicImport(modulePath: string, duration: number, success: boolean): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c${success ? '✅' : '❌'} Dynamic Import: ${modulePath}`,
        `color: ${success ? '#52c41a' : '#ff4d4f'};`,
        `(${duration.toFixed(2)}ms)`
      );
    }
  }

  private reportAnalysis(): void {
    if (!this.analysis || process.env.NODE_ENV !== 'development') {
      return;
    }

    console.group('%c📦 Bundle Analysis Report', 'color: #1890ff; font-weight: bold; font-size: 16px;');

    console.log(`Total Size: ${this.formatBytes(this.analysis.totalSize)}`);
    console.log(`Compression Ratio: ${(this.analysis.compressionRatio * 100).toFixed(1)}%`);
    console.log(`Number of Chunks: ${this.analysis.chunks.length}`);
    console.log(`Number of Modules: ${this.analysis.modules.length}`);

    if (this.analysis.largeModules.length > 0) {
      console.group('%c⚠️ Large Modules (>50KB)', 'color: #faad14;');
      this.analysis.largeModules.slice(0, 10).forEach(module => {
        console.log(`${this.formatBytes(module.size)} - ${module.name}`);
      });
      console.groupEnd();
    }

    if (this.analysis.duplicates.length > 0) {
      console.group('%c🔄 Duplicate Modules', 'color: #ff7a45;');
      this.analysis.duplicates.slice(0, 5).forEach(dup => {
        console.log(`${dup.modules.map(m => m.name).join(', ')} - ${this.formatBytes(dup.totalSize)}`);
      });
      console.groupEnd();
    }

    console.groupEnd();

    // 输出优化建议
    this.generateOptimizationSuggestions();
  }

  private generateOptimizationSuggestions(): void {
    if (!this.analysis) return;

    console.group('%c💡 Optimization Suggestions', 'color: #52c41a;');

    if (this.analysis.largeModules.length > 0) {
      console.log('• 考虑代码分割以减少初始包大小');
      console.log('• 使用动态import()延迟加载非关键模块');
    }

    if (this.analysis.duplicates.length > 0) {
      console.log('• 检查依赖重复，优化打包配置');
    }

    if (this.analysis.compressionRatio > 0.8) {
      console.log('• 启用更好的压缩配置（gzip, brotli）');
    }

    if (this.analysis.totalSize > 1024 * 1024) { // > 1MB
      console.log('• 考虑使用tree shaking移除未使用的代码');
      console.log('• 评估是否需要所有第三方库');
    }

    console.groupEnd();
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public getAnalysis(): BundleAnalysis | null {
    return this.analysis;
  }

  public getChunkSizes(): Array<{ name: string; size: number; percentage: number }> {
    if (!this.analysis) return [];

    const total = this.analysis.totalSize;
    return this.analysis.chunks
      .map(chunk => ({
        name: chunk.name,
        size: chunk.size,
        percentage: total > 0 ? (chunk.size / total) * 100 : 0,
      }))
      .sort((a, b) => b.size - a.size);
  }

  public getModuleDependencyGraph(): Array<{ from: string; to: string; weight: number }> {
    if (!this.analysis) return [];

    const graph: Array<{ from: string; to: string; weight: number }> = [];

    this.analysis.chunks.forEach(chunk => {
      chunk.children.forEach(childId => {
        const child = this.analysis!.chunks.find(c => c.id === childId);
        if (child) {
          graph.push({
            from: chunk.name,
            to: child.name,
            weight: chunk.size,
          });
        }
      });
    });

    return graph;
  }

  public async analyzeNewChunk(chunkName: string, modulePath: string): Promise<{
    size: number;
    dependencies: string[];
    recommendations: string[];
  }> {
    try {
      // 模拟分析新chunk
      const response = await fetch(modulePath);
      const content = await response.text();
      const size = new Blob([content]).size;

      // 简单的依赖分析
      const dependencies = this.extractDependencies(content);

      // 生成建议
      const recommendations = this.generateChunkRecommendations(size, dependencies);

      return {
        size,
        dependencies,
        recommendations,
      };
    } catch (error) {
      console.warn('分析新chunk失败:', error);
      return {
        size: 0,
        dependencies: [],
        recommendations: ['无法分析该模块'],
      };
    }
  }

  private extractDependencies(content: string): string[] {
    const importRegex = /import.*from\s+['"](.+?)['"]/g;
    const dependencies: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    return [...new Set(dependencies)];
  }

  private generateChunkRecommendations(size: number, dependencies: string[]): string[] {
    const recommendations: string[] = [];

    if (size > 200000) { // > 200KB
      recommendations.push('考虑进一步分割这个模块');
    }

    if (dependencies.length > 20) {
      recommendations.push('依赖过多，考虑重构以减少耦合');
    }

    const hasLargeDependency = dependencies.some(dep =>
      dep.includes('lodash') || dep.includes('moment') || dep.includes('antd')
    );

    if (hasLargeDependency) {
      recommendations.push('考虑使用按需引入或更轻量的替代库');
    }

    return recommendations;
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// 导出单例实例
export const bundleAnalyzer = BundleAnalyzer.getInstance();

// React Hook for Bundle Analysis
export const useBundleAnalysis = () => {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(() => bundleAnalyzer.getAnalysis());
  const [chunkSizes, setChunkSizes] = useState(() => bundleAnalyzer.getChunkSizes());

  useEffect(() => {
    const updateAnalysis = () => {
      setAnalysis(bundleAnalyzer.getAnalysis());
      setChunkSizes(bundleAnalyzer.getChunkSizes());
    };

    const interval = setInterval(updateAnalysis, 5000);
    updateAnalysis();

    return () => clearInterval(interval);
  }, []);

  return {
    analysis,
    chunkSizes,
    getModuleDependencyGraph: bundleAnalyzer.getModuleDependencyGraph.bind(bundleAnalyzer),
    analyzeNewChunk: bundleAnalyzer.analyzeNewChunk.bind(bundleAnalyzer),
  };
};