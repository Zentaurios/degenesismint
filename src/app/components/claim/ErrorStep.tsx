interface ErrorStepProps {
  error: string;
  onRetry: () => void;
}

export function ErrorStep({ error, onRetry }: ErrorStepProps) {
  // Check if error is related to ineligibility
  const isIneligibilityError = 
    error.includes("not allowlisted") || 
    error.includes("NotAllowlisted") || 
    error.includes("InvalidMerkleProof") ||
    error.includes("DropClaimExceedLimit") ||
    error.includes("exceeded") ||
    error.includes("limit");

  if (isIneligibilityError) {
    return (
      <div className="glass-card-small p-6 lg:p-8 neon-border relative overflow-hidden">
        <div className="text-center space-y-4">
          <div className="text-2xl lg:text-3xl font-bold gradient-text">
            Not Eligible to Claim
          </div>
          <p className="text-foreground/60 text-lg">
            You are not eligible to claim at this time. This could be because:
          </p>
          <ul className="text-foreground/60 text-lg space-y-2">
            <li>• You&apos;ve already claimed your maximum allocation</li>
            <li>• The current claim phase is restricted</li>
            <li>• The claim limit has been reached</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-small p-6 lg:p-8 neon-border relative overflow-hidden">
      <div className="text-center space-y-4">
        <div className="text-2xl lg:text-3xl font-bold gradient-text">
          Error Occurred
        </div>
        <p className="text-foreground/60 text-lg">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="cyber-button mt-4"
        >
          Try Again
        </button>
      </div>
    </div>
  );
} 