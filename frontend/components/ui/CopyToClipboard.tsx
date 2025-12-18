'use client';

import { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface CopyToClipboardProps {
  text: string;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
}

export default function CopyToClipboard({ text, className = '', iconSize = 'sm' }: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const pxSize = sizeMap[iconSize];

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${className}`}
      title="クリックしてコピー"
    >
      {copied ? (
        <Check size={pxSize} className="text-green-600" aria-hidden="true" />
      ) : (
        <Clipboard size={pxSize} aria-hidden="true" />
      )}
      <span className="sr-only">コピー</span>
    </button>
  );
}
