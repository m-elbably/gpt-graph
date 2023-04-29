<script setup lang="ts">
import { GithubOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import 'ant-design-vue/es/button/style/css';

</script>

<template>
    <div class="about-bar">
        <a-col>
            <a-row>
                <a-tooltip color="blue" placement="left">
                    <a-button>
                        <template #icon><GithubOutlined /></template>
                    </a-button>
                    <template #title>Github Repository</template>
                </a-tooltip>
            </a-row>
            <a-row>
                <a-tooltip color="blue" placement="left">
                    <a-button>
                        <template #icon><InfoCircleOutlined /></template>
                    </a-button>
                    <template #title>About</template>
                </a-tooltip>
            </a-row>
        </a-col>
    </div>
</template>

<style scoped>
.about-bar {
    display: block;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.7);
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    padding: 10px;
    align-items: center;
    bottom: 20px;
    right: 20px;
}

button {
    background-color: #ffffff00;
}
</style>
