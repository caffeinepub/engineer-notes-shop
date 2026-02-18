import { Component, ReactNode } from 'react';
import ProductFileUploadButton from './ProductFileUploadButton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SafeProductUploadActionProps {
  productId: string;
  onFileSelected: (file: File) => void;
  onSelectionError?: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

interface SafeProductUploadActionState {
  hasError: boolean;
  errorMessage: string;
}

export default class SafeProductUploadAction extends Component<
  SafeProductUploadActionProps,
  SafeProductUploadActionState
> {
  constructor(props: SafeProductUploadActionProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): SafeProductUploadActionState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unknown error occurred',
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ProductFileUploadButton error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Control Error</AlertTitle>
          <AlertDescription className="text-xs">
            The upload button failed to render. Error: {this.state.errorMessage}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <ProductFileUploadButton
        productId={this.props.productId}
        onFileSelected={this.props.onFileSelected}
        onSelectionError={this.props.onSelectionError}
        isLoading={this.props.isLoading}
        disabled={this.props.disabled}
      />
    );
  }
}
