import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../useAuthStore';

// Mock cookies for hydrateCookies
vi.mock('@/lib/cookies', () => ({
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn()
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, role: 'customer' });
    window.localStorage.clear();
  });

  it('starts with initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.role).toBe('customer');
  });

  it('updates state on login', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com', role: 'seller' as const };
    const mockToken = 'mock-jwt-token';

    useAuthStore.getState().login(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.role).toBe('seller');
  });

  it('clears state on logout', () => {
    // Setup logged in state
    const mockUser = { id: '1', name: 'Test', email: 'test@test.com', role: 'seller' as const };
    useAuthStore.setState({ user: mockUser, token: 'token', role: 'seller' });

    // Action
    useAuthStore.getState().logout();

    // Assert
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.role).toBe('customer');
  });

  it('updates role correctly when logged in', () => {
    const mockUser = { id: '1', name: 'Test', email: 'test@test.com', role: 'customer' as const };
    useAuthStore.setState({ user: mockUser, token: 'token', role: 'customer' });
    
    useAuthStore.getState().setRole('admin');
    expect(useAuthStore.getState().role).toBe('admin');
  });
});
