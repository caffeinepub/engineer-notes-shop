import { useState } from 'react';
import { Copy, X, Terminal, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getRetryCommand, getUpgradeCommand } from '@/utils/deploymentCommands';
import { parseDeploymentLog } from '@/utils/deploymentLogParser';
import { suggestFix } from '@/utils/deploymentFixSuggester';
import { formatDeploymentReport } from '@/utils/formatDeploymentReport';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RequestUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestUpdateModal({ open, onOpenChange }: RequestUpdateModalProps) {
  const [instructions, setInstructions] = useState('');
  const [deploymentOutput, setDeploymentOutput] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleCopyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!', {
        description: successMessage,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy', {
        description: 'Could not copy to clipboard. Please try again.',
      });
    }
  };

  const handleCopyInstructions = () => {
    handleCopyToClipboard(instructions, 'Your update request has been copied.');
  };

  const handleCopyRetryCommand = () => {
    const command = getRetryCommand();
    handleCopyToClipboard(command, 'Retry command copied to clipboard.');
  };

  const handleCopyUpgradeCommand = () => {
    const command = getUpgradeCommand();
    handleCopyToClipboard(command, 'Upgrade command copied to clipboard.');
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    try {
      const parsed = parseDeploymentLog(deploymentOutput);
      const fix = suggestFix(parsed);
      const formattedReport = formatDeploymentReport(parsed, fix);
      setReport(formattedReport);
      toast.success('Report generated', {
        description: 'Deployment failure report has been created.',
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report', {
        description: 'Could not parse deployment output. Please check the format.',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCopyReport = () => {
    if (report) {
      handleCopyToClipboard(report, 'Deployment report copied to clipboard.');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setInstructions('');
    setDeploymentOutput('');
    setReport(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Developer Tools</DialogTitle>
          <DialogDescription>
            Request updates, retry deployments, or analyze deployment failures.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="update" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="update">Update Request</TabsTrigger>
            <TabsTrigger value="deploy">Deployment</TabsTrigger>
            <TabsTrigger value="failure">Failure Report</TabsTrigger>
          </TabsList>

          <TabsContent value="update" className="space-y-4">
            <div className="py-4">
              <Textarea
                placeholder="Enter your update instructions here..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleCopyInstructions}
                disabled={!instructions.trim()}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="deploy" className="space-y-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Deployment Commands</AlertTitle>
              <AlertDescription>
                Choose the appropriate command based on your deployment scenario.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Standard Retry</h4>
                <p className="text-sm text-muted-foreground">
                  Use this to retry a failed deployment or deploy new changes.
                </p>
                <div className="bg-muted p-4 rounded-md font-mono text-sm break-all">
                  {getRetryCommand()}
                </div>
                <Button onClick={handleCopyRetryCommand} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Retry Command
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Upgrade Deployment</h4>
                <p className="text-sm text-muted-foreground">
                  Use this to upgrade canisters while preserving state, even if code hasn't changed.
                </p>
                <div className="bg-muted p-4 rounded-md font-mono text-sm break-all">
                  {getUpgradeCommand()}
                </div>
                <Button onClick={handleCopyUpgradeCommand} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Upgrade Command
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Copy the appropriate command above</li>
                <li>Run it in your terminal from the project root</li>
                <li>If deployment fails, copy the full output</li>
                <li>Paste the output in the "Failure Report" tab for analysis</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="failure" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Deployment Failure Analysis</AlertTitle>
              <AlertDescription>
                Paste the full deployment output below to generate an actionable failure report.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Deployment Output
                </label>
                <Textarea
                  placeholder="Paste your deployment output here..."
                  value={deploymentOutput}
                  onChange={(e) => setDeploymentOutput(e.target.value)}
                  className="min-h-[150px] resize-none font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleGenerateReport}
                  disabled={!deploymentOutput.trim() || isGeneratingReport}
                >
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>

              {report && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Failure Report
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyReport}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Report
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs whitespace-pre-wrap break-words">
                      {report}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
