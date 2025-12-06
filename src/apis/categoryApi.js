// src/api/categoryApi.js

import api from './index' // Axios instance đã cấu hình
const API_ENDPOINT = 'api/categories' // Không cần vì Controller đã tự đặt tên

const handleError = (error, name) => {
  const message = error.response?.data?.message || error.message || `Lỗi ${name} không xác định.`
  throw new Error(message)
}

/**
 * Lấy danh sách phẳng (GET /api/categories)
 */
export async function fetchFlatCategories(params = {}) {
  try {
    const response = await api.get(API_ENDPOINT, { params })
    return response.data
  } catch (err) {
    handleError(err, 'tải danh mục')
  }
}

/**
 * Lấy danh sách dạng cây (GET /api/categories/tree)
 */
export async function fetchCategoryTree(params = {}) {
  try {
    const response = await api.get(API_ENDPOINT + '/tree', { params })
    return response.data
  } catch (err) {
    handleError(err, 'tải cây danh mục')
  }
}

/**
 * Tạo danh mục (POST /api/categories)
 */
export async function createCategory(categoryDto) {
  try {
    const response = await api.post(API_ENDPOINT, categoryDto)
    return response.data
  } catch (err) {
    handleError(err, 'tạo danh mục')
  }
}

/**
 * Xóa danh mục (DELETE /api/categories/{id})
 */
export async function deleteCategory(id) {
  try {
    await api.delete(`${API_ENDPOINT}/${id}`)
    return true
  } catch (err) {
    handleError(err, 'xóa danh mục')
  }
}

// TODO: Thêm hàm updateCategory và fetchCategoryById
export async function updateCategory(id, categoryDto) {
  try {
    const response = await api.put(`${API_ENDPOINT}/${id}`, categoryDto)
    return response.data
  } catch (err) {
    handleError(err, 'cập nhật danh mục')
  }
}

/**
 * Lấy chi tiết một danh mục theo id (GET /api/categories/{id})
 */
export async function fetchCategoryById(id) {
  try {
    const response = await api.get(`${API_ENDPOINT}/${id}`)
    return response.data
  } catch (err) {
    handleError(err, 'lấy thông tin danh mục')
  }
}

export async function checkCategoryUsage(id) {
  try {
    const { data } = await api.get(`${API_ENDPOINT}/${id}/usage`)
    return data.count
  } catch (error) {
    return 0
  }
}
