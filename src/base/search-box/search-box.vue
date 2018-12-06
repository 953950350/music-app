<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input type="text" class="box" v-model="query" :placeholder="placeholder" ref="query">
    <i class="icon-dismiss" v-show="query" @click="clear"></i>
  </div>
</template>

<script>
import { debounce } from 'common/js/util'
export default {
  data() {
    return {
      query: ''
    }
  },
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  methods: {
    clear() {
      this.query = ''
    },
    setQuery(query) {
      this.query = query
    },
    blur() {
      this.$refs.query.blur()
    }
  },
  created() {
    // 使用节流函数减少发送请求的数量。
    this.$watch('query', debounce(newQuery => {
      this.$emit('query', newQuery)
    }, 200))
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
.search-box {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  border-radius: 6px;
  height: 40px;
  background-color: @color-highlight-background;
  .icon-search {
    font-size: 24px;
    color: @color-background;
  }
  .box {
    flex: 1;
    color: @color-text;
    background: @color-highlight-background;
    font-size: @font-size-medium;
    margin: 0 5px;
    outline: 0;
  }
  .icon-dismiss {
    font-size: @font-size-medium-x;
    color: @color-background;
  }
}
</style>

