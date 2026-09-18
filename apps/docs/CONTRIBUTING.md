# Contributing Guide — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14

---

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run development server: `npm run dev`
5. Read `docs/rules.md` before writing code

## Before You Code

1. **Read the PRD** (`docs/prd.md`) — Understand what we're building and why
2. **Read the TechSpec** (`docs/techspec.md`) — Understand the architecture
3. **Read the Rules** (`docs/rules.md`) — Understand the constraints
4. **Check the Tracker** (`docs/tracker.md`) — Understand current state
5. **Check the Implementation Plan** (`docs/implementationplan.md`) — Verify your work aligns with the current phase

## Development Workflow

1. Identify the task from `implementationplan.md`
2. Create a feature branch: `git checkout -b feature/description`
3. Implement changes following `rules.md` coding standards
4. Verify build passes: `npm run build`
5. Update documentation if behavior changes
6. Update `tracker.md` with progress
7. Submit for review

## Code Standards

- Follow patterns in `rules.md`
- API routes follow the standard pattern (dbConnect → auth → validate → business logic → response)
- Use TypeScript interfaces for all model documents
- Use Zod for input validation
- Use Mongoose transactions for multi-document writes

## Documentation Updates

| Change Type | Documents to Update |
|-------------|---------------------|
| New feature | `implementationplan.md`, `tracker.md` |
| New API endpoint | `API_DOCUMENTATION.md` |
| Schema change | `schema.md`, `DATABASE_DESIGN.md` |
| Architecture decision | `ADR.md` |
| Behavior change | `CHANGELOG.md` |
| Bug fix | `CHANGELOG.md`, `tracker.md` |

## Quality Checklist

Before submitting:
- [ ] `npm run build` passes with zero errors
- [ ] Protected routes have auth guards
- [ ] Input validation is present
- [ ] Error handling is consistent
- [ ] No `console.log` in production paths
- [ ] No hardcoded secrets
- [ ] Documentation is updated
- [ ] `tracker.md` reflects changes

---

> **Cross-references**: [rules.md](rules.md) (standards), [implementationplan.md](implementationplan.md) (task alignment)
