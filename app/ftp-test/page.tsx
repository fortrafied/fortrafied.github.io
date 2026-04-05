import type { Metadata } from 'next';
import FtpTestClient from './FtpTestClient';

export const metadata: Metadata = { title: 'FTP Upload Test' };

export default function Page() {
  return <FtpTestClient />;
}
