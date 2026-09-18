import QueryProvider from '@/providers/QueryProvider';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
