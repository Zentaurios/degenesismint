'use client';

import { useAllowlistSync } from '@/hooks/useAllowlistSync';
import { nftContract } from '@/lib/clients';
import { useActiveAccount } from 'thirdweb/react';

interface AllowlistStatusProps {
  tokenId?: bigint;
  className?: string;
}

/**
 * Example reusable component showing allowlist status
 * Can be used anywhere in your app
 */
export function AllowlistStatus({ 
  tokenId = BigInt(0), 
  className = "" 
}: AllowlistStatusProps) {
  const account = useActiveAccount();
  const { 
    isLoading, 
    isAllowed, 
    allowlistEntry, 
    error,
    activeClaim 
  } = useAllowlistSync({
    contract: nftContract,
    tokenId,
  });

  if (!account) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Connect wallet to check eligibility
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-blue-400 text-sm">Checking eligibility...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-400 text-sm ${className}`}>
        ❌ Error: {error}
      </div>
    );
  }

  if (!activeClaim) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        No active claim phase
      </div>
    );
  }

  // Public claim (no allowlist)
  if (isAllowed === true && !allowlistEntry) {
    return (
      <div className={`text-green-400 text-sm ${className}`}>
        ✅ Public claim - everyone eligible
      </div>
    );
  }

  // Allowlist claim
  if (isAllowed === true && allowlistEntry) {
    return (
      <div className={`text-green-400 text-sm ${className}`}>
        ✅ Eligible • Max: {allowlistEntry.maxClaimable || 1}
      </div>
    );
  }

  // Not eligible
  return (
    <div className={`text-red-400 text-sm ${className}`}>
      ❌ Not eligible to claim
    </div>
  );
}

// Usage examples:
// <AllowlistStatus />
// <AllowlistStatus tokenId={BigInt(1)} className="mb-4" />
// <AllowlistStatus tokenId={BigInt(2)} className="border p-2 rounded" />