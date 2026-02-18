<template>
  <UApp>
    <RouterView v-slot="{ Component }">
      <Transition name="layout" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </UApp>
</template>
