import React from 'react';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Document {
  id: number;
  name: string;
  created_at: string;
  file_path: string;
  content_type: string;
}

interface DocumentListProps {
  documents: Document[];
  viewType: 'grid' | 'list';
  onDocumentClick: (doc: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  viewType,
  onDocumentClick,
}) => {
  const handleDownload = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    const { data } = await supabase.storage
      .from('documents')
      .getPublicUrl(doc.file_path);
    
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  const getThumbnailUrl = (doc: Document) => {
    if (doc.content_type?.startsWith('image/')) {
      return supabase.storage.from('documents').getPublicUrl(doc.file_path).data?.publicUrl;
    }
    return null;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
        <p className="mt-1 text-sm text-gray-500">Upload your first document to get started.</p>
      </div>
    );
  }

  if (viewType === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.map((doc) => {
          const thumbnailUrl = getThumbnailUrl(doc);
          return (
            <div
              key={doc.id}
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onDocumentClick(doc)}
            >
              <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={doc.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="w-12 h-12 text-blue-500" />
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(doc.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDownload(e, doc)}
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md divide-y">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onDocumentClick(doc)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">{doc.name}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(doc.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => handleDownload(e, doc)}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};