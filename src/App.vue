<script setup lang="ts">
import store from './store';
import Toolbar from "./components/common/Toolbar.vue";
import Graph from "./components/graph/Graph.vue";
import AboutBar from "./components/common/AboutBar.vue";
import Home from "./components/Home.vue";
import Settings from "./components/common/Settings.vue";

</script>

<template>
    <Graph/>
    <Home v-if="store.splashView"/>
    <Toolbar v-if="!store.splashView"/>
    <Settings/>
    <AboutBar/>
</template>

<style scoped>

</style>
