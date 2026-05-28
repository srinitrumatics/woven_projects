"use client";

import { useEffect, useRef } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Link from "next/link";
import { Chart, registerables } from "chart.js";
import {
  ShoppingBag,
  FileText,
  Package,
  ClipboardList,
  Truck,
  BarChart3,
} from "lucide-react";

import { useUserSession } from "@/components/UserSessionContext";
import { useState } from "react";

interface StatItem {
  title: string;
  value: string | number;
  trend: string;
  subtext: string;
  subtextColor?: string;
  icon: any;
  color: string;
  bgColor: string;
  iconColor: string;
}

export default function HomePage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { selectedAccount, user } = useUserSession();
  const isManufacturer = ['Supplier', 'Manufacturer', 'Manufacturer Rep', 'Logistics Partner'].includes(selectedAccount?.Account_Record_Type__c || '');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const accountId = selectedAccount?.Id || selectedAccount?.id;
  const contactId = user?.Id || user?.contact?.Id;

  useEffect(() => {
    const fetchData = async () => {
      if (!accountId || !contactId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/salesforce/program-insights?accountId=${accountId}&contactId=${contactId}`);
        const result = await res.json();
        if (result.success && result.data?.[0]) {
          setData(result.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accountId, contactId]);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    Chart.register(...registerables);

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const invoiceSpend = data["Invoice Spend"] || [];

    // Generate last 12 months labels and keys
    const months = [];
    const now = new Date();
    // Start from 11 months ago to current month
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        month: d.getMonth() + 1,
        year: d.getFullYear()
      });
    }

    const labels = months.map(m => m.label);
    const paidData = months.map(m => {
      return invoiceSpend
        .filter((item: any) => item.Month === m.month && item.Year === m.year)
        .reduce((sum: number, item: any) => sum + (item.Paid_Amount__c || 0), 0);
    });
    const outstandingData = months.map(m => {
      return invoiceSpend
        .filter((item: any) => item.Month === m.month && item.Year === m.year)
        .reduce((sum: number, item: any) => sum + (item.Open_Balance__c || 0), 0);
    });

    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Paid",
            data: paidData,
            backgroundColor: "#3b82f6",
            borderRadius: 4,
            stack: "a"
          },
          {
            label: "Outstanding",
            data: outstandingData,
            backgroundColor: "#fbbf24",
            borderRadius: 4,
            stack: "a"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c: any) => " $" + c.parsed.y.toLocaleString()
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: {
              color: "#999",
              font: { size: 11 },
              autoSkip: false,
              maxRotation: 0
            }
          },
          y: {
            stacked: true,
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: {
              color: "#999",
              font: { size: 11 },
              callback: (v: any) => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)
            }
          }
        }
      }
    });

    return () => {
      myChart.destroy();
    };
  }, [data]);

  const stats: StatItem[] = [
    {
      title: "Open Orders",
      value: data?.["Open Orders"]?.["Open Orders Count"] || "0",
      trend: `$${(data?.["Open Orders"]?.["Total Value"] || 0).toLocaleString()} total`,
      subtext: "Recently updated",
      icon: ShoppingBag,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Pending Invoices",
      value: data?.["Pending Invoices"]?.["Pending Invoices Count"] || "0",
      trend: `$${(data?.["Pending Invoices"]?.["Total Value"] || 0).toLocaleString()} total`,
      subtext: "Recent invoices",
      icon: FileText,
      color: "yellow",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      title: "On Hand Inventory",
      value: data?.["On Hand Inventory"]?.["Unique Products Count"] || "0",
      trend: `$${(data?.["On Hand Inventory"]?.["Total Value"] || 0).toLocaleString()} total value`,
      subtext: "Products in stock",
      icon: Package,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Pending Quotes",
      value: data?.["Pending Quotes"]?.["Pending Quotes Count"] || "0",
      trend: `$${(data?.["Pending Quotes"]?.["Total Value"] || 0).toLocaleString()} total`,
      subtext: "Awaiting approval",
      icon: ClipboardList,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  const quickActions = [
    { label: "View Orders", icon: ShoppingBag, bgColor: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-700 dark:text-blue-400", borderColor: "border-blue-100 dark:border-blue-800/50", href: "/orders" },
    { label: "View Proposals", icon: FileText, bgColor: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-700 dark:text-green-400", borderColor: "border-green-100 dark:border-green-800/50", href: "/proposals" },
    { label: "View Quotes", icon: ClipboardList, bgColor: "bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-700 dark:text-purple-400", borderColor: "border-purple-100 dark:border-purple-800/50", href: "/quotes" },
    { label: "Track Shipments", icon: Truck, bgColor: "bg-orange-50 dark:bg-orange-900/20", textColor: "text-orange-700 dark:text-orange-400", borderColor: "border-orange-100 dark:border-orange-800/50", href: "/shipments" },
    { label: "View Invoices", icon: FileText, bgColor: "bg-red-50 dark:bg-red-900/20", textColor: "text-red-700 dark:text-red-400", borderColor: "border-red-100 dark:border-red-800/50", href: "/invoices" },
  ];

  const needsAttention = [
    {
      title: "Orders in Draft",
      count: data?.["Orders in Draft"]?.length || 0,
      badgeStyle: { background: "#dbeafe", color: "#1d4ed8" },
      href: "/orders",
      items: (data?.["Orders in Draft"] || []).slice(0, 3).map((item: any) => ({
        id: item.Name,
        href: `/orders/${item.Id}`,
        customerPo: item.Customer_PO__c || "N/A",
        info: `$${(item.Grand_Total__c || 0).toLocaleString()}`,
        status: item.Status__c,
        pillClass: "bg-[#fff7ed] text-[#9a3412]"
      })),
      footer: "View all draft orders"
    },
    {
      title: "Proposals",
      count: data?.["Proposals"]?.length || 0,
      badgeStyle: { background: "#eff6ff", color: "#1e40af" },
      href: "/proposals",
      items: (data?.["Proposals"] || []).slice(0, 3).map((item: any) => ({
        id: item.Proposal_Number__c || item.Name,
        href: `/proposals/${item.Id}`,
        customerPo: item.Customer_PO__c || "N/A",
        info: `$${(item.Grand_Total__c || 0).toLocaleString()}`,
        status: item.Status__c,
        pillClass: "bg-[#eff6ff] text-[#1e40af]"
      })),
      footer: "View all proposals"
    },
    {
      title: "Quotes",
      count: data?.["Quotes"]?.length || 0,
      badgeStyle: { background: "#fef3c7", color: "#92400e" },
      href: "/quotes",
      items: (data?.["Quotes"] || []).slice(0, 3).map((item: any) => ({
        id: item.Quote_Number__c || item.Name,
        href: `/quotes/${item.Id}`,
        customerPo: item.Customer_PO__c || "N/A",
        info: item.Expiration_Date__c ? `Expires: ${item.Expiration_Date__c}` : `$${(item.Grand_Total__c || 0).toLocaleString()}`,
        status: item.Status__c,
        pillClass: item.Status__c === 'Expiring' ? "bg-[#fff7ed] text-[#9a3412]" : "bg-[#edf7ee] text-[#05630b]"
      })),
      footer: "View all submitted quotes"
    },
    {
      title: "Invoices",
      count: data?.["Invoices"]?.length || 0,
      badgeStyle: { background: "#fee2e2", color: "#b91c1c" },
      href: "/invoices",
      items: (data?.["Invoices"] || []).slice(0, 3).map((item: any) => ({
        id: item.Invoice_Number__c || item.Name,
        href: `/invoices/${item.Id}`,
        customerPo: item.Customer_PO__c || "N/A",
        info: item.Days_Outstanding__c ? `${item.Days_Outstanding__c} days outstanding` : `$${(item.Grand_Total__c || 0).toLocaleString()}`,
        status: item.Status__c,
        pillClass: "bg-[#fef2f2] text-[#991b1b]"
      })),
      footer: "View all past due invoices"
    },
    {
      title: "Shipments",
      count: data?.["Shipments"]?.length || 0,
      badgeStyle: { background: "#dcfce7", color: "#166534" },
      href: "/shipments",
      items: (data?.["Shipments"] || []).slice(0, 3).map((item: any) => ({
        id: item.Shipping_Manifest_Number__c || item.Name,
        href: `/shipments/${item.Id}`,
        customerPo: item.Customer_PO__c || "N/A",
        info: item.Estimated_Delivery_Date__c ? `ETA: ${new Date(item.Estimated_Delivery_Date__c).toLocaleDateString()}` : `Total: $${(item.Total_Price__c || 0).toLocaleString()}`,
        status: item.Status__c,
        pillClass: item.Status__c === 'Delayed' ? "bg-[#fef2f2] text-[#991b1b]" : "bg-[#f0fdf4] text-[#166534]"
      })),
      footer: "View all shipments"
    }
  ];

  return (
    <Sidebar>
      <div className="p-8 max-w-[1600px] mx-auto space-y-8 min-h-screen relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Updating dashboard...</p>
            </div>
          </div>
        )}

        {/* Top Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex justify-between items-start transition-all hover:shadow-md">
              <div className="space-y-1">
                <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">{stat.title}</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="flex flex-col pt-1">
                  <span className={`text-[13px] font-semibold ${stat.color === 'blue' ? 'text-green-600' : 'text-gray-600'}`}>{stat.trend}</span>
                  <span className={`text-[12px] font-medium ${stat.subtextColor || 'text-gray-400'}`}>{stat.subtext}</span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Row */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white pl-1 font-sans">Quick actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className={`${action.bgColor} ${action.textColor} ${action.borderColor} border px-6 py-5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all hover:opacity-80 active:scale-95 shadow-sm`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Needs Attention Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white pl-1 font-sans mb-[10px]">Needs attention</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {needsAttention.map((col, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
                <div className="p-5 flex justify-between items-center border-b border-gray-50 dark:border-slate-800/50">
                  <h3 className="text-[15px] font-bold text-gray-800 dark:text-white">{col.title}</h3>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={col.badgeStyle}
                  >
                    {col.count}
                  </span>
                </div>
                <div className="p-5 space-y-5 flex-grow">
                  {col.items.map((item: any, i: number) => (
                    <div key={i} className="group cursor-pointer">
                      {!isManufacturer ? (
                        <Link href={item.href}>
                          <div className="text-[13px] font-bold text-blue-600 hover:underline mb-1 flex items-center gap-1">
                            {item.id}
                          </div>
                        </Link>
                      ) : (
                        <div className="text-[13px] font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                          {item.id}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-400 mb-1">
                        {['Invoices', 'Shipments'].includes(col.title) ? item.info : `Total Price: ${item.info}`}
                      </div>
                      <div className="text-[11px] text-gray-500 mb-2">Customer PO: {item.customerPo}</div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold  ${item.pillClass}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href={col.href}
                  className="py-4 border-t hover:underline border-gray-50 dark:border-slate-800/50 text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors text-center bg-gray-50/10 dark:bg-slate-800/20"
                >
                  {col.footer}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Spend Section */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">Invoice Spend — Rolling 12 Months</h2>
            <div className="flex items-center gap-6 text-[13px] font-semibold font-sans">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#3b82f6" }}></div>
                <span className="text-gray-600 dark:text-gray-400">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#fbbf24" }}></div>
                <span className="text-gray-600 dark:text-gray-400">Outstanding</span>
              </div>
            </div>
          </div>

          {/* Chart Wrapper */}
          <div className="h-[300px] w-full">
            <canvas ref={chartRef} id="sc" aria-label="Stacked bar chart of invoice spend over rolling 12 months split between paid and outstanding"></canvas>
          </div>
        </div>

      </div>
    </Sidebar>
  );
}
