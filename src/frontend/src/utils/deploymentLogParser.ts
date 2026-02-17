export interface ParsedDeploymentLog {
  failingStep: 'build' | 'bundle' | 'install' | 'unknown';
  errorText: string;
  rawOutput: string;
}

/**
 * Parses deployment output to extract the failing step and error details.
 */
export function parseDeploymentLog(output: string): ParsedDeploymentLog {
  const rawOutput = output.trim();
  
  if (!rawOutput) {
    return {
      failingStep: 'unknown',
      errorText: 'No output provided',
      rawOutput: '',
    };
  }

  let failingStep: ParsedDeploymentLog['failingStep'] = 'unknown';
  let errorText = '';

  // Detect build failures
  if (
    /build.*fail/i.test(output) ||
    /compilation.*error/i.test(output) ||
    /npm.*error/i.test(output) ||
    /vite.*error/i.test(output) ||
    /typescript.*error/i.test(output)
  ) {
    failingStep = 'build';
    errorText = extractErrorBlock(output, [
      /error:/i,
      /failed to compile/i,
      /build failed/i,
    ]);
  }
  // Detect bundle failures
  else if (
    /bundle.*fail/i.test(output) ||
    /wasm.*error/i.test(output) ||
    /candid.*error/i.test(output)
  ) {
    failingStep = 'bundle';
    errorText = extractErrorBlock(output, [
      /error:/i,
      /failed to bundle/i,
    ]);
  }
  // Detect canister install failures
  else if (
    /install.*fail/i.test(output) ||
    /canister.*error/i.test(output) ||
    /replica.*reject/i.test(output) ||
    /trap/i.test(output)
  ) {
    failingStep = 'install';
    errorText = extractErrorBlock(output, [
      /error:/i,
      /reject/i,
      /trap/i,
      /failed to install/i,
    ]);
  }
  // Generic error detection
  else if (/error/i.test(output)) {
    errorText = extractErrorBlock(output, [/error:/i]);
  }

  // If no specific error was extracted, use the last 500 characters
  if (!errorText) {
    errorText = output.slice(-500);
  }

  return {
    failingStep,
    errorText: errorText.trim(),
    rawOutput,
  };
}

/**
 * Extracts the error block from output based on patterns.
 */
function extractErrorBlock(output: string, patterns: RegExp[]): string {
  const lines = output.split('\n');
  let errorLines: string[] = [];
  let capturing = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line matches any error pattern
    const matchesPattern = patterns.some(pattern => pattern.test(line));
    
    if (matchesPattern) {
      capturing = true;
      errorLines = [line];
      
      // Capture subsequent lines that look like part of the error
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        const nextLine = lines[j];
        // Stop if we hit an empty line or a new section
        if (!nextLine.trim() || /^(Building|Deploying|Installing)/i.test(nextLine)) {
          break;
        }
        errorLines.push(nextLine);
      }
      break;
    }
  }

  return errorLines.join('\n');
}
