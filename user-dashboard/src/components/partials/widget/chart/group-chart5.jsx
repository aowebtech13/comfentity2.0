import React from "react";
import { colors } from "@/constant/data";
import Chart from "react-apexcharts";

const columnCharthome3 = {
  series: [
    {
      name: "Revenue",
      data: [40, 70, 45, 100, 75, 40, 80, 90],
    },
  ],
  options: {
    chart: {
      toolbar: {
        show: false,
      },
      offsetX: 0,
      offsetY: 0,
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "60px",
        barHeight: "100%",
      },
    },
    legend: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },

    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val + "k";
        },
      },
    },
    yaxis: {
      show: false,
    },
    xaxis: {
      show: false,
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    colors: [colors.info],
    grid: {
      show: false,
    },
  },
};

const columnCharthome4 = {
  series: [
    {
      name: "Revenue",
      data: [40, 70, 45, 100, 75, 40, 80, 90],
    },
  ],
  options: {
    chart: {
      toolbar: {
        show: false,
      },
      offsetX: 0,
      offsetY: 0,
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "60px",
        barHeight: "100%",
      },
    },
    legend: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },

    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val + "k";
        },
      },
    },
    yaxis: {
      show: false,
    },
    xaxis: {
      show: false,
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    colors: [colors.success],
    grid: {
      show: false,
    },
  },
};

/**
 * Format a number as a currency string.
 */
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "$0.00";
  }
  return `$${parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * GroupChart5 — displays balance summary cards.
 *
 * Accepts an optional `stats` prop from the backend `/dashboard-data` endpoint.
 * When stats are not provided (e.g. loading or fallback), the component
 * renders placeholder values.
 *
 * Props:
 *   stats: {
 *     balance: number,
 *     total_profit: number,
 *     total_invested: number,
 *     active_investments_count: number,
 *     total_referral_earnings: number,
 *   }
 */
const GroupChart5 = ({ stats }) => {
  const balance = stats?.balance ?? 0;
  const totalProfit = stats?.total_profit ?? 0;

  const displayStats = [
    {
      name: columnCharthome3,
      title: "Current balance",
      count: formatCurrency(balance),
      bg: "bg-[#E5F9FF] dark:bg-slate-900",
      text: "text-info-500",
      icon: "heroicons:shopping-cart",
    },
    {
      name: columnCharthome4,
      title: "Total profit",
      count: formatCurrency(totalProfit),
      bg: "bg-[#E5F9FF] dark:bg-slate-900",
      text: "text-success-500",
      icon: "heroicons:cube",
    },
  ];

  return (
    <>
      {displayStats.map((item, i) => (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-sm p-4" key={i}>
          <div className="text-slate-600 dark:text-slate-400 text-sm mb-1 font-medium">
            {item.title}
          </div>
          <div className="text-slate-900 dark:text-white text-lg font-medium">
            {item.count}
          </div>
          <div className="ml-auto max-w-[124px]">
            <Chart
              options={item.name.options}
              series={item.name.series}
              type="bar"
              height="48"
              width="124"
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default GroupChart5;
