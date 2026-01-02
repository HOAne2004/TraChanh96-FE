<script setup>
import { onMounted, computed } from 'vue'
import { useCommentStore } from '@/stores/comment'
import { storeToRefs } from 'pinia'

// Components
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'

const props = defineProps({
  newsId: { type: Number, required: true }
})

const commentStore = useCommentStore()
const { comments, loading } = storeToRefs(commentStore)

onMounted(() => {
  if (props.newsId) {
    commentStore.fetchComments(props.newsId)
  }
})

// 🟢 MỚI: Hàm đệ quy đếm tổng số comment (Cha + Con + Cháu...)
const countTotal = (list) => {
    let count = 0
    for(const c of list) {
        count++ // Đếm cha
        if(c.replies && c.replies.length > 0) {
            count += countTotal(c.replies) // Đếm con
        }
    }
    return count
}

const totalComments = computed(() => countTotal(comments.value))

// Các hàm handle giữ nguyên
const handleAddComment = async (content) => {
  await commentStore.addComment({
    newsId: props.newsId,
    content: content,
    parentId: null
  })
}

const handleReply = async (payload) => {
  await commentStore.addComment({
    newsId: props.newsId,
    content: payload.content,
    parentId: payload.parentId
  })
}

const handleDelete = async (commentId) => {
  await commentStore.deleteComment(commentId, props.newsId)
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8">
    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
      Bình luận
      <span class="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
        {{ totalComments }}
      </span>
    </h3>

    <div class="mb-8">
      <CommentForm
        :loading="loading"
        @submit="handleAddComment"
      />
    </div>

    <div v-if="loading && comments.length === 0" class="flex justify-center py-6">
       <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>

    <div v-else-if="comments.length > 0" class="space-y-6">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :news-id="newsId"
        @reply="handleReply"
        @delete="handleDelete"
      />
    </div>

    <div v-else class="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
      <p class="text-gray-500 dark:text-gray-400">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
    </div>
  </div>
</template>
