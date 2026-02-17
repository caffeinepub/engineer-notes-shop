import { useState } from 'react';
import { Heart, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RequestUpdateModal from './RequestUpdateModal';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'engineer-notes-shop');

  return (
    <>
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="page-container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p>© {currentYear} Engineer Notes Shop. All rights reserved.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Request an Update
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Built with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>

      <RequestUpdateModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
