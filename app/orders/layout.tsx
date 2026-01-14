import Sidebar from "@/components/layouts/Sidebar";

export default function OrdersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Sidebar>{children}</Sidebar>;
}
