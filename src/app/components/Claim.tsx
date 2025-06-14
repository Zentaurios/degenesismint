'use client';

import { useActiveWallet, useActiveAccount, useSwitchActiveWalletChain } from "thirdweb/react";
import { getClaimConditions, claimTo, getActiveClaimCondition } from "thirdweb/extensions/erc1155";
import { MediaRenderer } from "thirdweb/react";
import { useEffect, useState, useRef } from "react";
import { base } from "thirdweb/chains";
import { client, nftContract, NFT_METADATA } from "@/lib/clients";
import { SuccessStep } from "./claim/SuccessStep";
import { ErrorStep } from "./claim/ErrorStep";
import { ComingSoonPlaceholder } from "./claim/ComingSoonPlaceholder";
import { CustomConnectButton } from "./CustomConnectButton";
import { getNFT } from "thirdweb/extensions/erc1155";
import { CountdownTimer } from "./claim/CountdownTimer";
import { sendTransaction } from "thirdweb";
import CoinAnimation, { CoinAnimationRef } from "./CoinAnimation";
import { useAudioDetection } from "@/hooks/useAudioDetection";

const tokenId = BigInt(0);

// Define proper types for metadata attributes
interface MetadataAttribute {
  trait_type: string;
  value: string;
}

// Define type for claim condition (from thirdweb)
interface ClaimCondition {
  startTimestamp?: number | bigint;
  pricePerToken?: bigint;
  maxClaimableSupply?: bigint;
  [key: string]: unknown; // Allow other properties
}

export function Claim() {
  const wallet = useActiveWallet();
  const account = useActiveAccount();
  const switchChain = useSwitchActiveWalletChain();
  const coinAnimationRef = useRef<CoinAnimationRef>(null);
  const claimContainerRef = useRef<HTMLDivElement>(null);
  const isAudioPlaying = useAudioDetection();

  // Remove unused claimConditions state - we only need setClaimConditions
  const [, setClaimConditions] = useState<ClaimCondition[]>([]);
  const [activeClaim, setActiveClaim] = useState<ClaimCondition | null>(null);
  const [loading, setLoading] = useState(true);
  const [txState, setTxState] = useState<{
    status: "idle" | "processing" | "success" | "error";
    txHash?: string;
    error?: string;
  }>({ status: "idle" });
  const [, setIsAllowed] = useState<boolean>(true);

  useEffect(() => {
    async function fetchConditions() {
      setLoading(true);
      try {
        // Fetch claim conditions
        const allConds = await getClaimConditions({
          contract: nftContract,
          tokenId
        });
        console.log('All claim conditions:', allConds);
        setClaimConditions(allConds);

        // Fetch active claim condition
        const activeCond = await getActiveClaimCondition({
          contract: nftContract,
          tokenId
        });
        console.log('Active claim condition:', activeCond);
        setActiveClaim(activeCond);

        const nft = await getNFT({
          contract: nftContract,
          tokenId: tokenId,
        });
        console.log('NFT metadata:', nft);

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
        setClaimConditions([]);
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

  useEffect(() => {
    async function checkAllowlist() {
      if (!account?.address || !activeClaim) return;

      try {
        await claimTo({
          contract: nftContract,
          tokenId,
          quantity: BigInt(1),
          to: account.address,
          from: account.address
        });

        setIsAllowed(true);
      } catch (error) {
        console.log("Allowlist check error:", error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes("not allowlisted") ||
          errorMessage.includes("NotAllowlisted") ||
          errorMessage.includes("InvalidMerkleProof") ||
          errorMessage.includes("DropClaimExceedLimit") ||
          errorMessage.includes("exceeded") ||
          errorMessage.includes("limit")
        ) {
          setIsAllowed(false);
        } else {
          setIsAllowed(true);
        }
      }
    }

    checkAllowlist();
  }, [account?.address, activeClaim]);

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

      // Optionally refresh claim conditions after claim
      const activeCond = await getActiveClaimCondition({ contract: nftContract, tokenId });
      setActiveClaim(activeCond);
      console.log("Claimed NFT");
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
        // Update isAllowed state to prevent further attempts
        setIsAllowed(false);
      } else {
        setTxState({
          status: "error",
          error: errorMessage || "Unknown error occurred"
        });
      }
    }
  }

  // Format USDC price with 6 decimals
  const formatUSDCPrice = (price: bigint): string => {
    return (Number(price) / 1e6).toFixed(2);
  };

  const handleRetry = () => {
    setTxState({ status: "idle" });
  };

  const handleSwitchChain = async () => {
    try {
      console.log("Switching chain to Base");
      await switchChain(base);
    } catch (error) {
      console.error("Error switching chain:", error);
      setTxState({
        status: "error",
        error: "Failed to switch to Base network"
      });
    }
  };

  const isCorrectChain = wallet?.getChain?.()?.id === base.id;

  return (
    <div className="relative w-full perspective-card" ref={claimContainerRef}>
      {/* Coin Animation Overlay */}
      <CoinAnimation parentRef={claimContainerRef} ref={coinAnimationRef} />
      
      <div className="flex flex-col items-center">
        <div className="w-full max-w-7xl">
          <div className="flex justify-end mb-12">
            <div className="animate-float">
              <CustomConnectButton />
            </div>
          </div>

          {loading ? (
            <div className="glass-card p-12 text-center animate-pulse-glow">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-4"></div>
                <p className="gradient-text text-3xl font-bold">Initializing Degen Matrix...</p>
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
                      <div className="animate-float">
                        <CustomConnectButton />
                      </div>
                    ) : !isCorrectChain ? (
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
                    ) : (
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
                            <>
                              <span>⚡</span>
                              <span>DEGENIFY MY EXISTENCE</span>
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none"></div>
                      </button>
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
                      No USDC? No crypto? No problem. Click the wallet button at the top right to swap, bridge, or buy crypto with your card.
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