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

// Đăng ký các thành phần của Chart.js
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
// Chuyển đổi list Order thô thành dữ liệu cho biểu đồ
const chartData = computed(() => {
  const last7Days = []
  const revenueData = []

  // 1. Tạo mảng 7 ngày gần nhất (Label trục X)
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    // Format: DD/MM
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    last7Days.push(dateStr)

    // 2. Tính tổng tiền cho ngày này
    // Lưu ý: Cần so sánh ngày tháng năm chính xác
    const dailyTotal = props.orders
      .filter(o => {
        if (o.status !== 'Completed' && o.status !== 'Delivered') return false
        const orderDate = new Date(o.createdAt) // Giả sử BE trả về createdAt
        return orderDate.getDate() === d.getDate() &&
               orderDate.getMonth() === d.getMonth()
      })
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0)

    revenueData.push(dailyTotal)
  }

  return {
    labels: last7Days,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)', // Màu xanh lá mờ (Tailwind Green-500)
        borderColor: '#10B981', // Màu xanh lá đậm
        pointBackgroundColor: '#10B981',
        borderWidth: 2,
        fill: true, // Tô màu vùng dưới đường
        data: revenueData,
        tension: 0.4 // Làm mềm đường cong
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, // Ẩn chú thích nếu chỉ có 1 đường
    tooltip: {
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
      grid: { color: '#e5e7eb' } // Màu lưới xám nhạt
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
