/**
 * Translates backend error messages into user-friendly English text for the admin UI.
 * Handles authorization errors, file upload failures, and other common admin operation errors.
 */

export function translateAdminError(error: any): string {
  if (!error) {
    return 'An unknown error occurred. Please try again.';
  }

  const errorMessage = error.message || String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Authorization errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('only store owners')) {
    if (lowerMessage.includes('anonymous')) {
      return 'You must be signed in to perform this action. Please sign in and try again.';
    }
    if (lowerMessage.includes('admin system not initialized')) {
      return 'The admin system needs to be initialized. Please contact the store owner or try initializing the system.';
    }
    return 'You do not have permission to perform this action. Only store owners and administrators can manage products.';
  }

  // Category errors
  if (lowerMessage.includes('category not found')) {
    return 'The selected category does not exist. Please choose a valid category from the list.';
  }

  // Product errors
  if (lowerMessage.includes('product not found')) {
    return 'The product could not be found. It may have been deleted.';
  }

  // File upload errors
  if (lowerMessage.includes('file') && (lowerMessage.includes('upload') || lowerMessage.includes('not available'))) {
    return 'File upload failed. Please ensure the file is a valid PDF and try again.';
  }

  // File selection errors (from frontend validation)
  if (lowerMessage.includes('no file selected') || lowerMessage.includes('please select a file')) {
    return 'No file was selected. Please choose a PDF file to upload.';
  }

  if (lowerMessage.includes('only pdf files')) {
    return 'Only PDF files are allowed. Please select a PDF file.';
  }

  // Network/connection errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Store initialization errors
  if (lowerMessage.includes('store already initialized')) {
    return 'The store has already been initialized. No further action is needed.';
  }

  // Purchase errors
  if (lowerMessage.includes('purchase') && lowerMessage.includes('unauthorized')) {
    return 'You must be signed in to purchase products. Please sign in and try again.';
  }

  if (lowerMessage.includes('product is not published')) {
    return 'This product is not available for purchase at this time.';
  }

  // Download errors
  if (lowerMessage.includes('download') && lowerMessage.includes('unauthorized')) {
    return 'You must purchase this product before downloading. Please complete your purchase and try again.';
  }

  // Profile errors
  if (lowerMessage.includes('profile') && lowerMessage.includes('unauthorized')) {
    return 'You must be signed in to manage your profile. Please sign in and try again.';
  }

  // Generic actor/backend errors
  if (lowerMessage.includes('actor not available')) {
    return 'Unable to connect to the backend. Please refresh the page and try again.';
  }

  // Return the original error message if no specific translation matches
  return errorMessage;
}
