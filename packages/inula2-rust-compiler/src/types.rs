use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateUnit {
    pub name: String,
    pub initial_value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComputedUnit {
    pub name: String,
    pub expression: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropValue {
    pub value: String,
    pub dep_id_bitmap: u32,
    pub dependencies: Vec<String>,
    pub is_event: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextUnit {
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpUnit {
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HtmlUnit {
    pub tag: String,
    pub props: HashMap<String, PropValue>,
    pub children: Vec<Box<ViewUnit>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForUnit {
    pub array: String,
    pub item: String,
    pub index: Option<String>,
    pub key: Option<String>,
    pub children: Vec<Box<ViewUnit>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IfBranch {
    pub condition: String,
    pub children: Vec<Box<ViewUnit>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IfUnit {
    pub branches: Vec<Box<IfBranch>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FragmentUnit {
    pub children: Vec<Box<ViewUnit>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextUnit {
    pub context_name: String,
    pub props: HashMap<String, PropValue>,
    pub children: Vec<Box<ViewUnit>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SuspenseUnit {
    pub children: Vec<Box<ViewUnit>>,
    pub fallback: Option<Box<ViewUnit>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateProp {
    pub tag: String,
    pub name: String,
    pub key: String,
    pub path: Vec<usize>,
    pub value: String,
    pub is_event: bool, // 新增字段
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateUnit {
    pub template: HtmlUnit,
    pub mutable_units: Vec<MutableUnit>,
    pub props: Vec<TemplateProp>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MutableUnit {
    pub path: Vec<usize>,
    pub unit: ViewUnit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ViewUnit {
    Html(HtmlUnit),
    Text(TextUnit),
    Exp(ExpUnit),
    For(ForUnit),
    If(IfUnit),
    Fragment(FragmentUnit),
    Context(ContextUnit),
    Suspense(Box<SuspenseUnit>),
    Template(TemplateUnit),
    State(StateUnit),
    Computed(ComputedUnit),
}