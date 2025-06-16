'use client';

import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getActiveClaimCondition } from 'thirdweb/extensions/erc1155';
import { fetchProofsERC1155 } from 'thirdweb/extensions/airdrop';
import { readContract, type ThirdwebContract } from 'thirdweb';

interface AllowlistEntry {
  recipient: string;
  maxClaimable?: number;
  maxQuantityInProof?: bigint;
  pricePerToken?: bigint;
  currency?: string;
  warning?: string;
  [key: string]: unknown;
}

interface ProofData {
  proof: readonly `0x${string}`[];
  maxQuantityInProof?: bigint;
  maxClaimablePerWallet?: bigint;
  pricePerToken?: bigint;
  price?: bigint;
  currency?: string;
  currencyAddress?: string;
}

interface AllowlistSyncState {
  isLoading: boolean;
  isAllowed: boolean | null;
  allowlistEntry: AllowlistEntry | null;
  merkleProof: ProofData | null;
  error: string | null;
  activeClaim: unknown | null;
}

interface UseAllowlistSyncOptions {
  contract: ThirdwebContract;
  tokenId: bigint;
}

export function useAllowlistSync({ 
  contract, 
  tokenId
}: UseAllowlistSyncOptions): AllowlistSyncState & {
  refetch: () => Promise<void>;
} {
  const account = useActiveAccount();
  const [state, setState] = useState<AllowlistSyncState>({
    isLoading: true,
    isAllowed: null,
    allowlistEntry: null,
    merkleProof: null,
    error: null,
    activeClaim: null,
  });

  const syncAllowlist = useCallback(async (): Promise<void> => {
    // Don't run allowlist sync if no wallet is connected
    if (!account?.address) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAllowed: null,
        allowlistEntry: null,
        merkleProof: null,
        error: null,
        activeClaim: null, // Don't fetch activeClaim without wallet
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Fetch the active claim condition
      const activeClaim = await getActiveClaimCondition({
        contract,
        tokenId,
      });

      if (!activeClaim) {
        throw new Error('No active claim condition found');
      }

      setState(prev => ({ ...prev, activeClaim }));

      const merkleRoot = activeClaim.merkleRoot;
      
      // Handle public claims (no allowlist)
      if (
        !merkleRoot ||
        merkleRoot === "0x" ||
        merkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAllowed: true,
          allowlistEntry: null,
          merkleProof: null,
        }));
        return;
      }

      // Step 2: Try to generate a Merkle proof directly
      // This will work if the user is in the allowlist
      try {
        const proofResponse = await fetchProofsERC1155({
          contract,
          recipient: account.address,
          merkleRoot,
        });
        
        const proofData = proofResponse as ProofData | null;

        if (!proofData) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isAllowed: false,
            allowlistEntry: null,
            merkleProof: null,
          }));
          return;
        }

        // Step 3: Create allowlist entry from proof data
        const allowlistEntry: AllowlistEntry = {
          recipient: account.address,
          maxClaimable: Number(proofData.maxQuantityInProof || proofData.maxClaimablePerWallet || 1),
          maxQuantityInProof: proofData.maxQuantityInProof,
          pricePerToken: proofData.pricePerToken || proofData.price,
          currency: proofData.currency || proofData.currencyAddress,
        };

        // Step 4: Verify eligibility with proof on-chain
        const proofArg = {
          proof: proofData.proof,
          maxQuantityInProof: proofData.maxQuantityInProof ?? 
                             proofData.maxClaimablePerWallet ?? 
                             BigInt(1),
          pricePerToken: proofData.pricePerToken ?? 
                        proofData.price ?? 
                        activeClaim.pricePerToken ?? 
                        BigInt(0),
          currency: proofData.currency ?? 
                   proofData.currencyAddress ?? 
                   activeClaim.currency ?? 
                   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
        };
        
        try {
          const canClaim = await readContract({
            contract,
            method: "function verifyClaim(uint256 conditionId, address claimer, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, (bytes32[] proof, uint256 maxQuantityInProof, uint256 pricePerToken, address currency) allowlistProof) view returns (bool)",
            params: [
              (activeClaim as { id?: bigint }).id ?? BigInt(0),
              account.address,
              tokenId,
              BigInt(1),
              proofArg.currency,
              proofArg.pricePerToken,
              proofArg,
            ],
          });

          setState(prev => ({
            ...prev,
            isLoading: false,
            isAllowed: Boolean(canClaim),
            allowlistEntry,
            merkleProof: proofData,
          }));

        } catch {
          // If on-chain verification fails but user has a valid proof, assume they're eligible
          // This could happen due to network issues or if they've already claimed
          setState(prev => ({
            ...prev,
            isLoading: false,
            isAllowed: true,
            allowlistEntry,
            merkleProof: proofData,
          }));
        }

      } catch (proofError) {
        // Check if this is the "Invalid address: undefined" error
        const errorMessage = proofError instanceof Error ? proofError.message : String(proofError);
        
        if (errorMessage.includes('Invalid address: undefined')) {
          // Fallback: Just check if there's a merkle root and assume user might be eligible
          // In this case, the claim will succeed or fail based on the actual transaction
          setState(prev => ({
            ...prev,
            isLoading: false,
            isAllowed: true, // Optimistically assume eligible - let the transaction decide
            allowlistEntry: {
              recipient: account.address,
              maxClaimable: 1,
              warning: 'Allowlist format issue detected - proceeding optimistically',
            },
            merkleProof: null, // No proof available due to format issues
            error: null, // Don't treat this as a blocking error
          }));
          return;
        }
        
        // For other errors, user is likely not in allowlist
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAllowed: false,
          allowlistEntry: null,
          merkleProof: null,
        }));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAllowed: false,
        allowlistEntry: null,
        merkleProof: null,
        error: errorMessage,
      }));
    }
  }, [account?.address, contract, tokenId]);

  // Auto-sync when dependencies change
  useEffect(() => {
    syncAllowlist();
  }, [syncAllowlist]);

  return {
    ...state,
    refetch: syncAllowlist,
  };
}