import QueryProvider from '@/providers/QueryProvider';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
