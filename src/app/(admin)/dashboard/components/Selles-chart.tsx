'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface SalesData {
  date: string
  sales: number
}

interface SalesChartProps {
  data: SalesData[]
}

const SalesChart = ({ data }: SalesChartProps) => {
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: 'Penjualan',
        data: data.map((item) => item.sales),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          },
        },
      },
    },
  }

  return <Line data={chartData} options={options} />
}

export default SalesChart
