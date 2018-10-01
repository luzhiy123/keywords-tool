<template>
<div>
  <nav class="header">用户名：{{user.name}}
    <router-link to="/login" class="r button is-info  is-outlined" >退出</router-link>
  </nav>
  <div class="container">
    <router-view></router-view>
  </div>
</div>

</template>


<script>
import * as _ from "lodash";

export default {
  data() {
    return {
      user: {}
    };
  },
  methods: {},
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    if (!this.user) {
      this.$router.push("/login");
    }
  }
};
</script>
