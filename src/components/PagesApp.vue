<template>
  <Sortable
      :list="templateRows"
      item-key="id"
      tag="div"
      class="row g-4 row-template"
      role="list"
      aria-label="Rows list"
      @sort="sortRow"
      :options="{
                    sort: true,
                    handle: '.row-drag-handle',
                    ghostClass: 'ghost',
                    scroll: true,
                    forceFallback: true,
                    bubbleScroll: true,
                    group: 'rows'
                   }"
  >
    <template #item="{element: row, index}">
      <div class="row border-row" :class="row.classes" role="listitem" :aria-label="`Row ${index + 1}`" tabindex="0">
        <div class="col">
          <div class="">
            <Sortable
                :list="row.columns"
                item-key="id"
                tag="div"
                class="row g-4 row-template"
                role="list"
                :aria-label="`Columns for row ${index + 1}`"
                :data-row="row.id"
                :key="`columns-${row.id}-${row.columns.map(c => c.id).join('_')}`"
                @add="sortAddColumn"
                @sort="sortColumn"
                @remove="sortRemoveColumn"
                :options="{
                    sort: true,
                    handle: '.btn-drag-handle',
                    ghostClass: 'ghost',
                    scroll: true,
                    forceFallback: true,
                    bubbleScroll: true,
                    group: { name: 'columns', pull: true, put: true }
                   }"
            >
              <template #item="{element, index}">
                <column-template
                    :column="element"
                    :index="index"
                    :row-id="row.id"
                    @delete-column="onDeleteColumn"
                    @update-column-content="onUpdateColumnContent"
                    @move-left="onMoveColumnLeft($event)"
                    @move-right="onMoveColumnRight($event)"
                    @move-prev-row="onMoveColumnToPrevRow($event)"
                    @move-next-row="onMoveColumnToNextRow($event)"
                    :key="`${element.id}-${row.id}`"
                    role="listitem"
                    :aria-label="`Column ${index + 1} of row ${row.id}`"
                ></column-template>
              </template>
            </Sortable>
          </div>
        </div>
        <div class="col-auto">
          <div class="d-flex flex-column gap-1">
            <button type="button" :class="['btn btn-light btn-sm btn-square row-drag-handle']" aria-label="Drag row" title="Drag row">
              <i class="bi bi-grip-horizontal" aria-hidden="true"></i>
            </button>

            <button
                type="button"
                class="btn btn-light btn-sm btn-square"
                :disabled="index === 0"
                :aria-disabled="index === 0"
                @click="moveRowUp(index)"
                :aria-label="`Move row ${index + 1} up`"
                title="Move row up"
            >
              <i class="bi bi-caret-up-fill" aria-hidden="true"></i>
            </button>

            <button
                type="button"
                class="btn btn-light btn-sm btn-square"
                :disabled="index === templateRows.length - 1"
                :aria-disabled="index === templateRows.length - 1"
                @click="moveRowDown(index)"
                :aria-label="`Move row ${index + 1} down`"
                title="Move row down"
            >
              <i class="bi bi-caret-down-fill" aria-hidden="true"></i>
            </button>

            <button type="button" :class="['btn btn-light btn-sm btn-square', {disabled: row.columns.length === 12}]" @click="addColumn(row.id)" :aria-label="`Add column to row ${index + 1}`" title="Add column">
              <i class="bi bi-plus-square" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn-light btn-sm btn-square" @click="deleteRow(row.id)" :aria-label="`Delete row ${index + 1}`" title="Delete row">
              <i class="bi bi-trash3" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn-light btn-sm btn-square" @click="setSelectedRow(row)" data-bs-toggle="modal" data-bs-target="#rowSettingsModal" :aria-controls="'rowSettingsModal'" :aria-label="`Open settings for row ${index + 1}`" title="Row settings">
              <i class="bi bi-gear-fill" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </template>
  </Sortable>
  <div class="row mt-3">
    <div class="col-auto">
      <div type="button" class="btn btn-light btn-sm" @click="addRow">
        <i class="bi bi-plus-lg me-1"></i> Add row
      </div>
    </div>
  </div>

  <div class="container pt-4">
    <div class="row">
      <div class="col-12">
          <pre>
            <code>
              {{ templateRows }}
            </code>
          </pre>
      </div>
    </div>
  </div>

  <div class="modal fade" id="rowSettingsModal" tabindex="-1" aria-labelledby="rowSettingsModalLabel" aria-hidden="true" role="dialog">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="rowSettingsModalLabel">Update row settings</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row g-2">
            <div class="col-md-6 col-lg-4" v-for="(column, index) in selectedRow.columns">
              <div class="border p-3">
                <h5>Column {{ index + 1 }}</h5>
                <div class="row g-2 mb-2 align-items-center">
                  <div class="col-4">
                    <label class="form-label mb-0" :for="column.id + 'all'">All widths</label>
                  </div>
                  <div class="col">
                    <input class="form-control" type="number" :id="column.id + 'all'" v-model="column.widths.all">
                  </div>
                </div>
                <div class="row g-2 mb-2 align-items-center">
                  <div class="col-4"><label class="form-label mb-0" :for="column.id + 'sm'">Mobile (sm)</label></div>
                  <div class="col">
                    <input class="form-control" type="number" :id="column.id + 'sm'" v-model="column.widths.sm">
                  </div>
                </div>
                <div class="row g-2 mb-2 align-items-center">
                  <div class="col-4"><label class="form-label mb-0" :for="column.id + 'md'">Tablet (md)</label></div>
                  <div class="col">
                    <input class="form-control" type="number" :id="column.id + 'md'" v-model="column.widths.md">
                  </div>
                </div>
                <div class="row g-2 mb-2 align-items-center">
                  <div class="col-4"><label class="form-label mb-0" :for="column.id + 'lg'">Tablet (lg)</label></div>
                  <div class="col">
                    <input class="form-control" type="number" :id="column.id + 'lg'" v-model="column.widths.lg">
                  </div>
                </div>
                <div class="row g-2 mb-2 align-items-center">
                  <div class="col-4"><label class="form-label mb-0" :for="column.id + 'xl'">Laptop (xl)</label></div>
                  <div class="col">
                    <input class="form-control" type="number" :id="column.id + 'xl'" v-model="column.widths.xl">
                  </div>
                </div>
                <div class="row g-2 mb-2 align-items-center">
                  <div class="col-4"><label class="form-label mb-0" :for="column.id + 'xxl'">Desktop (xxl)</label>
                  </div>
                  <div class="col">
                    <input class="form-control" type="number" :id="column.id + 'xxl'" v-model="column.widths.xxl">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-bs-target="rowSettingsModal">Close</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" data-bs-target="#rowSettingsModal">Save changes</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true" role="dialog" aria-describedby="deleteModalBody">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="deleteModalLabel">Are you sure?</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" data-bs-target="#deleteModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p id="deleteModalBody">Deleting this content will remove it forever!</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-primary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal" data-bs-target="#deleteModal" @click="confirmDelete" aria-label="Confirm delete">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ColumnTemplate from '@/components/ColumnTemplate.vue'
import { Sortable } from 'sortablejs-vue3'
import { arrayMoveMutable } from 'array-move'
import Modal from 'bootstrap/js/dist/modal'

const templateRows = ref([
  {
    id: 'sfjer243oi2i42',
    classes: null,
    columns: [
      {
        id: 'ksflk4k2t4k3',
        classes: null,
        widths: {
          all: null,
          sm: null,
          md: null,
          xl: null,
          xxl: null
        },
        content: '',
        visible: true,
        order: 1
      },
      {
        id: 'sqkkfsdlk324',
        classes: null,
        widths: {
          all: null,
          sm: null,
          md: null,
          xl: null,
          xxl: null
        },
        content: '',
        visible: true,
        order: 2
      }
    ]
  }
])

const selectedRow = ref({})
const pendingDelete = ref({ rowId: null, columnId: null })

// helper: find a column's current row/indices by column id
function findRowByColumnId (columnId) {
  for (let i = 0; i < templateRows.value.length; i++) {
    const colIndex = templateRows.value[i].columns.findIndex(c => c.id === columnId)
    if (colIndex !== -1) {
      return { row: templateRows.value[i], rowIndex: i, colIndex }
    }
  }
  return { row: null, rowIndex: -1, colIndex: -1 }
}

const sortColumn = (event) => {
  console.log('sort column: ', event)
  const rowId = event.from.dataset.row
  const rowIndex = templateRows.value.findIndex(row => row.id === rowId)
  const columns = templateRows.value[rowIndex].columns

  arrayMoveMutable(columns, event.oldIndex, event.newIndex)
}

const sortRow = event => {
  console.log('sort row:', event)
  if (event.oldIndex === undefined || event.newIndex === undefined) return

  arrayMoveMutable(templateRows.value, event.oldIndex, event.newIndex)
}

function moveRowUp (index) {
  if (typeof index !== 'number' || index <= 0) return
  arrayMoveMutable(templateRows.value, index, index - 1)
}

function moveRowDown (index) {
  if (typeof index !== 'number') return
  const last = templateRows.value.length - 1
  if (index >= last) return
  arrayMoveMutable(templateRows.value, index, index + 1)
}

const sortAddColumn = (evt) => {
  // Move column data from source row to target row at the right index
  try {
    const toRowId = evt.to?.dataset?.row
    const newIndex = typeof evt.newIndex === 'number' ? evt.newIndex : null
    const itemEl = evt.item
    if (!toRowId || newIndex === null || !itemEl) return

    // Extract column id from element id="column-<id>"
    const elId = itemEl.getAttribute('id') || ''
    const match = elId.match(/^column-(.*)$/)
    const columnId = match ? match[1] : null
    if (!columnId) return

    // Find current row/col (source) and remove it
    const found = findRowByColumnId(columnId)
    if (!found.row || found.colIndex < 0) return
    const [moved] = found.row.columns.splice(found.colIndex, 1)
    if (!moved) return

    // Insert into target row at newIndex
    const targetRow = templateRows.value.find(r => r.id === toRowId)
    if (!targetRow) return
    targetRow.columns.splice(newIndex, 0, moved)

    // Remove the DOM node that Sortable inserted; Vue will re-render the correct vnode
    if (itemEl && itemEl.parentNode) {
      try { itemEl.parentNode.removeChild(itemEl) } catch (e) { /* ignore */ }
    }
  } catch (e) {
    console.warn('sortAddColumn failed', e)
  }
}

const sortRemoveColumn = () => {
  // No-op: removal handled in sortAddColumn to avoid race/dupe issues
}

function addRow () {
  templateRows.value.push({
    id: `r${Date.now()}`,
    classes: null,
    columns: [
      {
        id: `c${Date.now()}`,
        classes: null,
        widths: {
          all: null,
          sm: null,
          md: null,
          xl: null,
          xxl: null
        },
        content: '',
        visible: true,
        order: 1
      }
    ]
  })
}

function deleteRow (rowId) {
  pendingDelete.value = { rowId, columnId: null }
  const modalEl = document.getElementById('deleteModal')
  if (modalEl) {
    try {
      const instance = Modal.getInstance(modalEl) || new Modal(modalEl)
      instance.show()
    } catch (e) {
      modalEl.classList.add('show')
      modalEl.style.display = 'block'
      modalEl.removeAttribute('aria-hidden')
      modalEl.setAttribute('aria-modal', 'true')
    }
  }
}

function addColumn (rowId) {
  const row = templateRows.value.find(row => row.id === rowId)
  if (Object.values(row.columns).length < 12) {
    row.columns.push({
      id: `c${Date.now()}`,
      classes: null,
      widths: {
        all: null,
        sm: null,
        md: null,
        xl: null,
        xxl: null
      },
      content: '',
      visible: true,
      order: row.columns.length + 1
    })
  }
}

function onDeleteColumn (event) {
  // expect a single payload { id, rowId }
  if (!event || typeof event !== 'object') return
  const columnId = event.id
  if (!columnId) return

  // resolve the column's current row in case it was dragged
  const found = findRowByColumnId(columnId)
  const effectiveRowId = (found.row && found.row.id) || event.rowId
  if (!effectiveRowId) return

  pendingDelete.value = { rowId: effectiveRowId, columnId }
  const modalEl = document.getElementById('deleteModal')
  if (modalEl) {
    try {
      const instance = Modal.getInstance(modalEl) || new Modal(modalEl)
      instance.show()
    } catch (e) {
      modalEl.classList.add('show')
      modalEl.style.display = 'block'
      modalEl.removeAttribute('aria-hidden')
      modalEl.setAttribute('aria-modal', 'true')
    }
  }
}

function confirmDelete () {
  const { rowId, columnId } = pendingDelete.value || {}
  if (!rowId) return

  if (columnId) {
    // delete a column (robust across rows)
    let row = templateRows.value.find(row => row.id === rowId)
    let colIndex = row ? row.columns.findIndex(column => column.id === columnId) : -1

    // if not found in the provided row (e.g., after drag), search the whole structure
    if (!row || colIndex < 0) {
      const found = findRowByColumnId(columnId)
      row = found.row
      colIndex = found.colIndex
    }

    if (row && colIndex >= 0) {
      row.columns.splice(colIndex, 1)
    }
  } else {
    // delete an entire row
    const rowIndex = templateRows.value.findIndex(row => row.id === rowId)
    if (rowIndex >= 0) templateRows.value.splice(rowIndex, 1)
  }

  pendingDelete.value = { rowId: null, columnId: null }
  const modalEl = document.getElementById('deleteModal')
  if (modalEl) {
    try {
      const instance = Modal.getInstance(modalEl) || new Modal(modalEl)
      try { instance.hide() } catch (e) { /* ignore */ }
    } catch (e) {
      // ignore
    }
  }
}

function onUpdateColumnContent (event) {
  // expect payload: { id, content, rowId }
  if (!event || typeof event !== 'object') return
  const { id: columnId, content } = event
  if (!columnId) return

  // resolve column's current row/column index in case it moved
  const found = findRowByColumnId(columnId)
  if (found.row && found.colIndex >= 0) {
    found.row.columns[found.colIndex].content = content
  }
}

// new column movement handlers
function _focusMovedColumn (columnId) {
  // try to focus the moved column root after DOM updates
  setTimeout(() => {
    const el = document.getElementById(`column-${columnId}`)
    if (el && typeof el.focus === 'function') el.focus()
  }, 50)
}

function onMoveColumnLeft (payload) {
  const { rowId, index } = payload || {}
  const rowIndex = templateRows.value.findIndex(r => r.id === rowId)
  if (rowIndex === -1) return
  const cols = templateRows.value[rowIndex].columns
  if (index > 0 && index < cols.length) {
    arrayMoveMutable(cols, index, index - 1)
    _focusMovedColumn(cols[index - 1].id)
  }
}

function onMoveColumnRight (payload) {
  const { rowId, index } = payload || {}
  const rowIndex = templateRows.value.findIndex(r => r.id === rowId)
  if (rowIndex === -1) return
  const cols = templateRows.value[rowIndex].columns
  if (index >= 0 && index < cols.length - 1) {
    arrayMoveMutable(cols, index, index + 1)
    _focusMovedColumn(cols[index + 1].id)
  }
}

function onMoveColumnToPrevRow (payload) {
  const { rowId, index } = payload || {}
  const rowIndex = templateRows.value.findIndex(r => r.id === rowId)
  if (rowIndex <= 0) return
  const cols = templateRows.value[rowIndex].columns
  if (index < 0 || index >= cols.length) return
  const [col] = cols.splice(index, 1)
  if (!col) return
  // insert into previous row at end
  templateRows.value[rowIndex - 1].columns.push(col)
  _focusMovedColumn(col.id)
}

function onMoveColumnToNextRow (payload) {
  const { rowId, index } = payload || {}
  const rowIndex = templateRows.value.findIndex(r => r.id === rowId)
  if (rowIndex === -1) return
  if (rowIndex >= templateRows.value.length - 1) return
  const cols = templateRows.value[rowIndex].columns
  if (index < 0 || index >= cols.length) return
  const [col] = cols.splice(index, 1)
  if (!col) return
  // insert into next row at end
  templateRows.value[rowIndex + 1].columns.push(col)
  _focusMovedColumn(col.id)
}

function setSelectedRow (row) {
  selectedRow.value = row
  console.log(selectedRow.value)
}

function onModalHidden () {
  pendingDelete.value = { rowId: null, columnId: null }
}

onMounted(() => {
  const modalEl = document.getElementById('deleteModal')
  if (modalEl) {
    modalEl.addEventListener('hidden.bs.modal', onModalHidden)
  }
})

onBeforeUnmount(() => {
  const modalEl = document.getElementById('deleteModal')
  if (modalEl) {
    modalEl.removeEventListener('hidden.bs.modal', onModalHidden)
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.row-template {
  position: relative;
}

.btn-square {
  width: 30px;
  height: 30px;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn {
  .bi {
    font-size: 1.1rem;
  }
}

.ghost {
  opacity: 0.5;
  background: #fff;
  border: 1px dashed #ccc;
}

.border-row {
  padding-top: 1rem;
  padding-bottom: 0.5rem;
}
</style>
