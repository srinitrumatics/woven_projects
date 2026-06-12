import Sidebar from "@/components/layouts/Sidebar";

export default function ConfigureLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Sidebar>{children}</Sidebar>;
}
