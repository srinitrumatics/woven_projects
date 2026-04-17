"use client";

import { useEffect, useRef } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import { Chart, registerables } from "chart.js";
import {
  ShoppingBag,
  FileText,
  Package,
  ClipboardList,
  Truck,
  BarChart3,
} from "lucide-react";

export default function Program360Page() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    Chart.register(...registerables);

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
        datasets: [
          {
            label: "Paid",
            data: [41000, 38000, 44000, 36000, 50000, 42000, 34000, 38000, 25000, 44000, 39000, 11000],
            backgroundColor: "#3b82f6",
            borderRadius: 4,
            stack: "a"
          },
          {
            label: "Outstanding",
            data: [3000, 2000, 5000, 4000, 6000, 3000, 4000, 4000, 4000, 7000, 6000, 8000],
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
              callback: (v: any) => "$" + (v / 1000).toFixed(0) + "k"
            }
          }
        }
      }
    });

    return () => {
      myChart.destroy();
    };
  }, []);

  const stats = [
    {
      title: "Open Orders",
      value: "24",
      trend: "+12% from last month",
      subtext: "3 pending approval",
      icon: ShoppingBag,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Pending Invoices",
      value: "8",
      trend: "$45,230.00 total",
      subtext: "2 overdue > 30 days",
      subtextColor: "text-red-500",
      icon: FileText,
      color: "yellow",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      title: "On Hand Inventory",
      value: "156",
      trend: "$284,500 total value",
      subtext: "Across 12 locations",
      icon: Package,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Pending Quotes",
      value: "12",
      trend: "$128,450.00 pipeline",
      subtext: "4 expiring in 7 days",
      subtextColor: "text-orange-500",
      icon: ClipboardList,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  const quickActions = [
    { label: "New Order", icon: ShoppingBag, bgColor: "bg-blue-50", textColor: "text-blue-700", borderColor: "border-blue-100" },
    { label: "View Proposals", icon: FileText, bgColor: "bg-green-50", textColor: "text-green-700", borderColor: "border-green-100" },
    { label: "View Quotes", icon: ClipboardList, bgColor: "bg-purple-50", textColor: "text-purple-700", borderColor: "border-purple-100" },
    { label: "Track Shipments", icon: Truck, bgColor: "bg-orange-50", textColor: "text-orange-700", borderColor: "border-orange-100" },
    { label: "View Invoices", icon: FileText, bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-100" },
    { label: "View Reports", icon: BarChart3, bgColor: "bg-gray-50", textColor: "text-gray-700", borderColor: "border-gray-200" },
  ];

  const needsAttention = [
    {
      title: "Orders in Draft",
      count: 2,
      badgeStyle: { background: "#dbeafe", color: "#1d4ed8" },
      items: [
        { id: "ORD-1009", info: "18 days — no activity", status: "Draft", pillClass: "bg-[#fff7ed] text-[#9a3412]" },
        { id: "ORD-1012", info: "26 days — incomplete", status: "Draft", pillClass: "bg-[#fff7ed] text-[#9a3412]" },
        { id: "ORD-1014", info: "7 days — pending items", status: "Draft", pillClass: "bg-[#fff7ed] text-[#9a3412]" },
      ],
      footer: "View all draft orders"
    },
    {
      title: "Proposals",
      count: 2,
      badgeStyle: { background: "#dbeafe", color: "#1d4ed8" },
      items: [
        { id: "PRO-0047", info: "Sent 9 days — no response", status: "Client Review", pillClass: "bg-[#eff6ff] text-[#1e40af]" },
        { id: "PRO-0051", info: "Sent 14 days — follow-up due", status: "Client Review", pillClass: "bg-[#eff6ff] text-[#1e40af]" },
      ],
      footer: "View all proposals"
    },
    {
      title: "Quotes",
      count: 4,
      badgeStyle: { background: "#fef3c7", color: "#92400e" },
      items: [
        { id: "QTE-0089 — $34,000", info: "Expires in 3 days", status: "Expiring", pillClass: "bg-[#fff7ed] text-[#9a3412]" },
        { id: "QTE-0085 — $18,200", info: "Submitted 11 days ago", status: "Submitted", pillClass: "bg-[#f9fafb] text-[#4b5563]" },
        { id: "QTE-0081 — $9,750", info: "Submitted 19 days ago", status: "Submitted", pillClass: "bg-[#f9fafb] text-[#4b5563]" },
      ],
      footer: "View all submitted quotes"
    },
    {
      title: "Invoices",
      count: 2,
      badgeStyle: { background: "#fee2e2", color: "#b91c1c" },
      items: [
        { id: "INV-2041 — $12,800", info: "Overdue 32 days", status: "Past Due", pillClass: "bg-[#fef2f2] text-[#991b1b]" },
        { id: "INV-2038 — $6,420", info: "Overdue 41 days", status: "Past Due", pillClass: "bg-[#fef2f2] text-[#991b1b]" },
      ],
      footer: "View all past due invoices"
    },
    {
      title: "Shipments",
      count: 3,
      badgeStyle: { background: "#dcfce7", color: "#166534" },
      items: [
        { id: "SHP-3301 — ORD-1007", info: "4 days past ETA", status: "Delayed", pillClass: "bg-[#fef2f2] text-[#991b1b]" },
        { id: "SHP-3298 — ORD-1006", info: "Arrives tomorrow", status: "On Track", pillClass: "bg-[#f0fdf4] text-[#166534]" },
        { id: "SHP-3295 — ORD-1005", info: "In transit — 2 days out", status: "On Track", pillClass: "bg-[#f0fdf4] text-[#166534]" },
      ],
      footer: "View all shipments"
    }
  ];

  return (
    <Sidebar>
      <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-gray-50/50 min-h-screen">

        {/* Top Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-start transition-all hover:shadow-md">
              <div className="space-y-1">
                <h3 className="text-gray-500 font-medium text-sm">{stat.title}</h3>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
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
          <h2 className="text-sm font-bold text-gray-900  pl-1 font-sans">Quick actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className={`${action.bgColor} ${action.textColor} ${action.borderColor} border px-10 py-5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all hover:opacity-80 active:scale-95 shadow-sm`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Needs Attention Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900  pl-1 font-sans mb-[10px]">Needs attention</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {needsAttention.map((col, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                <div className="p-5 flex justify-between items-center border-b border-gray-50">
                  <h3 className="text-[15px] font-bold text-gray-800">{col.title}</h3>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={col.badgeStyle}
                  >
                    {col.count}
                  </span>
                </div>
                <div className="p-5 space-y-5 flex-grow">
                  {col.items.map((item, i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="text-[13px] font-bold text-blue-600 hover:underline mb-1 flex items-center gap-1">
                        {item.id}
                      </div>
                      <div className="text-[11px] text-gray-400 mb-2">{item.info}</div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold  ${item.pillClass}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="p-4 border-t border-gray-50 text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors text-center bg-gray-50/10">
                  {col.footer}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Spend Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-[14px] font-bold text-gray-900">Invoice spend — rolling 12 months</h2>
            <div className="flex items-center gap-6 text-[13px] font-semibold font-sans">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#3b82f6" }}></div>
                <span className="text-gray-600">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#fbbf24" }}></div>
                <span className="text-gray-600">Outstanding</span>
              </div>
              <button className="text-blue-600 hover:underline text-sm font-sans">Full report</button>
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
