<template>
  <div class="song-list">
    <ul>
      <li @click="select(song, index)" class="item" v-for="(song, index) in songs" :key="song.id">
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)" class="icon text">{{getRankText(index)}}</span>
        </div>
        <div class="content">
          <h2 class="name" v-html="song.name"></h2>
          <p class="desc" v-html="desc(song)"></p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    songs: {
      type: Array,
      default: []
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    desc(song) {
      if (!song.id) {
        return ''
      }
      return `${song.singer}·${song.album}`
    },
    select(song, index) {
      this.$emit('select', song, index)
    },
    getRankCls(index) {
      return index <= 2 ? `icon${index}` : ''
    },
    getRankText(index) {
      return index > 2 ? index + 1 : ''
    }
  },
  components: {
    scroll
  }
}
</script>

<style lang="less" scoped>
@import url("../../common/less/variable.less");
@import url("../../common/less/mixin.less");
.song-list {
  .item {
    display: flex;
    align-items: center;
    height: 64px;
    font-size: @font-size-medium;
    box-sizing: border-box;
    .rank {
      flex: 0 0 25px;
      margin-right: 30px;
      width: 25px;
      text-align: center; 
      .icon {
        display: inline-block;
        width: 25px;
        height: 24px;
        background-size: 25px 24px;
        &.icon0 {
          .bg-image("../../base/song-list/first");
        }
        &.icon1 {
          .bg-image("../../base/song-list/second");
        }
        &.icon2 {
          .bg-image("../../base/song-list/third");
        }
      }
      .text {
        color: @color-theme;
        font-size: @font-size-large;
      }
    }
    .content {
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .name {
        .no-wrap();
        color: @color-text;
      }
      .desc {
        margin-top: 4px;
        .no-wrap();
        color: @color-text-d;
      }
    }
  }
}
</style>

