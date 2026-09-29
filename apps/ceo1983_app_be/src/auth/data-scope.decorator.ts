import { SetMetadata } from '@nestjs/common';

export const DATA_SCOPE_KEY = 'data_scope';

export type DataScopeType = 'sponsor' | 'event' | 'member' | 'financial';

/**
 * Decorator to declare data-level scoping policy for NestJS endpoints.
 * Example: @DataScope('sponsor')
 */
export const DataScope = (scope: DataScopeType) =>
  SetMetadata(DATA_SCOPE_KEY, scope);
