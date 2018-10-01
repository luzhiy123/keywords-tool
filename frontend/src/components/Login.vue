<template>
<div class="from-container">
  <h1 class="ptitle">标题生成器</h1>
   <p class="control has-icon">
  <input class="input" type="text" v-model="username" placeholder="账号">
  <i class="fa fa-envelope"></i>
</p>
<p class="control has-icon">
  <input class="input" type="password" v-model="password" placeholder="密码">
  <i class="fa fa-lock"></i>
</p>
<p class="control">
  <button class="button is-success is-fullwidth" @click="login()" >
    登录
  </button>
  
</p>
  <div class="center">
    没有账号去<router-link to="register" class=" is-outlined is-fullwidth" >注册</router-link>
  </div>
  <!-- <router-link to="home" class=" is-outlined " >直接去看看</router-link> -->
</div>

</template>


<script>
import * as _ from "lodash";

export default {
  beforeCreate: function() {
    localStorage.removeItem("user");
  },
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    login() {
      if (!this.username) {
        this.$notify.open({
          content: "账号不能为空！",
          duration: 1000,
          type: "danger"
        });
      } else if (!this.password) {
        this.$notify.open({
          content: "密码不能为空！",
          duration: 1000,
          type: "danger"
        });
      } else {
        this.$http
          .post("/api/user/login", {
            username: this.username,
            password: this.password
          })
          .then(data => {
            localStorage.setItem("user", JSON.stringify(data));
            this.$router.push("home");
          });
      }
    }
  }
};
</script>

