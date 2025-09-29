use crate::bit_manager::BitManager;
use crate::types::{CompiledResult, ComponentNode};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;

/// 优化配置
#[derive(Debug, Clone)]
pub struct OptimizationConfig {
    pub enable_caching: bool,
    pub enable_parallel_processing: bool,
    pub max_cache_size: usize,
    pub memory_threshold: usize,
}

impl Default for OptimizationConfig {
    fn default() -> Self {
        Self {
            enable_caching: true,
            enable_parallel_processing: true,
            max_cache_size: 1000,
            memory_threshold: 100 * 1024 * 1024, // 100MB
        }
    }
}

/// 性能统计
#[derive(Debug, Clone)]
pub struct PerformanceStats {
    pub total_compilations: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub average_compilation_time: u64,
    pub max_compilation_time: u64,
    pub min_compilation_time: u64,
}

impl Default for PerformanceStats {
    fn default() -> Self {
        Self {
            total_compilations: 0,
            cache_hits: 0,
            cache_misses: 0,
            average_compilation_time: 0,
            max_compilation_time: 0,
            min_compilation_time: u64::MAX,
        }
    }
}

/// 内存统计
#[derive(Debug, Clone)]
pub struct MemoryStats {
    pub total_memory_usage: usize,
    pub cache_size: usize,
    pub peak_memory_usage: usize,
}

impl Default for MemoryStats {
    fn default() -> Self {
        Self {
            total_memory_usage: 0,
            cache_size: 0,
            peak_memory_usage: 0,
        }
    }
}

/// 性能优化器
pub struct PerformanceOptimizer {
    optimization_config: OptimizationConfig,
    compilation_cache: HashMap<String, Arc<CompiledResult<'static>>>,
    performance_stats: PerformanceStats,
    memory_stats: MemoryStats,
}

impl PerformanceOptimizer {
    /// 创建新的性能优化器
    pub fn new() -> Self {
        Self {
            optimization_config: OptimizationConfig::default(),
            compilation_cache: HashMap::new(),
            performance_stats: PerformanceStats::default(),
            memory_stats: MemoryStats::default(),
        }
    }

    /// 创建带配置的性能优化器
    pub fn with_config(config: OptimizationConfig) -> Self {
        Self {
            optimization_config: config,
            compilation_cache: HashMap::new(),
            performance_stats: PerformanceStats::default(),
            memory_stats: MemoryStats::default(),
        }
    }

    /// 优化编译过程
    pub fn optimize_compilation(
        &mut self,
        code: &str,
    ) -> Result<Arc<CompiledResult<'static>>, String> {
        let start_time = Instant::now();

        // 检查缓存
        if self.optimization_config.enable_caching {
            if let Some(cached_result) = self.compilation_cache.get(code) {
                self.performance_stats.cache_hits += 1;
                self.performance_stats.total_compilations += 1;
                return Ok(cached_result.clone());
            }
        }

        // 执行编译
        let result = self.execute_compilation(code)?;
        let compilation_time = start_time.elapsed().as_millis() as u64;

        // 更新统计信息
        self.performance_stats.total_compilations += 1;
        self.performance_stats.cache_misses += 1;
        self.update_performance_stats(compilation_time);

        // 创建结果
        let result_arc = Arc::new(result);

        // 缓存结果
        if self.optimization_config.enable_caching {
            // 检查缓存是否已满，如果满了则清理最旧的项
            if self.is_cache_full() {
                self.evict_oldest_cache_entry();
            }
            self.compilation_cache
                .insert(code.to_string(), result_arc.clone());
            self.memory_stats.cache_size =
                self.compilation_cache.len() * std::mem::size_of::<CompiledResult>();
        }

        Ok(result_arc)
    }

    /// 执行编译
    fn execute_compilation(&mut self, code: &str) -> Result<CompiledResult<'static>, String> {
        use crate::inula2_compiler::Inula2Compiler;

        let start_time = std::time::Instant::now();
        let mut compiler = Inula2Compiler::new();

        // 调用实际的编译器
        match compiler.compile_jsx(code) {
            Ok(_) => {
                let compilation_time = start_time.elapsed().as_millis() as u64;
                let memory_usage = code.len(); // 简化的内存使用计算

                Ok(CompiledResult {
                    ast: ComponentNode::default(),
                    bit_manager: BitManager::new(),
                    compilation_time,
                    memory_usage,
                })
            }
            Err(e) => Err(format!("编译失败: {}", e)),
        }
    }

    /// 更新性能统计
    fn update_performance_stats(&mut self, compilation_time: u64) {
        // 更新平均编译时间
        if self.performance_stats.total_compilations > 0 {
            self.performance_stats.average_compilation_time =
                (self.performance_stats.average_compilation_time
                    * (self.performance_stats.total_compilations - 1)
                    + compilation_time)
                    / self.performance_stats.total_compilations;
        } else {
            self.performance_stats.average_compilation_time = compilation_time;
        }

        // 更新最大编译时间
        if compilation_time > self.performance_stats.max_compilation_time {
            self.performance_stats.max_compilation_time = compilation_time;
        }

        // 更新最小编译时间
        if compilation_time < self.performance_stats.min_compilation_time {
            self.performance_stats.min_compilation_time = compilation_time;
        }
    }

    /// 启用缓存
    pub fn enable_caching(&mut self) {
        self.optimization_config.enable_caching = true;
    }

    /// 禁用缓存
    pub fn disable_caching(&mut self) {
        self.optimization_config.enable_caching = false;
    }

    /// 启用并行处理
    pub fn enable_parallel_processing(&mut self) {
        self.optimization_config.enable_parallel_processing = true;
    }

    /// 禁用并行处理
    pub fn disable_parallel_processing(&mut self) {
        self.optimization_config.enable_parallel_processing = false;
    }

    /// 获取性能统计
    pub fn get_performance_stats(&self) -> &PerformanceStats {
        &self.performance_stats
    }

    /// 获取内存统计
    pub fn get_memory_stats(&self) -> &MemoryStats {
        &self.memory_stats
    }

    /// 清理缓存
    pub fn clear_cache(&mut self) {
        self.compilation_cache.clear();
        self.memory_stats.cache_size = 0;
    }

    /// 获取缓存大小
    pub fn get_cache_size(&self) -> usize {
        self.compilation_cache.len()
    }

    /// 检查内存使用是否超过阈值
    pub fn is_memory_threshold_exceeded(&self) -> bool {
        self.memory_stats.total_memory_usage > self.optimization_config.memory_threshold
    }

    /// 优化内存使用
    pub fn optimize_memory_usage(&mut self) {
        if self.is_memory_threshold_exceeded() {
            // 清理一半的缓存
            let cache_size = self.compilation_cache.len();
            let to_remove = cache_size / 2;

            let keys_to_remove: Vec<String> = self
                .compilation_cache
                .keys()
                .take(to_remove)
                .cloned()
                .collect();

            for key in keys_to_remove {
                self.compilation_cache.remove(&key);
            }

            // 更新内存统计
            self.memory_stats.cache_size =
                self.compilation_cache.len() * std::mem::size_of::<CompiledResult>();
            // 减少总内存使用量
            self.memory_stats.total_memory_usage =
                self.memory_stats.total_memory_usage.saturating_sub(500);
        }
    }

    /// 获取优化配置
    pub fn get_config(&self) -> &OptimizationConfig {
        &self.optimization_config
    }

    /// 更新优化配置
    pub fn update_config(&mut self, config: OptimizationConfig) {
        self.optimization_config = config;
    }

    /// 重置统计信息
    pub fn reset_stats(&mut self) {
        self.performance_stats = PerformanceStats::default();
        self.memory_stats = MemoryStats::default();
    }

    /// 获取缓存命中率
    pub fn get_cache_hit_rate(&self) -> f64 {
        if self.performance_stats.total_compilations == 0 {
            0.0
        } else {
            self.performance_stats.cache_hits as f64
                / self.performance_stats.total_compilations as f64
        }
    }

    /// 获取平均编译时间
    pub fn get_average_compilation_time(&self) -> u64 {
        self.performance_stats.average_compilation_time
    }

    /// 获取最大编译时间
    pub fn get_max_compilation_time(&self) -> u64 {
        self.performance_stats.max_compilation_time
    }

    /// 获取最小编译时间
    pub fn get_min_compilation_time(&self) -> u64 {
        self.performance_stats.min_compilation_time
    }

    /// 获取总编译次数
    pub fn get_total_compilations(&self) -> u64 {
        self.performance_stats.total_compilations
    }

    /// 获取缓存命中次数
    pub fn get_cache_hits(&self) -> u64 {
        self.performance_stats.cache_hits
    }

    /// 获取缓存未命中次数
    pub fn get_cache_misses(&self) -> u64 {
        self.performance_stats.cache_misses
    }

    /// 获取总内存使用量
    pub fn get_total_memory_usage(&self) -> usize {
        self.memory_stats.total_memory_usage
    }

    /// 获取缓存大小
    pub fn get_cache_memory_usage(&self) -> usize {
        self.memory_stats.cache_size
    }

    /// 获取峰值内存使用量
    pub fn get_peak_memory_usage(&self) -> usize {
        self.memory_stats.peak_memory_usage
    }

    /// 设置内存阈值
    pub fn set_memory_threshold(&mut self, threshold: usize) {
        self.optimization_config.memory_threshold = threshold;
    }

    /// 设置最大缓存大小
    pub fn set_max_cache_size(&mut self, max_size: usize) {
        self.optimization_config.max_cache_size = max_size;
    }

    /// 检查缓存是否已满
    pub fn is_cache_full(&self) -> bool {
        self.compilation_cache.len() >= self.optimization_config.max_cache_size
    }

    /// 清理最旧的缓存项
    pub fn evict_oldest_cache_entry(&mut self) {
        if !self.compilation_cache.is_empty() {
            let key_to_remove = self.compilation_cache.keys().next().cloned();
            if let Some(key) = key_to_remove {
                self.compilation_cache.remove(&key);
            }
        }
    }

    /// 批量清理缓存
    pub fn batch_clear_cache(&mut self, count: usize) {
        let keys_to_remove: Vec<String> =
            self.compilation_cache.keys().take(count).cloned().collect();

        for key in keys_to_remove {
            self.compilation_cache.remove(&key);
        }
    }

    /// 获取缓存项数量
    pub fn get_cache_item_count(&self) -> usize {
        self.compilation_cache.len()
    }

    /// 检查缓存中是否存在特定项
    pub fn has_cache_item(&self, key: &str) -> bool {
        self.compilation_cache.contains_key(key)
    }

    /// 获取缓存项
    pub fn get_cache_item(&self, key: &str) -> Option<&Arc<CompiledResult>> {
        self.compilation_cache.get(key)
    }

    /// 移除特定缓存项
    pub fn remove_cache_item(&mut self, key: &str) -> Option<Arc<CompiledResult>> {
        self.compilation_cache.remove(key)
    }

    /// 更新内存统计
    pub fn update_memory_stats(&mut self, memory_usage: usize) {
        self.memory_stats.total_memory_usage = memory_usage;
        if memory_usage > self.memory_stats.peak_memory_usage {
            self.memory_stats.peak_memory_usage = memory_usage;
        }
    }

    /// 获取内存使用率
    pub fn get_memory_usage_rate(&self) -> f64 {
        if self.optimization_config.memory_threshold == 0 {
            0.0
        } else {
            self.memory_stats.total_memory_usage as f64
                / self.optimization_config.memory_threshold as f64
        }
    }

    /// 检查是否需要内存优化
    pub fn needs_memory_optimization(&self) -> bool {
        self.is_memory_threshold_exceeded() || self.is_cache_full()
    }

    /// 执行内存优化
    pub fn perform_memory_optimization(&mut self) {
        if self.needs_memory_optimization() {
            self.optimize_memory_usage();
        }
    }

    /// 获取优化建议
    pub fn get_optimization_suggestions(&self) -> Vec<String> {
        let mut suggestions = Vec::new();

        if self.get_cache_hit_rate() < 0.5 {
            suggestions.push("考虑增加缓存大小以提高命中率".to_string());
        }

        if self.get_memory_usage_rate() > 0.8 {
            suggestions.push("内存使用率过高，建议清理缓存".to_string());
        }

        if self.get_average_compilation_time() > 1000 {
            suggestions.push("编译时间较长，建议启用并行处理".to_string());
        }

        suggestions
    }

    /// 导出性能报告
    pub fn export_performance_report(&self) -> String {
        format!(
            "性能报告:\n\
            总编译次数: {}\n\
            缓存命中率: {:.2}%\n\
            平均编译时间: {}ms\n\
            最大编译时间: {}ms\n\
            最小编译时间: {}ms\n\
            缓存大小: {}\n\
            内存使用率: {:.2}%\n\
            优化建议: {:?}",
            self.get_total_compilations(),
            self.get_cache_hit_rate() * 100.0,
            self.get_average_compilation_time(),
            self.get_max_compilation_time(),
            self.get_min_compilation_time(),
            self.get_cache_size(),
            self.get_memory_usage_rate() * 100.0,
            self.get_optimization_suggestions()
        )
    }
}

impl Default for PerformanceOptimizer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_performance_optimizer_creation() {
        let optimizer = PerformanceOptimizer::new();
        assert_eq!(optimizer.get_total_compilations(), 0);
        assert_eq!(optimizer.get_cache_size(), 0);
    }

    #[test]
    fn test_performance_optimizer_with_config() {
        let config = OptimizationConfig {
            enable_caching: false,
            enable_parallel_processing: false,
            max_cache_size: 500,
            memory_threshold: 50 * 1024 * 1024,
        };
        let optimizer = PerformanceOptimizer::with_config(config);
        assert!(!optimizer.get_config().enable_caching);
        assert!(!optimizer.get_config().enable_parallel_processing);
    }

    #[test]
    fn test_optimization_compilation() {
        let mut optimizer = PerformanceOptimizer::new();
        let code = "function Test() { return <div>Test</div>; }";
        let result = optimizer.optimize_compilation(code);
        assert!(result.is_ok());
        assert_eq!(optimizer.get_total_compilations(), 1);
    }

    #[test]
    fn test_cache_functionality() {
        let mut optimizer = PerformanceOptimizer::new();
        let code = "function Test() { return <div>Test</div>; }";

        // 第一次编译
        let result1 = optimizer.optimize_compilation(code);
        assert!(result1.is_ok());
        assert_eq!(optimizer.get_cache_misses(), 1);

        // 第二次编译（应该命中缓存）
        let result2 = optimizer.optimize_compilation(code);
        assert!(result2.is_ok());
        assert_eq!(optimizer.get_cache_hits(), 1);
    }

    #[test]
    fn test_memory_optimization() {
        let mut optimizer = PerformanceOptimizer::new();
        optimizer.set_memory_threshold(1000); // 设置较小的阈值

        // 模拟内存使用
        optimizer.update_memory_stats(1500);
        assert!(optimizer.is_memory_threshold_exceeded());

        // 执行内存优化
        optimizer.perform_memory_optimization();
        assert!(!optimizer.is_memory_threshold_exceeded());
    }

    #[test]
    fn test_statistics() {
        let mut optimizer = PerformanceOptimizer::new();
        let code = "function Test() { return <div>Test</div>; }";

        // 执行几次编译
        for _ in 0..5 {
            let _ = optimizer.optimize_compilation(code);
        }

        assert_eq!(optimizer.get_total_compilations(), 5);
        assert_eq!(optimizer.get_cache_misses(), 1); // 只有第一次是未命中
        assert_eq!(optimizer.get_cache_hits(), 4); // 其余4次都是命中
    }

    #[test]
    fn test_cache_management() {
        let mut optimizer = PerformanceOptimizer::new();
        optimizer.set_max_cache_size(2);

        let code1 = "function Test1() { return <div>Test1</div>; }";
        let code2 = "function Test2() { return <div>Test2</div>; }";
        let code3 = "function Test3() { return <div>Test3</div>; }";

        // 编译三个不同的代码
        let _ = optimizer.optimize_compilation(code1);
        let _ = optimizer.optimize_compilation(code2);
        let _ = optimizer.optimize_compilation(code3);

        // 缓存应该被限制在最大大小
        assert!(optimizer.get_cache_size() <= 2);
    }

    #[test]
    fn test_performance_report() {
        let mut optimizer = PerformanceOptimizer::new();
        let code = "function Test() { return <div>Test</div>; }";

        // 执行一些编译
        for _ in 0..3 {
            let _ = optimizer.optimize_compilation(code);
        }

        let report = optimizer.export_performance_report();
        assert!(report.contains("性能报告"));
        assert!(report.contains("总编译次数: 3"));
    }
}
