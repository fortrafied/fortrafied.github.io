import Link from 'next/link';

export interface RelatedTool {
  href: string;
  label: string;
  description: string;
}

export default function RelatedTools({ tools }: { tools: RelatedTool[] }) {
  return (
    <div className="test-panel">
      <h2>Related Tools</h2>
      <div className="card-grid" style={{ marginTop: 16 }}>
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="related-tool-card"
          >
            <span className="related-tool-label">{tool.label}</span>
            <span className="related-tool-desc">{tool.description}</span>
            <span className="related-tool-arrow">&rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
