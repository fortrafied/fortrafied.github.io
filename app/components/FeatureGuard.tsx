import type { ReactNode } from 'react';
import PageHeader from './PageHeader';
import { appSettings, getFeatureStatus } from '@/app/lib/feature-config';

interface FeatureGuardProps {
  featureId: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function FeatureGuard({
  featureId,
  title,
  description,
  children,
}: FeatureGuardProps) {
  const status = getFeatureStatus(featureId);
  const isDisabled = status === 'disabled';

  if (status === 'hidden') {
    return (
      <>
        <PageHeader title={title} description={description} />
        <main className="container section">
          <div className="warning-box">
            <strong>Feature unavailable:</strong> {appSettings.featureMessages.hidden}
          </div>
          <p style={{ color: '#b0bec5', lineHeight: 1.8 }}>
            The {title} feature has been hidden by site configuration and is currently not accessible.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader title={title} description={description} />
      <main className="container section">
        {isDisabled && (
          <div className="warning-box">
            <strong>Feature disabled:</strong> {appSettings.featureMessages.disabled}
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: isDisabled ? 0.45 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}>
            {children}
          </div>
          {isDisabled && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                color: '#e0e0e0',
                background: 'rgba(10, 14, 23, 0.8)',
                borderRadius: '12px',
              }}
            >
              <div>
                <strong>This feature is disabled.</strong>
                <p style={{ marginTop: '0.75rem', color: '#b0bec5' }}>
                  The feature is visible in the UI but not available for interaction.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
