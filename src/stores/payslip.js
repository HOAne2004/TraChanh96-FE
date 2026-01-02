// src/stores/payslip.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import payslipService from '@/services/payslip.service'

export const usePayslipStore = defineStore('payslip', () => {
  // --- STATE ---
  const payslips = ref([])
  const currentPayslip = ref(null) // Dùng cho Modal chỉnh sửa/chi tiết
  const loading = ref(false)
  const error = ref(null)

  // --- COMPUTED ---

  /**
   * Tổng quỹ lương thực lĩnh của danh sách hiện tại
   * Dùng để hiển thị thống kê nhanh: "Tổng chi lương tháng này: ..."
   */
  const totalPayroll = computed(() => {
    return payslips.value.reduce((sum, p) => sum + (p.finalSalary || 0), 0)
  })

  // --- ACTIONS ---

  /**
   * Lấy danh sách phiếu lương
   * @param {Object} params - { storeId: 1, month: 12, year: 2025 }
   */
  async function fetchPayslips(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await payslipService.getAll(params)
      payslips.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách lương'
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy chi tiết
   */
  async function fetchPayslipDetail(id) {
    loading.value = true
    error.value = null
    try {
      const response = await payslipService.getById(id)
      currentPayslip.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi tải chi tiết'
    } finally {
      loading.value = false
    }
  }

  /**
   * Tính lương (Generate)
   */
  async function generatePayslipAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await payslipService.generate(createDto)

      // Tính xong reload lại danh sách theo tháng/năm của nhân viên đó
      await fetchPayslips({
        storeId: createDto.storeId, // Lưu ý: DTO cần có storeId hoặc lấy từ context
        month: createDto.month,
        year: createDto.year
      })
      return true
    } catch (err) {
      // BE sẽ báo lỗi nếu phiếu lương tháng đó đã tồn tại
      error.value = err.response?.data?.message || err.response?.data || 'Tính lương thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật phiếu lương
   */
  async function updatePayslipAction(id, updateDto, currentFilters = {}) {
    loading.value = true
    error.value = null
    try {
      await payslipService.update(id, updateDto)
      // Update xong reload lại list
      await fetchPayslips(currentFilters)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa phiếu lương
   */
  async function deletePayslipAction(id, currentFilters = {}) {
    if (!confirm('Bạn có chắc chắn muốn xóa phiếu lương này?')) return

    loading.value = true
    error.value = null
    try {
      await payslipService.delete(id)
      await fetchPayslips(currentFilters)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    payslips,
    currentPayslip,
    totalPayroll,
    loading,
    error,
    fetchPayslips,
    fetchPayslipDetail,
    generatePayslipAction,
    updatePayslipAction,
    deletePayslipAction
  }
})
