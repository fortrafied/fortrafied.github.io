import type { Metadata } from 'next';
import EmailTestClient from './EmailTestClient';

export const metadata: Metadata = { title: 'Email / SMTP Test' };

export default function Page() {
  return <EmailTestClient />;
}
