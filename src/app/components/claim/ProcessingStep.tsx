import { useEffect, useState } from "react";

interface ProcessingStepProps {
  provider: "stripe" | "coinbase" | "transak";
}

export function ProcessingStep({ provider }: ProcessingStepProps) {
  const [currentStep, setCurrentStep] = useState<
    "payment" | "confirmation" | "minting"
  >("payment");

  // Auto-progress through steps for demo purposes
  useEffect(() => {
    const timer1 = setTimeout(
      () => setCurrentStep("confirmation"),
      5000,
    );
    const timer2 = setTimeout(() => setCurrentStep("minting"), 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const providerInfo = {
    stripe: { name: "Degen Stripe", logo: "💳", color: "purple" },
    coinbase: { name: "Coinbase Degen", logo: "🟦", color: "blue" },
    transak: { name: "Transak Matrix", logo: "🌐", color: "teal" },
  };

  const info = providerInfo[provider];

  return (
    <div className="text-center space-y-8">
      <div className="mb-8">
        <div className="text-6xl mb-4 animate-pulse-glow">{info.logo}</div>
        <h3 className="gradient-text text-2xl font-bold mb-2">
          ⚛️ DEGEN PROCESSING
        </h3>
        <p className="text-foreground/70 text-lg">
          Trading sync with {info.name}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-6">
        <div
          className={`glass-card-small p-6 transition-all duration-500 ${
            currentStep === "payment"
              ? "neon-border animate-pulse-glow"
              : currentStep === "confirmation" || currentStep === "minting"
              ? "border-green-500/50"
              : ""
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                currentStep === "payment"
                  ? "bg-gradient-to-r from-purple-500 to-teal-500 text-white animate-pulse shadow-neon"
                  : currentStep === "confirmation" || currentStep === "minting"
                  ? "bg-gradient-to-r from-green-400 to-teal-400 text-black"
                  : "bg-gray-600 text-gray-400"
              }`}
            >
              {currentStep === "payment" ? "01" : "✓"}
            </div>
            <div className="text-left flex-1">
              <div className="gradient-text font-bold text-lg mb-1">DEGEN PAYMENT SYNC</div>
              <div className="text-foreground/70 text-sm">
                {currentStep === "payment"
                  ? "Establishing degen payment tunnel..."
                  : "Payment synchronized successfully"}
              </div>
              {currentStep === "payment" && (
                <div className="mt-2 w-full bg-purple-500/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`glass-card-small p-6 transition-all duration-500 ${
            currentStep === "confirmation"
              ? "neon-border animate-pulse-glow"
              : currentStep === "minting"
              ? "border-green-500/50"
              : ""
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                currentStep === "confirmation"
                  ? "bg-gradient-to-r from-purple-500 to-teal-500 text-white animate-pulse shadow-neon"
                  : currentStep === "minting"
                  ? "bg-gradient-to-r from-green-400 to-teal-400 text-black"
                  : "bg-gray-600 text-gray-400"
              }`}
            >
              {currentStep === "confirmation"
                ? "02"
                : currentStep === "minting"
                ? "✓"
                : "02"}
            </div>
            <div className="text-left flex-1">
              <div className="gradient-text font-bold text-lg mb-1">BLOCKCHAIN VERIFICATION</div>
              <div className="text-foreground/70 text-sm">
                {currentStep === "confirmation"
                  ? "Validating transaction through trading nodes..."
                  : currentStep === "minting"
                  ? "Blockchain consensus achieved"
                  : "Awaiting payment confirmation"}
              </div>
              {currentStep === "confirmation" && (
                <div className="mt-2 w-full bg-purple-500/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`glass-card-small p-6 transition-all duration-500 ${
            currentStep === "minting"
              ? "neon-border animate-pulse-glow"
              : ""
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                currentStep === "minting"
                  ? "bg-gradient-to-r from-purple-500 to-teal-500 text-white animate-pulse shadow-neon"
                  : "bg-gray-600 text-gray-400"
              }`}
            >
              03
            </div>
            <div className="text-left flex-1">
              <div className="gradient-text font-bold text-lg mb-1">NFT MATERIALIZATION</div>
              <div className="text-foreground/70 text-sm">
                {currentStep === "minting"
                  ? "Manifesting your unique degen artifact..."
                  : "Preparing degen NFT forge"}
              </div>
              {currentStep === "minting" && (
                <div className="mt-2 w-full bg-purple-500/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full animate-pulse" style={{ width: '95%' }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {currentStep === "payment" && (
        <div className="glass-card-small p-6 border-yellow-500/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse"></div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-6 h-6 bg-yellow-500 rounded-full animate-bounce flex items-center justify-center">
              <span className="text-black text-sm font-bold">!</span>
            </div>
            <span className="gradient-text font-bold text-lg">DEGEN SYNC REQUIRED</span>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Complete your payment in the {info.name} trading tunnel to continue the synchronization process. Your trading patterns will be automatically updated upon confirmation.
          </p>
        </div>
      )}

      {currentStep === "minting" && (
        <div className="glass-card-small p-6 border-blue-500/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-teal-500 animate-gradient"></div>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDelay: '0.5s' }}></div>
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="text-center">
            <span className="gradient-text font-bold text-lg block mb-2">⚡ DEGEN FORGE ACTIVE</span>
            <p className="text-foreground/80 text-sm leading-relaxed">
              Your NFT is materializing through the degen matrix. Trading patterns are being embedded into the blockchain substrate. Process completion: 30-60 temporal units.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 