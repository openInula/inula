// bit_manager.rs - 依赖关系位图管理器
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// 位图管理器 - 管理状态依赖关系位图
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BitManager {
    /// 状态名称到比特位的映射
    pub state_bits: HashMap<String, u32>,
    /// 比特位到状态名称的映射
    pub bit_states: HashMap<u32, String>,
    /// 依赖关系位图：状态名 -> 依赖的比特位
    pub dependency_bits: HashMap<String, u32>,
    /// 发布关系位图：状态名 -> 需要更新的比特位
    pub publish_bits: HashMap<String, u32>,
    /// 下一个可用的比特位
    next_bit: u32,
    /// 缓存：状态名 -> 传递闭包结果
    #[serde(skip)]
    pub update_cache: HashMap<String, u32>,
    /// 缓存失效标志
    #[serde(skip)]
    pub cache_dirty: bool,
}

impl BitManager {
    /// 创建新的位图管理器
    pub fn new() -> Self {
        Self {
            state_bits: HashMap::new(),
            bit_states: HashMap::new(),
            dependency_bits: HashMap::new(),
            publish_bits: HashMap::new(),
            next_bit: 1, // 从 1 开始，0 位保留
            update_cache: HashMap::new(),
            cache_dirty: false,
        }
    }

    /// 显式注册状态与其比特位（用于与外部已分配的位对齐）
    pub fn register_state_bit(&mut self, state_name: &str, bit: u32) {
        self.state_bits.insert(state_name.to_string(), bit);
        self.bit_states.insert(bit, state_name.to_string());
        // 确保 next_bit 始终为未使用的最高位之后
        while self.next_bit <= bit {
            self.next_bit <<= 1;
        }
    }

    /// 分配新的状态比特位
    pub fn allocate_state_bit(&mut self, state_name: &str) -> u32 {
        if let Some(&bit) = self.state_bits.get(state_name) {
            return bit;
        }

        let bit = self.next_bit;
        self.next_bit <<= 1; // 左移一位，确保每个状态都有唯一的比特位

        self.state_bits.insert(state_name.to_string(), bit);
        self.bit_states.insert(bit, state_name.to_string());

        bit
    }

    /// 获取状态的比特位
    pub fn get_state_bit(&self, state_name: &str) -> Option<u32> {
        self.state_bits.get(state_name).copied()
    }

    /// 设置状态依赖关系
    pub fn set_dependency(&mut self, state_name: &str, dependencies: &[String]) {
        let mut dep_bits = 0u32;
        for dep in dependencies {
            if let Some(&bit) = self.state_bits.get(dep) {
                dep_bits |= bit;
            }
        }
        self.dependency_bits
            .insert(state_name.to_string(), dep_bits);
        // 依赖关系改变时，缓存失效
        self.cache_dirty = true;
    }

    /// 获取状态依赖比特位
    pub fn get_dependency_bits(&self, state_name: &str) -> u32 {
        self.dependency_bits.get(state_name).copied().unwrap_or(0)
    }

    /// 设置发布关系
    pub fn set_publish_bits(&mut self, state_name: &str, publish_bits: u32) {
        self.publish_bits
            .insert(state_name.to_string(), publish_bits);
    }

    /// 获取发布比特位
    pub fn get_publish_bits(&self, state_name: &str) -> u32 {
        self.publish_bits.get(state_name).copied().unwrap_or(0)
    }

    /// 检查状态是否依赖其他状态
    pub fn has_dependency(&self, state_name: &str, other_state: &str) -> bool {
        let dep_bits = self.get_dependency_bits(state_name);
        if let Some(&other_bit) = self.state_bits.get(other_state) {
            (dep_bits & other_bit) != 0
        } else {
            false
        }
    }

    /// 计算需要更新的状态比特位（带缓存优化）
    pub fn calculate_update_bits(&mut self, changed_state: &str) -> u32 {
        // 检查缓存
        if !self.cache_dirty {
            if let Some(&cached_result) = self.update_cache.get(changed_state) {
                return cached_result;
            }
        }

        // 计算传递闭包
        let result = self.calculate_update_bits_internal(changed_state);

        // 更新缓存
        self.update_cache.insert(changed_state.to_string(), result);

        result
    }

    /// 内部计算更新比特位（无缓存）
    fn calculate_update_bits_internal(&self, changed_state: &str) -> u32 {
        let Some(&changed_bit) = self.state_bits.get(changed_state) else {
            return 0;
        };

        // 使用位运算优化的广度优先搜索
        let mut frontier: u32 = changed_bit;
        let mut visited_bits: u32 = 0;
        let mut new_frontier: u32 = 0;

        while frontier != 0 {
            // 找到所有依赖于当前 frontier 中比特位的状态
            for (state_name, dep_bits) in &self.dependency_bits {
                if (dep_bits & frontier) != 0 {
                    if let Some(&state_bit) = self.state_bits.get(state_name) {
                        if (visited_bits & state_bit) == 0 {
                            new_frontier |= state_bit;
                        }
                    }
                }
            }

            visited_bits |= frontier;
            frontier = new_frontier;
            new_frontier = 0;
        }

        visited_bits
    }

    /// 批量计算多个状态的更新比特位
    pub fn calculate_batch_update_bits(&mut self, changed_states: &[String]) -> u32 {
        let mut result = 0u32;

        for state in changed_states {
            result |= self.calculate_update_bits(state);
        }

        result
    }

    /// 合并多个状态比特位
    pub fn merge_bits(&self, states: &[String]) -> u32 {
        let mut merged = 0u32;
        for state in states {
            if let Some(&bit) = self.state_bits.get(state) {
                merged |= bit;
            }
        }
        merged
    }

    /// 获取所有状态名称
    pub fn get_all_states(&self) -> Vec<String> {
        self.state_bits.keys().cloned().collect()
    }

    /// 获取位图统计信息
    pub fn get_stats(&self) -> BitManagerStats {
        BitManagerStats {
            total_states: self.state_bits.len(),
            total_dependencies: self.dependency_bits.len(),
            total_publishes: self.publish_bits.len(),
            next_available_bit: self.next_bit,
        }
    }
}

impl Default for BitManager {
    fn default() -> Self {
        Self::new()
    }
}

/// 位图管理器统计信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BitManagerStats {
    pub total_states: usize,
    pub total_dependencies: usize,
    pub total_publishes: usize,
    pub next_available_bit: u32,
}

impl BitManager {
    /// 清除缓存
    pub fn clear_cache(&mut self) {
        self.update_cache.clear();
        self.cache_dirty = false;
    }

    /// 标记缓存为脏
    pub fn mark_cache_dirty(&mut self) {
        self.cache_dirty = true;
    }

    /// 预热缓存 - 预计算所有状态的更新比特位
    pub fn warmup_cache(&mut self) {
        self.clear_cache();

        let state_names: Vec<String> = self.state_bits.keys().cloned().collect();
        for state_name in state_names {
            self.calculate_update_bits(&state_name);
        }

        self.cache_dirty = false;
    }

    /// 获取缓存统计信息
    pub fn get_cache_stats(&self) -> (usize, bool) {
        (self.update_cache.len(), self.cache_dirty)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bit_allocation() {
        let mut manager = BitManager::new();

        let bit_a = manager.allocate_state_bit("a");
        let bit_b = manager.allocate_state_bit("b");
        let bit_c = manager.allocate_state_bit("c");

        assert_eq!(bit_a, 1);
        assert_eq!(bit_b, 2);
        assert_eq!(bit_c, 4);

        // 重复分配应该返回相同的比特位
        let bit_a_again = manager.allocate_state_bit("a");
        assert_eq!(bit_a, bit_a_again);
    }

    #[test]
    fn test_dependency_tracking() {
        let mut manager = BitManager::new();

        manager.allocate_state_bit("a");
        manager.allocate_state_bit("b");
        manager.allocate_state_bit("c");

        // b 依赖于 a
        manager.set_dependency("b", &["a".to_string()]);
        // c 依赖于 a 和 b
        manager.set_dependency("c", &["a".to_string(), "b".to_string()]);

        assert!(manager.has_dependency("b", "a"));
        assert!(manager.has_dependency("c", "a"));
        assert!(manager.has_dependency("c", "b"));
        assert!(!manager.has_dependency("a", "b"));
    }

    #[test]
    fn test_update_calculation() {
        let mut manager = BitManager::new();

        manager.allocate_state_bit("a");
        manager.allocate_state_bit("b");
        manager.allocate_state_bit("c");

        // b 依赖于 a，c 依赖于 b
        manager.set_dependency("b", &["a".to_string()]);
        manager.set_dependency("c", &["b".to_string()]);

        // 当 a 变化时，应该更新 a、b、c
        let update_bits = manager.calculate_update_bits("a");
        assert_eq!(update_bits, 1 | 2 | 4); // a | b | c
    }
}
