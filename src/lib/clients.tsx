import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { VERIFIED_CONTRACT_ADDRESS, verifyContractAddress } from "./security";

// Only use client ID on the frontend - NEVER use secret key here
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!;

if (!clientId) {
  throw new Error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is required");
}

export const client = createThirdwebClient({
  clientId, // Safe for frontend use
});

// USDC contract on Base
export const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Verify contract address for security
if (!verifyContractAddress(VERIFIED_CONTRACT_ADDRESS)) {
  throw new Error("Contract address verification failed - security check");
}

// NFT contract configuration
export const nftContract = getContract({
  client,
  chain: base,
  address: VERIFIED_CONTRACT_ADDRESS, // Use verified address from security module
});

// NFT pricing and metadata configuration
export const NFT_PRICE_USDC = "69"; // 69 USDC per NFT
export const NFT_METADATA = {
  name: "DeGenesis NFT Collection",
  description: "Only 1 NFT per 19,195,238 people on Earth.",
  image: "https://degenplays.com/logo.png",
  animation_url: "https://degenplays.com/logo.png",
  attributes: [
    { trait_type: "Collection", value: "Genesis" },
    { trait_type: "Rarity", value: "1 per 19,195,238 people" },
  ],
};  