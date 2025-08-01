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
}

export default function MonthlySpendingChart({
  data,
  datasets,
}: MonthlySpendingChartProps) {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: datasets || [
      {
        label: "Monthly Spending",
        data: data.map((item) => item.amount),
        borderColor: "#4e008e", // primary-500
        backgroundColor: "rgba(78, 0, 142, 0.1)", // primary-500 with opacity
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#4e008e", // primary-500
        pointBorderColor: "#4e008e", // primary-500
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: datasets !== undefined,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Spending",
        color: "rgb(44, 0, 82)", // primary-700
        font: {
          size: 16,
          weight: "bold" as const,
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
        },
      },
      x: {
        grid: {
          color: "rgba(115, 115, 115, 0.1)", // accent-700 with opacity
        },
        ticks: {
          color: "rgb(44, 0, 82)", // primary-700
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-secondary-100">
      <div className="h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
