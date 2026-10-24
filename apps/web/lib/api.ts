'use client';

import { createGraphQLClient } from '@juls/pickleball-kit/sdk';
import { GraphQLClientError } from '@juls/pickleball-kit/sdk';

const TOKEN_KEY = 'pb_access_token';

export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/graphql';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export const api = createGraphQLClient({
  url: GRAPHQL_URL,
  getToken,
});

export function errorMessage(error: unknown): string {
  if (error instanceof GraphQLClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}
