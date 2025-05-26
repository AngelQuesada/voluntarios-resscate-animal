import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {
    signOut: jest.fn(),
  },
  db: {},
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('useAuth Hook', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    getIdToken: jest.fn(() => Promise.resolve('mock-token')),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = '';
  });

  test('should initialize with empty values', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  test('should update email and password', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });
    
    expect(result.current.email).toBe('test@example.com');
    expect(result.current.password).toBe('password123');
  });

  test('should show error for empty email', async () => {
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() };
    
    await act(async () => {
      await result.current.handleSignIn(mockEvent as any);
    });
    
    expect(result.current.error).toBe('Por favor, introduce tu correo electrónico.');
  });

  test('should show error for invalid email format', async () => {
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() };
    
    act(() => {
      result.current.setEmail('invalid-email');
    });
    
    await act(async () => {
      await result.current.handleSignIn(mockEvent as any);
    });
    
    expect(result.current.error).toBe('Por favor, introduce un correo electrónico válido.');
  });

  test('should show error for empty password', async () => {
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() };
    
    act(() => {
      result.current.setEmail('test@example.com');
    });
    
    await act(async () => {
      await result.current.handleSignIn(mockEvent as any);
    });
    
    expect(result.current.error).toBe('Por favor, introduce tu contraseña.');
  });

  test('should show error for short password', async () => {
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() };
    
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('123');
    });
    
    await act(async () => {
      await result.current.handleSignIn(mockEvent as any);
    });
    
    expect(result.current.error).toBe('La contraseña debe tener al menos 6 caracteres.');
  });

  test('should handle successful login with enabled user', async () => {
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() };
    
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });
    
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ isEnabled: true }),
    });
    
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });
    
    await act(async () => {
      await result.current.handleSignIn(mockEvent as any);
    });
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/schedule');
      expect(document.cookie).toContain('auth-token=mock-token');
    });
  });

  test('should handle disabled user account', async () => {
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() };
    const mockSignOut = jest.fn();
    
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });
    
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ isEnabled: false }),
    });
    
    require('@/lib/firebase').auth.signOut = mockSignOut;
    
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });
    
    await act(async () => {
      await result.current.handleSignIn(mockEvent as any);
    });
    
    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.error).toBe('Esta cuenta ha sido deshabilitada por el administrador. Por favor, contacta con el administrador para más información.');
    expect(result.current.isLoading).toBe(false);
  });

  test('should handle auth errors correctly', async () => {
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() };
    
    const authError = { code: 'auth/user-not-found' };
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(authError);
    
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });
    
    await act(async () => {
      await result.current.handleSignIn(mockEvent as any);
    });
    
    expect(result.current.error).toBe('Correo electrónico o contraseña incorrectos.');
    expect(result.current.isLoading).toBe(false);
  });

  test('should handle unexpected errors', async () => {
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() };
    
    const unexpectedError = { code: 'unknown-error' };
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(unexpectedError);
    
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });
    
    await act(async () => {
      await result.current.handleSignIn(mockEvent as any);
    });
    
    expect(result.current.error).toBe('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
  });

  test('should set loading state during sign in', async () => {
    const { result } = renderHook(() => useAuth());
    const mockEvent = { preventDefault: jest.fn() };
    
    let resolveSignIn: any;
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve;
    });
    
    (signInWithEmailAndPassword as jest.Mock).mockReturnValueOnce(signInPromise);
    
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });
    
    act(() => {
      result.current.handleSignIn(mockEvent as any);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await act(async () => {
      resolveSignIn({ user: mockUser });
      await signInPromise;
    });
  });
});