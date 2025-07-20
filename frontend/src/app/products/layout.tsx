import { Metadata } from 'next';
import { seoConfigs } from '@/lib/utils/seo';

export const metadata: Metadata = seoConfigs.products();

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
