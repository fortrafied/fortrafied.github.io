import Link from 'next/link';
import { getFeatureByHref } from '@/app/lib/feature-registry';
import { getFeatureStatus } from '@/app/lib/feature-config';
import { isFeatureHidden } from '@/app/lib/feature-config';

export interface RelatedTool {
  href: string;
  label: string;
  description: string;
}

export default function RelatedTools({ tools }: { tools: RelatedTool[] }) {
  const visibleTools = tools.filter((tool) => {
    const feature = getFeatureByHref(tool.href);
    return !feature || !isFeatureHidden(feature.id);
  });

  return (
    <div className="test-panel">
      <h2>Related Tools</h2>
      <div className="card-grid" style={{ marginTop: 16 }}>
        {visibleTools.map((tool) => {
          const feature = getFeatureByHref(tool.href);
          const status = feature ? getFeatureStatus(feature.id) : 'enabled';

          if (status === 'disabled') {
            return (
              <div key={tool.href} className="related-tool-card" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                <span className="related-tool-label">{tool.label}</span>
                <span className="related-tool-desc">{tool.description}</span>
                <span className="related-tool-arrow">&rarr;</span>
                <div style={{ marginTop: 12, fontSize: '0.85rem', color: '#9e9e9e' }}>
                  Disabled by configuration
                </div>
              </div>
            );
          }

          return (
            <Link key={tool.href} href={tool.href} className="related-tool-card">
              <span className="related-tool-label">{tool.label}</span>
              <span className="related-tool-desc">{tool.description}</span>
              <span className="related-tool-arrow">&rarr;</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
