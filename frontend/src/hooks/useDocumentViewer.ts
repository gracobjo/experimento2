import { useState, useCallback } from 'react';

interface DocumentViewerState {
  isOpen: boolean;
  documentId: string | null;
  originalName: string | null;
}

export const useDocumentViewer = () => {
  const [viewerState, setViewerState] = useState<DocumentViewerState>({
    isOpen: false,
    documentId: null,
    originalName: null
  });

  const openDocument = useCallback((documentId: string, originalName: string) => {
    setViewerState({
      isOpen: true,
      documentId,
      originalName
    });
  }, []);

  const closeDocument = useCallback(() => {
    setViewerState({
      isOpen: false,
      documentId: null,
      originalName: null
    });
  }, []);

  return {
    ...viewerState,
    openDocument,
    closeDocument
  };
};






