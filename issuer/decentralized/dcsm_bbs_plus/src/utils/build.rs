use std::env;
use std::fs;
use std::path::Path;

fn main() {
    let test_dir = Path::new("tests");
    if test_dir.exists() {
        for entry in fs::read_dir(test_dir).unwrap() {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("rs") {
                let content = fs::read_to_string(&path).unwrap();
                if !content.contains("#[test]") {
                    println!(
                        "cargo:warning=Test file `{}` contains no tests",
                        path.display()
                    );
                }
            }
        }
    }
}