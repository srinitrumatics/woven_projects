import Sidebar from '@/components/layouts/Sidebar';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Sidebar>
      {children}
    </Sidebar>
  );
}
