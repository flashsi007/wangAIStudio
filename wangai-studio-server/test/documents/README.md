# 文档模块测试

本目录包含文档管理系统的完整测试套件，包括单元测试、集成测试和端到端测试。

## 测试文件结构

```
test/documents/
├── documents.service.spec.ts     # 文档服务单元测试
├── documents.controller.spec.ts  # 文档控制器单元测试
├── children.controller.spec.ts   # 子节点控制器单元测试
├── dto.spec.ts                   # DTO验证测试
├── schemas.spec.ts               # 数据库模式测试
├── documents.e2e-spec.ts         # 端到端测试
├── jest.config.js                # Jest配置文件
├── setup.ts                      # 测试环境设置
├── run-tests.sh                  # Linux/Mac测试运行脚本
├── run-tests.bat                 # Windows测试运行脚本
└── README.md                     # 本文件
```

## 测试覆盖范围

### 1. 单元测试

#### DocumentsService (documents.service.spec.ts)
- ✅ 创建文档
- ✅ 查询所有文档（分页）
- ✅ 根据ID查询文档
- ✅ 更新文档
- ✅ 删除文档
- ✅ 添加子节点
- ✅ 更新子节点
- ✅ 删除子节点
- ✅ 获取子节点
- ✅ 错误处理（文档不存在等）

#### DocumentsController (documents.controller.spec.ts)
- ✅ 创建文档接口
- ✅ 查询文档列表接口
- ✅ 查询单个文档接口
- ✅ 更新文档接口
- ✅ 删除文档接口
- ✅ 错误处理和异常传播

#### ChildrenController (children.controller.spec.ts)
- ✅ 创建子节点接口
- ✅ 查询子节点接口
- ✅ 更新子节点接口
- ✅ 删除子节点接口
- ✅ 错误处理和异常传播

#### DTO验证 (dto.spec.ts)
- ✅ CreateDocumentDto 验证规则
- ✅ UpdateDocumentDto 验证规则
- ✅ CreateChildNodeDto 验证规则
- ✅ UpdateChildNodeDto 验证规则
- ✅ 必填字段验证
- ✅ 数据类型验证
- ✅ 枚举值验证

#### 数据库模式 (schemas.spec.ts)
- ✅ DocumentStructure 模式验证
- ✅ ChildNode 子文档模式验证
- ✅ 默认值设置
- ✅ 时间戳自动更新
- ✅ 数据库操作（查询、分页等）

### 2. 端到端测试 (documents.e2e-spec.ts)
- ✅ 完整的API接口测试
- ✅ 请求/响应验证
- ✅ HTTP状态码验证
- ✅ 数据持久化验证
- ✅ 错误场景测试

## 运行测试

### 前置条件

确保已安装所有依赖：

```bash
pnpm install
```

### 运行所有测试

**Windows:**
```cmd
test\documents\run-tests.bat
```

**Linux/Mac:**
```bash
chmod +x test/documents/run-tests.sh
./test/documents/run-tests.sh
```

### 单独运行测试类型

**只运行单元测试:**
```bash
npx jest --config=test/documents/jest.config.js --testPathPattern=".*\.spec\.ts$" --testPathIgnorePatterns=".*\.e2e-spec\.ts$"
```

**只运行端到端测试:**
```bash
npx jest --config=test/documents/jest.config.js --testPathPattern=".*\.e2e-spec\.ts$"
```

**生成覆盖率报告:**
```bash
npx jest --config=test/documents/jest.config.js --coverage
```

### 运行特定测试文件

```bash
# 运行服务测试
npx jest test/documents/documents.service.spec.ts

# 运行控制器测试
npx jest test/documents/documents.controller.spec.ts

# 运行DTO测试
npx jest test/documents/dto.spec.ts
```

## 测试配置

### Jest配置 (jest.config.js)
- 使用 `ts-jest` 转换TypeScript
- 设置30秒测试超时
- 配置覆盖率收集
- 模块路径映射

### 测试环境设置 (setup.ts)
- 静默非关键日志输出
- 设置全局测试钩子
- 处理未捕获的Promise拒绝

## 测试数据

### 内存数据库
端到端测试和模式测试使用 `mongodb-memory-server` 创建临时的MongoDB实例，确保：
- 测试隔离性
- 无需外部数据库依赖
- 测试数据自动清理

### 模拟数据
单元测试使用Jest模拟对象，包括：
- Mongoose模型模拟
- 服务方法模拟
- 数据库操作模拟

## 覆盖率报告

测试完成后，覆盖率报告将生成在：
- `coverage/documents/index.html` - HTML格式报告
- `coverage/documents/lcov.info` - LCOV格式报告
- 控制台输出 - 文本格式摘要

## 持续集成

这些测试可以轻松集成到CI/CD流水线中：

```yaml
# GitHub Actions 示例
- name: Run Document Tests
  run: |
    npm install
    npm run test:documents
```

## 故障排除

### 常见问题

1. **MongoDB内存服务器启动失败**
   - 确保有足够的内存
   - 检查端口是否被占用

2. **测试超时**
   - 增加Jest超时时间
   - 检查异步操作是否正确处理

3. **模块导入错误**
   - 检查路径映射配置
   - 确保所有依赖已安装

### 调试测试

```bash
# 运行单个测试并显示详细输出
npx jest test/documents/documents.service.spec.ts --verbose

# 以调试模式运行
node --inspect-brk node_modules/.bin/jest test/documents/documents.service.spec.ts --runInBand
```

## 贡献指南

添加新测试时请遵循以下原则：

1. **测试命名**: 使用描述性的测试名称
2. **测试隔离**: 每个测试应该独立运行
3. **数据清理**: 确保测试后清理数据
4. **错误场景**: 包含正常和异常场景测试
5. **覆盖率**: 保持高测试覆盖率

## API接口测试清单

根据 `doc.md` 中定义的接口，以下是完整的测试覆盖：

### 文档接口
- ✅ `POST /documents` - 创建文档
- ✅ `GET /documents` - 获取文档列表（分页）
- ✅ `GET /documents/:id` - 获取单个文档
- ✅ `PUT /documents` - 更新文档
- ✅ `DELETE /documents/:id` - 删除文档

### 子节点接口
- ✅ `POST /children` - 创建子节点
- ✅ `GET /children/:parentId/:nodeId` - 获取子节点
- ✅ `PUT /children` - 更新子节点
- ✅ `DELETE /children/:parentId/:nodeId` - 删除子节点

所有接口都包含了成功和失败场景的测试用例。