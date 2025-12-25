import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

interface InitialContentPluginProps {
    initialContent: string | null;
}

export function InitialContentPlugin({ initialContent }: InitialContentPluginProps) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (initialContent) {
            try {
                const parsedState = editor.parseEditorState(initialContent);
                editor.setEditorState(parsedState);
            } catch (error) {
                console.error('Failed to load initial content:', error);
            }
        }
    }, [editor, initialContent]);

    return null;
}
