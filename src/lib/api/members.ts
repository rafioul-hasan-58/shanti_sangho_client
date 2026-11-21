/**
 * Legacy API re-export for Committee / Leadership.
 * Architectural domain rename: Committee Member / /api/v1/members -> Executive / /api/v1/executives.
 * Re-exports everything from `@/lib/api/executiveService`.
 */

export * from "./executiveService";
