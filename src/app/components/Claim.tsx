'use client';

import { useActiveWallet, useActiveAccount, useSwitchActiveWalletChain, useActiveWalletChain } from "thirdweb/react";
import { getClaimConditions, claimTo, getActiveClaimCondition } from "thirdweb/extensions/erc1155";
import { MediaRenderer } from "thirdweb/react";
import { useEffect, useState, useRef } from "react";
import { base } from "thirdweb/chains";
import { client, nftContract, NFT_METADATA, USDC_CONTRACT } from "@/lib/clients";
import { SuccessStep } from "./claim/SuccessStep";
import { ErrorStep } from "./claim/ErrorStep";
import { ComingSoonPlaceholder } from "./claim/ComingSoonPlaceholder";
import { CustomConnectButton } from "./CustomConnectButton";
import { getNFT } from "thirdweb/extensions/erc1155";
import { CountdownTimer } from "./claim/CountdownTimer";
import { sendTransaction, getContract, readContract, prepareContractCall } from "thirdweb";
import CoinAnimation, { CoinAnimationRef } from "./CoinAnimation";
import { useAudioDetection } from "@/hooks/useAudioDetection";
import { useAllowlistSync } from "@/hooks/useAllowlistSync";

const tokenId = BigInt(0);

// Define proper types for metadata attributes
interface MetadataAttribute {
  trait_type: string;
  value: string;
}

// Define type for claim condition (from thirdweb)
interface ClaimCondition {
  id?: bigint;
  startTimestamp?: number | bigint;
  pricePerToken?: bigint;
  maxClaimableSupply?: bigint;
  merkleRoot?: string;
  currency?: string; // ERC-20 contract address
  metadata?: string;
  quantityLimitPerWallet?: bigint;
  supplyClaimed?: bigint;
  [key: string]: unknown;
}

export function Claim() {
  const wallet = useActiveWallet();
  const account = useActiveAccount();
  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();
  const coinAnimationRef = useRef<CoinAnimationRef>(null);
  const claimContainerRef = useRef<HTMLDivElement>(null);
  const isAudioPlaying = useAudioDetection();

  // Use the new allowlist sync hook (only for wallet-specific allowlist checking)
  const {
    isLoading: allowlistLoading,
    isAllowed,
    allowlistEntry,
    error: allowlistError,
    refetch: refetchAllowlist,
  } = useAllowlistSync({
    contract: nftContract,
    tokenId,
  });

  const [activeClaim, setActiveClaim] = useState<ClaimCondition | null>(null);
  const [loading, setLoading] = useState(true);
  const [txState, setTxState] = useState<{
    status: "idle" | "processing" | "success" | "error";
    txHash?: string;
    error?: string;
  }>({ status: "idle" });
  
  // Add state for USDC approval
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approving, setApproving] = useState(false);
  
  // Create USDC contract instance
  const usdcContract = getContract({
    client,
    chain: base,
    address: USDC_CONTRACT
  });

  // Check if on correct chain
  const isCorrectChain = activeChain?.id === base.id;

  useEffect(() => {
    async function fetchConditions() {
      setLoading(true);
      try {
        // Fetch claim conditions (we don't store them but still fetch for validation)
        await getClaimConditions({
          contract: nftContract,
          tokenId
        });

        // Fetch active claim condition (independent of wallet)
        const activeCond = await getActiveClaimCondition({
          contract: nftContract,
          tokenId
        });
        setActiveClaim(activeCond);

        const nft = await getNFT({
          contract: nftContract,
          tokenId: tokenId,
        });

        if (nft.metadata) {
          NFT_METADATA.name = nft.metadata.name || NFT_METADATA.name;
          NFT_METADATA.description = nft.metadata.description || NFT_METADATA.description;
          NFT_METADATA.image = nft.metadata.image || NFT_METADATA.image;
          NFT_METADATA.animation_url = nft.metadata.animation_url || NFT_METADATA.image;
          if (Array.isArray(nft.metadata.attributes)) {
            NFT_METADATA.attributes = nft.metadata.attributes.map((attr: MetadataAttribute) => ({
              trait_type: attr.trait_type || '',
              value: attr.value || ''
            }));
          }
        }

      } catch (e) {
        console.error("Error fetching claim conditions:", e);
        if (e instanceof Error) {
          console.error("Error details:", {
            message: e.message,
            stack: e.stack,
            name: e.name
          });
        }
        setActiveClaim(null);
      }
      setLoading(false);
    }

    if (nftContract) {
      fetchConditions();
    } else {
      console.error("NFT contract not initialized");
      setLoading(false);
    }
  }, []);

  // Check USDC allowance when user is eligible
  useEffect(() => {
    async function checkUSDCAllowance() {
      if (!account?.address || !activeClaim || !isCorrectChain || isAllowed !== true) {
        setNeedsApproval(false);
        return;
      }

      try {
        const pricePerToken = activeClaim.pricePerToken || BigInt(0);
        if (pricePerToken === BigInt(0)) {
          setNeedsApproval(false);
          return;
        }

        // Check current allowance
        const allowance = await readContract({
          contract: usdcContract,
          method: "function allowance(address owner, address spender) view returns (uint256)",
          params: [account.address, nftContract.address]
        });

        setNeedsApproval(allowance < pricePerToken);
      } catch (error) {
        console.error('Error checking USDC allowance:', error);
        // Assume approval needed if we can't check
        setNeedsApproval(true);
      }
    }

    checkUSDCAllowance();
  }, [account?.address, activeClaim, isCorrectChain, isAllowed, usdcContract]);

  // Trigger coin animation on successful mint
  useEffect(() => {
    if (txState.status === "success" && coinAnimationRef.current) {
      // Small delay to let success message appear first
      setTimeout(() => {
        coinAnimationRef.current?.startCelebration();
      }, 500);
    }
  }, [txState.status]);

  // Add audio-playing class to body when audio is detected
  useEffect(() => {
    if (isAudioPlaying) {
      document.body.classList.add('audio-playing');
    } else {
      document.body.classList.remove('audio-playing');
    }
    
    return () => {
      document.body.classList.remove('audio-playing');
    };
  }, [isAudioPlaying]);

  async function handleApproval() {
    if (!account?.address || !activeClaim) {
      setTxState({
        status: "error",
        error: "Please connect your wallet first"
      });
      return;
    }

    setApproving(true);
    try {
      // Approve a large amount to avoid future approvals (standard practice)
      const approvalAmount = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935"); // Max uint256
      
      const transaction = prepareContractCall({
        contract: usdcContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [nftContract.address, approvalAmount]
      });

      await sendTransaction({
        transaction,
        account
      });
      
      // Re-check allowance after approval
      setTimeout(async () => {
        try {
          const allowance = await readContract({
            contract: usdcContract,
            method: "function allowance(address owner, address spender) view returns (uint256)",
            params: [account.address, nftContract.address]
          });
          
          const pricePerToken = activeClaim?.pricePerToken || BigInt(0);
          const stillNeedsApproval = allowance < pricePerToken;
          
          setNeedsApproval(stillNeedsApproval);
        } catch (error) {
          console.error('Error re-checking allowance:', error);
        }
        setApproving(false);
      }, 3000); // Give the blockchain time to update
      
    } catch (error) {
      console.error('Error approving USDC:', error);
      setApproving(false);
      setTxState({
        status: "error",
        error: "Failed to approve USDC spending. Please try again."
      });
    }
  }

  async function handleClaim(quantity: number) {
    if (!account?.address) {
      setTxState({
        status: "error",
        error: "Please connect your wallet first"
      });
      return;
    }

    setTxState({ status: "processing" });
    try {
      const transaction = await claimTo({
        contract: nftContract,
        tokenId,
        quantity: BigInt(quantity),
        to: account.address,
        from: account.address
      });

      const tx = await sendTransaction({
        transaction,
        account
      });

      // Get transaction hash from the transaction result
      const txHash = (tx as { transactionHash?: string; hash?: string }).transactionHash || 
                     (tx as { transactionHash?: string; hash?: string }).hash;

      setTxState({
        status: "success",
        txHash
      });

      // Refresh allowlist state after successful claim
      await refetchAllowlist();
    } catch (error) {
      console.error("Error claiming NFT:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check for claim limit errors
      if (
        errorMessage.includes("DropClaimExceedLimit") ||
        errorMessage.includes("exceeded") ||
        errorMessage.includes("limit")
      ) {
        setTxState({
          status: "error",
          error: "You have already claimed your maximum allocation or the claim limit has been reached"
        });
        // Refresh allowlist state to reflect the change
        await refetchAllowlist();
      } else {
        setTxState({
          status: "error",
          error: errorMessage || "Unknown error occurred"
        });
      }
    }
  }

  // Format USDC price without decimals
  const formatUSDCPrice = (price: bigint): string => {
    return Math.floor(Number(price) / 1e6).toString();
  };

  const handleRetry = () => {
    setTxState({ status: "idle" });
  };

  const handleSwitchChain = async () => {
    try {
      await switchChain(base);
    } catch (error) {
      console.error("Error switching chain:", error);
      setTxState({
        status: "error",
        error: "Failed to switch to Base network"
      });
    }
  };

  // Show loading while either basic data or allowlist is loading
  const isLoadingData = loading;
  const isLoadingAllowlist = allowlistLoading && account?.address;

  return (
    <div className="relative w-full perspective-card" ref={claimContainerRef}>
      {/* Coin Animation Overlay */}
      <CoinAnimation parentRef={claimContainerRef} ref={coinAnimationRef} />
      
      <div className="flex flex-col items-center">
        <div className="w-full max-w-7xl">
          <div className="flex justify-end mb-12">
            <div className="animate-float z-50">
              <CustomConnectButton />
            </div>
          </div>

          {isLoadingData ? (
            <div className="glass-card p-12 text-center animate-pulse-glow">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-4"></div>
                <p className="gradient-text text-3xl font-bold">
                  {loading ? 'Initializing Degen Matrix...' : 'Syncing with live allowlist...'}
                </p>
              </div>
              <div className="w-full bg-glass-border/20 rounded-full h-2 mt-4">
                <div className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          ) : activeClaim ? (
            <div className="glass-card p-8 lg:p-12 card-3d group animate-card-float-3d">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-16">
                {/* Left Column - NFT Display */}
                <div className="flex flex-col items-center space-y-8">
                  <div className="relative group/nft">
                    {/* Background glow - positioned to not interfere with content */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-teal-600 rounded-3xl blur opacity-30 animate-pulse group-hover/nft:animate-none group-hover/nft:opacity-60 transition duration-500 pointer-events-none"></div>
                    <div className="relative">
                      <div className="overflow-hidden rounded-3xl media-container relative">
                        <MediaRenderer
                          client={client}
                          src={NFT_METADATA.animation_url || NFT_METADATA.image}
                          poster={NFT_METADATA.image}
                          className="w-full aspect-square shadow-2xl border-2 border-glass-border/50 backdrop-blur-sm
                            transform transition-all duration-500
                            hover:shadow-neon"
                          alt={NFT_METADATA.name}
                        />
                      </div>
                      {/* Holographic overlay - positioned behind content and with reduced interference */}
                      <div className="absolute inset-0 rounded-3xl bg-holographic opacity-0 group-hover/nft:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                  <div className="w-full">
                  <div className="flex justify-between items-center -mt-6 mb-4">
                    <div className={`flex items-center space-x-2 ${isAudioPlaying ? 'animate-glitch' : ''}`}>
                      <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isAudioPlaying ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-gray-500'
                      }`}></div>
                      <span className={`text-sm font-mono uppercase tracking-wider transition-colors duration-300 ${
                        isAudioPlaying ? 'text-green-400' : 'text-foreground/40'
                      }`}>
                        {isAudioPlaying ? 'Audio Detected' : 'No Audio'}
                      </span>
                    </div>
                    <p className="text-foreground/60 text-lg font-mono uppercase tracking-wider">Play for 🔊 🔊 🔊</p>
                  </div>
                  {/* Countdown Timer */}
                  {activeClaim?.startTimestamp && Number(activeClaim.startTimestamp) > Math.floor(Date.now() / 1000) && (
                    <div className="glass-card-small p-6 lg:p-8 neon-border relative overflow-hidden group/timer">
                      <div className="relative z-10">
                        <div className="text-center mb-4">
                          <span className="text-foreground/60 text-lg font-mono uppercase tracking-wider">Degen Launch In</span>
                        </div>
                        <CountdownTimer targetTimestamp={BigInt(activeClaim.startTimestamp || 0)} />
                      </div>
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-teal-500/5 opacity-0 group-hover/timer:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  </div>
                </div>

                {/* Right Column - Claim Info */}
                <div className="flex flex-col justify-between space-y-8">
                  <div className="space-y-6">
                    <div className="relative">
                      <h1 className="text-4xl lg:text-6xl font-bold mb-6 gradient-text animate-gradient leading-tight pb-2">
                        {NFT_METADATA.name}
                      </h1>
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-teal-400 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-teal-400 rounded-full"></div>
                    </div>

                    <p className="text-foreground/90 text-lg lg:text-xl mb-8 leading-relaxed font-light whitespace-pre-line">
                      {NFT_METADATA.description}
                    </p>

                    <div className="glass-card-small p-6 lg:p-8 neon-border relative overflow-hidden group/price">
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-foreground/60 text-lg font-mono uppercase tracking-wider">Cheap as shit</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="gradient-text font-bold text-2xl lg:text-3xl text-right">
                              {activeClaim ? formatUSDCPrice(activeClaim.pricePerToken || BigInt(0)) : '0.00'} USDC
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/60 text-lg font-mono uppercase tracking-wider">In stock</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            <span className="gradient-text font-bold text-2xl lg:text-3xl">
                              {activeClaim ? Number(activeClaim.maxClaimableSupply || BigInt(0)) : '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-teal-500/5 opacity-0 group-hover/price:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {!wallet ? (
                      // 1. Not connected - show connect button
                      <div className="animate-float">
                        <CustomConnectButton />
                      </div>
                    ) : !isCorrectChain ? (
                      // 2. Connected but wrong chain - show switch chain button
                      <button
                        onClick={() => handleSwitchChain()}
                        className="cyber-button animate-border-light animate-teal-border-pulse w-full text-xl lg:text-2xl py-6 relative overflow-hidden cursor-pointer"
                      >
                        <span className="flex items-center justify-center space-x-3">
                          <span>🔄</span>
                          <span>INITIALIZE BASE PROTOCOL</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none"></div>
                      </button>
                    ) : isLoadingAllowlist ? (
                      // 3. Loading allowlist after wallet connection
                      <div className="glass-card-small p-4 border border-yellow-500/30 bg-yellow-500/10">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-yellow-300 text-sm">
                            Syncing with live allowlist...
                          </span>
                        </div>
                      </div>
                    ) : allowlistError ? (
                      // 4. Error syncing allowlist - show error with retry
                      <div className="space-y-4">
                        <div className="glass-card-small p-4 border border-red-500/30 bg-red-500/10">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-400">❌</span>
                            <div className="text-red-300 text-sm">
                              <p>Error syncing allowlist</p>
                              <p className="text-xs mt-1 opacity-80">{allowlistError}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={refetchAllowlist}
                          className="cyber-button animate-border-light animate-red-border-pulse w-full text-lg py-4"
                        >
                          <span>🔄 Retry Sync</span>
                        </button>
                      </div>
                    ) : isAllowed === false ? (
                      // 5. Not eligible - show not eligible message
                      <div className="space-y-4">
                        <div className="glass-card-small p-4 border border-red-500/30 bg-red-500/10">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-400">❌</span>
                            <div className="text-red-300 text-sm">
                              <p>Not eligible to claim</p>
                              <p className="text-xs mt-1 opacity-80">You may have already claimed or are not on the allowlist</p>
                            </div>
                          </div>
                        </div>
                        {allowlistEntry && (
                          <div className="glass-card-small p-3 border border-blue-500/30 bg-blue-500/10">
                            <div className="text-blue-300 text-xs">
                              <p>Found in allowlist: {allowlistEntry.recipient}</p>
                              <p>Max claimable: {allowlistEntry.maxClaimable || 1}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (needsApproval && activeClaim?.pricePerToken && Number(activeClaim.pricePerToken) > 0) ? (
                      // 6. Eligible but needs USDC approval - show approval button
                      <div className="space-y-4">
                        <div className="glass-card-small p-3 border border-blue-500/30 bg-blue-500/10">
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-400">📋</span>
                            <span className="text-blue-300 text-sm">
                              USDC approval required to claim NFT
                            </span>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleApproval}
                          disabled={approving || txState.status === "processing"}
                          className="cyber-button animate-border-light animate-teal-border-pulse w-full text-xl lg:text-2xl py-6 relative overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center justify-center space-x-3">
                            {approving ? (
                              <>
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>APPROVING USDC...</span>
                              </>
                            ) : (
                              <>
                                <span>📋</span>
                                <span>APPROVE USDC SPENDING</span>
                              </>
                            )}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none"></div>
                        </button>
                      </div>
                    ) : (
                      // 7. Eligible and approved - show claim button
                      <div className="space-y-4">
                        {allowlistEntry?.warning && (
                          <div className="glass-card-small p-3 border border-yellow-500/30 bg-yellow-500/10">
                            <div className="flex items-center space-x-2">
                              <span className="text-yellow-400">⚠️</span>
                              <span className="text-yellow-300 text-sm">
                                {allowlistEntry.warning}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {allowlistEntry && !allowlistEntry.warning && (
                          <div className="glass-card-small p-3 border border-green-500/30 bg-green-500/10">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400">✅</span>
                              <span className="text-green-300 text-sm">
                                Eligible to claim • Max: {allowlistEntry.maxClaimable || 1}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleClaim(1)}
                          disabled={txState.status === "processing"}
                          className="cyber-button animate-border-light animate-teal-border-pulse w-full text-xl lg:text-2xl py-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden cursor-pointer"
                        >
                          <span className="flex items-center justify-center space-x-3">
                            {txState.status === "processing" ? (
                              <>
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>DEGEN SYNC IN PROGRESS...</span>
                              </>
                            ) : (
                              <div className="flex flex-col items-center space-x-3">
                                <div className="flex flex-row">
                                <span>⚡</span>
                                <span>DEGENIFY MY EXISTENCE</span>
                                </div>
                                <span className="text-xs">(That means buy the NFT)</span>
                              </div>
                            )}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none"></div>
                        </button>
                      </div>
                    )}

                    {txState.status === "success" && txState.txHash && (
                      <div className="animate-float relative z-50">
                        <SuccessStep txHash={txState.txHash} nftMetadata={NFT_METADATA} />
                      </div>
                    )}

                    {txState.status === "error" && (
                      <div className="animate-float relative z-50">
                        <ErrorStep error={txState.error || "Possibly you are not degen enough"} onRetry={handleRetry} />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <p className="text-foreground/60 text-lg font-mono uppercase tracking-wider">
                      No USDC? No crypto? No problem. Click the wallet button at the top right press +Buy for more options.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-float">
              <ComingSoonPlaceholder />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}