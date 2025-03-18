import React, { useState, useEffect } from 'react';
import { Grid, List, LayoutDashboard } from 'lucide-react';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentList } from './components/DocumentList';
import { DocumentPreview } from './components/DocumentPreview';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error loading documents');
    } else {
      setDocuments(data || []);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </button>
        </div>

        <div className="mb-8">
          <DocumentUpload onUploadComplete={loadDocuments} />
        </div>

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-md ${
                viewType === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-md ${
                viewType === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <DocumentList
          documents={documents}
          viewType={viewType}
          onDocumentClick={setSelectedDocument}
        />

        {selectedDocument && (
          <DocumentPreview
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;