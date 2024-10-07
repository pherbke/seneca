use std::sync::Once;
use env_logger::{Builder, Env};

// Static variable to ensure the logger is initialized only once
static INIT: Once = Once::new();

/// Initializes the logger with a default log level of "info" if RUST_LOG is not set.
/// This function will only initialize the logger once, even if called multiple times.
pub fn initialize_logger() {
    INIT.call_once(|| {
        Builder::from_env(Env::default().default_filter_or("info")).init();
    });
}
