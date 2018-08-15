<template>
  <div class="search-list">
    <transition-group tag="ul" name="list">
      <li @click="selectItem(item)" class="search-item" v-for="(item, index) in searches" :key="index">
        <span class="text">{{item}}</span>
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  props: {
    searches: {
      type: Array,
      default: []
    }
  },
  methods: {
    selectItem(item) {
      this.$emit('select', item)
    },
    deleteOne(item) {
      this.$emit('delete', item)
    }
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.search-list {
  .search-item {
    height: 40px;
    display: flex;
    align-items: center;
    overflow: hidden;
    &.list-enter,
    &.list-leave-to {
      height: 0;
    }
    &.list-enter-active,
    &.list-leave-active {
      transition: all 0.1s;
    }
    .text {
      flex: 1;
      color: @color-text-l;
    }
    .icon {
      .extend-click();
      .icon-delete {
        color: @color-text-d;
        font-size: @font-size-small;
      }
    }
  }
}
</style>

