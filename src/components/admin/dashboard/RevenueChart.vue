<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'
// 🟢 1. IMPORT CONSTANT ĐỂ SO SÁNH ĐÚNG ENUM
import { ORDER_STATUS } from '@/constants/order.constants'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  }
})

// --- LOGIC XỬ LÝ DỮ LIỆU ---
const chartData = computed(() => {
  const last7Days = []
  const revenueData = []

  // Các trạng thái được tính là có doanh thu
  // (Đã hoàn thành hoặc Đã nhận hàng)
  const validStatuses = [ORDER_STATUS.COMPLETED, ORDER_STATUS.RECEIVED]

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)

    // Label trục X (VD: 05/01)
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    last7Days.push(dateStr)

    // Tính tổng tiền
    const dailyTotal = props.orders
      .filter(o => {
        // 🟢 2. SỬA LOGIC LỌC STATUS
        // Nếu status không nằm trong danh sách hợp lệ -> Bỏ qua
        if (!validStatuses.includes(o.status)) return false

        // Kiểm tra ngày tháng năm
        if (!o.createdAt) return false
        const orderDate = new Date(o.createdAt)

        return orderDate.getDate() === d.getDate() &&
               orderDate.getMonth() === d.getMonth() &&
               orderDate.getFullYear() === d.getFullYear() // Thêm check năm cho chắc chắn
      })
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0)

    revenueData.push(dailyTotal)
  }

  // 🟢 3. Debug log để bạn kiểm tra xem dữ liệu đã vào chưa
  console.log('Revenue Data Chart:', revenueData)

  return {
    labels: last7Days,
    datasets: [
      {
        label: 'Doanh thu',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10B981',
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10B981',
        borderWidth: 2,
        fill: true,
        data: revenueData,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 13 },
      bodyFont: { size: 14, weight: 'bold' },
      callbacks: {
        label: (context) => {
          return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.raw)
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f3f4f6' },
      ticks: {
        callback: (value) => {
            // Rút gọn số liệu trục Y (VD: 1.000.000 -> 1M hoặc để nguyên tùy bạn)
            if (value >= 1000000) return (value / 1000000) + 'Tr'
            if (value >= 1000) return (value / 1000) + 'k'
            return value
        }
      }
    },
    x: {
      grid: { display: false }
    }
  }
}
</script>

<template>
  <div class="h-[300px] w-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
