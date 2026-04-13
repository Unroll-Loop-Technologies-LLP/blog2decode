import { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const toolbarButtons = [
    { icon: Heading1, label: 'Heading 1', action: () => insertMarkdown('# ', '\n') },
    { icon: Heading2, label: 'Heading 2', action: () => insertMarkdown('## ', '\n') },
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('_', '_') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ', '\n') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
    { icon: List, label: 'Bullet List', action: () => insertMarkdown('- ', '\n') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertMarkdown('1. ', '\n') },
    { icon: LinkIcon, label: 'Link', action: () => insertMarkdown('[', '](url)') },
    { icon: ImageIcon, label: 'Image', action: () => insertMarkdown('![alt](', ')') },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={button.action}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title={button.label}
          >
            <button.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Write your blog content in Markdown...'}
        className="w-full p-4 min-h-[400px] resize-y focus:outline-none font-mono text-sm"
      />
    </div>
  );
}
