<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {
    ApartmentOutlined,
    SearchOutlined,
    SettingOutlined
} from '@ant-design/icons-vue';
import store from '../../store';
import events from '../../events';
import 'ant-design-vue/es/button/style/css';

const layout = ref<string>('horizontal');
const searchText = ref<string>('');

function changeLayout(layout: string) {
    events.emit('layoutChanged', layout);
}

const onSearchTextChange = () => {
    events.emit('searchTextChanged', searchText.value);
};

const showSettings = () => {
    store.settingsView = true;
}

</script>

<template>
    <div class="toolbar">
        <a-space>
            <a-radio-group v-model:value="layout" button-style="solid">
                <a-tooltip color="blue" placement="top">
                    <a-radio-button @click="changeLayout('horizontal')" value="horizontal">
                        <apartment-outlined :rotate="270"/>
                    </a-radio-button>
                    <template #title>Horizontal Layout</template>
                </a-tooltip>
                <a-tooltip color="blue" placement="top">
                    <a-radio-button @click="changeLayout('vertical')" value="vertical">
                        <apartment-outlined />
                    </a-radio-button>
                    <template #title>Vertical Layout</template>
                </a-tooltip>
            </a-radio-group>
            <a-input v-model:value="searchText" @pressEnter="onSearchTextChange">
                <template #prefix>
                    <search-outlined type="user" />
                </template>
            </a-input>
            <a-button @click="showSettings()">
                <template #icon><SettingOutlined /></template>
            </a-button>
        </a-space>
    </div>
</template>

<style scoped>
.toolbar {
    display: block;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.7);
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    padding: 10px;
    align-items: center;
    bottom: 20px;
}
.toolbar * {
    background-color: inherit;
}
.typography-comment {
    display: inline-block;
    margin-top: 8px;
}
</style>
