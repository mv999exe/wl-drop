# Contributing to WL-Drop

First off, thank you for considering contributing to WL-Drop! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **System information** (OS, Python version, browser)
- **Error logs** (if applicable)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide detailed description**
- **Explain why this enhancement would be useful**
- **Include mockups/examples** (if applicable)

### Pull Requests

1. **Fork the repository**
2. **Create a branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages** (`git commit -m 'Add AmazingFeature'`)
6. **Push to branch** (`git push origin feature/AmazingFeature`)
7. **Open a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/mv999exe/wl-drop.git
cd wl-drop

# Install dependencies
pip install -r requirements.txt
npm install

# Run in development mode
uvicorn backend.main:app --reload
```

## Code Style

### Python
- Follow PEP 8
- Use type hints
- Add docstrings for functions/classes
- Keep functions focused and small

### TypeScript/React
- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Add prop types

### Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues/PRs when applicable

## Testing

Before submitting PR:

```bash
# Test backend
python -m pytest

# Test frontend
npm test

# Check Python types
mypy backend/

# Lint
npm run lint
```

## Project Structure

```
backend/
├── api/           # API endpoints
├── core/          # Core functionality
└── services/      # Background services

components/        # React components
utils/            # Frontend utilities
```

## Questions?

Feel free to open an issue for any questions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
