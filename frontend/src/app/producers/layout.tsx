import { Metadata } from 'next';
import { seoConfigs } from '@/lib/utils/seo';

export const metadata: Metadata = seoConfigs.producers();

export default function ProducersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
