# 基于Vue.js的音乐播放器（Webapp）

--------

基于 Vue(2.5) + vuex + vue-router + vue-axios +better-scroll + Less + ES6 等开发一款移动端音乐 WebApp，下面是一些简单的功能介绍，功能的具体实现在代码中都有详细的注释，也可以看我的[博客](https://953950350.github.io/2018/07/25/vue-music/#more)，其中记录了一些较复杂功能的实现方法。

## 效果

![](https://oc1gyfe6q.qnssl.com/17-7-28/29546400.jpg)

![](https://oc1gyfe6q.qnssl.com/17-7-28/80941247.jpg)

## 技术栈

**前端**

* `Vue`：用于构建用户界面的 MVVM 框架
* `vue-router`：为单页面应用提供的路由系统，使用了 `Lazy Loading Routes` 技术来实现异步加载优化性能
* `vuex`：Vue 集中状态管理，在多个组件共享某些状态时非常便捷
* `vue-lazyload`：实现图片懒加载，节省用户流量，优化页面加载速度
* `better-scroll`：解决移动端各种滚动场景需求的插件，使移动端滑动体验更加流畅
* `less`：css 预编译处理器
* `ES6`：ECMAScript 新一代语法，模块化、解构赋值、Promise、Class 等方法非常好用

**后端**

* `Node.js`：利用 Express 搭建的本地测试服务器
* `vue-axios`：用来请求后端 API 音乐数据
* `NeteaseCloudMusicApi`：网易云音乐 NodeJS 版 API，提供音乐数据

**其他工具**

* `vue-cli`：Vue 脚手架工具，快速初始化项目代码
* `eslint`：代码风格检查工具，帮助我们规范代码书写（一定要养成良好的代码规范）
* `iconfont` ：阿里巴巴图标库，谁用谁知道
* `fastclick` ：消除 click 移动游览器 300ms 的延

## 实现功能

播放器内核、推荐页面、热榜页面、歌手页面、歌单详情、歌手详情、排行榜详情、搜索页面、播放列表、用户中心等等功能。

### 推荐页面

推荐页分成三个部分，分别是 banner 轮播图、推荐歌单、推荐歌曲，数据都是使用 `axios` 请求 API 获取得到的，图片都使用 `vue-lazyload` 实现懒加载。

轮播图：使用 `better-scroll` 实现，具体可以看这里 [Slide](https://ustbhuangyi.github.io/better-scroll/doc/zh-hans/options-advanced.html#```snap```) 。*点击跳转方面只实现歌曲和歌单的跳转，因为暂时只实现了这两个功能。*


### 歌手页面

实现歌手列表的左右联动。

### 歌曲列表组件

用来显示歌曲列表，在很多的地方都进行了复用，例如：歌单详情页、排行榜详情页、歌手详情页、搜索结果、用户中心等等。

### 歌单详情页

通过歌单的 ID 来获取歌单中的歌曲数据。

然后就是复用 歌曲列表组建 来显示歌曲。

### 排行榜详情、歌手详情

和歌单详情基本上没有什么区别，除了 UI 界面方面有细微的改动（根据不同的内容作出不同的优化）。

### 播放器

实现功能：顺序播放、单曲循环、随机播放、收藏等。

播放、暂停使用 HTML5 的 audio 实现。

数据、播放状态、播放历史、习惯歌曲等方面使用了 `vuex` 来进行管理。

中间的唱片旋转动画使用了 `animation` 实现。

歌词部分获取到QQ音乐的歌词数据，然后使用 第三方库 [`lyric-parser`](https://github.com/ustbhuangyi/lyric-parser) 进行处理。实现显示歌词、拖动进度条歌词同步滚动、歌词跟随歌曲进度高亮。

通过 `localstorage` 存储喜欢歌曲、播放历史数据。

播放器具体细节可以看我的[博客](https://953950350.github.io/2018/08/09/%E9%9F%B3%E4%B9%90%E6%92%AD%E6%94%BE%E5%99%A8%E5%86%85%E6%A0%B8/)

#### audio 标签在移动端不能够自动播放的问题

在chrome下可以正常播放，但是在手机上音频的播放需要用户的行为触发事件才能播放，最后使用touch事件解决，具体可以看我的博客，里面详细分析了播放器组件的所用方法。

### 播放列表

显示和管理当前播放歌曲，可以用来删除列表中的歌曲、以及选择播放歌曲。

### 搜索功能

实现功能：搜索歌手、歌单、歌曲、热门搜索、数据节流、上拉刷新、保存搜索记录。

通过关键字请求 API 获取搜索数据，显示歌手、歌单、歌曲。

实现了上刷新，因为搜索可以设置请求数据的条数，所以可以用来实现上刷新的功能。

通过节流函数实现数据节流，通过 `localstorage` 存储搜索数据。

### 用户中心

将在本地存储的数据显示出来，方便用户使用。

### 构建
#### 开发环境

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:3000
npm run dev

```
#### 生产环境

``` bash
# build for production with minification
npm run build
# run
node prod.server.js
```
