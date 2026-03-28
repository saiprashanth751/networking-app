import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import {
    TRANSFORMERS,
    TEXT_FORMAT_TRANSFORMERS,
    TEXT_MATCH_TRANSFORMERS,
    ELEMENT_TRANSFORMERS,
} from '@lexical/markdown';
import { EditorToolbar } from './EditorToolbar';
import { OnChangePlugin } from './OnChangePlugin';
import { HashtagPlugin, HashtagNode } from './HashtagPlugin';
import { InitialContentPlugin } from './InitialContentPlugin';

const editorTheme = {
    paragraph: 'mb-2',
    quote: 'border-l-4 border-neutral-700 pl-4 italic text-neutral-400 my-2',
    list: {
        ul: 'list-disc list-inside ml-4 mb-2',
        ol: 'list-decimal list-inside ml-4 mb-2',
        listitem: 'mb-1',
    },
    link: 'text-blue-500 hover:text-blue-600 underline cursor-pointer',
    code: 'bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono text-sm',
    codeHighlight: {
        atrule: 'text-purple-600',
        attr: 'text-blue-600',
        boolean: 'text-orange-600',
        builtin: 'text-cyan-600',
        cdata: 'text-gray-600',
        char: 'text-green-600',
        class: 'text-yellow-600',
        'class-name': 'text-yellow-600',
        comment: 'text-gray-500 italic',
        constant: 'text-orange-600',
        deleted: 'text-red-600',
        doctype: 'text-gray-600',
        entity: 'text-purple-600',
        function: 'text-blue-600',
        important: 'text-red-600 font-bold',
        inserted: 'text-green-600',
        keyword: 'text-purple-600',
        namespace: 'text-cyan-600',
        number: 'text-orange-600',
        operator: 'text-cyan-600',
        prolog: 'text-gray-600',
        property: 'text-blue-600',
        punctuation: 'text-gray-700',
        regex: 'text-green-600',
        selector: 'text-yellow-600',
        string: 'text-green-600',
        symbol: 'text-orange-600',
        tag: 'text-red-600',
        url: 'text-blue-500 underline',
        variable: 'text-cyan-600',
    },
};

// URL matchers for AutoLinkPlugin
const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const EMAIL_MATCHER = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const MATCHERS = [
    (text: string) => {
        const match = URL_MATCHER.exec(text);
        if (match) {
            const fullMatch = match[0];
            return {
                index: match.index,
                length: fullMatch.length,
                text: fullMatch,
                url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
            };
        }
        return null;
    },
    (text: string) => {
        const match = EMAIL_MATCHER.exec(text);
        if (match) {
            const fullMatch = match[0];
            return {
                index: match.index,
                length: fullMatch.length,
                text: fullMatch,
                url: `mailto:${fullMatch}`,
            };
        }
        return null;
    },
];

// Use only TEXT transformers (no element transformers to avoid missing deps)
// This enables Ctrl+B, Ctrl+I keyboard shortcuts safely
const SUPPORTED_TRANSFORMERS = [
    ...TEXT_FORMAT_TRANSFORMERS, // Bold, italic, inline code
    ...TEXT_MATCH_TRANSFORMERS,  // Auto-link URLs
];

interface LexicalEditorProps {
    onChange: (editorState: any) => void;
    placeholder?: string;
    initialContent?: string | null;
    autoFocus?: boolean;
}

export function LexicalEditor({
    onChange,
    placeholder = "Start writing...",
    initialContent,
    autoFocus = true
}: LexicalEditorProps) {
    const editorConfig = {
        namespace: 'PostEditor',
        theme: editorTheme,
        nodes: [
            ListNode,
            ListItemNode,
            CodeNode,
            CodeHighlightNode,
            LinkNode,
            AutoLinkNode,
            HeadingNode,
            QuoteNode, // ✅ Added QuoteNode to fix MarkdownShortcuts crash
            HashtagNode,
        ],
        onError: (error: Error) => {
            console.error('Lexical Error:', error);
        },
    };

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className="relative border-border rounded-lg bg-card">
                <EditorToolbar />

                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 outline-none text-foreground"
                                aria-label="Post content editor"
                                aria-multiline="true"
                                role="textbox"
                                aria-required="true"
                                spellCheck="true"
                                autoCapitalize="sentences"
                            />
                        }
                        placeholder={
                            <div className="absolute top-3 left-4 text-neutral-500 pointer-events-none text-base opacity-50 transition-opacity">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />

                    {/* Core Plugins */}
                    <HistoryPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <AutoLinkPlugin matchers={MATCHERS} />
                    {autoFocus && <AutoFocusPlugin />}
                    <MarkdownShortcutPlugin transformers={SUPPORTED_TRANSFORMERS} />
                    <HashtagPlugin />

                    {/* Custom Plugins */}
                    {onChange && <OnChangePlugin onChange={onChange} />}
                    {initialContent && <InitialContentPlugin initialContent={initialContent} />}
                </div>
            </div>
        </LexicalComposer>
    );
}
