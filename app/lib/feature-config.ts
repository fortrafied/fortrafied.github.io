import settings from '@/config/settings.json';
import features from '@/config/features.json';

export type FeatureStatus = 'enabled' | 'disabled' | 'hidden';

export interface AppSettings {
  siteTitle: string;
  brandSubtext: string;
  featureMessages: {
    disabled: string;
    hidden: string;
  };
  featureDefaults: {
    status: FeatureStatus;
  };
}

export interface FeaturesConfig {
  enabled: string[];
  disabled: string[];
  hidden: string[];
}

export const appSettings: AppSettings = settings;
export const featureConfig: FeaturesConfig = features;

export function getFeatureStatus(featureId: string): FeatureStatus {
  if (featureConfig.hidden.includes(featureId)) return 'hidden';
  if (featureConfig.disabled.includes(featureId)) return 'disabled';
  if (featureConfig.enabled.includes(featureId)) return 'enabled';
  return appSettings.featureDefaults.status;
}

export function isFeatureHidden(featureId: string): boolean {
  return getFeatureStatus(featureId) === 'hidden';
}

export function isFeatureDisabled(featureId: string): boolean {
  return getFeatureStatus(featureId) === 'disabled';
}

export function isFeatureEnabled(featureId: string): boolean {
  return getFeatureStatus(featureId) === 'enabled';
}
