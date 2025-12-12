

<!-- Sync Impact Report
Version change: v1.2.0 → v1.3.0
Modified principles: None
Added sections:
- TanStack Query v5 使用规范 (开发规范第4节)
Removed sections: None
Templates requiring updates: ✅ All templates already aligned with new principles
Follow-up TODOs: None
-->

# 影院商品管理中台 项目宪章

## 项目概述

**项目名称**: 影院商品管理中台
**项目描述**: 影院商品管理中台 - 为影院行业提供统一的商品管理、销售分析和运营支持的中台系统
**版本**: v1.3.0
**创建日期**: 2025-12-11
**最后更新**: 2025-12-12

## 核心架构原则

### 1. 架构模式原则
**必须采用SpringBoot单体架构**，不使用微服务架构。理由如下：
- 项目当前规模适中，单体架构开发效率更高
- 团队规模较小，单体架构维护成本更低
- 部署和运维相对简单，适合快速迭代
- 可以在业务发展需要时再考虑微服务拆分

**前端采用React 18组件化架构**，实现模块化开发
**数据存储使用关系型数据库+缓存系统**，保证数据一致性
**部署方式为容器化部署**，支持未来的水平扩展需求

### 2. 技术选型原则
- **稳定性优先**: 必须选择成熟稳定的技术栈，避免实验性技术
- **开发效率**: 优先考虑开发效率和维护成本的平衡
- **性能要求**: 必须满足中等规模影院业务的性能需求
- **团队技能**: 基于团队现有技术储备进行技术选择，降低学习成本

### 3. 架构演进原则
- 当前阶段专注单体架构的优化和完善
- 在业务复杂度和团队规模达到一定阈值时，重新评估微服务拆分的必要性
- 任何架构变更必须经过充分的论证和测试

## 技术栈规范

### 前端技术栈 (必须严格遵守)
```json
{
  "framework": "React 18.2.0",
  "language": "TypeScript 5.0.4",
  "ui": "Ant Design 6.1.0",
  "styling": "Tailwind CSS 4.1.17",
  "bundler": "Vite 6.0.7",
  "stateManagement": "Zustand",
  "dataFetching": "TanStack Query",
  "routing": "React Router 6",
  "testing": {
    "e2e": "Playwright",
    "unit": "Vitest"
  }
}
```

### 后端技术栈 (必须严格遵守)
```json
{
  "framework": "Spring Boot 3.x",
  "language": "Java 17+",
  "database": "PostgreSQL",
  "cache": "Redis",
  "build": "Maven",
  "deployment": "Docker",
  "monitoring": "Actuator + Micrometer"
}
```

### 技术栈约束
- **禁止使用**: 微服务架构、Service Mesh、复杂的分布式事务
- **必须使用**: SpringBoot单体架构、关系型数据库、本地缓存
- **版本锁定**: 所有依赖版本必须在package.json/pom.xml中明确指定

## 开发规范

### 1. 代码风格规范
- **命名规范**: 严格遵循各语言的标准命名约定
- **注释规范**: 关键业务逻辑必须添加中文注释，注释率不低于30%
- **目录结构**: 按功能模块组织代码结构，避免按技术分层
- **依赖管理**: 统一使用包管理器，禁止手动下载依赖
- **代码格式**: 使用ESLint/Prettier统一代码格式

### 2. Git工作流规范
- **主分支**: `main` - 生产环境代码，受保护分支
- **开发分支**: `develop` - 开发环境代码
- **功能分支**: `feature/功能名称` - 新功能开发
- **修复分支**: `hotfix/问题描述` - 紧急修复
- **发布分支**: `release/版本号` - 发布准备

### 3. 提交规范 (强制执行)
- **格式**: `type(scope): description`
- **类型**: feat(新功能), fix(修复), docs(文档), style(格式), refactor(重构), test(测试), chore(构建)
- **示例**: `feat(product): 添加商品管理功能`
- **禁止**: 不符合规范的提交将被CI/CD拒绝

### 4. TanStack Query v5 使用规范 (强制执行)

#### 4.1 职责划分原则
- **TanStack Query**: 必须且仅用于管理服务器状态（API数据、缓存、同步）
- **Zustand**: 必须用于管理客户端状态（UI状态、表单数据、模态框状态）
- **禁止混用**: 禁止将服务器状态存储在Zustand中，禁止将客户端状态存储在TanStack Query中

#### 4.2 查询键管理规范
- **统一管理**: 所有查询键必须在 `src/services/queryKeys.ts` 中统一管理
- **使用工厂模式**: 必须使用 `QueryKeyFactory` 类创建查询键，确保一致性
- **命名规范**: 查询键必须使用有意义的名称，遵循 `[模块名, 操作类型, ...参数]` 格式
- **类型安全**: 查询键必须使用 `as const` 确保类型安全
- **示例**:
```typescript
// ✅ 正确：使用查询键工厂
export const skuKeys = new QueryKeyFactory('skus');
skuKeys.skusPaginated(page, pageSize, filters)

// ❌ 错误：直接使用字符串数组
['skus', page, pageSize]
```

#### 4.3 Query Hooks 规范
- **命名规范**: Query Hooks 必须以 `use` 开头，以 `Query` 结尾，如 `useSkuListQuery`
- **参数处理**: 必须清理 `undefined` 和 `null` 值，避免不必要的重新获取
- **缓存配置**: 必须根据数据特性设置合理的 `staleTime` 和 `gcTime`（v5中 `cacheTime` 已重命名为 `gcTime`）
- **错误处理**: 必须使用统一的错误处理函数 `showError` 和 `getFriendlyErrorMessage`
- **类型定义**: 必须为所有 Query Hooks 定义明确的返回类型
- **示例**:
```typescript
// ✅ 正确：完整的 Query Hook 实现
export const useSkuListQuery = (params: SkuQueryParams, enabled: boolean = true) => {
  const cleanParams = cleanQueryParams(params);
  return useQuery({
    queryKey: skuKeys.skusPaginated(cleanParams.page, cleanParams.pageSize, cleanParams.filters),
    queryFn: () => skuService.getSkus(cleanParams),
    enabled,
    staleTime: 2 * 60 * 1000, // 2分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  });
};
```

#### 4.4 Mutation Hooks 规范
- **命名规范**: Mutation Hooks 必须以 `use` 开头，以 `Mutation` 结尾，如 `useCreateSkuMutation`
- **缓存失效**: Mutation 成功后必须使用 `queryClient.invalidateQueries` 失效相关查询
- **乐观更新**: 对于频繁操作，应该使用乐观更新提升用户体验
- **错误处理**: 必须使用统一的错误处理，显示友好的错误消息
- **成功提示**: 必须使用统一的成功提示函数 `showSuccess`
- **示例**:
```typescript
// ✅ 正确：完整的 Mutation Hook 实现
export const useCreateSkuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SkuFormData) => skuService.createSku(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skuKeys.all() });
      showSuccess('SKU创建成功');
    },
    onError: (error) => {
      showError(getFriendlyErrorMessage(error));
    },
  });
};
```

#### 4.5 缓存策略规范
- **staleTime 设置**: 
  - 实时数据（如库存、订单）: `staleTime: 0` 或 `30 * 1000`（30秒）
  - 半静态数据（如商品列表）: `staleTime: 2 * 60 * 1000`（2分钟）
  - 静态数据（如分类、品牌）: `staleTime: 10 * 60 * 1000`（10分钟）
- **gcTime 设置**: 必须根据数据访问频率设置，默认 `10 * 60 * 1000`（10分钟）
- **refetchOnWindowFocus**: 默认 `false`，仅在需要实时数据的场景启用
- **refetchOnReconnect**: 必须设置为 `true`，确保网络重连后数据同步

#### 4.6 查询选项工具函数规范
- **统一使用**: 必须使用 `createQueryOptions` 和 `createMutationOptions` 工具函数
- **位置**: 这些函数定义在 `src/services/index.ts` 中
- **目的**: 确保所有查询和变更使用一致的配置模式

#### 4.7 禁止事项
- **禁止**: 在组件中直接使用 `useQuery` 和 `useMutation`，必须封装为自定义 Hooks
- **禁止**: 在 Zustand Store 中存储从 API 获取的数据
- **禁止**: 使用 `cacheTime`（v5已废弃），必须使用 `gcTime`
- **禁止**: 在查询键中包含函数或对象引用，必须序列化为字符串
- **禁止**: 忽略错误处理，所有查询和变更必须有错误处理逻辑

#### 4.8 最佳实践
- **自定义 Hooks**: 将业务逻辑封装在自定义 Hooks 中，组件只负责展示
- **查询键工厂**: 使用 `QueryKeyFactory` 确保查询键的一致性和可维护性
- **类型安全**: 充分利用 TypeScript 类型系统，为所有查询和变更定义类型
- **错误边界**: 在关键组件中使用错误边界处理查询错误
- **加载状态**: 合理使用 `isLoading`、`isFetching`、`isPending` 区分不同的加载状态

## 质量保证

### 1. 质量保证指导
- **测试策略**: 根据项目实际需要和业务优先级决定测试策略
- **质量保证**: 重点关注核心功能的稳定性和用户体验
- **性能关注**: 监控系统关键性能指标，确保用户体验
- **安全考虑**: 遵循基本的安全开发实践，保护用户数据和系统安全

### 2. 代码审查 (强制执行)
- **强制审查**: 所有代码必须经过同行审查才能合并
- **审查重点**: 业务逻辑正确性、性能影响、安全性、可维护性
- **工具支持**: 使用自动化工具辅助代码审查
- **审查标准**: 使用Code Review Checklist

### 3. 部署流程规范
- **环境隔离**: dev → staging → prod，严禁跳过环境
- **自动化部署**: 使用CI/CD流水线，禁止手动部署
- **回滚机制**: 必须支持一键回滚，回滚时间 < 5分钟
- **监控告警**: 完善的监控和告警机制，响应时间 < 15分钟

## 性能要求


## 团队协作

### 1. 沟通协作规范
- **每日站会**: 同步进度和问题，时间控制在15分钟内
- **周度回顾**: 总结成果和改进点，形成会议纪要
- **文档共享**: 重要决策和设计文档化，使用Confluence
- **知识分享**: 定期技术分享和培训，每月至少一次

### 2. 文档管理指导
- **文档语言**: 推荐使用中文编写文档，便于团队理解和维护
- **API文档**: 根据需要生成API文档，便于接口对接和维护
- **开发文档**: 记录重要的环境配置和开发注意事项
- **代码注释**: 为关键业务逻辑添加必要注释，便于代码维护
- **文档策略**: 根据项目实际需要编写文档，避免过度文档化


## 项目管理

### 1. 需求管理规范
- **需求优先级**: 基于业务价值和技术可行性评估
- **变更控制**: 严格的需求变更控制流程，使用变更申请表
- **风险管理**: 定期识别和应对项目风险，建立风险清单

### 2. 迭代规划规范
- **迭代周期**: 2周一个迭代，固定节奏
- **版本规划**: 制定清晰的版本发布计划，提前1个月规划
- **验收标准**: 明确的功能验收标准，使用DoD(Definition of Done)
- **发布管理**: 规范的版本发布流程，包含发布检查清单

## 持续改进

### 1. 技术改进机制
- **技术债务**: 定期识别和偿还技术债务，每个迭代分配20%时间
- **性能优化**: 持续的性能监控和优化，建立性能基线
- **架构演进**: 基于业务发展适度架构调整，每季度评估
- **工具升级**: 定期升级开发工具和依赖，保持技术栈现代化


## 决策记录 (Architecture Decision Records)

### 关键架构决策

1. **单体架构选择** (2025-12-11)
   - **决策**: 采用SpringBoot单体架构而非微服务架构
   - **理由**:
     - 项目规模适中，单体架构开发效率更高
     - 团队规模较小，单体架构维护成本更低
     - 部署和运维相对简单，适合快速迭代
     - 可以在业务发展需要时再考虑拆分
   - **影响**: 开发效率提升，运维复杂度降低，团队协作更简单
   - **回滚计划**: 在业务规模扩大时重新评估微服务拆分
   - **决策者**: 技术负责人

2. **技术栈选择** (2025-12-11)
   - **决策**: 前端采用React 18 + TypeScript 5.0 + Ant Design 6.1.0
   - **理由**:
     - 团队熟悉React生态，学习成本低
     - TypeScript提供更好的类型安全和代码质量
     - Ant Design 6提供完善的企业级组件库
     - 与现有技术栈保持一致
   - **影响**: 开发效率提升，代码质量保证，维护成本降低
   - **决策者**: 前端技术负责人

3. **数据库选择** (2025-12-11)
   - **决策**: 使用PostgreSQL作为主数据库
   - **理由**:
     - 强一致性保证，符合业务需求
     - 丰富的功能和扩展性
     - 开源免费，降低成本
     - 团队有PostgreSQL使用经验
   - **影响**: 数据一致性保证，功能完善，成本可控
   - **决策者**: 数据库管理员

## 宪章更新

### 更新流程 (必须遵守)
1. **提案**: 任何团队成员都可以提出宪章修改建议
2. **讨论**: 团队讨论修改的必要性和影响，形成会议纪要
3. **决策**: 技术负责人或团队决策是否采纳，需要2/3以上同意
4. **更新**: 更新宪章内容并记录变更，版本号递增
5. **通知**: 通知所有团队成员变更内容，更新相关文档

### 版本管理
- **版本号**: 使用语义化版本控制 (Semantic Versioning)
- **MAJOR**: 不兼容的API变更或重大架构调整
- **MINOR**: 新功能添加或非破坏性改进
- **PATCH**: 错误修复或文档更新

### 合规性检查
- **定期审查**: 每季度审查宪章的适用性和有效性
- **合规审计**: 每半年进行一次合规性审计
- **违规处理**: 发现违规行为必须及时纠正并记录

## 版本历史

- **v1.3.0** (2025-12-12): 新增 TanStack Query v5 使用规范
  - 添加 TanStack Query v5 的完整使用规范
  - 明确职责划分原则（TanStack Query vs Zustand）
  - 规范查询键管理、Query Hooks、Mutation Hooks 的使用
  - 定义缓存策略和最佳实践
  - 列出禁止事项和最佳实践指导

- **v1.2.0** (2025-12-11): 优化质量保证和文档管理策略
  - 将强制测试要求改为灵活的测试策略指导
  - 将强制文档要求改为实用的文档管理指导
  - 提倡根据项目实际需要进行质量保证和文档编写
  - 移除过于严格的量化指标要求

- **v1.1.0** (2025-12-11): 新增文档语言规范
  - 要求所有项目文档必须使用中文编写
  - 明确代码注释和提交信息的中文使用规范
  - 更新文档管理规范，确保文档一致性

- **v1.0.0** (2025-12-11): 初始版本，确立SpringBoot单体架构原则
  - 建立完整的技术栈规范
  - 制定开发规范和质量标准
  - 建立项目管理和团队协作机制
  - 配置性能和安全要求

---

**宪章生效日期**: 2025-12-11
**下次审查日期**: 2026-03-11
**维护负责人**: 技术负责人
**审批人**: 项目经理
**文档版本**: v1.3.0
