import SellerLayout from '@/components/SellerLayout';
import QueryProvider from '@/providers/QueryProvider';

export default function SellerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <SellerLayout>{children}</SellerLayout>
    </QueryProvider>
  );
}
