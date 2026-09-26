<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue"
import { clampSidebarRatio, writeStoredSidebarRatio } from "../RangerLayout"

const props = defineProps<{
  ratio: number
}>()

const emit = defineEmits<{
  "update:ratio": [ratio: number]
}>()

const dragging = ref(false)
const latestRatio = ref(props.ratio)
let container: HTMLElement | null = null

function setRatio(ratio: number): void {
  const nextRatio = clampSidebarRatio(ratio)

  latestRatio.value = nextRatio
  emit("update:ratio", nextRatio)
}

function updateRatio(event: PointerEvent): void {
  if (container === null) return

  const rect = container.getBoundingClientRect()
  if (rect.width === 0) return

  setRatio((event.clientX - rect.left) / rect.width)
}

function onPointerDown(event: PointerEvent): void {
  const target = event.currentTarget as HTMLElement | null

  container = target?.parentElement ?? null
  if (target === null || container === null) return

  event.preventDefault()
  dragging.value = true
  latestRatio.value = props.ratio
  target.setPointerCapture(event.pointerId)
  document.body.style.userSelect = "none"
  document.body.style.cursor = "col-resize"

  updateRatio(event)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return

  updateRatio(event)
}

function onPointerUp(event: PointerEvent): void {
  if (!dragging.value) return

  const target = event.currentTarget as HTMLElement | null

  dragging.value = false
  container = null

  if (target !== null && target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }

  document.body.style.userSelect = ""
  document.body.style.cursor = ""
  writeStoredSidebarRatio(latestRatio.value)
}

onBeforeUnmount(() => {
  document.body.style.userSelect = ""
  document.body.style.cursor = ""
})
</script>

<template>
  <div
    class="group flex h-full w-1 shrink-0 cursor-col-resize touch-none justify-center"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div
      class="h-full w-px"
      :class="dragging ? 'bg-ink/50' : 'bg-line group-hover:bg-ink/30'"
    />
  </div>
</template>
