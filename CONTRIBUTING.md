# Contributing to Seneca

We welcome contributions to the Seneca project! By contributing, you help make this project better for everyone. Here are some guidelines to help you get started.

## How to Contribute

### Reporting Bugs

If you find a bug, please report it by opening an issue on the [GitHub repository](https://github.com/yourusername/seneca/issues). Include as much detail as possible to help us understand and reproduce the issue.

### Suggesting Enhancements

We welcome suggestions for new features or improvements. Please open an issue on the [GitHub repository](https://github.com/yourusername/seneca/issues) and describe your idea in detail.

### Submitting Pull Requests

1. **Fork the repository**: Click the "Fork" button on the top right of the repository page.
2. **Clone your fork**: 
    ```bash
    git clone https://github.com/yourusername/seneca.git
    cd seneca
    ```
3. **Create a new branch**: 
    ```bash
    git checkout -b feature/your-feature-name
    ```
4. **Make your changes**: Implement your feature or fix the bug.
5. **Commit your changes**: 
    ```bash
    git commit -m "Description of your changes"
    ```
6. **Push to your fork**: 
    ```bash
    git push origin feature/your-feature-name
    ```
7. **Open a pull request**: Go to the original repository and click the "New pull request" button. Provide a clear description of your changes.

## Code Style

Please follow these guidelines to maintain a consistent code style:

- Use 2 spaces for indentation.
- Use camelCase for variable and function names.
- Use PascalCase for class names.
- Write clear and concise comments.

## Running Tests

Before submitting your pull request, make sure all tests pass. You can run the tests using the following commands:

```bash
yarn test