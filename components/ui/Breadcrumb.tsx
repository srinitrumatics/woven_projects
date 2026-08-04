import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    return (
        <div className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 min-w-0 ${className}`}>
            {items.map((item, index) => (
                <Fragment key={index}>
                    {index > 0 && <span>&gt;</span>}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-gray-700 dark:hover:text-gray-300">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 dark:text-white truncate">{item.label}</span>
                    )}
                </Fragment>
            ))}
        </div>
    );
}
