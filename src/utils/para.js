export const PARA_CATEGORIES = ['Projects', 'Areas', 'Resources', 'Archives'];

export const CATEGORY_ICONS = {
  Projects: 'fas fa-folder',
  Areas: 'fas fa-bullseye',
  Resources: 'fas fa-archive',
  Archives: 'fas fa-history'
};

export const INITIAL_NOTES = {
  'note-1': {
    id: 'note-1',
    title: 'Product Launch Strategy',
    category: 'Projects',
    tag: 'Marketing',
    content: `<h2>Product Launch Strategy</h2><p>The objective of this launch is to establish <strong>VNotes</strong> as the premier tool for cognitive synthesis. Our focus will be on the developer-centric market segment before expanding to broader knowledge workers.</p><ul data-type="taskList"><li data-checked="true">Finalize the 4px/8px design grid and core token architecture.</li><li data-checked="true">Implement fluid pane management system.</li><li data-checked="false">Deploy agentic terminal bridge for CLI integration.</li><li data-checked="false">Beta rollout to selected technical partners.</li></ul><pre><code>const vnotesAgent = require('@vnotes/core');\n\nasync function initGraph() {\n  const context = await vnotesAgent.hydrate({\n    depth: 2\n  });\n}</code></pre>`
  },
  'note-2': {
    id: 'note-2',
    title: 'Health & Fitness',
    category: 'Areas',
    tag: 'Long-term',
    content: `<h2>Health & Fitness</h2><p>Maintaining high cognitive performance requires a baseline of physical health.</p><ul><li>Morning routine: 20m mobility, 10m meditation.</li><li>Hydration: 3L daily minimum.</li><li>Deep work blocks: Max 90m before movement break.</li></ul>`
  },
  'note-3': {
    id: 'note-3',
    title: 'React Patterns',
    category: 'Resources',
    tag: 'Technical',
    content: `<h2>React Patterns</h2><p>Curated collection of advanced React patterns for agentic UI development.</p><h3>Compound Components</h3><p>Excellent for complex UI blocks like our Sidebar/Editor bridge.</p><pre><code>const Sidebar = ({ children }) => {\n  return &lt;aside&gt;{children}&lt;/aside&gt;\n}</code></pre>`
  },
  'note-4': {
    id: 'note-4',
    title: 'Q1 Vision 2024',
    category: 'Archives',
    tag: 'Historical',
    content: `<h2>Q1 Vision 2024</h2><p>Archive of initial brainstorms for the VNotes ecosystem.</p><blockquote>"Knowledge is gravity, and we are building the antigravity shoes."</blockquote>`
  }
};
