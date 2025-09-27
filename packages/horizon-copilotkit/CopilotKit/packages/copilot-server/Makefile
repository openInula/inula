.PHONY: help install install-dev test test-unit test-integration coverage lint format type-check clean build publish docs

# Default target
help:
	@echo "CopilotKit Runtime Python - Available Commands:"
	@echo ""
	@echo "  install        Install production dependencies"
	@echo "  install-dev    Install development dependencies"
	@echo "  test           Run all tests"
	@echo "  test-unit      Run unit tests only"
	@echo "  test-integration Run integration tests only"
	@echo "  coverage       Run tests with coverage report"
	@echo "  lint           Run linting checks"
	@echo "  format         Format code with black and isort"
	@echo "  type-check     Run mypy type checking"
	@echo "  clean          Clean build artifacts"
	@echo "  build          Build the package"
	@echo "  publish        Publish to PyPI"
	@echo "  docs           Generate documentation"

# Installation
install:
	poetry install --only=main

install-dev:
	poetry install

# Testing
test:
	poetry run pytest

test-unit:
	poetry run pytest -m unit

test-integration:
	poetry run pytest -m integration

coverage:
	poetry run pytest --cov=copilotkit_runtime --cov-report=html --cov-report=term

# Code quality
lint:
	poetry run flake8 copilotkit_runtime tests
	poetry run mypy copilotkit_runtime

format:
	poetry run black copilotkit_runtime tests
	poetry run isort copilotkit_runtime tests

type-check:
	poetry run mypy copilotkit_runtime

# Build and publish
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	find . -type d -name __pycache__ -delete
	find . -type f -name "*.pyc" -delete

build: clean
	poetry build

publish: build
	poetry publish

# Documentation
docs:
	@echo "Documentation is available at https://docs.copilotkit.ai"

# Development workflow
dev: install-dev format lint test

# CI workflow
ci: install-dev lint type-check test coverage