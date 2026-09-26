<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { rangerMessages } from "./Ranger.i18n"
import { rangerLocationStorageKey } from "./RangerPersistence"
import RangerPanel from "./RangerPanel.vue"

const route = useRoute()
const workspaceId = computed(() => String(route.params.workspaceId ?? ""))
const locationStorageKey = computed(() =>
  rangerLocationStorageKey(workspaceId.value),
)

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})

useHead(() => ({
  title: t("title"),
  meta: [
    {
      name: "description",
      content: t("description"),
    },
  ],
}))
</script>

<template>
  <RangerPanel
    :workspace-id="workspaceId"
    :location-storage-key="locationStorageKey"
  />
</template>
