<template>
  <div class="m-header">
    <div class="icon"></div>
    <h1 class="title">Chicken Music</h1>
    <router-link tag="div" to="/user" class="mine">
      <i class="icon-mine"></i>
    </router-link>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.m-header {
  font-size: 0;
  text-align: center;
  position: relative;
  height: 44px;
  font-size: 0;
  .icon {
    width: 30px;
    height: 32px;
    margin: 6px 9px 0 0;
    display: inline-block;
    vertical-align: top;
    background-size: 30px 32px;
    .bg-image("../../components/m-header/logo");
    background-repeat: no-repeat;
  }
  .title {
    font-size: 18px;
    vertical-align: top;
    display: inline-block;
    line-height: 44px;
    color: @color-theme;
  }
  .mine {
    position: absolute;
    top: 0;
    right: 0;
    .icon-mine {
      display: block;
      padding: 12px;
      font-size: 20px;
      color: @color-theme;
    }
  }
}
</style>
