import React from 'react';
import { Link } from 'react-router-dom';
interface PostContentProps {
    content: any; // Lexical JSON
    className?: string;
}

export function PostContent({ content, className = '' }: PostContentProps) {
    // Parse content if it's a string (from API)
    let parsedContent = content;
    if (typeof content === 'string') {
        try {
            parsedContent = JSON.parse(content);
        } catch (error) {
            console.error('Failed to parse post content:', error);
            return null;
        }
    }

    if (!parsedContent || !parsedContent.root || !parsedContent.root.children) {
        return null;
    }

    const renderNode = (node: any, index: number): React.ReactNode => {
        // Text node
        if (node.text) {
            let textElement = node.text;
            let className = '';

            // Apply formatting
            if (node.format) {
                if (node.format & 1) className += ' font-bold'; // Bold
                if (node.format & 2) className += ' italic'; // Italic
                if (node.format & 8) className += ' font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-sm'; // Code
            }

            return (
                <span key={index} className={className}>
                    {textElement}
                </span>
            );
        }

        // Hashtag node (from HashtagPlugin)
        if (node.type === 'hashtag') {
            const tagName = node.text?.startsWith('#') ? node.text.slice(1) : node.text;
            return (
                <Link
                    key={index}
                    to={`/posts/tag/${tagName}`}
                    className="text-primary font-medium hover:underline"
                >
                    {node.text}
                </Link>
            );
        }

        // Paragraph
        if (node.type === 'paragraph') {
            return (
                <p key={index} className="mb-3 leading-relaxed">
                    {node.children?.map((child: any, i: number) => renderNode(child, i))}
                </p>
            );
        }

        // Heading
        if (node.type === 'heading') {
            const HeadingTag = `h${node.tag}` as keyof JSX.IntrinsicElements;
            const headingClasses = {
                h1: 'text-3xl font-bold mb-4',
                h2: 'text-2xl font-bold mb-3',
                h3: 'text-xl font-bold mb-2',
                h4: 'text-lg font-semibold mb-2',
                h5: 'text-base font-semibold mb-2',
                h6: 'text-sm font-semibold mb-2',
            };

            return (
                <HeadingTag key={index} className={headingClasses[node.tag as keyof typeof headingClasses]}>
                    {node.children?.map((child: any, i: number) => renderNode(child, i))}
                </HeadingTag>
            );
        }

        // List
        if (node.type === 'list') {
            const ListTag = node.listType === 'bullet' ? 'ul' : 'ol';
            const listClass = node.listType === 'bullet' ? 'list-disc' : 'list-decimal';

            return (
                <ListTag key={index} className={`${listClass} ml-6 mb-3 space-y-1`}>
                    {node.children?.map((child: any, i: number) => renderNode(child, i))}
                </ListTag>
            );
        }

        // List item
        if (node.type === 'listitem') {
            return (
                <li key={index} className="leading-relaxed">
                    {node.children?.map((child: any, i: number) => renderNode(child, i))}
                </li>
            );
        }

        // Code block
        if (node.type === 'code') {
            return (
                <pre key={index} className="bg-neutral-900 dark:bg-neutral-950 text-neutral-100 p-4 rounded-lg mb-3 overflow-x-auto">
                    <code className="text-sm font-mono">
                        {node.children?.map((child: any, i: number) => renderNode(child, i))}
                    </code>
                </pre>
            );
        }

        // Quote
        if (node.type === 'quote') {
            return (
                <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-3 text-neutral-600 dark:text-neutral-400">
                    {node.children?.map((child: any, i: number) => renderNode(child, i))}
                </blockquote>
            );
        }

        // Link
        if (node.type === 'link') {
            return (
                <a
                    key={index}
                    href={node.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                >
                    {node.children?.map((child: any, i: number) => renderNode(child, i))}
                </a>
            );
        }

        // Fallback for unknown nodes
        if (node.children) {
            return node.children.map((child: any, i: number) => renderNode(child, i));
        }

        return null;
    };

    return (
        <div className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}>
            {parsedContent.root.children.map((node: any, index: number) => renderNode(node, index))}
        </div>
    );
}
