import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFileUploadButtonProps {
  productId: string;
  onFileSelected: (file: File) => void;
  onSelectionError?: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function ProductFileUploadButton({
  productId,
  onFileSelected,
  onSelectionError,
  disabled = false,
  isLoading = false,
  className,
}: ProductFileUploadButtonProps) {
  const inputId = useId();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    // No file selected (user canceled)
    if (!files || files.length === 0) {
      onSelectionError?.('No file selected. Please try again.');
      return;
    }

    const file = files[0];

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      onSelectionError?.('Please select a PDF file.');
      e.target.value = ''; // Reset input
      return;
    }

    // File selected successfully
    onFileSelected(file);
    
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    // Prevent if disabled or loading
    if (disabled || isLoading) {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("w-full", className)} data-testid={`upload-wrapper-${productId}`}>
      {/* Visually hidden input (not display:none) for mobile compatibility */}
      <input
        id={inputId}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="sr-only"
        data-testid={`file-input-${productId}`}
        disabled={disabled || isLoading}
      />
      
      {/* Label acts as the trigger - native browser behavior, works on mobile */}
      <label htmlFor={inputId} onClick={handleLabelClick} className="block w-full">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isLoading}
          className="w-full pointer-events-none"
          data-testid={`upload-button-${productId}`}
          asChild
        >
          <span className="flex items-center justify-center">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}
