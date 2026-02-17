import { ParsedDeploymentLog } from './deploymentLogParser';

export interface FixSuggestion {
  suggestion: string;
  rationale: string;
  codeSnippet?: string;
}

/**
 * Suggests fixes based on common deployment error patterns.
 */
export function suggestFix(parsed: ParsedDeploymentLog): FixSuggestion {
  const { failingStep, errorText } = parsed;

  // TypeScript/Build errors
  if (failingStep === 'build') {
    if (/cannot find module/i.test(errorText)) {
      return {
        suggestion: 'Install missing dependencies',
        rationale: 'The build is failing because a required module cannot be found.',
        codeSnippet: 'npm install\n# or\npnpm install',
      };
    }
    
    if (/type.*error/i.test(errorText) || /property.*does not exist/i.test(errorText)) {
      return {
        suggestion: 'Fix TypeScript type errors',
        rationale: 'TypeScript compilation is failing due to type mismatches. Review the error output and fix type definitions.',
      };
    }

    if (/syntax error/i.test(errorText)) {
      return {
        suggestion: 'Fix syntax errors in source code',
        rationale: 'There are syntax errors preventing compilation. Check the file and line number in the error output.',
      };
    }

    return {
      suggestion: 'Review build configuration and source code',
      rationale: 'The build step is failing. Check the full error output for specific file and line numbers.',
    };
  }

  // Bundle/Wasm errors
  if (failingStep === 'bundle') {
    if (/wasm/i.test(errorText)) {
      return {
        suggestion: 'Rebuild Motoko canisters',
        rationale: 'The Wasm bundle generation failed. Try rebuilding the backend canister.',
        codeSnippet: 'dfx build backend',
      };
    }

    if (/candid/i.test(errorText)) {
      return {
        suggestion: 'Regenerate Candid interface',
        rationale: 'The Candid interface may be out of sync with the backend code.',
        codeSnippet: 'dfx generate backend',
      };
    }

    return {
      suggestion: 'Clean and rebuild project',
      rationale: 'Bundle generation failed. Try cleaning the build artifacts and rebuilding.',
      codeSnippet: 'rm -rf .dfx\ndfx build',
    };
  }

  // Canister install errors
  if (failingStep === 'install') {
    if (/out of cycles/i.test(errorText) || /insufficient cycles/i.test(errorText)) {
      return {
        suggestion: 'Add cycles to your wallet',
        rationale: 'The deployment failed due to insufficient cycles in your wallet.',
        codeSnippet: 'dfx wallet balance\n# Top up your wallet if needed',
      };
    }

    if (/unauthorized/i.test(errorText) || /permission/i.test(errorText)) {
      return {
        suggestion: 'Check canister controller permissions',
        rationale: 'You may not have permission to install/upgrade this canister.',
        codeSnippet: 'dfx canister status --network ic <canister-name>',
      };
    }

    if (/trap/i.test(errorText)) {
      return {
        suggestion: 'Review canister initialization code',
        rationale: 'The canister trapped during installation. Check init/post_upgrade logic in your Motoko code.',
      };
    }

    return {
      suggestion: 'Review canister installation logs',
      rationale: 'Canister installation failed. Check the full error output for specific details.',
    };
  }

  // Generic/unknown errors
  return {
    suggestion: 'Review full deployment output',
    rationale: 'Unable to determine specific failure cause. Review the complete output for error details.',
    codeSnippet: 'dfx deploy --network ic --verbose',
  };
}
