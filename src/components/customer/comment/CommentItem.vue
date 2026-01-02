<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCommentStore } from '@/stores/comment' // Import Store
import { formatDate } from '@/utils/formatters'
import { resolveImage } from '@/utils/image'
import CommentForm from './CommentForm.vue'
import defaultAvatar from '@/assets/images/others/default-drink.png'

const props = defineProps({
  comment: { type: Object, required: true },
  newsId: { type: Number, required: true }
})

const emit = defineEmits(['reply', 'delete'])

const userStore = useUserStore()
const commentStore = useCommentStore() // Init Store
const showReplyForm = ref(false)
const isReplying = ref(false)

const userAvatar = computed(() => resolveImage(props.comment.userThumbnailUrl, defaultAvatar))
const isOwner = computed(() => userStore.user?.id === props.comment.userId)

const handleReplySubmit = async (content) => {
  isReplying.value = true
  try {
    await emit('reply', { content, parentId: props.comment.id })
    showReplyForm.value = false
  } finally {
    isReplying.value = false
  }
}

// 🟢 MỚI: Xử lý Thả tim
const handleLike = () => {
  if (!userStore.isLoggedIn) {
    alert('Vui lòng đăng nhập để thích bình luận.')
    return
  }
  commentStore.toggleLike(props.comment.id)
}
</script>

<template>
  <div class="group animate-fade-in">
    <div class="flex gap-3">
      <div class="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
        <img :src="userAvatar" class="w-full h-full object-cover" alt="User Avatar" />
      </div>

      <div class="flex-1">
        <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none inline-block min-w-[200px] relative">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-bold text-sm text-gray-900 dark:text-gray-100">
              {{ comment.userName }}
              <span v-if="comment.userId === 1" class="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1 border border-green-200">Admin</span>
            </span>
            <span class="text-xs text-gray-400">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed pr-8">
            {{ comment.content }}
          </p>

          <div v-if="comment.likeCount > 0" class="absolute -bottom-2 -right-2 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 px-1.5 py-0.5 flex items-center gap-1">
             <div class="bg-red-500 rounded-full p-0.5">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-2 h-2"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
             </div>
             <span class="text-[10px] text-gray-500 dark:text-gray-300 font-medium">{{ comment.likeCount }}</span>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-1 ml-2 select-none">
            <button
                @click="handleLike"
                class="text-xs font-semibold transition-colors flex items-center gap-1"
                :class="comment.isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'"
            >
                {{ comment.isLiked ? 'Đã thích' : 'Thích' }}
            </button>

            <button
                v-if="userStore.isLoggedIn"
                @click="showReplyForm = !showReplyForm"
                class="text-xs font-semibold text-gray-500 hover:text-green-600 transition-colors"
            >
                Trả lời
            </button>

            <span class="text-xs text-gray-300">|</span> <button
                v-if="isOwner"
                @click="$emit('delete', comment.id)"
                class="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
                Xóa
            </button>
        </div>

        <div v-if="showReplyForm" class="mt-3">
          <CommentForm
            :placeholder="`Trả lời ${comment.userName}...`"
            :loading="isReplying"
            show-cancel
            @submit="handleReplySubmit"
            @cancel="showReplyForm = false"
          />
        </div>
      </div>
    </div>

    <div v-if="comment.replies && comment.replies.length > 0" class="pl-10 md:pl-14 mt-4 space-y-4 border-l-2 border-gray-100 dark:border-gray-700">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :news-id="newsId"
        @reply="(payload) => $emit('reply', payload)"
        @delete="(id) => $emit('delete', id)"
      />
    </div>
  </div>
</template>
