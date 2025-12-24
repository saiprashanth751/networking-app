import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { useEffect } from 'react';

const HASHTAG_REGEX = /(^|\s)(#[a-zA-Z0-9_]+)/g;

export function HashtagPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    // Hashtag styling is handled by CSS
                    // Backend will extract hashtags from the content text
                }
            });
        });
    }, [editor]);

    return null;
}

// Helper function to extract hashtags from text
export function extractHashtags(text: string): string[] {
    const matches = text.match(HASHTAG_REGEX);
    if (!matches) return [];

    return matches.map(match => match.trim().slice(1).toLowerCase());
}
