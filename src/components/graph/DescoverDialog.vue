<script setup lang="ts">
import {ref, nextTick, defineEmits, getCurrentInstance, watch} from 'vue';

export interface DiscoverDialogState {
    visible: boolean;
    title?: string;
    prompts?: Array<string>;
    selectedPrompt?: string;
}

defineProps<DiscoverDialogState>();

const context = getCurrentInstance();
const form = ref();
const promptElements = ref<Array<HTMLElement | null>>([]);
const formState = ref({
    prompt: '',
    rules: {
        prompt: {
            required: true,
            message: 'Your custom prompt is required'
        }
    }
});
const userPromptInput = ref<HTMLElement>();

const emit = defineEmits([
    'submit',
    'update:visible',
    'update:selectedPrompt'
]);

watch(() => context?.props.visible, (n, o) => {
    const selected = context?.props.selectedPrompt as string;
    if(selected === '_') {
        nextTick(() => userPromptInput.value?.focus());
    }
});

async function onSubmit() {
    let prompt = '';
    const selected = context?.props.selectedPrompt as string;

    if(selected === '_') {
        try {
            formState.value.rules.prompt.required = true;
            await form.value.validate();
            prompt = formState.value.prompt;
        } catch (e) {
            return;
        }
    } else {
        formState.value.rules.prompt.required = false;
        const el = promptElements.value?.[parseInt(selected)] as any;
        prompt = (el?.['$el'] as HTMLElement).textContent as string;
    }

    emit('submit', prompt);
    emit('update:visible', false);
}

function onCanceled() {
    emit('update:visible', false);
}

function onPromptSelectionChanged(e: Event) {
    const value = (e.target as HTMLInputElement)?.value;
    emit('update:selectedPrompt', value);
    nextTick(() => userPromptInput.value?.focus());
}
</script>

<template>
    <a-modal :centered="true" :mask-closable="true" :visible="visible" :title="title" @cancel="onCanceled()">
        <template #footer>
            <a-button key="cancel" @click="onCanceled">Cancel</a-button>
            <a-button key="save" type="primary" @click="onSubmit()">Explore</a-button>
        </template>
        <a-form ref="form" :model="formState" layout="vertical" :rules="formState.rules">
            <a-form-item label="Suggested Prompts" name="builtin-prompt" v-if="prompts && prompts?.length > -1">
                <a-radio-group
                    :value="selectedPrompt"
                    @change="onPromptSelectionChanged($event)"
                    button-style="solid"
                    class="prompts-group">
                    <a-radio-button v-for="(item, index) in prompts" ref="promptElements" :value="String(index)">{{ item }}</a-radio-button>
                    <a-radio-button value="_">Use your own prompt</a-radio-button>
                </a-radio-group>
            </a-form-item>
            <a-form-item
                    name="prompt"
                    v-if="selectedPrompt == '_'">
                <a-textarea
                        v-model:value="formState.prompt"
                        ref="userPromptInput"
                        placeholder="Prompt"
                        :maxlength="512"
                        :auto-size="{ minRows: 5, maxRows: 8 }"
                />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<style scoped>
.prompts-group {
    display: grid;
}

.prompts-group label {
    height: auto;
    padding: 8px;
    line-height: normal;
}

.prompts-group :last-child {
    margin-top: 12px;
}
</style>
