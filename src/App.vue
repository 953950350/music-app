<template>
  <div id="app">
    <m-header></m-header>
    <tap></tap>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Tap from 'components/tap/tap'
import Player from 'components/player/player'
export default {
  name: 'App',
  components: {
    MHeader,
    Tap,
    Player
  }
}
</script>

<style lang="less" scoped>

</style>
