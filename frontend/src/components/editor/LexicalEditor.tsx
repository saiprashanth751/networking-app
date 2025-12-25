import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { HeadingNode } from '@lexical/rich-text';
import { EditorToolbar } from './EditorToolbar';
import { OnChangePlugin } from './OnChangePlugin';
import { HashtagPlugin, HashtagNode } from './HashtagPlugin';

const editorTheme = {
    paragraph: 'mb-2',
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

interface LexicalEditorProps {
    onChange?: (editorState: any) => void;
    initialContent?: any;
    placeholder?: string;
}

export function LexicalEditor({ onChange, initialContent, placeholder = 'Start writing...' }: LexicalEditorProps) {
    const initialConfig = {
        namespace: 'PostEditor',
        theme: editorTheme,
        onError: (error: Error) => {
            console.error('Lexical Error:', error);
        },
        nodes: [
            ListNode,
            ListItemNode,
            CodeNode,
            CodeHighlightNode,
            LinkNode,
            AutoLinkNode,
            HeadingNode,
            HashtagNode,
        ],
        editorState: initialContent ? JSON.stringify(initialContent) : undefined,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="relative border border-neutral-800 rounded-lg bg-black">
                <EditorToolbar />

                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 outline-none text-white" />
                        }
                        placeholder={
                            <div className="absolute top-3 left-4 text-neutral-500 pointer-events-none text-base">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <HashtagPlugin />
                    {onChange && <OnChangePlugin onChange={onChange} />}
                </div>
            </div>
        </LexicalComposer>
    );
}
