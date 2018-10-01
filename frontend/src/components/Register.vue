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
    注册
  </button>
</p>
  <div class="center">
    已有账号去<router-link to="login" class=" is-outlined " >登录</router-link>
  </div>
</div>

</template>


<script>
import * as _ from "lodash";

export default {
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
          .post("/api/user/register", {
            username: this.username,
            password: this.password
          })
          .then(data => {
            if (data) {
              localStorage.setItem("user", JSON.stringify(data));
              this.$router.push("home");
            } else {
              this.$notify.open({
                content: "未知错误",
                duration: 1000,
                type: "danger"
              });
            }
          });
      }
    }
  }
};
</script>
