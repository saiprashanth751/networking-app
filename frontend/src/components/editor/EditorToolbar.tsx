import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState, useRef, KeyboardEvent } from 'react';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
} from 'lexical';
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $createCodeNode } from '@lexical/code';
import { $setBlocksType } from '@lexical/selection';
import {
    Bold,
    Italic,
    Code,
    List,
    ListOrdered,
    Undo2,
    Redo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function EditorToolbar() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsCode(selection.hasFormat('code'));
        }
    }, []);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    const formatBold = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
    };

    const formatItalic = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
    };

    const formatCode = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
    };

    const insertBulletList = () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    };

    const insertNumberedList = () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    };

    const formatCodeBlock = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createCodeNode());
            }
        });
    };

    const undo = () => {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
    };

    const redo = () => {
        editor.dispatchCommand(REDO_COMMAND, undefined);
    };

    // Keyboard navigation for toolbar
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const buttons = toolbarRef.current?.querySelectorAll('button');
            if (!buttons) return;

            const currentIndex = Array.from(buttons).indexOf(document.activeElement as HTMLButtonElement);
            let nextIndex = currentIndex;

            if (e.key === 'ArrowRight') {
                nextIndex = currentIndex + 1 >= buttons.length ? 0 : currentIndex + 1;
            } else {
                nextIndex = currentIndex - 1 < 0 ? buttons.length - 1 : currentIndex - 1;
            }

            (buttons[nextIndex] as HTMLButtonElement).focus();
        }
    };

    return (
        <div
            ref={toolbarRef}
            className="flex items-center gap-1 p-2 border-b border-neutral-800 bg-neutral-900"
            role="toolbar"
            aria-label="Text formatting toolbar"
            aria-controls="editor"
            onKeyDown={handleKeyDown}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                className="h-8 w-8 p-0 text-foreground"
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
            >
                <Undo2 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                className="h-8 w-8 p-0 text-foreground"
                title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
                aria-label="Redo"
            >
                <Redo2 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button
                variant="ghost"
                size="sm"
                onClick={formatBold}
                className={`h-8 w-8 p-0 text-foreground ${isBold ? 'bg-muted' : ''}`}
                title="Bold (Ctrl+B)"
                aria-label="Bold"
                aria-pressed={isBold}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={formatItalic}
                className={`h-8 w-8 p-0 text-foreground ${isItalic ? 'bg-muted' : ''}`}
                title="Italic (Ctrl+I)"
                aria-label="Italic"
                aria-pressed={isItalic}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={formatCode}
                className={`h-8 w-8 p-0 text-white ${isCode ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
                title="Inline Code (Ctrl+E)"
                aria-label="Inline Code"
                aria-pressed={isCode}
            >
                <Code className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button
                variant="ghost"
                size="sm"
                onClick={insertBulletList}
                className="h-8 w-8 p-0 text-white"
                title="Bullet List"
                aria-label="Bullet List"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={insertNumberedList}
                className="h-8 w-8 p-0 text-white"
                title="Numbered List"
                aria-label="Numbered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={formatCodeBlock}
                className="h-8 w-8 p-0 text-white"
                title="Code Block"
                aria-label="Code Block"
            >
                <Code className="h-4 w-4" />
            </Button>
        </div>
    );
}
