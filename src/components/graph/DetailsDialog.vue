<script setup lang="ts">
import {defineEmits, getCurrentInstance, watch} from 'vue';
import Markdown from 'vue3-markdown-it';

export interface DetailsDialogState {
    visible: boolean;
    title?: string;
    description?: string;
}

defineProps<DetailsDialogState>();

const context = getCurrentInstance();
const emit = defineEmits([
    'update:visible'
]);

function onClose() {
    emit('update:visible', false);
}
</script>

<template>
    <a-modal :centered="true" :mask-closable="true" :visible="visible" :title="title" @cancel="onClose()">
        <template #footer>
            <a-button key="close" type="primary" @click="onClose()">Close</a-button>
        </template>
        <Markdown :source="description" />
    </a-modal>
</template>

<style scoped>

</style>
