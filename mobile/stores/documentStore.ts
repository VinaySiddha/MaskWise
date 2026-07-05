import { create } from 'zustand';
import { Document } from '../types/document';

interface DocumentState {
  documents: Document[];
  currentDocumentId: string | null;
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, partial: Partial<Document>) => void;
  setCurrentDocumentId: (id: string | null) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  currentDocumentId: null,
  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
  updateDocument: (id, partial) => set((state) => ({
    documents: state.documents.map(d => d.id === id ? { ...d, ...partial } : d)
  })),
  setCurrentDocumentId: (id) => set({ currentDocumentId: id }),
}));
