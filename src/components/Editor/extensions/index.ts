import StarterKit from '@tiptap/starter-kit';
import { Node, mergeAttributes, isNodeSelection, nodeInputRule } from '@tiptap/core';
import { Document } from '@tiptap/extension-document'
import { Columns, Column } from './MultiColumn'
import { Placeholder } from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline';
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { SlashCommand } from "./SlashCommand"
import { ContentAI } from "./contentAI"
import { CharacterCount } from '@tiptap/extension-character-count'
import Heading from '@tiptap/extension-heading'

import EnforceFirstHeading from './EnforceFirstHeading'

import TextAlign from '@tiptap/extension-text-align'

const extensions = [
    StarterKit.configure({
        document: false,   // 关掉自带的 Document
        heading: false,
    }),
    TextAlign.configure({
        types: ['paragraph', 'heading'], // 允许对齐的节点
        alignments: ['left', 'center', 'right'], // 需要的对齐方式
    }),
    
    Node,
    Columns,
    Column,
    HorizontalRule,
    SlashCommand,
    ContentAI,
    Underline,
    EnforceFirstHeading,
    Document.extend({
        content: 'heading (columns | block)*',
    }),
    Heading.configure({ // 允许 h1-h3 标题
        levels: [1, 2, 3]
    }),

    CharacterCount.configure({ limit: 50000 }),
    Placeholder.configure({
        includeChildren: true,
        showOnlyCurrent: false,
        placeholder: () => '',
    }),

    mergeAttributes,
    isNodeSelection,
    nodeInputRule
]

export default extensions;