//! Utility functions for inula-compiler

use bitvec::prelude::BitVec;
use std::collections::HashMap;

/// Merge multiple bitmaps into one
pub fn merge_bitmaps(bitmaps: &[BitVec<u8>]) -> BitVec<u8> {
    if bitmaps.is_empty() {
        return BitVec::new();
    }

    let max_len = bitmaps.iter().map(|b| b.len()).max().unwrap_or(0);
    let mut result = BitVec::with_capacity(max_len);

    for i in 0..max_len {
        let mut has_true = false;
        for bm in bitmaps {
            if i < bm.len() && bm[i] {
                has_true = true;
                break;
            }
        }
        result.push(has_true);
    }

    result
}

/// Convert bitmap to human-readable string
pub fn bitmap_to_string(bitmap: &BitVec<u8>) -> String {
    bitmap.iter()
        .map(|b| if *b { '1' } else { '0' })
        .collect()
}

/// Get dependency names from bitmap and reactive map
pub fn get_dependencies_from_bitmap(
    bitmap: &BitVec<u8>,
    reactive_map: &HashMap<String, usize>
) -> Vec<String> {
    reactive_map.iter()
        .filter(|(_, &index)| index < bitmap.len() && bitmap[index])
        .map(|(name, _)| name.clone())
        .collect()
}