import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TextNode } from 'lexical';
import { useEffect } from 'react';
import { $createTextNode } from 'lexical';

const HASHTAG_REGEX = /(^|\s)(#[a-zA-Z0-9_]+)/g;
const HASHTAG_CLASS = 'text-blue-500 hover:text-blue-600 font-medium cursor-pointer';

// Custom HashtagNode to style hashtags
class HashtagNode extends TextNode {
    static getType() {
        return 'hashtag';
    }

    static clone(node: HashtagNode) {
        return new HashtagNode(node.__text, node.__key);
    }

    createDOM(config: any) {
        const element = super.createDOM(config);
        element.className = HASHTAG_CLASS;
        element.setAttribute('data-hashtag', this.__text);
        return element;
    }

    static importJSON(serializedNode: any) {
        const node = $createHashtagNode(serializedNode.text);
        return node;
    }

    exportJSON() {
        return {
            ...super.exportJSON(),
            type: 'hashtag',
        };
    }
}

function $createHashtagNode(text: string): HashtagNode {
    return new HashtagNode(text);
}

function $isHashtagNode(node: any): node is HashtagNode {
    return node instanceof HashtagNode;
}

export function HashtagPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // Register the hashtag node type
        if (!editor.hasNodes([HashtagNode])) {
            throw new Error('HashtagPlugin: HashtagNode not registered on editor');
        }

        // Transform text nodes containing hashtags
        const removeTransform = editor.registerNodeTransform(TextNode, (textNode: TextNode) => {
            if ($isHashtagNode(textNode)) {
                return;
            }

            const text = textNode.getTextContent();
            const match = text.match(HASHTAG_REGEX);

            if (match) {
                // Split text into parts and create hashtag nodes
                const parts: Array<TextNode | HashtagNode> = [];
                let lastIndex = 0;

                text.replace(HASHTAG_REGEX, (matchedText, whitespace, hashtag, offset) => {
                    // Add text before hashtag
                    if (offset > lastIndex) {
                        parts.push($createTextNode(text.slice(lastIndex, offset)));
                    }

                    // Add whitespace
                    if (whitespace) {
                        parts.push($createTextNode(whitespace));
                    }

                    // Add hashtag as HashtagNode
                    parts.push($createHashtagNode(hashtag));

                    lastIndex = offset + matchedText.length;
                    return matchedText;
                });

                // Add remaining text
                if (lastIndex < text.length) {
                    parts.push($createTextNode(text.slice(lastIndex)));
                }

                // Replace the original text node with the parts
                if (parts.length > 0) {
                    const parent = textNode.getParent();
                    if (parent) {
                        textNode.replace(parts[0]);
                        for (let i = 1; i < parts.length; i++) {
                            parts[0].insertAfter(parts[i]);
                        }
                    }
                }
            }
        });

        return removeTransform;
    }, [editor]);

    return null;
}

// Helper function to extract hashtags from text
export function extractHashtags(text: string): string[] {
    const matches = text.match(HASHTAG_REGEX);
    if (!matches) return [];

    return matches.map(match => match.trim().slice(1).toLowerCase());
}

// Export the node for editor configuration
export { HashtagNode };
