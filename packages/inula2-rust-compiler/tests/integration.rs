use inula_compiler_rs::jsx_parser::JsxParser;
use inula_compiler_rs::reactivity_parser::ReactivityParser;
use inula_compiler_rs::generator::Generator;
use inula_compiler_rs::DependencyInfo;
use serde_wasm_bindgen::from_value;
use wasm_bindgen_test::*;
wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);
use wasm_bindgen::JsValue;
use web_sys::console;

#[wasm_bindgen_test]
fn test_jsx_parsing() {
    let parser = JsxParser::new();
    let jsx = r#"<div className="app">Hello, {name}!</div>"#;
    match parser.parse(jsx) {
        Ok(result) => {
            let view_unit_json = result.as_string().unwrap();
            console::log_1(&JsValue::from_str(&format!("Parsed JSX result: {}", view_unit_json)));
        }
        Err(e) => {
            panic!("Parsing error: {:?}", e);
        }
    }
}

#[wasm_bindgen_test]
fn test_reactivity_analysis() {
    let jsx = r#"<div>{count + 1}</div>"#;
    let parser = JsxParser::new();
    let result = parser.parse(jsx).expect("Failed to parse JSX");
    let view_unit_json = result.as_string().expect("Parsed JSX result is not a string");
    console::log_1(&JsValue::from_str(&format!("ViewUnit JSON: {}", view_unit_json)));

    let mut reactivity_parser = ReactivityParser::new();
    let result = reactivity_parser.analyze(&view_unit_json)
        .expect("Analysis failed");
    console::log_1(&result);

    let dependencies: DependencyInfo = from_value(result)
        .expect("Failed to convert JsValue to DependencyInfo");

    assert!(dependencies.dependencies.contains_key("count"));
    assert_eq!(dependencies.total_bitmap.len(), 1);
}

#[wasm_bindgen_test]
fn test_bitmap_operations() {
    let mut parser = ReactivityParser::new();
    assert_eq!(parser.get_or_create_bit("a"), 0);
    assert_eq!(parser.get_or_create_bit("b"), 1);
    assert_eq!(parser.get_or_create_bit("a"), 0);
    assert_eq!(parser.get_or_create_bit("c"), 2);
}

#[wasm_bindgen_test]
fn test_context_handling() {
    let parser = JsxParser::new();
    let jsx = r#"
        <MyContext.Provider value={{ theme: 'dark' }}>
            <div>Theme is {theme}</div>
        </MyContext.Provider>
    "#;
    match parser.parse(jsx) {
        Ok(result) => {
            let view_unit_json = result.as_string().unwrap();
            console::log_1(&JsValue::from_str(&format!("Context parsing result: {}", view_unit_json)));
            assert!(view_unit_json.contains("Context"), "Context not found in parsing result");
            assert!(view_unit_json.contains("MyContext"), "Context name not found");
            assert!(view_unit_json.contains("theme"), "Context value not found");
        }
        Err(e) => {
            panic!("Context parsing error: {:?}", e);
        }
    }
}

#[wasm_bindgen_test]
fn test_suspense_handling() {
    let parser = JsxParser::new();
    let jsx = r#"
        <Suspense fallback={<div>Loading...</div>}>
            <AsyncComponent />
        </Suspense>
    "#;
    match parser.parse(jsx) {
        Ok(result) => {
            let view_unit_json = result.as_string().unwrap();
            console::log_1(&JsValue::from_str(&format!("Suspense parsing result: {}", view_unit_json)));
            assert!(view_unit_json.contains("Suspense"), "Suspense not found in parsing result");
            assert!(view_unit_json.contains("Loading..."), "Fallback content not found");
            assert!(view_unit_json.contains("AsyncComponent"), "Child component not found");
        }
        Err(e) => {
            panic!("Suspense parsing error: {:?}", e);
        }
    }
}

#[wasm_bindgen_test]
fn test_template_transformation() {
    let parser = JsxParser::new();
    let jsx = r#"
        <template>
            <div className="card">{title}</div>
            <ul>
                {items.map(item => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </template>
    "#;
    match parser.parse(jsx) {
        Ok(result) => {
            let view_unit_json = result.as_string().unwrap();
            console::log_1(&JsValue::from_str(&format!("Template parsing result: {}", view_unit_json)));
            assert!(view_unit_json.contains("template"), "Template not found in parsing result");
            assert!(view_unit_json.contains("title"), "Template variable not found");
            assert!(view_unit_json.contains("each"), "Each block not found");
        }
        Err(e) => {
            panic!("Template parsing error: {:?}", e);
        }
    }
}

#[wasm_bindgen_test]
fn test_event_handling() {
    let parser = JsxParser::new();
    let jsx = r#"<button onClick={handleClick}>Click me</button>"#;
    match parser.parse(jsx) {
        Ok(result) => {
            let view_unit_json = result.as_string().unwrap();
            console::log_1(&JsValue::from_str(&format!("Event parsing result: {}", view_unit_json)));
            assert!(view_unit_json.contains("is_event\":true"), "Event handler not marked");
            assert!(view_unit_json.contains("handleClick"), "Event handler not found");
        }
        Err(e) => {
            panic!("Event parsing error: {:?}", e);
        }
    }
}

#[wasm_bindgen_test]
fn test_computed_property() {
    let parser = JsxParser::new();
    let jsx = r#"<div>{derivedCount = count + 1}</div>"#;
    match parser.parse(jsx) {
        Ok(result) => {
            let view_unit_json = result.as_string().unwrap();
            console::log_1(&JsValue::from_str(&format!("Computed property parsing result: {}", view_unit_json)));
            assert!(view_unit_json.contains("derivedCount"), "Computed property not found");
            assert!(view_unit_json.contains("count + 1"), "Computed expression not found");
        }
        Err(e) => {
            panic!("Computed property parsing error: {:?}", e);
        }
    }
}

#[wasm_bindgen_test]
fn test_dependency_cache() {
    let parser = JsxParser::new();
    let jsx = r#"<div data={{ theme: 'dark' }}>{theme}</div>"#;
    let result = parser.parse(jsx).expect("Failed to parse JSX");
    let view_unit_json = result.as_string().expect("Parsed JSX result is not a string");
    console::log_1(&JsValue::from_str(&format!("ViewUnit JSON: {}", view_unit_json)));

    let mut reactivity_parser = ReactivityParser::new();
    let result = reactivity_parser.analyze(&view_unit_json)
        .expect("Analysis failed");
    console::log_1(&result);

    let dependencies: DependencyInfo = from_value(result)
        .expect("Failed to convert JsValue to DependencyInfo");

    assert!(dependencies.cache.contains_key("{ theme: \"dark\" }"), "Cache not found for complex data");
    assert!(dependencies.dependencies.contains_key("theme"), "Theme dependency not found");
}

#[wasm_bindgen_test]
fn test_state_declaration() {
    let parser = JsxParser::new();
    let code = r#"
        const [count, setCount] = useState(0);
        <div>{count}</div>
    "#;
    match parser.parse(code) {
        Ok(result) => {
            let view_unit_json = result.as_string().unwrap();
            console::log_1(&JsValue::from_str(&format!("State parsing result: {}", view_unit_json)));
            assert!(view_unit_json.contains("State"), "State not found in parsing result");
            assert!(view_unit_json.contains("count"), "State variable not found");
            assert!(view_unit_json.contains("0"), "Initial value not found");
        }
        Err(e) => {
            panic!("State parsing error: {:?}", e);
        }
    }
}

#[wasm_bindgen_test]
fn test_generate_code() {
    let parser = JsxParser::new();
    let code = r#"
        const [count, setCount] = useState(0);
        <template>
            <div className="card">{count}</div>
            <button onClick={handleClick}>Click</button>
        </template>
    "#;
    let result = parser.parse(code).expect("Failed to parse JSX");
    let view_unit_json = result.as_string().expect("Parsed JSX result is not a string");

    let mut reactivity_parser = ReactivityParser::new();
    let dep_result = reactivity_parser.analyze(&view_unit_json)
        .expect("Analysis failed");
    let dep_info: DependencyInfo = from_value(dep_result)
        .expect("Failed to convert JsValue to DependencyInfo");

    let dep_info_json = serde_json::to_string(&dep_info)
        .expect("Failed to serialize DependencyInfo");

    let generator = Generator::new();
    match generator.generate(&view_unit_json, &dep_info_json) {
        Ok(result) => {
            let generated_code = result.as_string().unwrap();
            console::log_1(&JsValue::from_str(&format!("Generated code: {}", generated_code)));
            assert!(generated_code.contains("const [count, setCount] = useState(0);"), "State declaration not generated");
            assert!(generated_code.contains("document.createElement('div')"), "Static template not generated");
            assert!(generated_code.contains("setAttribute('className', 'card')"), "Static prop not generated");
            assert!(generated_code.contains("document.createTextNode(count)"), "Dynamic node not generated");
            assert!(generated_code.contains("addEventListener('click', handleClick)"), "Event listener not generated");
        }
        Err(e) => {
            panic!("Code generation error: {:?}", e);
        }
    }
}