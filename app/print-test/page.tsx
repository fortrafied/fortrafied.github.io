import type { Metadata } from 'next';
import PrintTestClient from './PrintTestClient';

export const metadata: Metadata = { title: 'Print / Screenshot Test' };

export default function Page() {
  return <PrintTestClient />;
}
