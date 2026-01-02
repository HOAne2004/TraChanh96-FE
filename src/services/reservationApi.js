import api from './axiosClient'

const RESERVATION_ENDPOINT = '/api/reservation'

const handleError = (error, actionName) => {
  console.error(`❌ Lỗi khi ${actionName}:`, error.message)
  throw error
}

const reservationApi = {
  // --- CUSTOMER ACTIONS ---

  /**
   * Tạo đơn đặt bàn mới (POST /Reservation)
   * @param {object} bookingData - { storeId, reservationDatetime, numberOfGuests, ... }
   */
  async createReservation(bookingData) {
    try {
      const { data } = await api.post(RESERVATION_ENDPOINT, bookingData)
      return data
    } catch (err) {
      handleError(err, 'tạo đơn đặt bàn')
    }
  },

  /**
   * Lấy chi tiết đơn đặt bàn (GET /Reservation/:id)
   * @param {number|string} id
   */
  async fetchReservationById(id) {
    try {
      const { data } = await api.get(`${RESERVATION_ENDPOINT}/${id}`)
      return data
    } catch (err) {
      handleError(err, `lấy đơn đặt bàn ID ${id}`)
    }
  },

  /**
   * Lấy lịch sử đặt bàn của tôi (GET /Reservation/my-history)
   * Yêu cầu: Đã đăng nhập (Token tự động đính kèm qua interceptor)
   */
  async fetchMyHistory() {
    try {
      const { data } = await api.get(`${RESERVATION_ENDPOINT}/my-history`)
      return data
    } catch (err) {
      handleError(err, 'lấy lịch sử đặt bàn')
    }
  },

  /**
   * Khách hàng tự hủy đơn (PUT /Reservation/:id/cancel)
   * @param {number|string} id
   */
  async cancelReservation(id) {
    try {
      const { data } = await api.put(`${RESERVATION_ENDPOINT}/${id}/cancel`)
      return data
    } catch (err) {
      handleError(err, `hủy đơn đặt bàn ID ${id}`)
    }
  },

  // --- ADMIN / STAFF ACTIONS ---

  /**
   * Admin lấy danh sách đặt bàn theo Store (GET /Reservation/store/:storeId)
   * @param {number} storeId
   * @param {string|Date} dateFilter - (Optional) Lọc theo ngày
   */
  async fetchReservationsByStore(storeId, dateFilter = null) {
    try {
      // Axios hỗ trợ truyền params qua object config
      const config = {
        params: {},
      }
      if (dateFilter) {
        config.params.date = dateFilter // Backend sẽ nhận ?date=yyyy-MM-dd
      }

      const { data } = await api.get(`${RESERVATION_ENDPOINT}/store/${storeId}`, config)
      return data
    } catch (err) {
      handleError(err, `lấy danh sách đặt bàn của store ID ${storeId}`)
    }
  },

  /**
   * Admin cập nhật trạng thái hoặc gán bàn (PUT /Reservation/:id)
   * @param {number|string} id
   * @param {object} updateData - { status, assignedTableId, note }
   */
  async updateReservation(id, updateData) {
    try {
      const { data } = await api.put(`${RESERVATION_ENDPOINT}/${id}`, updateData)
      return data
    } catch (err) {
      handleError(err, `cập nhật đơn đặt bàn ID ${id}`)
    }
  },

  /**
   * Admin xác nhận đã nhận tiền cọc (PUT /Reservation/:id/confirm-deposit)
   * @param {number|string} id
   */
  async confirmDeposit(id) {
    try {
      const { data } = await api.put(`${RESERVATION_ENDPOINT}/${id}/confirm-deposit`)
      return data
    } catch (err) {
      handleError(err, `xác nhận tiền cọc đơn ID ${id}`)
    }
  },
}

export default reservationApi
