import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';

interface OnChangePluginProps {
    onChange: (editorState: any) => void;
}

export function OnChangePlugin({ onChange }: OnChangePluginProps) {
    const [editor] = useLexicalComposerContext();
    const onChangeRef = useRef(onChange);

    // Keep ref up to date without triggering effect re-run
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            onChangeRef.current(editorState.toJSON());
        });
    }, [editor]); // Only re-register if editor instance changes

    return null;
}
