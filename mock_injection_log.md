# Mock Question Injection Log

This file tracks which mock tests have been used to inject questions into generated files.

## Injection History

| Date | Target File | Source Used | Sections Replaced | Notes |
|------|-------------|-------------|-------------------|-------|
| 2026-01-28 | `deepseek_json_20260127_b334c5.json` | `docs/mathsquestion.json` | Math (Class 10), Math (11-12) | Used harder math questions (AM-GM, Beta function, 3D geometry, etc.) - 30 questions total |

## Available Mocks for Future Injections

The following mocks are available for the remaining 9 files:

- [ ] `mock4.json`
- [ ] `mock5.json`
- [ ] `mock6.json`
- [ ] `mock7.json`
- [ ] `mock8.json`
- [ ] `mock9&10.json`

## Source Files

- `docs/mathsquestion.json` - Contains harder/advanced math questions (AM-GM inequality, Beta function, 3D geometry, etc.)
- `docs/mocktestsgeneral/mock*.json` - Standard mock tests with mixed difficulty

## Usage Instructions

When the user provides 9 remaining files, use the mocks in order to inject fresh questions. Each mock contains:
- 15 Math (Class 10) questions
- 15 Math (11-12) questions
- 20 Logic & Data Interpretation questions
- 10 Algorithmic Thinking questions
- 10 Reading Comprehension questions  
- 10 Language Reasoning questions

Total: 80 questions per mock
