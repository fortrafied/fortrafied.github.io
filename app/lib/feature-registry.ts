export interface FeatureDefinition {
  id: string;
  label: string;
  href: string;
  section: string;
}

export const featureDefinitions: FeatureDefinition[] = [
  { id: 'http-post', label: 'HTTP POST Test', href: '/http-post', section: 'Data in Motion' },
  { id: 'https-post', label: 'HTTPS POST Test', href: '/https-post', section: 'Data in Motion' },
  { id: 'email-test', label: 'Email / SMTP Test', href: '/email-test', section: 'Data in Motion' },
  { id: 'ftp-test', label: 'FTP Upload Test', href: '/ftp-test', section: 'Data in Motion' },
  { id: 'clipboard-test', label: 'Clipboard / Paste Test', href: '/clipboard-test', section: 'Data in Use' },
  { id: 'print-test', label: 'Print / Screenshot Test', href: '/print-test', section: 'Data in Use' },
  { id: 'sample-data', label: 'Sample Data Downloads', href: '/sample-data', section: 'Data at Rest' },
  { id: 'data-classifier', label: 'Classification Tester', href: '/data-classifier', section: 'Data at Rest' },
  { id: 'classification-builder', label: 'Classification Builder', href: '/classification-builder', section: 'Data at Rest' },
  { id: 'regex-tester', label: 'Regex Pattern Tester', href: '/regex-tester', section: 'Tools' },
  { id: 'email-analyzer', label: 'Email Header Analyzer', href: '/email-analyzer', section: 'Tools' },
  { id: 'prompt-builder', label: 'DLP Prompt Builder', href: '/prompt-builder', section: 'Tools' },
  { id: 'hash-generator', label: 'File Hash Generator', href: '/hash-generator', section: 'Tools' },
  { id: 'assessment', label: 'Assessment', href: '/assessment', section: 'Tools' },
  { id: 'coverage-map', label: 'Coverage Map', href: '/coverage-map', section: 'Tools' },
];

export const navSections = [
  { label: 'Data in Motion', featureIds: ['http-post', 'https-post', 'email-test', 'ftp-test'] },
  { label: 'Data in Use', featureIds: ['clipboard-test', 'print-test'] },
  { label: 'Data at Rest', featureIds: ['sample-data', 'data-classifier', 'classification-builder'] },
  { label: 'Tools', featureIds: ['regex-tester', 'email-analyzer', 'prompt-builder', 'hash-generator', 'assessment', 'coverage-map'] },
];

export function getFeatureById(featureId: string): FeatureDefinition | undefined {
  return featureDefinitions.find((feature) => feature.id === featureId);
}

export function getFeatureByHref(href: string): FeatureDefinition | undefined {
  return featureDefinitions.find((feature) => feature.href === href);
}
