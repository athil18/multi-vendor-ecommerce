import { NextResponse } from 'next/server';

export interface ApiErrorOptions {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Standardized error response envelope for the API.
 * Ensures consistent parsing on the frontend.
 * 
 * Shape: { message: string, code?: string, errors?: Record<string, string[]> }
 */
export function apiError({ message, status = 400, code, errors }: ApiErrorOptions) {
  const payload: Record<string, any> = { message };
  
  if (code) {
    payload.code = code;
  }
  
  if (errors) {
    payload.errors = errors;
  }
  
  return NextResponse.json(payload, { status });
}

/**
 * Standardized success response envelope for a single resource.
 * 
 * Shape: { data: T, message?: string }
 */
export function apiSuccess<T>(data: T, status = 200, message?: string) {
  const payload: Record<string, any> = { data };
  
  if (message) {
    payload.message = message;
  }
  
  return NextResponse.json(payload, { status });
}


