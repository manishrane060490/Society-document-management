import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Document {
  id: number;
  name: string;
  file_path: string;
  content_type: string;
}

interface Comment {
  id: number;
  document_id: number;
  content: string;
  created_at: string;
  author_name: string;
}

interface DocumentPreviewProps {
  document: Document | null;
  onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (document) {
      loadComments();
      getDocumentUrl();
    }
  }, [document]);

  const loadComments = async () => {
    if (!document) return;
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('document_id', document.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
    }
  };

  const getDocumentUrl = async () => {
    if (!document) return;

    const { data } = await supabase.storage
      .from('documents')
      .getPublicUrl(document.file_path);

    if (data) {
      setDocumentUrl(data.publicUrl);
    }
  };

  const handleDownload = async () => {
    if (!documentUrl) return;
    window.open(documentUrl, '_blank');
  };

  const addComment = async () => {
    if (!document || !newComment.trim() || !authorName.trim()) {
      if (!authorName.trim()) {
        toast.error('Please enter your name');
      }
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('comments').insert([
      {
        document_id: document.id,
        content: newComment.trim(),
        author_name: authorName.trim(),
      },
    ]);

    if (!error) {
      setNewComment('');
      loadComments();
    } else {
      console.error('Error adding comment:', error);
    }
    setLoading(false);
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">{document.name}</h2>
            <button
              onClick={handleDownload}
              className="ml-4 p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
              title="Download document"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 overflow-auto">
            {documentUrl && (
              <iframe
                src={documentUrl}
                className="w-full h-full border-0"
                title="Document preview"
              />
            )}
          </div>
          
          <div className="w-80 border-l flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium mb-4">Comments</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your name"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add a comment..."
                    rows={3}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={addComment}
                  disabled={loading || !newComment.trim() || !authorName.trim()}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {comments.map((comment) => (
                <div key={comment.id} className="mb-4 last:mb-0 bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">{comment.content}</p>
                  <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                    <span className="font-medium">{comment.author_name}</span>
                    <span>{format(new Date(comment.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};