<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.clearfix {
  overflow: auto;
}
.clearfix:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}
.center {
  text-align: center;
}

nav.header {
  background: #0a0a0a;
  height: 50px;
  line-height: 50px;
  color: #66ccff;
  padding: 0 20px;
}
nav.header .button {
  margin-top: 10px;
  border-radius: 15px;
  background: transparent;
}
.container {
  padding: 20px;
}
.from-container {
  max-width: 300px;
  margin: 15% auto;
}
.from-container .ptitle {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}
.l {
  float: left;
}
.r {
  float: right;
}
.button.r {
  margin-left: 10px;
}
.meun {
  min-width: 200px;
  float: left;
  margin: 10px;
}
.title {
  background-color: #f2e6d2;
  color: #b08133;
  overflow: hidden;
  padding: 5px 6px 8px 13px;
  font-size: 14px !important;
}
.option-wrap {
  height: 300px;
  overflow: auto;
}
.option {
  display: block !important;
  padding-bottom: 10px;
}
.bottom-btn {
  margin-top: 20px;
}
.back {
  margin-bottom: 10px;
  display: inline-block;
}
.data-table thead tr {
  background-color: #f2e6d2;
  color: #b08133;
}
</style>
