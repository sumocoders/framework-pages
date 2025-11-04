<template>
  <div :id="`column-${column.id}`" :class="[classString, { hidden: !column.visible }] " role="article" :aria-label="`Column ${column.id}`" tabindex="0" @keydown="onKeyDown" title="Use Left/Right to move within row. Alt+Left/Alt+Right to move to previous/next row.">
    <div class="column-template h-100 p-3">
      <button type="button" :class="['btn btn-light btn-sm btn-square btn-drag-handle']" aria-label="Drag column" title="Drag column">
        <i class="bi bi-grip-vertical" aria-hidden="true"></i>
      </button>

      <p>Column {{ column.id }}</p>
      <div class="editor-wrapper">
        <div class="editor" :id="`editor-${column.id}`" data-role="editor" ref="editor" role="region" :aria-label="`Editor for column ${column.id}`"></div>
      </div>
      <div class="d-flex justify-content-between mt-auto">
        <button class="btn btn-primary btn-sm mt-auto align-self-start" @click="saveContent" aria-label="Save column content">Save</button>
        <div class="d-flex gap-1">
          <button class="btn btn-light btn-sm" type="button" @click="toggleVisibility" :aria-pressed="column.visible" :aria-label="column.visible ? 'Hide column' : 'Show column'" title="Toggle visibility">
            <i class="bi bi-eye-fill" v-if="column.visible" aria-hidden="true"></i> <i class="bi bi-eye-slash-fill" v-else aria-hidden="true"></i>
          </button>
          <button class="btn btn-light btn-sm btn-delete" type="button" @click="deleteColumn" aria-label="Delete column" title="Delete column">
            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import EditorJS from '@editorjs/editorjs'

const props = defineProps(['column', 'index', 'rowId'])
const emit = defineEmits(['delete-column', 'update-column-content', 'move-left', 'move-right', 'move-prev-row', 'move-next-row'])
let editor = ref(null)
const editorInstance = ref(null)

const classString = computed(() => {
  let string = ''
  if (props.column.widths) {
    Object.entries(props.column.widths).forEach(width => {
      if (width[0] === 'all' && width[1]) {
        string = string + ` col-${width[1]}`
      } else if (width[1]) string = string + ` col-${width[0]}-${width[1]}`
    })
  }
  return string || 'col'
})

function deleteColumn () {
  emit('delete-column', { id: props.column.id, rowId: props.rowId })
}

function saveContent () {
  editorInstance.value.save().then((outputData) => {
    console.log('Article data: ', outputData)
    emit('update-column-content', {
      content: outputData,
      id: props.column.id,
      rowId: props.rowId
    })
  }).catch((error) => {
    console.error('Saving failed: ', error)
  })
}

function toggleVisibility () {
  props.column.visible = !props.column.visible
}

// keyboard handler for moving columns
function onKeyDown (e) {
  // ignore when typing in editor (focus may be inside editor element)
  // if editor contains activeElement, skip
  const active = document.activeElement
  if (active && active.closest && active.closest('.editor')) return

  // Left/Right to move within the same row
  if (e.key === 'ArrowLeft' && !e.altKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    emit('move-left', { columnId: props.column.id, index: props.index, rowId: props.rowId })
    return
  }
  if (e.key === 'ArrowRight' && !e.altKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    emit('move-right', { columnId: props.column.id, index: props.index, rowId: props.rowId })
    return
  }

  // Alt + Left/Right to move column to previous/next row
  if (e.key === 'ArrowLeft' && e.altKey) {
    e.preventDefault()
    emit('move-prev-row', { columnId: props.column.id, index: props.index, rowId: props.rowId })
    return
  }
  if (e.key === 'ArrowRight' && e.altKey) {
    e.preventDefault()
    emit('move-next-row', { columnId: props.column.id, index: props.index, rowId: props.rowId })
  }
}

onMounted(() => {
  editorInstance.value = new EditorJS({
    holder: editor.value,
    placeholder: 'Write your content'
  })
})

onBeforeUnmount(() => {
  if (editorInstance.value && typeof editorInstance.value.destroy === 'function') {
    try { editorInstance.value.destroy() } catch (e) { /* ignore */ }
  }
})
</script>

<style scoped lang="scss">
.hidden {
  h2, .editor-wrapper {
    opacity: 0.6;
  }
}

.column-template {
  position: relative;
  border: 1px solid #cdcdcd;
  display: flex;
  flex-flow: column nowrap;
}

.btn-delete {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  font-size: 1.1rem;
}

.btn-drag-handle {
  position: absolute;
  left: -1rem;
  top: 1rem;
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
