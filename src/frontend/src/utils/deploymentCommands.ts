/**
 * Returns the recommended retry command for deployment.
 * This command can be run from the project root to retry the current deployment.
 */
export function getRetryCommand(): string {
  // Standard deployment command for IC projects
  return 'dfx deploy --network ic';
}

/**
 * Returns the recommended upgrade command for deployment.
 * This command performs an upgrade deployment, preserving canister state.
 */
export function getUpgradeCommand(): string {
  // Upgrade deployment command for IC projects
  return 'dfx deploy --network ic --upgrade-unchanged';
}

/**
 * Returns additional diagnostic commands that can help debug deployment issues.
 */
export function getDiagnosticCommands(): string[] {
  return [
    'dfx identity whoami',
    'dfx wallet balance',
    'dfx canister status --network ic --all',
  ];
}
