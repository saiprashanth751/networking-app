// src/components/messaging/ChatInput.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUploadFile } from '@/hooks/mutations/message';
import { Paperclip, Send, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

interface ChatInputProps {
  onSend: (content: string, mediaUrl?: string, mediaType?: string) => void;
  onTyping: () => void;
}

export function ChatInput({ onSend, onTyping }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileMutation = useUploadFile();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;

    let mediaUrl: string | undefined;
    let mediaType: string | undefined;

    // Upload file first if present
    if (selectedFile) {
      try {
        const result = await uploadFileMutation.mutateAsync(selectedFile);
        mediaUrl = result.url;
        mediaType = result.type;
      } catch (error) {
        toast.error('Failed to upload file');
        return;
      }
    }

    // Send message
    onSend(message.trim() || '📎 File attachment', mediaUrl, mediaType);

    // Reset
    setMessage('');
    handleRemoveFile();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-800 bg-black p-4">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 flex items-center gap-3 p-3 bg-neutral-900 rounded-lg">
          {filePreview ? (
            <img
              src={filePreview}
              alt="Preview"
              className="h-16 w-16 object-cover rounded"
            />
          ) : (
            <div className="h-16 w-16 bg-neutral-800 rounded flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-neutral-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{selectedFile.name}</div>
            <div className="text-xs text-neutral-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <Button
            onClick={handleRemoveFile}
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* File Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          disabled={uploadFileMutation.isPending}
        >
          {uploadFileMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping();
            }}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="pr-10 bg-neutral-900 border-0 focus-visible:ring-1 focus-visible:ring-blue-500 resize-none"
            disabled={uploadFileMutation.isPending}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || uploadFileMutation.isPending}
          size="icon"
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}