// src/lib/security.ts
import { useRef } from 'react';

// Verified contract address for production security
export const VERIFIED_CONTRACT_ADDRESS = "0xFe97bF3E1d8F3A414cbcda78Ab74283C357B9f07";

// Contract address verification
export const verifyContractAddress = (address: string): boolean => {
  return address.toLowerCase() === VERIFIED_CONTRACT_ADDRESS.toLowerCase();
};

// Input validation functions
export const validateQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 10; // Max 10 per transaction
};

export const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const sanitizeUserInput = (input: string): string => {
  // Remove script tags and other potentially dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
};

// Enhanced error handling that preserves existing logic while adding security
export const handleClaimError = (error: unknown, context: string = 'claim'): { 
  userMessage: string; 
  shouldUpdateAllowedState: boolean;
  shouldRetry: boolean;
} => {
  const timestamp = new Date().toISOString();
  
  // Log detailed error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${timestamp}] ${context}:`, error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }
  
  // Extract error message
  let errorMessage = '';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as { message: unknown }).message);
  } else {
    errorMessage = String(error);
  }
  
  const lowerErrorMessage = errorMessage.toLowerCase();
  
  // Handle specific error types with user-friendly messages
  if (lowerErrorMessage.includes('dropclaimexceedlimit')) {
    return {
      userMessage: "You have already claimed your maximum allocation or the claim limit has been reached.",
      shouldUpdateAllowedState: true,
      shouldRetry: false
    };
  }
  
  if (lowerErrorMessage.includes('not allowlisted') || 
      lowerErrorMessage.includes('notallowlisted') || 
      lowerErrorMessage.includes('invalidmerkleproof')) {
    return {
      userMessage: "You are not eligible to claim. Make sure you're using the correct wallet address.",
      shouldUpdateAllowedState: true,
      shouldRetry: false
    };
  }
  
  if (lowerErrorMessage.includes('exceeded') || 
      lowerErrorMessage.includes('limit')) {
    return {
      userMessage: "Claim limit exceeded. You may have already reached your maximum allocation.",
      shouldUpdateAllowedState: true,
      shouldRetry: false
    };
  }
  
  if (lowerErrorMessage.includes('insufficient funds') || 
      lowerErrorMessage.includes('insufficient balance')) {
    return {
      userMessage: "Insufficient funds in your wallet. Please add more USDC and try again.",
      shouldUpdateAllowedState: false,
      shouldRetry: true
    };
  }
  
  if (lowerErrorMessage.includes('user rejected') || 
      lowerErrorMessage.includes('user denied') ||
      lowerErrorMessage.includes('rejected')) {
    return {
      userMessage: "Transaction was cancelled. Please try again if you want to claim.",
      shouldUpdateAllowedState: false,
      shouldRetry: true
    };
  }
  
  if (lowerErrorMessage.includes('network') || 
      lowerErrorMessage.includes('rpc') ||
      lowerErrorMessage.includes('timeout')) {
    return {
      userMessage: "Network error occurred. Please check your connection and try again.",
      shouldUpdateAllowedState: false,
      shouldRetry: true
    };
  }
  
  if (lowerErrorMessage.includes('gas') || 
      lowerErrorMessage.includes('estimation')) {
    return {
      userMessage: "Transaction failed due to gas estimation. Please try again.",
      shouldUpdateAllowedState: false,
      shouldRetry: true
    };
  }
  
  // For unknown errors, provide a safe generic message
  return {
    userMessage: errorMessage.length > 0 && errorMessage.length < 200 ? 
      errorMessage : "Transaction failed. Please try again or contact support if the issue persists.",
    shouldUpdateAllowedState: false,
    shouldRetry: true
  };
};

// Rate limiting hook
export const useRateLimit = (limit: number = 6, windowMs: number = 60000) => {
  const attempts = useRef<number[]>([]);
  
  const checkStatus = (): { allowed: boolean; remaining: number; timeUntilReset: number } => {
    const now = Date.now();
    
    // Remove old attempts outside the time window
    attempts.current = attempts.current.filter(time => now - time < windowMs);
    
    const recentAttempts = attempts.current.length;
    const allowed = recentAttempts < limit;
    const remaining = Math.max(0, limit - recentAttempts);
    
    let timeUntilReset = 0;
    if (attempts.current.length > 0) {
      const oldestAttempt = Math.min(...attempts.current);
      timeUntilReset = Math.max(0, oldestAttempt + windowMs - now);
    }
    
    return { allowed, remaining, timeUntilReset };
  };
  
  const recordAttempt = (): boolean => {
    const status = checkStatus();
    
    if (status.allowed) {
      attempts.current.push(Date.now());
      return true;
    }
    
    return false;
  };
  
  // Legacy functions for backward compatibility (but safe)
  const isAllowed = (): boolean => {
    return checkStatus().allowed; // Just check, don't record
  };
  
  const getRemainingAttempts = (): number => {
    return checkStatus().remaining;
  };
  
  const getTimeUntilReset = (): number => {
    return checkStatus().timeUntilReset;
  };
  
  return { 
    checkStatus,
    recordAttempt,
    isAllowed, 
    getRemainingAttempts, 
    getTimeUntilReset 
  };
};

// Secure transaction validation
export const validateTransactionParams = ({
  quantity,
  to,
  from
}: {
  quantity: number;
  to: string;
  from: string;
}): { isValid: boolean; error?: string } => {
  // Validate quantity
  if (!validateQuantity(quantity)) {
    return { 
      isValid: false, 
      error: 'Invalid quantity. Must be between 1 and 10.' 
    };
  }
  
  // Validate addresses
  if (!validateAddress(to) || !validateAddress(from)) {
    return { 
      isValid: false, 
      error: 'Invalid wallet address format.' 
    };
  }
  
  // Ensure user is claiming for themselves (prevent front-running)
  if (to.toLowerCase() !== from.toLowerCase()) {
    return { 
      isValid: false, 
      error: 'Cannot claim NFTs for another address.' 
    };
  }
  
  return { isValid: true };
};

// Network validation
export const isValidNetwork = (chainId: number): boolean => {
  const validChainIds = [
    8453, // Base Mainnet
    84532, // Base Sepolia (for testing)
  ];
  
  return validChainIds.includes(chainId);
};

// Environment validation
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required environment variables
  if (!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) {
    errors.push('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is required');
  }
  
  if (!process.env.NEXT_PUBLIC_DOMAIN) {
    errors.push('NEXT_PUBLIC_DOMAIN is required');
  }
  
  // Check for accidentally exposed secret keys
  if (typeof window !== 'undefined' && (window as { THIRDWEB_SECRET_KEY?: unknown }).THIRDWEB_SECRET_KEY) {
    errors.push('Secret key detected in browser environment - SECURITY RISK!');
  }
  
  // Validate domain format in production
  if (process.env.NODE_ENV === 'production') {
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    if (domain?.includes('localhost')) {
      errors.push('Production environment should not use localhost domain');
    }
    
    // Ensure production uses secure domain
    if (domain && !domain.includes('degenplays.com') && !domain.includes('https://')) {
      errors.push('Production domain should be degenplays.com or use HTTPS');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Initialize security checks
export const initializeSecurity = () => {
  const envCheck = validateEnvironment();
  
  if (!envCheck.isValid) {
    console.error('Security validation failed:', envCheck.errors);
    
    if (process.env.NODE_ENV === 'production') {
      // In production, throw error to prevent app from running with security issues
      throw new Error('Security validation failed. Check environment configuration.');
    }
  }
  
  return envCheck.isValid;
};