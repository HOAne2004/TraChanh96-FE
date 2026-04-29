// 1. Import trực tiếp các ảnh fallback từ thư mục assets
// (Vite sẽ tự động xử lý đường dẫn tối ưu khi build)
import defaultDrink from '@/assets/images/others/default-drink.png';
import defaultStore from '@/assets/images/others/default-store.png';
import defaultNews from '@/assets/images/others/default-news.jpg';
import error404 from '@/assets/images/others/error-404.png';

// 2. Map các loại ảnh để dễ gọi
const fallbacks = {
  drink: defaultDrink,
  store: defaultStore,
  news: defaultNews,
  default: error404,
};

/**
 * Vue Custom Directive để xử lý ảnh lỗi
 * Cách dùng: <img src="..." v-img-fallback="'drink'" />
 */
export const imageFallbackDirective = {
  // Hook mounted chạy khi thẻ <img> được render ra DOM
  mounted(el, binding) {
    // Lấy loại fallback truyền vào (vd: 'drink', 'store'), nếu không có thì dùng 'default'
    const category = binding.value || 'default';

    // Gắn sự kiện lắng nghe lỗi tải ảnh
    el.addEventListener('error', function handleError() {
      // Bảo vệ chống lặp vô hạn (Infinite Loop):
      // Nếu chính ảnh fallback cũng bị lỗi mạng, không cố load lại nữa
      if (el.getAttribute('data-is-fallback') === 'true') {
        return;
      }

      // Đánh dấu thẻ này đang dùng ảnh fallback
      el.setAttribute('data-is-fallback', 'true');

      // Thay thế src bị lỗi bằng ảnh mặc định tương ứng
      el.src = fallbacks[category] || fallbacks.default;
    });
  },

  // Hook updated cần thiết cho các trang SPA (Single Page App)
  // khi dữ liệu thay đổi nhưng thẻ img không bị destroy và recreate
  updated(el, binding) {
    if (el.src && el.src !== (fallbacks[binding.value || 'default'])) {
       // Xóa cờ fallback nếu URL ảnh chính thức thay đổi (vd: chọn sản phẩm khác)
       el.removeAttribute('data-is-fallback');
    }
  }
};
