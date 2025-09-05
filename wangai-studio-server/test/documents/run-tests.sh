#!/bin/bash

# 文档模块测试运行脚本

echo "🧪 开始运行文档模块测试..."

# 设置环境变量
export NODE_ENV=test

# 运行单元测试
echo "📋 运行单元测试..."
npx jest --config=test/documents/jest.config.js --testPathPattern=".*\.spec\.ts$" --testPathIgnorePatterns=".*\.e2e-spec\.ts$"

if [ $? -eq 0 ]; then
    echo "✅ 单元测试通过"
else
    echo "❌ 单元测试失败"
    exit 1
fi

# 运行端到端测试
echo "🌐 运行端到端测试..."
npx jest --config=test/documents/jest.config.js --testPathPattern=".*\.e2e-spec\.ts$"

if [ $? -eq 0 ]; then
    echo "✅ 端到端测试通过"
else
    echo "❌ 端到端测试失败"
    exit 1
fi

# 生成覆盖率报告
echo "📊 生成测试覆盖率报告..."
npx jest --config=test/documents/jest.config.js --coverage

echo "🎉 所有测试完成！"
echo "📈 查看覆盖率报告: coverage/documents/index.html"