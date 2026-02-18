import React, { Component, ReactNode } from 'react';
import ProductFileUploadButton from './ProductFileUploadButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SafeProductUploadActionProps {
  productId: string;
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

interface SafeProductUploadActionState {
  hasError: boolean;
  errorMessage: string;
}

class SafeProductUploadAction extends Component<SafeProductUploadActionProps, SafeProductUploadActionState> {
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProductFileUploadButton render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Upload control failed to render: {this.state.errorMessage}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <ProductFileUploadButton
        productId={this.props.productId}
        onFileSelected={this.props.onFileSelected}
        disabled={this.props.disabled}
        isLoading={this.props.isLoading}
        className={this.props.className}
      />
    );
  }
}

export default SafeProductUploadAction;
