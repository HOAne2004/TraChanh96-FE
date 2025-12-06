import api from '.'

// ⭐️ THAY ĐỔI: Đổi tên biến để rõ ràng hơn
const PRODUCTS_API = 'api/products'
const CATEGORIES_API = 'api/categories'
const SIZES_API = 'api/sizes'
const SUGAR_LEVELS_API = 'api/sugarLevels'
const ICE_LEVELS_API = 'api/iceLevels'

const handleError = (error, name) => {
  console.error(`❌ Lỗi khi fetch ${name}:`, error.message)
  throw error // Đẩy lỗi lên để Store có thể bắt
}

const productApi = {
  /**
   * Lấy các sản phẩm chính (Đồ uống/Bánh), KHÔNG bao gồm Topping
   */
  async fetchProducts() {
    try {
      // ⭐️ THAY ĐỔI: Lọc để chỉ lấy sản phẩm chính (Giả định type là 'Beverage')
      // (Bạn cần kiểm tra CSDL của mình xem product_type chính xác là gì)
      const { data } = await api.get(PRODUCTS_API, {
        params: { product_type: 'Beverage' }, // Hoặc bất kỳ type nào không phải 'Topping'
      })
      return data
    } catch (err) {
      handleError(err, 'products')
    }
  },

  /**
   * Lấy danh mục (Không đổi)
   */
  async fetchCategories() {
    try {
      // ⭐️ KHÔNG ĐỔI: Endpoint này đã khớp với CategoriesController
      const { data } = await api.get(CATEGORIES_API)
      return data
    } catch (err) {
      handleError(err, 'categories')
    }
  },

  /**
   * Lấy tất cả các tùy chọn (Topping, Size, Sugar, Ice)
   */
  async fetchProductOptions() {
    try {
      const responses = await Promise.all([
        // ⭐️ THAY ĐỔI: Lấy Topping bằng cách lọc từ /products
        api.get(PRODUCTS_API, { params: { product_type: 'Topping' } }),
        // ⭐️ KHÔNG ĐỔI: Các endpoint này đã khớp với C# Controllers
        api.get(SIZES_API),
        api.get(SUGAR_LEVELS_API),
        api.get(ICE_LEVELS_API),
      ])
      return {
        toppings: responses[0].data,
        sizes: responses[1].data,
        sugarLevels: responses[2].data,
        iceLevels: responses[3].data,
      }
    } catch (err) {
      handleError(err, 'product options')
    }
  },

  // --- ADMIN CRUD ACTIONS ---

  /**
   * TẠO: Tạo sản phẩm mới (POST /products)
   */
  async createProduct(productData) {
    try {
      const { data } = await api.post(PRODUCTS_API, productData)
      return data
    } catch (err) {
      handleError(err, 'tạo sản phẩm mới')
    }
  },

  /**
   * CẬP NHẬT: Cập nhật thông tin sản phẩm (PUT /products/:id)
   */
  async updateProduct(id, productData) {
    try {
      // ⭐️ THAY ĐỔI: Đảm bảo C# Controller (HttpPut) nhận đúng DTO
      const { data } = await api.put(`${PRODUCTS_API}/${id}`, productData)
      return data
    } catch (err) {
      handleError(err, `cập nhật sản phẩm ID ${id}`)
    }
  },

  /**
   * XÓA: Xóa sản phẩm (DELETE /products/:id)
   */
  async deleteProduct(id) {
    try {
      await api.delete(`${PRODUCTS_API}/${id}`)
      return true
    } catch (err) {
      handleError(err, `xóa sản phẩm ID ${id}`)
    }
  },

  // ⭐️ CRUD SIZE
  async createSize(sizeDto) {
    const { data } = await api.post(SIZES_API, sizeDto)
    return data
  },
  async updateSize(id, sizeDto) {
    const { data } = await api.put(`${SIZES_API}/${id}`, sizeDto)
    return data
  },
  async deleteSize(id) {
    await api.delete(`${SIZES_API}/${id}`)
    return true
  },

  // ⭐️ CRUD ICE LEVEL
  async createIceLevel(iceLevelDto) {
    const { data } = await api.post(ICE_LEVELS_API, iceLevelDto)
    return data
  },
  async updateIceLevel(id, iceLevelDto) {
    const { data } = await api.put(`${ICE_LEVELS_API}/${id}`, iceLevelDto)
    return data
  },
  async deleteIceLevel(id) {
    await api.delete(`${ICE_LEVELS_API}/${id}`)
    return true
  },

  // ⭐️ CRUD SUGAR LEVEL
  async createSugarLevel(sugarLevelDto) {
    const { data } = await api.post(SUGAR_LEVELS_API, sugarLevelDto)
    return data
  },
  async updateSugarLevel(id, sugarLevelDto) {
    const { data } = await api.put(`${SUGAR_LEVELS_API}/${id}`, sugarLevelDto)
    return data
  },
  async deleteSugarLevel(id) {
    await api.delete(`${SUGAR_LEVELS_API}/${id}`)
    return true
  },
  // 🆕 API Check Usage cho Option (Size/Sugar/Ice)
  // type: 'Sizes', 'SugarLevels', 'IceLevels' (khớp tên Controller)
  async checkOptionUsage(type, id) {
    try {
        // Gọi: GET /api/Sizes/1/usage
        const { data } = await api.get(`/${type}/${id}/usage`)
        return data.count
    } catch (error) {
        return 0; // Nếu lỗi coi như là 0 để không chặn user
    }
  }
}

export default productApi
