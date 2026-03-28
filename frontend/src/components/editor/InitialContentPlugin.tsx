import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from 'react';
import { $getRoot } from 'lexical';
import { toast } from 'react-toastify';

interface InitialContentPluginProps {
    initialContent: string | null;
}

export function InitialContentPlugin({ initialContent }: InitialContentPluginProps) {
    const [editor] = useLexicalComposerContext();
    const [hasSetInitialContent, setHasSetInitialContent] = useState(false);

    useEffect(() => {
        // Only set initial content once to prevent race conditions
        if (initialContent && !hasSetInitialContent) {
            try {
                const parsedState = editor.parseEditorState(initialContent);
                editor.setEditorState(parsedState);
                setHasSetInitialContent(true);
            } catch (error) {
                console.error('Failed to load initial content:', error);

                // User-friendly error recovery
                toast.error('Could not load saved content. Starting with a fresh editor.');

                // Reset to empty state instead of leaving broken
                editor.update(() => {
                    const root = $getRoot();
                    root.clear();
                });

                setHasSetInitialContent(true);
            }
        }
    }, [editor, initialContent, hasSetInitialContent]);

    return null;
}
