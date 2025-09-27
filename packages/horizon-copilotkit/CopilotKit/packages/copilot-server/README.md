  安装依赖:
  - make install: 安装生产依赖
  - make install-dev: 安装开发依赖

  测试:
  - make test: 运行所有测试
  - make test-unit: 只运行单元测试
  - make test-integration: 只运行集成测试
  - make coverage: 运行测试并生成覆盖率报告

  代码质量:
  - make lint: 运行flake8和mypy检查
  - make format: 使用black和isort格式化代码
  - make type-check: 运行mypy类型检查

  构建发布:
  - make clean: 清理构建产物
  - make build: 构建包
  - make publish: 发布到PyPI

  工作流:
  - make dev: 开发工作流（安装+格式化+检查+测试）