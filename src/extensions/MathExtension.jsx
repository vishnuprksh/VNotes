import React, { useEffect, useRef } from 'react';
import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

// ── Inline math: $...$ ────────────────────────────────────────────────────────

const InlineMathView = ({ node }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.katex) {
      try {
        window.katex.render(node.attrs.latex, ref.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch {
        ref.current.textContent = node.attrs.latex;
      }
    }
  }, [node.attrs.latex]);
  return (
    <NodeViewWrapper as="span" className="math-inline" contentEditable={false}>
      <span ref={ref} />
    </NodeViewWrapper>
  );
};

export const InlineMath = Node.create({
  name: 'inlineMath',
  inline: true,
  group: 'inline',
  atom: true,

  addAttributes() {
    return { latex: { default: '' } };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="inline-math"]', getAttrs: el => ({ latex: el.getAttribute('data-latex') }) }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-math', 'data-latex': node.attrs.latex })];
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /(?:^|\s)\$([^$\n]+)\$$/,
        type: this.type,
        getAttributes: match => ({ latex: match[1] }),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathView);
  },
});

// ── Block math: $$...$$ ───────────────────────────────────────────────────────

const BlockMathView = ({ node }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.katex) {
      try {
        window.katex.render(node.attrs.latex, ref.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch {
        ref.current.textContent = node.attrs.latex;
      }
    }
  }, [node.attrs.latex]);
  return (
    <NodeViewWrapper className="math-block" contentEditable={false}>
      <div ref={ref} />
    </NodeViewWrapper>
  );
};

export const BlockMath = Node.create({
  name: 'blockMath',
  group: 'block',
  atom: true,

  addAttributes() {
    return { latex: { default: '' } };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="block-math"]', getAttrs: el => ({ latex: el.getAttribute('data-latex') }) }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'block-math', 'data-latex': node.attrs.latex })];
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^\$\$([^$]+)\$\$\s*$/,
        type: this.type,
        getAttributes: match => ({ latex: match[1].trim() }),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockMathView);
  },
});
