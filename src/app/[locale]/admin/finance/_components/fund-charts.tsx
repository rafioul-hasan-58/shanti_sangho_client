"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Fund, MonthlyFlow } from "@/lib/api/finance";
import { formatMoney } from "@/lib/format";
import { BarChart3, TrendingUp } from "lucide-react";

interface FundChartsProps {
  funds: Fund[];
  monthlyFlow: MonthlyFlow[];
  isBn?: boolean;
}

// Custom tooltip for money formatting
function CustomTooltip({ active, payload, label, isBn }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-neutral-900/95 text-white border border-neutral-800 shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-bold text-slate-200 border-b border-neutral-800 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => {
          const isIncome = entry.dataKey === "in" || entry.dataKey === "totalIn";
          const isExpense = entry.dataKey === "out" || entry.dataKey === "totalOut";
          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span
                className={`font-black tabular-nums ${
                  isIncome ? "text-emerald-400" : isExpense ? "text-rose-400" : "text-amber-400"
                }`}
              >
                {formatMoney(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

export function FundCharts({ funds, monthlyFlow, isBn = false }: FundChartsProps) {
  // Format spending by fund data
  const spendingData = funds.map((f) => ({
    name: f.name,
    spent: f.totalOut,
    raised: f.totalIn,
    remaining: f.remaining,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Spending by Fund Bar Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-[#f42a41]">
              <BarChart3 className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                {isBn ? "তহবিল অনুযায়ী ব্যয় বণ্টন" : "Spending by Fund"}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isBn
                  ? "কোন খাতে মোট কত টাকা ব্যয় হয়েছে"
                  : "Total expenditures distributed across funds"}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spendingData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip isBn={isBn} />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
              />
              <Bar
                name={isBn ? "ব্যয়িত" : "Spent"}
                dataKey="spent"
                fill="#f42a41"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                name={isBn ? "অবশিষ্ট" : "Remaining"}
                dataKey="remaining"
                fill="#006a4e"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Last 6 Months In vs Out Area Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#006a4e]">
              <TrendingUp className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                {isBn ? "গত ৬ মাসের আয় বনাম ব্যয়" : "Last 6 Months: In vs Out"}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isBn
                  ? "তহবিলে অর্থ সংগ্রহ ও খরচের মাসিক তুলনামূলক চিত্র"
                  : "Monthly cash inflows vs expenditures trend"}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyFlow}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006a4e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#006a4e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f42a41" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f42a41" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip isBn={isBn} />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="in"
                name={isBn ? "অর্থ সংগ্রহ (In)" : "Raised (In)"}
                stroke="#006a4e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorIn)"
              />
              <Area
                type="monotone"
                dataKey="out"
                name={isBn ? "ব্যয় (Out)" : "Spent (Out)"}
                stroke="#f42a41"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorOut)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
