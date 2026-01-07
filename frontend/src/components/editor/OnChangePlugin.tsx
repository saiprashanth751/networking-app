import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

interface OnChangePluginProps {
    onChange: (editorState: any) => void;
}

export function OnChangePlugin({ onChange }: OnChangePluginProps) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            onChange(editorState.toJSON());
        });
    }, [editor, onChange]);

    return null;
}
