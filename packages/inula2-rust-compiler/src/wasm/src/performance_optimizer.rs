use std::collections::HashMap;

/// 性能优化工具
pub struct PerformanceOptimizer {
    // 缓存已解析的表达式
    expression_cache: HashMap<String, String>,
    // 缓存位置计算结果
    location_cache: HashMap<String, (u32, u32, u32, u32)>, // (start_line, start_col, end_line, end_col)
}

impl PerformanceOptimizer {
    pub fn new() -> Self {
        Self {
            expression_cache: HashMap::new(),
            location_cache: HashMap::new(),
        }
    }

    /// 缓存表达式解析结果
    pub fn get_cached_expression(&self, expr: &str) -> Option<&String> {
        self.expression_cache.get(expr)
    }

    /// 缓存表达式解析结果
    pub fn cache_expression(&mut self, expr: String, result: String) {
        self.expression_cache.insert(expr, result);
    }

    /// 缓存位置计算结果
    pub fn get_cached_location(&self, source: &str) -> Option<(u32, u32, u32, u32)> {
        self.location_cache.get(source).copied()
    }

    /// 缓存位置计算结果
    pub fn cache_location(&mut self, source: String, location: (u32, u32, u32, u32)) {
        self.location_cache.insert(source, location);
    }

    /// 清空缓存
    pub fn clear_cache(&mut self) {
        self.expression_cache.clear();
        self.location_cache.clear();
    }
}

impl Default for PerformanceOptimizer {
    fn default() -> Self {
        Self::new()
    }
}

/// 字符串解析优化工具
pub struct StringParserOptimizer;

impl StringParserOptimizer {
    /// 优化的字符查找 - 避免重复的 chars().nth() 调用
    pub fn find_char_optimized(s: &str, start: usize, target: char) -> Option<usize> {
        let bytes = s.as_bytes();
        for (i, &byte) in bytes.iter().enumerate().skip(start) {
            if byte == target as u8 {
                return Some(i);
            }
        }
        None
    }

    /// 优化的字符查找 - 查找多个目标字符
    pub fn find_any_char_optimized(
        s: &str,
        start: usize,
        targets: &[char],
    ) -> Option<(usize, char)> {
        let bytes = s.as_bytes();
        for (i, &byte) in bytes.iter().enumerate().skip(start) {
            for &target in targets {
                if byte == target as u8 {
                    return Some((i, target));
                }
            }
        }
        None
    }

    /// 优化的字符串匹配计数
    pub fn count_matches_optimized(s: &str, pattern: &str) -> usize {
        if pattern.is_empty() {
            return 0;
        }

        let mut count = 0;
        let mut start = 0;
        let pattern_bytes = pattern.as_bytes();

        while let Some(pos) = s[start..].find(pattern) {
            count += 1;
            start += pos + pattern.len();
        }

        count
    }

    /// 优化的标签名提取
    pub fn extract_tag_name_optimized(jsx: &str) -> String {
        if let Some(start) = jsx.find('<') {
            let tag_start = start + 1;
            let tag_end = jsx[tag_start..]
                .find(|c: char| c.is_whitespace() || c == '>')
                .map(|pos| tag_start + pos)
                .unwrap_or(jsx.len());

            if tag_end > tag_start {
                return jsx[tag_start..tag_end].to_string();
            }
        }
        "div".to_string()
    }

    /// 优化的嵌套检测
    pub fn has_nested_html_optimized(jsx: &str) -> bool {
        let open_tags = Self::count_matches_optimized(jsx, "<");
        let close_tags = Self::count_matches_optimized(jsx, "</");

        // 如果有超过一个标签对，则认为是嵌套结构
        if open_tags > 2 && close_tags > 1 {
            return true;
        }

        // 检查是否包含嵌套的 HTML 元素（不是属性中的 JSX 表达式）
        // 需要排除属性中的大括号，只检查标签内容中的大括号
        if jsx.contains('{') && jsx.contains('}') {
            // 检查是否在标签内容中有大括号（不是属性值）
            if let Some(tag_end) = jsx.find('>') {
                let content_start = tag_end + 1;
                if let Some(closing_tag) = jsx[content_start..].find('<') {
                    let content = &jsx[content_start..content_start + closing_tag];
                    if content.contains('{') && content.contains('}') {
                        return true;
                    }
                }
            }
        }

        false
    }

    /// 优化的属性解析 - 减少字符串操作
    pub fn parse_attributes_optimized(jsx: &str) -> Vec<(String, String)> {
        let mut attributes = Vec::new();

        if let Some(tag_start) = jsx.find('<') {
            if let Some(tag_end) = Self::find_tag_end_optimized(jsx, tag_start) {
                let tag_content = &jsx[tag_start + 1..tag_end];

                // 查找标签名结束位置
                let name_end = tag_content
                    .find(|c: char| c.is_whitespace())
                    .unwrap_or(tag_content.len());

                if name_end > 0 && name_end < tag_content.len() {
                    let attributes_str = &tag_content[name_end..];
                    Self::parse_attributes_from_string(attributes_str, &mut attributes);
                }
            }
        }

        attributes
    }

    /// 查找标签结束位置 - 优化版本
    fn find_tag_end_optimized(jsx: &str, tag_start: usize) -> Option<usize> {
        let mut pos = tag_start + 1;
        let mut in_string = false;
        let mut quote_char = '"';
        let mut brace_count = 0;

        while pos < jsx.len() {
            let ch = jsx.as_bytes()[pos] as char;

            if !in_string {
                match ch {
                    '"' | '\'' => {
                        in_string = true;
                        quote_char = ch;
                    }
                    '{' => brace_count += 1,
                    '}' => brace_count -= 1,
                    '>' if brace_count == 0 => return Some(pos),
                    _ => {}
                }
            } else if ch == quote_char {
                in_string = false;
            }

            pos += 1;
        }

        None
    }

    /// 从字符串解析属性 - 优化版本
    fn parse_attributes_from_string(attributes_str: &str, attributes: &mut Vec<(String, String)>) {
        let mut pos = 0;

        while pos < attributes_str.len() {
            // 跳过空白字符
            while pos < attributes_str.len() && attributes_str.as_bytes()[pos] as char == ' ' {
                pos += 1;
            }

            if pos >= attributes_str.len() {
                break;
            }

            // 查找属性名结束位置
            let name_start = pos;
            while pos < attributes_str.len() {
                let ch = attributes_str.as_bytes()[pos] as char;
                if ch == '=' || ch == ' ' {
                    break;
                }
                pos += 1;
            }

            if pos > name_start {
                let attr_name = attributes_str[name_start..pos].to_string();

                // 跳过空白字符
                while pos < attributes_str.len() && attributes_str.as_bytes()[pos] as char == ' ' {
                    pos += 1;
                }

                if pos < attributes_str.len() && attributes_str.as_bytes()[pos] as char == '=' {
                    pos += 1; // 跳过 '='

                    // 跳过空白字符
                    while pos < attributes_str.len()
                        && attributes_str.as_bytes()[pos] as char == ' '
                    {
                        pos += 1;
                    }

                    if pos < attributes_str.len() {
                        let value_start = pos;
                        let value = if attributes_str[pos..].starts_with('{') {
                            // JSX 表达式
                            if let Some(end_pos) =
                                Self::find_matching_brace_optimized(&attributes_str[pos..])
                            {
                                pos += end_pos;
                                attributes_str[value_start..pos].to_string()
                            } else {
                                continue;
                            }
                        } else if attributes_str[pos..].starts_with('"') {
                            // 字符串值
                            if let Some(end_pos) = attributes_str[pos + 1..].find('"') {
                                pos += 1 + end_pos + 1;
                                attributes_str[value_start..pos].to_string()
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                        };

                        attributes.push((attr_name, value));
                    }
                } else {
                    // 布尔属性（没有值）
                    attributes.push((attr_name, String::new()));
                }
            } else {
                break;
            }
        }
    }

    /// 查找匹配的大括号 - 优化版本
    fn find_matching_brace_optimized(text: &str) -> Option<usize> {
        let mut brace_count = 0;
        let mut in_string = false;
        let mut escape_next = false;
        let mut quote_char = '"';

        for (i, &byte) in text.as_bytes().iter().enumerate() {
            let ch = byte as char;

            if escape_next {
                escape_next = false;
                continue;
            }

            match ch {
                '\\' => escape_next = true,
                '"' | '\'' => {
                    if !in_string {
                        in_string = true;
                        quote_char = ch;
                    } else if ch == quote_char {
                        in_string = false;
                    }
                }
                '{' if !in_string => brace_count += 1,
                '}' if !in_string => {
                    brace_count -= 1;
                    if brace_count == 0 {
                        return Some(i + 1);
                    }
                }
                _ => {}
            }
        }

        None
    }
}
