<script setup lang="ts">
import {ref, nextTick, onMounted} from 'vue';
import store from '../../store';
import events from '../../events';

const settingsVisible = ref<boolean>(false);
const apiKey = ref<string>('');

const settingDialogSave = () => {
    store.apiKey = apiKey.value;
    store.settingsView = false;
};

const settingsDialogCancel = () => {
    store.settingsView = false;
};

onMounted(() => {
    apiKey.value = store.apiKey;
});

</script>

<template>
    <a-modal :centered="true" v-model:visible="store.settingsView" title="Settings">
        <template #footer>
            <a-button key="cancel" @click="settingsDialogCancel">Cancel</a-button>
            <a-button key="save" type="primary" @click="settingDialogSave">Save</a-button>
        </template>
        <a-input v-model:value="apiKey" addon-before="API KEY" />
    </a-modal>
</template>

<style scoped>

</style>
