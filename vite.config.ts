import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite';
import {AntDesignVueResolver} from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/gpt-graph/',
    plugins: [
        vue({}),
        Components({
            resolvers: [AntDesignVueResolver()],
        }),
    ],
})
