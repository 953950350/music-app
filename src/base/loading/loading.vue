<template>
  <div class="loading">
    <img src="./loading.gif" height="24" width="24" alt="">
    <p class="title">{{tilte}}</p>
  </div>
</template>

<script>
export default {
  props: {
    tilte: {
      type: String,
      default: '正在加载...'
    }
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
.loading {
  width: 100%;
  text-align: center;
  .title {
    line-height: 20px;
    font-size: @font-size-small;
    color: @color-text-l;
  }
}
</style>
