import { Button } from '@/components/ui/button';
import { Heart, Info } from 'lucide-react';
import RequestUpdateModal from './RequestUpdateModal';
import { useState } from 'react';
import { getActiveBuildVersion } from '../utils/buildVersion';

export default function Footer() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const currentYear = new Date().getFullYear();
  const buildVersion = getActiveBuildVersion();
  
  // Generate app identifier for UTM tracking
  const appIdentifier = encodeURIComponent(window.location.hostname || 'unknown-app');
  const caffeineLink = `https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`;

  return (
    <>
      <footer className="border-t mt-auto">
        <div className="page-container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Engineer Notes Shop. All rights reserved.
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRequestModal(true)}
                className="gap-2"
              >
                <Info className="h-4 w-4" />
                Developer Tools
              </Button>
              
              <div className="text-sm text-muted-foreground text-center">
                Built with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> using{' '}
                <a
                  href={caffeineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  caffeine.ai
                </a>
              </div>
            </div>
          </div>
          
          {/* Build version and troubleshooting guidance */}
          <div className="mt-6 pt-6 border-t">
            <div className="text-xs text-muted-foreground text-center space-y-2">
              <div>
                <strong>Build Version:</strong> v{buildVersion}
              </div>
              <div>
                <strong>Troubleshooting:</strong> If you see an old menu or UI flashing, try adding{' '}
                <code className="px-1.5 py-0.5 bg-muted rounded text-foreground">?v={buildVersion}</code>{' '}
                to the URL to force-load this build version.
              </div>
            </div>
          </div>
        </div>
      </footer>

      <RequestUpdateModal 
        open={showRequestModal} 
        onOpenChange={setShowRequestModal} 
      />
    </>
  );
}
