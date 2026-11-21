/**
 * Legacy API re-export for User Management.
 * Architectural domain rename: User / /api/v1/users -> Member / /api/v1/members.
 * Re-exports everything from `@/lib/api/memberService`.
 */

export * from "./memberService";
