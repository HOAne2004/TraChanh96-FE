<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'

// Đăng ký các thành phần cần thiết cho Bar Chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  products: {
    type: Array,
    default: () => [] // Nhận vào danh sách bestSellingProducts từ Store
  }
})

const chartData = computed(() => {
  // Lấy Top 5 để hiển thị cho đẹp trên giao diện dashboard (dù store trả về 10)
  const topProducts = props.products.slice(0, 5)

  return {
    labels: topProducts.map(p => {
      // Cắt ngắn tên nếu quá dài để không bị vỡ giao diện
      return p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name
    }),
    datasets: [
      {
        label: 'Đã bán (Ly/Cốc)',
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',  // Đỏ
          'rgba(54, 162, 235, 0.7)',  // Xanh dương
          'rgba(255, 206, 86, 0.7)',  // Vàng
          'rgba(75, 192, 192, 0.7)',  // Xanh ngọc
          'rgba(153, 102, 255, 0.7)', // Tím
        ],
        borderRadius: 6, // Bo tròn góc cột
        data: topProducts.map(p => p.totalSold || 0)
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // 'y' để làm biểu đồ Ngang (dễ đọc tên món), bỏ dòng này nếu muốn biểu đồ Dọc
  plugins: {
    legend: { display: false }, // Ẩn chú thích vì tiêu đề đã rõ
    tooltip: {
      callbacks: {
        label: (context) => `Đã bán: ${context.raw} sản phẩm`
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { display: true }
    },
    y: {
      grid: { display: false } // Ẩn lưới trục Y cho thoáng
    }
  }
}
</script>

<template>
  <div class="h-[300px] w-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
