"""
Function model with text processing and analysis methods.
"""

import re
from datetime import datetime
from typing import Dict, List
from uuid import uuid4

from app.models.schemas import (
    FunctionExample,
    LLMFunction,
    Parameter,
    PerformanceMetrics,
)


class FunctionModel:
    """Enhanced function model with text processing capabilities."""
    
    def __init__(self, data: Dict):
        """Initialize function model from dictionary data."""
        # Generate ID if not provided
        if 'function_id' not in data:
            data['function_id'] = str(uuid4())
        
        # Set default values
        defaults = {
            'subcategory': '',
            'parameters': {},
            'use_cases': [],
            'examples': [],
            'dependencies': [],
            'performance_metrics': None,
            'tags': [],
            'version': '1.0.0',
            'last_updated': datetime.utcnow(),
            'license': 'MIT',
        }
        
        for key, default_value in defaults.items():
            if key not in data:
                data[key] = default_value
        
        # Create and validate the LLM function
        self._data = LLMFunction(**data)
    
    @property
    def id(self) -> str:
        """Get function ID."""
        return self._data.function_id
    
    @property
    def name(self) -> str:
        """Get function name."""
        return self._data.name
    
    @property
    def description(self) -> str:
        """Get function description."""
        return self._data.description
    
    @property
    def category(self) -> str:
        """Get function category."""
        return self._data.category
    
    @property
    def subcategory(self) -> str:
        """Get function subcategory."""
        return self._data.subcategory or ''
    
    @property
    def parameters(self) -> Dict[str, Parameter]:
        """Get function parameters."""
        return self._data.parameters
    
    @property
    def use_cases(self) -> List[str]:
        """Get function use cases."""
        return self._data.use_cases
    
    @property
    def examples(self) -> List[FunctionExample]:
        """Get function examples."""
        return self._data.examples
    
    @property
    def dependencies(self) -> List[str]:
        """Get function dependencies."""
        return self._data.dependencies
    
    @property
    def performance_metrics(self) -> PerformanceMetrics:
        """Get performance metrics."""
        return self._data.performance_metrics
    
    @property
    def tags(self) -> List[str]:
        """Get function tags."""
        return self._data.tags
    
    @property
    def version(self) -> str:
        """Get function version."""
        return self._data.version
    
    @property
    def last_updated(self) -> datetime:
        """Get last updated timestamp."""
        return self._data.last_updated
    
    @property
    def implementation(self) -> str:
        """Get function implementation."""
        return self._data.implementation or ''
    
    @property
    def raw(self) -> LLMFunction:
        """Get raw function data."""
        return self._data
    
    def get_main_text(self) -> str:
        """Get main text representation for embedding."""
        return f"{self._data.name}: {self._data.description}"
    
    def get_detailed_text(self) -> str:
        """Get detailed text representation."""
        param_texts = []
        for name, param in self._data.parameters.items():
            required_text = ", required" if param.required else ""
            param_texts.append(f"{name} ({param.type.value}{required_text}): {param.description}")
        
        parts = [
            f"Function: {self._data.name}",
            f"Description: {self._data.description}",
            f"Category: {self._data.category}",
        ]
        
        if self._data.subcategory:
            parts[-1] += f" > {self._data.subcategory}"
        
        if param_texts:
            parts.append(f"Parameters: {'; '.join(param_texts)}")
        
        if self._data.use_cases:
            parts.append(f"Use Cases: {', '.join(self._data.use_cases)}")
        
        if self._data.examples:
            example_texts = [
                f"Input: {ex.input} -> Output: {ex.output}"
                for ex in self._data.examples
            ]
            parts.append(f"Examples: {'; '.join(example_texts)}")
        
        return '\n'.join(parts)
    
    def get_scenarios_text(self) -> str:
        """Get scenarios text for embedding."""
        scenarios = list(self._data.use_cases)
        
        for example in self._data.examples:
            if example.context:
                scenarios.append(f"{example.context} {example.input}")
            else:
                scenarios.append(example.input)
        
        return ' '.join(filter(None, scenarios))
    
    def get_keywords_text(self) -> str:
        """Get keywords text for embedding."""
        keywords = []
        
        # Add tags
        keywords.extend(self._data.tags)
        
        # Add category and subcategory
        keywords.append(self._data.category)
        if self._data.subcategory:
            keywords.append(self._data.subcategory)
        
        # Add function name components
        name_parts = re.split(r'[_\-\s]+', self._data.name)
        keywords.extend(name_parts)
        
        # Add parameter names
        keywords.extend(self._data.parameters.keys())
        
        # Filter empty strings and return unique keywords
        return ' '.join(filter(None, set(keywords)))
    
    def get_searchable_text(self) -> str:
        """Get comprehensive searchable text."""
        return ' '.join([
            self.get_main_text(),
            self.get_detailed_text(),
            self.get_scenarios_text(),
            self.get_keywords_text(),
        ])
    
    def update_description(self, description: str) -> None:
        """Update function description."""
        self._data.description = description
        self._data.last_updated = datetime.utcnow()
    
    def add_use_case(self, use_case: str) -> None:
        """Add a use case."""
        if use_case not in self._data.use_cases:
            self._data.use_cases.append(use_case)
            self._data.last_updated = datetime.utcnow()
    
    def add_example(self, example: FunctionExample) -> None:
        """Add an example."""
        self._data.examples.append(example)
        self._data.last_updated = datetime.utcnow()
    
    def add_tag(self, tag: str) -> None:
        """Add a tag."""
        tag_lower = tag.lower().strip()
        if tag_lower and tag_lower not in self._data.tags:
            self._data.tags.append(tag_lower)
            self._data.last_updated = datetime.utcnow()
    
    def update_performance_metrics(self, metrics: Dict) -> None:
        """Update performance metrics."""
        if self._data.performance_metrics is None:
            self._data.performance_metrics = PerformanceMetrics(**metrics)
        else:
            for key, value in metrics.items():
                setattr(self._data.performance_metrics, key, value)
        self._data.last_updated = datetime.utcnow()
    
    def update_version(self, version: str) -> None:
        """Update function version."""
        self._data.version = version
        self._data.last_updated = datetime.utcnow()
    
    def is_compatible_with(self, other: 'FunctionModel') -> bool:
        """Check compatibility with another function."""
        return (
            self.id in other.dependencies or 
            other.id in self.dependencies
        )
    
    def get_complexity_score(self) -> float:
        """Calculate complexity score based on parameters and examples."""
        param_count = len(self._data.parameters)
        example_count = len(self._data.examples)
        dependency_count = len(self._data.dependencies)
        
        return (param_count * 2) + (example_count * 1) + (dependency_count * 3)
    
    def get_popularity_score(self) -> float:
        """Get popularity score from performance metrics."""
        if (self._data.performance_metrics and 
            self._data.performance_metrics.usage_frequency is not None):
            return float(self._data.performance_metrics.usage_frequency)
        return 0.0
    
    def get_reliability_score(self) -> float:
        """Get reliability score from performance metrics."""
        if (self._data.performance_metrics and 
            self._data.performance_metrics.success_rate is not None):
            return self._data.performance_metrics.success_rate
        return 0.5  # Default neutral score
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return self._data.dict()
    
    def to_json(self) -> str:
        """Convert to JSON string."""
        return self._data.json()
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'FunctionModel':
        """Create from dictionary."""
        return cls(data)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'FunctionModel':
        """Create from JSON string."""
        function_data = LLMFunction.parse_raw(json_str)
        return cls(function_data.dict())
    
    def validate(self) -> bool:
        """Validate the function model."""
        try:
            # This will raise ValidationError if invalid
            LLMFunction(**self._data.dict())
            return True
        except Exception:
            return False
    
    def __str__(self) -> str:
        """String representation."""
        return f"FunctionModel(id='{self.id}', name='{self.name}')"
    
    def __repr__(self) -> str:
        """Detailed string representation."""
        return (
            f"FunctionModel(id='{self.id}', name='{self.name}', "
            f"category='{self.category}', params={len(self.parameters)})"
        )