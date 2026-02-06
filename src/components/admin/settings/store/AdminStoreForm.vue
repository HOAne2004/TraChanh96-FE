<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  storeStatusOptions: {
    type: Array,
    default: () => [],
  },
  hasAddress: {
    type: Boolean,
    default: false,
  },
  uploadLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:form', 'image-upload', 'address-modal', 'submit', 'back'])

function updateField(key, value) {
  emit('update:form', key, value)
}

function handleImageChange(event) {
  const file = event.target.files[0]
  if (!file) return
  emit('image-upload', file)
}

function handleSubmit() {
  emit('submit')
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div
      class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0"
    >
      <div>
        <button
          @click="emit('back')"
          class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại
        </button>
        <h1 class="text-lg font-bold text-gray-800">
          {{ isEditMode ? 'Cập nhật cửa hàng' : 'Thêm cửa hàng mới' }}
        </h1>
      </div>
      <button @click="handleSubmit" :disabled="isLoading" class="save-btn">
        <svg v-if="isLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {{ isEditMode ? 'Lưu thay đổi' : 'Tạo cửa hàng' }}
      </button>
    </div>

    <!-- Form Content -->
    <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Thông tin chung -->
        <div class="space-y-4">
          <h3 class="section-title">Thông tin chung</h3>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="form-label">Tên cửa hàng <span class="text-red-500">*</span></label>
              <input
                :value="form.name"
                @input="updateField('name', $event.target.value)"
                type="text"
                class="form-input"
                placeholder="VD: Trà chanh 96 - Bình Lục"
                required
              />
            </div>
          </div>

          <!-- Address Section -->
          <div>
            <div class="flex justify-between items-center gap-2">
              <label class="form-label">Địa chỉ hiển thị</label>
            <button
              type="button"
              @click="emit('address-modal')"
              class="text-gray-400 text-sm hover:text-green-600"
            >
              Sửa địa chỉ
            </button>
            </div>
            <div
              v-if="hasAddress"
              class="p-4 bg-green-50 border border-green-200 rounded-xl relative group"
            >
              <p class="text-sm font-bold text-gray-800 mb-1">{{ form.addressDisplay }}</p>
              <div class="flex items-center gap-4 text-xs text-gray-500 mt-2">
                <span class="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ form.latitude.toFixed(6) }}, {{ form.longitude.toFixed(6) }}
                </span>
              </div>
            </div>
            <div
              v-else
              class="p-6 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-gray-300 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 0 1 6 0z"
                />
              </svg>
              <p class="text-sm text-gray-500 mb-3">Chưa có địa chỉ được thiết lập</p>
              <button
                type="button"
                @click="emit('address-modal')"
                class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-200"
              >
                + Tạo địa chỉ mới
              </button>
            </div>
          </div>

          <!-- Rich Text Editor -->
          <div>
            <label class="form-label">Giới thiệu</label>
            <div class="bg-white rounded-lg overflow-hidden border border-gray-300">
              <QuillEditor
                :content="form.description"
                @update:content="updateField('description', $event)"
                content-type="html"
                theme="snow"
                toolbar="essential"
                style="height: 150px"
              />
            </div>
          </div>
        </div>

        <hr class="border-gray-100" />

        <!-- Hình ảnh -->
        <div class="space-y-4">
          <h3 class="section-title">Hình ảnh</h3>
          <div>
            <label class="form-label">Ảnh đại diện / Banner</label>
            <div class="flex items-start gap-4">
              <div
                class="w-32 h-20 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative group"
              >
                <img v-if="form.imageUrl" :src="form.imageUrl" class="w-full h-full object-cover" />
                <div v-else class="text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div
                  v-if="uploadLoading"
                  class="absolute inset-0 bg-white/80 flex items-center justify-center"
                >
                  <svg class="animate-spin h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>

              <div class="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageChange"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                <p class="text-xs text-gray-500 mt-2">Tải lên ảnh JPG, PNG. Tối đa 5MB.</p>
              </div>
            </div>
          </div>
        </div>

        <hr class="border-gray-100" />

        <!-- Vận hành & Tiện ích -->
        <div class="space-y-4">
          <h3 class="section-title">Vận hành & Tiện ích</h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Giờ mở cửa</label>
              <input
                :value="form.openTime"
                @input="updateField('openTime', $event.target.value)"
                type="time"
                class="form-input"
              />
            </div>
            <div>
              <label class="form-label">Giờ đóng cửa</label>
              <input
                :value="form.closeTime"
                @input="updateField('closeTime', $event.target.value)"
                type="time"
                class="form-input"
              />
            </div>
          </div>

          <div class="mt-2">
            <label class="form-label">Ngày khai trương</label>
            <input
              :value="form.openDate"
              @input="updateField('openDate', $event.target.value)"
              type="date"
              class="form-input"
            />
          </div>

          <div class="grid grid-cols-3 gap-4 mt-2">
            <div>
              <label class="form-label">Phí ship cố định</label>
              <input
                :value="form.shippingFeeFixed"
                @input="updateField('shippingFeeFixed', parseInt($event.target.value) || 0)"
                type="number"
                class="form-input"
              />
            </div>
            <div>
              <label class="form-label">Phí ship / Km</label>
              <input
                :value="form.shippingFeePerKm"
                @input="updateField('shippingFeePerKm', parseInt($event.target.value) || 0)"
                type="number"
                class="form-input"
              />
            </div>
            <div>
              <label class="form-label">Bán kính bán hàng</label>
              <input
                :value="form.deliveryRadius"
                @input="updateField('deliveryRadius', parseInt($event.target.value) || 20)"
                type="number"
                class="form-input"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Hotline</label>
              <input
                :value="form.phoneNumber"
                @input="updateField('phoneNumber', $event.target.value)"
                type="text"
                class="form-input"
                placeholder="0909..."
              />
            </div>
            <div>
              <label class="form-label">Mật khẩu Wifi</label>
              <input
                :value="form.wifiPassword"
                @input="updateField('wifiPassword', $event.target.value)"
                type="text"
                class="form-input"
                placeholder="Free wifi..."
              />
            </div>
          </div>

          <div>
            <label class="form-label">Trạng thái</label>
            <select
              :value="form.status"
              @change="updateField('status', $event.target.value)"
              class="form-input"
            >
              <option value="">Chọn trạng thái</option>
              <option
                v-for="option in storeStatusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1.5;
}
.form-input {
  @apply w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm h-10 px-3 border transition-colors;
}
.section-title {
  @apply text-sm font-semibold text-gray-900 uppercase tracking-wider;
}
.save-btn {
  @apply px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-colors;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
