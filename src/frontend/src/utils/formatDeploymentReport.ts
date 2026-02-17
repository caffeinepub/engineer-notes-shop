import { ParsedDeploymentLog } from './deploymentLogParser';
import { FixSuggestion } from './deploymentFixSuggester';

/**
 * Formats a deployment failure report for developers.
 */
export function formatDeploymentReport(
  parsed: ParsedDeploymentLog,
  fix: FixSuggestion
): string {
  const sections: string[] = [];

  // Header
  sections.push('='.repeat(60));
  sections.push('DEPLOYMENT FAILURE REPORT');
  sections.push('='.repeat(60));
  sections.push('');

  // Failing step
  sections.push('FAILING STEP:');
  sections.push(`  ${parsed.failingStep.toUpperCase()}`);
  sections.push('');

  // Suggested fix
  sections.push('SUGGESTED FIX:');
  sections.push(`  ${fix.suggestion}`);
  sections.push('');
  sections.push('RATIONALE:');
  sections.push(`  ${fix.rationale}`);
  sections.push('');

  // Code snippet if available
  if (fix.codeSnippet) {
    sections.push('RECOMMENDED COMMAND(S):');
    sections.push('');
    fix.codeSnippet.split('\n').forEach(line => {
      sections.push(`  ${line}`);
    });
    sections.push('');
  }

  // Full error text
  sections.push('FULL ERROR OUTPUT:');
  sections.push('-'.repeat(60));
  sections.push(parsed.errorText);
  sections.push('-'.repeat(60));
  sections.push('');

  // Footer
  sections.push('END OF REPORT');
  sections.push('='.repeat(60));

  return sections.join('\n');
}
