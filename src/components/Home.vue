<script setup lang="ts">
import {ref, nextTick} from 'vue';
import store from '../store';
import events from '../events';
import { Modal } from 'ant-design-vue';
import 'ant-design-vue/es/button/style/css';
interface FormState {
    prompt: string;
    minNodes: number;
}

const newGraphVisible = ref<boolean>(false);

const form = ref();
const formPromptField = ref<HTMLElement>();
const formState = ref<FormState>({
    prompt: '',
    minNodes: 3
});
const placeholder = ref(
    `Examples: \n- Albert Einstein \n- How to learn Rust?\n- TED talk by Stephen Wolfram "Computing a theory of all knowledge"`
)

// Settings
const showNewGraphDialog = () => {
    if(!store.apiKey || store.apiKey.length === 0){
        Modal.error({
            title: 'API Key',
            content: 'You need OpenAI API key to processed, Close this dialog to add your key.',
            centered: true,
            afterClose: () => store.settingsView = true
        });
        return;
    }

    formState.value.minNodes = store.minNodes;
    newGraphVisible.value = true;
    nextTick(() =>  formPromptField.value?.focus());
};

const newGraphDialogSave = async () => {
    try {
        await form.value.validate();
        newGraphVisible.value = false;
        store.initialPrompt = formState.value.prompt;
        store.minNodes = formState.value.minNodes;
        store.splashView = false;
        events.emit('startDiscovery');
    } catch (e) {
       console.log(e);
    }
};

</script>

<template>
    <div class="initial-view">
        <a-empty image="./src/assets/empty.svg" :image-style="{ height: '150px' }" >
            <template #description>
                <a-typography-text class="typography-comment" type="secondary">
                    Discover new ideas
                </a-typography-text>
            </template>
            <a-button type="primary" @click="showNewGraphDialog">Create New Graph</a-button>
        </a-empty>
        <a-modal :centered="true"  v-model:visible="newGraphVisible" title="New Graph" @ok="newGraphDialogSave">
            <a-form
                ref="form"
                :model="formState"
                layout="vertical"
            >
                <a-form-item
                    label="Topic"
                    name="prompt"
                    :rules="[{ required: true, max: 256, message: 'Field prompt is required' }]">
                    <a-textarea
                        ref="formPromptField"
                        :placeholder="placeholder"
                        v-model:value="formState.prompt"
                        :auto-size="{ minRows: 5, maxRows: 8 }"
                    />
<!--                    <a-typography-text class="typography-comment" type="secondary">-->
<!--                        Ant Design Vue (secondary)-->
<!--                    </a-typography-text>-->
                </a-form-item>
                <a-form-item label="Minimum Nodes">
                    <a-slider v-model:value="formState.minNodes" :min="1" :max="10"/>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<style scoped>
.initial-view {
    display: block;
    position: absolute;
    padding: 10px;
    align-items: center;
    bottom: 50%;
}
.typography-text {
    display: inline-block;
    margin-bottom: 4px;
}
.typography-comment {
    display: inline-block;
    margin-top: 8px;
}
</style>
