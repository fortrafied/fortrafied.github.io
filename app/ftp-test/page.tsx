import type { Metadata } from 'next';
import FeatureGuard from '../components/FeatureGuard';
import FtpTestClient from './FtpTestClient';

export const metadata: Metadata = { title: 'FTP Upload Test' };

export default function Page() {
  return (
    <FeatureGuard
      featureId="ftp-test"
      title="FTP Upload Test"
      description="Upload sensitive files using FTP to verify whether your data loss prevention controls detect file-based exfiltration."
    >
      <FtpTestClient />
    </FeatureGuard>
  );
}
