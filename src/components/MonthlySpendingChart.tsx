"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface MonthlySpendingData {
  month: string;
  amount: number;
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
  pointBackgroundColor: string;
  pointBorderColor: string;
  pointRadius: number;
  pointHoverRadius: number;
}

interface MonthlySpendingChartProps {
  data: MonthlySpendingData[];
  datasets?: Dataset[];
  containerless?: boolean;
}

export default function MonthlySpendingChart({
  data,
  datasets,
  containerless = false,
}: MonthlySpendingChartProps) {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: datasets || [
      {
        label: "Monthly Spending",
        data: data.map((item) => item.amount),
        borderColor: "#4e008e", // primary-500
        backgroundColor: "rgba(78, 0, 142, 0.1)", // primary-500 with opacity
        fill: true,
        pointBackgroundColor: "#4e008e", // primary-500
        pointBorderColor: "#4e008e", // primary-500
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgb(44, 0, 82)", // primary-700
          font: {
            size: 12,
          },
          padding: 16,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "rgb(44, 0, 82)", // primary-700
        bodyColor: "rgb(44, 0, 82)", // primary-700
        borderColor: "rgba(115, 115, 115, 0.2)", // accent-700 with opacity
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (tooltipItem: TooltipItem<"line">) {
            return `${tooltipItem.dataset.label || 'Data'}: $${tooltipItem.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(115, 115, 115, 0.1)", // accent-700 with opacity
        },
        ticks: {
          callback: function (tickValue: number | string) {
            return `$${tickValue}`;
          },
          color: "rgb(44, 0, 82)", // primary-700
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(115, 115, 115, 0.1)", // accent-700 with opacity
        },
        ticks: {
          color: "rgb(44, 0, 82)", // primary-700
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5,
        hitRadius: 10,
      },
      line: {
        tension: 0.4,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Render without container styling when used in analytics (containerless mode)
  if (containerless) {
    return (
      <div className="h-full w-full">
        <Line data={chartData} options={options} />
      </div>
    );
  }

  // Default render with container styling for standalone use
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 border border-secondary-100">
      <div className="h-[250px] sm:h-[300px] lg:h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
