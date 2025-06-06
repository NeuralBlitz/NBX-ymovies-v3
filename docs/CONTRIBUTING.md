# 🤝 Contributing to Netflix Clone

Thank you for your interest in contributing to our Netflix Clone project! We welcome contributions from developers of all skill levels. This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Git installed
- Basic knowledge of React, TypeScript, and Node.js
- Familiarity with PostgreSQL (helpful but not required)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/netflix-clone.git
   cd netflix-clone
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys (see INSTALLATION.md for details)
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🛠️ Development Guidelines

### Code Style
- **TypeScript**: We use strict TypeScript. All new code should be properly typed
- **ESLint/Prettier**: Code is automatically formatted. Run `npm run lint` before committing
- **Naming Conventions**: 
  - Components: PascalCase (`MovieCard.tsx`)
  - Files/Folders: kebab-case (`movie-list/`)
  - Functions: camelCase (`getUserPreferences()`)

### File Structure
```
├── client/src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── server/
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic
│   ├── middleware/    # Express middleware
│   └── utils/         # Server utilities
└── shared/            # Code shared between client/server
```

### Git Workflow

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make Changes**
   - Write clean, well-commented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new recommendation algorithm"
   # Use conventional commit format
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Then create a Pull Request on GitHub
   ```

## 📝 Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

Examples:
feat(recommendations): add mood-based filtering
fix(auth): resolve login redirect issue
docs(api): update endpoint documentation
test(recommendations): add unit tests for algorithm
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Maintenance tasks

## 🧪 Testing

### Running Tests
```bash
npm run test          # Run all tests
npm run test:client   # Frontend tests only
npm run test:server   # Backend tests only
npm run test:e2e      # End-to-end tests
```

### Writing Tests
- **Unit Tests**: For individual functions and components
- **Integration Tests**: For API endpoints and database operations
- **E2E Tests**: For complete user workflows

Example test structure:
```typescript
describe('RecommendationEngine', () => {
  it('should generate personalized recommendations', () => {
    // Test implementation
  });
});
```

## 🎯 Contribution Areas

### High Priority
- **Recommendation Algorithm**: Improve ML algorithms and add new recommendation types
- **Performance**: Optimize database queries and frontend rendering
- **Testing**: Add comprehensive test coverage
- **Accessibility**: Improve screen reader support and keyboard navigation

### Medium Priority
- **UI/UX**: Enhance user interface and experience
- **Documentation**: Add code comments and improve guides
- **Mobile**: Optimize mobile experience
- **Internationalization**: Add multi-language support

### Good First Issues
Look for issues labeled `good-first-issue` in the GitHub repository. These are perfect for new contributors:
- Documentation improvements
- Small bug fixes
- Code cleanup
- Adding unit tests

## 🐛 Bug Reports

When reporting bugs, please include:
1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Step-by-step instructions
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, Node.js version
6. **Screenshots**: If applicable

Use the bug report template in GitHub Issues.

## 💡 Feature Requests

For new features:
1. **Check Existing Issues**: See if it's already requested
2. **Use Feature Template**: Fill out the feature request template
3. **Provide Context**: Explain why this feature would be valuable
4. **Consider Implementation**: How might this be implemented?

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated if needed
- [ ] No console.log statements left in code
- [ ] TypeScript types are properly defined

### PR Description Should Include
- **What**: What changes were made
- **Why**: Why these changes were necessary
- **How**: How the changes were implemented
- **Testing**: How the changes were tested
- **Screenshots**: For UI changes

### Code Review Process
1. **Automated Checks**: CI/CD will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Merge**: Once approved, your PR will be merged

## 🏆 Recognition

Contributors will be:
- Added to the Contributors section in README
- Mentioned in release notes for significant contributions
- Given credit in commit messages and PR descriptions

## 📚 Resources

### Learning Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Project-Specific Guides
- [Installation Guide](./INSTALLATION.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Recommendation Engine](./RECOMMENDATION_ENGINE_ENHANCEMENT.md)

## 🤔 Questions?

- **General Questions**: Use GitHub Discussions
- **Bug Reports**: Create a GitHub Issue
- **Feature Requests**: Create a GitHub Issue
- **Security Issues**: Email us privately (see SECURITY.md)

---

**Thank you for contributing to Netflix Clone! 🎬**

*Every contribution, no matter how small, makes this project better for everyone.*
