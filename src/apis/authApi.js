// src/api/authApi.js
import api from './index'

const AUTH_ENDPOINT = 'api/users'
const ADMIN_ENDPOINT = 'api/admin'

// Utility: try to extract token from various response shapes
function extractToken(payload) {
  if (!payload) return null
  // common shapes: { token: 'xxx' } OR { data: { token: 'xxx' } } OR payload string
  if (typeof payload === 'string') return payload
  if (payload.token) return payload.token
  if (payload.data && payload.data.token) return payload.data.token
  if (payload.data && typeof payload.data === 'string') return payload.data
  return null
}

/**
 * Login: payload = { email, password } or { username, password }
 * Returns: token string
 */
export async function login(payload) {
  try {
    const r = await api.post(`${AUTH_ENDPOINT}/login`, payload)
    const token = extractToken(r.data)
    if (!token) {
      throw new Error('Không nhận được token từ server.')
    }
    return token
  } catch (err) {
    // normalize error message
    const message =
      err?.response?.data?.message || err?.response?.data || err?.message || 'Đăng nhập thất bại'
    throw new Error(message)
  }
}

export async function register(registerDto) {
  try {
    const r = await api.post(`${AUTH_ENDPOINT}/register`, registerDto)
    // usually backend returns created user or success message
    return r.data
  } catch (err) {
    const message =
      err?.response?.data?.message || err?.response?.data || err?.message || 'Đăng ký thất bại'
    throw new Error(message)
  }
}

export async function getMe() {
  try {
    const r = await api.get(`${AUTH_ENDPOINT}/me`)
    return r.data
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      'Không thể lấy thông tin người dùng.'
    throw new Error(message)
  }
}

export async function updateProfile(data) {
  try {
    const r = await api.put(`${AUTH_ENDPOINT}/me`, data)
    return r.data
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      'Cập nhật thông tin thất bại.'
    throw new Error(message)
  }
}

/**
 * ADMIN: Tải danh sách tất cả người dùng
 * Endpoint giả định: GET /api/users
 * @param {object} params - Tham số truy vấn (ví dụ: { _page: 1, _limit: 10, status: 1 })
 * @returns {Promise<{data: Array<object>, totalCount: number}>} Danh sách người dùng và tổng số (cho phân trang)
 */
export async function fetchAllUsersForAdmin(params = {}) {
  try {
    const response = await api.get(`${ADMIN_ENDPOINT}/users`, { params })

    console.log(`API: Tải ${response.data.length} người dùng cho Admin thành công.`)
    return {
      data: response.data,
      totalCount: response.headers['x-total-count'],
    }
  } catch (error) {
    console.error('❌ Lỗi tải danh sách người dùng Admin:', error.response?.data || error.message)
    throw new Error('Lỗi khi tải danh sách người dùng từ máy chủ.')
  }
}

/**
 * ADMIN: Cập nhật thông tin, vai trò, hoặc trạng thái của người dùng
 * Endpoint giả định: PATCH /api/users/{userId}
 * @param {number|string} userId - ID hoặc PublicId của người dùng cần cập nhật
 * @param {object} updateDto - Dữ liệu cập nhật (ví dụ: { role_id: 2, status: 1, full_name: '...' })
 * @returns {Promise<object>} Người dùng đã được cập nhật
 */
export async function updateUserRoleAndStatus(userId, updateDto) {
  try {
    const response = await api.patch(`${ADMIN_ENDPOINT}/users/${userId}`, updateDto)
    return response.data
  } catch (err) {
    console.error(`❌ Lỗi cập nhật người dùng #${userId}:`, err.response?.data || err.message)
    throw new Error(err.response?.data?.message || 'Không thể cập nhật thông tin người dùng.')
  }
}

/**
 * ADMIN: Xóa người dùng
 * Endpoint giả định: DELETE /api/users/{userId}
 * @param {number|string} userId - ID hoặc PublicId của người dùng cần xóa
 * @returns {Promise<object>} Người dùng đã được xóa
 */
export async function deleteUser(userId) {
  try {
    const response = await api.delete(`${ADMIN_ENDPOINT}/users/${userId}`)
    return response.data
  } catch (err) {
    console.error(`❌ Lỗi xóa người dùng #${userId}:`, err.response?.data || err.message)
    throw new Error(err.response?.data?.message || 'Không thể xóa người dùng.')
  }
}
