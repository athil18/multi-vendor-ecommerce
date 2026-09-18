# Enterprise Design System

Welcome to the Marketplace Design System. This document serves as the single source of truth for UI conventions, accessibility standards, and component usage across the frontend application.

## 1. Principles

1. **Accessibility First**: All interactive elements must be keyboard navigable, screen-reader friendly, and visually distinct on focus.
2. **Composition over Configuration**: Build complex UIs by composing small, atomic components (e.g., `Card`, `CardHeader`, `CardContent`) rather than creating massive monolithic components with dozens of boolean props.
3. **Consistency**: Rely exclusively on Tailwind CSS variables and `@theme` tokens. Avoid arbitrary magic numbers (e.g., `w-[31px]`).

## 2. Design Tokens

Tokens are defined in `src/app/globals.css` using Tailwind v4's `@theme` directive.

- **Colors**: Use the `brand` scale (purple) for primary actions and the `surface` scale (slate) for backgrounds and borders.
- **Spacing**: Use the semantic spacing scale (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`).
- **Typography**: Adhere to the established font sizes and line heights (`display`, `h1`, `h2`, `h3`, `body-lg`, `body`, `caption`).

## 3. UI Component Library

All primitive components reside in `src/components/ui/`.

### Available Components
- **Inputs**: `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`
- **Actions**: `Button`
- **Data Display**: `Badge`, `Card`, `EmptyState`
- **Feedback**: `Alert`, `Modal`, `ConfirmationDialog`, `Spinner`, `Skeleton`, `ErrorState`, `Toast`

### Do's and Don'ts
- **DO** use `forwardRef` on all native wrapper components so they can be seamlessly integrated with `react-hook-form`.
- **DO** use `cn()` from `@/lib/utils` to merge className props securely without conflicts.
- **DON'T** apply excessive outer margins to UI components. Spacing should be managed by the parent container (using flex gap or grid gap).

## 4. Forms & Validation

We use `react-hook-form` and `zod` for all form handling.

### Implementation Standard
1. Define a strictly typed `zod` schema.
2. Initialize `useForm` with the `zodResolver`.
3. Pass `...register('fieldName')` and `error={!!errors.fieldName}` to the `Input` or `Select` component.
4. Render validation messages directly below the input using a text-red-500 span.

*Reference `src/components/examples/FormExample.tsx` for a complete, accessible implementation.*

## 5. Accessibility (A11y) Standards

- **Focus Rings**: Standardized via the `focus-visible:ring-brand-500` utility. Do not disable outlines unless replaced with a custom focus ring.
- **Roles & Aria**: Use `aria-describedby` to link inputs with their error messages. Ensure modals trap focus correctly (handled via our `Modal` wrapper).
- **Contrast**: Ensure text passes WCAG AA contrast ratios, specifically in Dark Mode where text should be highly legible against `surface-900` backgrounds.

## 6. Extending the System

To add a new component:
1. Ensure it's universally needed. If it's a one-off feature component, it belongs in `src/components/features/`.
2. Define standard variants using an object map instead of multiple if/else chains.
3. Ensure dark mode support by testing with `dark:bg-surface-800` etc.
4. Export the component and its props interface clearly.
