import { useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

interface ProductFileUploadButtonProps {
  productId: string;
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function ProductFileUploadButton({
  productId,
  onFileSelected,
  disabled = false,
  isLoading = false,
  className,
}: ProductFileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  return (
    <div className="w-full" data-testid={`upload-button-wrapper-${productId}`}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        data-testid={`upload-input-${productId}`}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={disabled || isLoading}
        className={className}
        data-testid={`upload-button-${productId}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 mr-1" />
        )}
        Upload PDF
      </Button>
    </div>
  );
}
