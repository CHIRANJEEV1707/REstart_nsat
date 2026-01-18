'use client';

import { useRef, useState } from 'react';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface CodeEditorProps {
    language: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    height?: string;
}

const LANGUAGE_MAP: Record<string, string> = {
    'python': 'python',
    'javascript': 'javascript',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c'
};

export default function CodeEditor({
    language,
    value,
    onChange,
    readOnly = false,
    height = '400px'
}: CodeEditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        setIsLoading(false);

        // Configure editor settings
        editor.updateOptions({
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            folding: true,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true
        });
    };

    const handleEditorChange = (value: string | undefined) => {
        onChange(value || '');
    };

    return (
        <div className="relative w-full rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e]">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        Loading Editor...
                    </div>
                </div>
            )}
            <Editor
                height={height}
                language={LANGUAGE_MAP[language] || 'python'}
                value={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true
                }}
            />
        </div>
    );
}
