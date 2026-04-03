'use client';

import { useRef, useState, useCallback } from 'react';
import LoadingAnimation from './LoadingAnimation';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_BYTES = 5 * 1024 * 1024;

function isImageType(type: string) {
  return type.startsWith('image/');
}

type UploadState =
  | { status: 'empty' }
  | { status: 'selected'; file: File; previewUrl: string }
  | { status: 'uploading' }
  | { status: 'error'; message: string };

interface UploadZoneProps {
  onSuccess: (reportId: string) => void;
}

export default function UploadZone({ onSuccess }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>({ status: 'empty' });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, or WebP image.';
    }
    if (file.size > MAX_BYTES) {
      return "This file is too large. We're a morgue, not a warehouse. Max 5MB.";
    }
    return null;
  }

  function selectFile(file: File) {
    const error = validateFile(file);
    if (error) {
      setState({ status: 'error', message: error });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setState({ status: 'selected', file, previewUrl });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
    e.target.value = '';
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleSubmit() {
    if (state.status !== 'selected') return;
    const file = state.file;

    // Revoke the preview URL before unmounting it
    URL.revokeObjectURL(state.previewUrl);
    setState({ status: 'uploading' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/autopsy', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setState({
          status: 'error',
          message: data.error ?? 'Something went wrong. Please try again.',
        });
        return;
      }

      onSuccess(data.id as string);
    } catch {
      setState({
        status: 'error',
        message: 'Please upload a LinkedIn profile screenshot (Experience section) or a CV. Random images cannot be autopsied.',
      });
    }
  }

  function reset() {
    if (state.status === 'selected') URL.revokeObjectURL(state.previewUrl);
    setState({ status: 'empty' });
  }

  // ── Uploading ────────────────────────────────────────────
  if (state.status === 'uploading') {
    return <LoadingAnimation />;
  }

  // ── Error ────────────────────────────────────────────────
  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <XCircleIcon className="w-5 h-5 text-[#E24B4A]" />
        </div>
        <p className="text-sm text-[#E24B4A] font-medium max-w-xs">{state.message}</p>
        <button
          onClick={reset}
          className="text-xs text-gray-500 underline hover:text-gray-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── File selected ────────────────────────────────────────
  if (state.status === 'selected') {
    return (
      <div className="flex flex-col gap-3">
        {/* Preview row */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          {isImageType(state.file.type) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.previewUrl}
              alt="Preview"
              className="w-14 h-14 object-cover rounded-lg shrink-0 border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg shrink-0 border border-gray-200 bg-white flex flex-col items-center justify-center gap-0.5">
              <DocumentIcon className="w-6 h-6 text-gray-400" />
              <span className="text-[9px] font-semibold uppercase text-gray-400 tracking-wide">
                {state.file.type.includes('pdf') ? 'PDF' : 'DOCX'}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">{state.file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {(state.file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            onClick={reset}
            className="text-xs text-gray-400 hover:text-gray-600 underline shrink-0 transition-colors"
          >
            Change
          </button>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide bg-[#E24B4A] text-white hover:bg-[#c73b3a] active:scale-[0.98] transition-all"
        >
          Dexter me
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  // ── Empty / drop zone ────────────────────────────────────

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          'flex flex-col items-center justify-center gap-3 py-10 px-4',
          'border-2 border-dashed rounded-xl cursor-pointer',
          'transition-colors select-none text-center',
          isDragging
            ? 'border-[#E24B4A] bg-red-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        ].join(' ')}
      >
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <UploadIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Upload your LinkedIn screenshot or CV</p>
          <p className="text-xs text-gray-400 mt-1">LinkedIn Experience section · PDF CV · Word CV</p>
          <p className="text-xs text-gray-300 mt-1.5">JPEG · PNG · WebP · PDF · DOCX · max 5 MB</p>
        </div>
      </div>

      {/* Disabled submit button */}
      <button
        disabled
        className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        Begin autopsy
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
