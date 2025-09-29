use std::env;
use std::fs;
use std::path::Path;

// Use the library crate public API (native path)
#[cfg(feature = "analysis")]
use inula_compiler_wasm::inula2_compiler::compile_jsx_v2_native;

fn main() {
    // Expect a single file path argument
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        eprintln!("Usage: inula_rust_cli <input.jsx|tsx>");
        std::process::exit(2);
    }

    let input_path = &args[1];
    if !Path::new(input_path).exists() {
        eprintln!("Input file not found: {}", input_path);
        std::process::exit(2);
    }

    let code = match fs::read_to_string(input_path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to read file {}: {}", input_path, e);
            std::process::exit(2);
        }
    };

    // Call native compile entry, output JSON string
    #[cfg(feature = "analysis")]
    {
        match compile_jsx_v2_native(&code) {
            Ok(s) => {
                println!("{}", s);
            }
            Err(e) => {
                eprintln!("{}", e);
                std::process::exit(1);
            }
        }
    }

    #[cfg(not(feature = "analysis"))]
    {
        eprintln!("Error: analysis feature is required for CLI functionality");
        eprintln!("Please build with: cargo build --features analysis,codegen");
        std::process::exit(1);
    }
}
