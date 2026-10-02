import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { colors } from "@/constant/data";
import useDarkMode from "@/hooks/useDarkMode";

/**
 * HistoryChart — area chart showing earnings vs expenses over time.
 *
 * Accepts an optional `transactions` prop (array of backend transaction
 * objects with `amount` and `created_at` fields). When transactions are
 * provided, the chart series and x-axis categories are derived from the
 * actual data. When not provided, falls back to sample data.
 *
 * Props:
 *   transactions: Array<{ amount: number, created_at: string }>
 *   height: number (default 360)
 */
const HistoryChart = ({ transactions = [], height = 360 }) => {
  const [isDark] = useDarkMode();

  const { series, categories } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        series: [
          {
            name: "Earnings",
            data: [31, 40, 28, 51, 42, 109, 100],
          },
          {
            name: "Expenses",
            data: [11, 32, 45, 32, 34, 52, 41],
          },
        ],
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z",
        ],
      };
    }

    // Sort transactions by date ascending
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    const earnings = [];
    const expenses = [];
    const cats = [];

    sorted.forEach((tx) => {
      const amount = parseFloat(tx.amount) || 0;
      const date = tx.created_at
        ? new Date(tx.created_at).toISOString()
        : new Date().toISOString();
      cats.push(date);
      if (amount >= 0) {
        earnings.push(amount);
        expenses.push(0);
      } else {
        earnings.push(0);
        expenses.push(Math.abs(amount));
      }
    });

    return {
      series: [
        {
          name: "Earnings",
          data: earnings,
        },
        {
          name: "Expenses",
          data: expenses,
        },
      ],
      categories: cats,
    };
  }, [transactions]);

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
      offsetX: 0,
      offsetY: 0,
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: 2,
    },
    colors: [colors.primary, colors.warning],
    tooltip: {
      theme: "dark",
    },
    legend: {
      offsetY: 4,
      show: true,
      fontSize: "12px",
      fontFamily: "Inter",
      labels: {
        colors: isDark ? "#CBD5E1" : "#475569",
      },
      markers: {
        width: 6,
        height: 6,
        offsetY: 0,
        offsetX: -5,
        radius: 12,
      },
      itemMargin: {
        horizontal: 18,
        vertical: 0,
      },
    },
    grid: {
      show: true,
      borderColor: isDark ? "#334155" : "#e2e8f0",
      strokeDashArray: 10,
      position: "back",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.3,
        opacityFrom: 0.4,
        opacityTo: 0.5,
        stops: [0, 30, 0],
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
    },
    xaxis: {
      type: "datetime",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
    },
  };
  return (
    <>
      <Chart options={options} series={series} type="area" height={height} />
    </>
  );
};

export default HistoryChart;
