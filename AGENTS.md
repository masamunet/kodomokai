# Agent Guidelines for Kodomokai Project

## User Experience (UX) & Design Quality
**CRITICAL:** This project demands a high standard of UX/UI consistency. "Generic" or "inconsistent" designs are unacceptable.

1.  **Strict Color Consistency**:
    - **NEVER** use hardcoded colors (e.g., `bg-blue-100`, `text-gray-500`, `indigo-600`) unless explicitly justified for a specific outlier status.
    - **ALWAYS** use the semantic CSS variables defined in `globals.css` via Tailwind classes or equivalent:
        - Background: `bg-background`
        - Foreground (Text): `text-foreground`
        - Muted Background: `bg-muted`
        - Muted Text: `text-muted-foreground`
        - Border: `border-border`
        - Input: `bg-background`, `border-input`, `ring-ring`
        - Accent: `bg-primary`, `text-primary-foreground` (if defined) or equivalent project standard.
    - If a "primary" color (like Indigo) is used, define it in `globals.css` or `tailwind.config.ts` as a token (e.g., `--primary`) and use `bg-primary`. Do NOT scatter `indigo-600` across the codebase.

2.  **Component Consistency**:
    - Reuse existing UI components (`Button`, `Card`, `Input`, `Dialog` etc.) from `@/components/ui/` if available.
    - Do not invent new styles for standard interactions (forms, tables, lists). Match existing Admin Dashboard patterns.

3.  **Refactoring Rule**:
    - If you touch a file that has poor UX/UI (e.g., unreadable text, hardcoded colors), **FIX IT** immediately. Do not leave "hintusified" (low quality) code behind.

4.  **Review Process**:
    - Before submitting code for verification, self-correct for design inconsistencies. Ask yourself: "Does this look exactly like the rest of the app?"

## Technical Standards
- **Server Actions**: Always handle errors gracefully and return typed results (`{ success: boolean, message: string }`).
- **Authorization**: Ensure RLS policies are backed by actual checks if needed, but primarily rely on Supabase Auth.
- **Type Safety**: No `any`. Define types for all props and data.
