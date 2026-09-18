import AdminLayout from '@/components/AdminLayout';
import QueryProvider from '@/providers/QueryProvider';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AdminLayout>{children}</AdminLayout>
    </QueryProvider>
  );
}
