<template>
<div>
    <modal title="添加" :on-ok="save" :is-show="isShow" @close="isShow=false">
    <label class="label">名称：</label>
    <p class="control">
        <input class="input" type="text" v-model="modal.name" placeholder="输入生成器名称">
    </p>
    </modal>
  <a class="generator-block button is-info is-outlined add" @click="add">+</a>
  <router-link v-for="generator in generators" :key="generator.id" :to="{ path: `plates/${generator.id}`}" class="generator-block button is-primary" >
    <a class="button is-danger is-fullwidth" title="删除"  @click.stop="deleteGenerator($event, generator.id)">删除</a>
    {{generator.name}}
  </router-link>
  
</div>

</template>


<script>
import * as _ from "lodash";

export default {
  data() {
    return {
      isShow: false,
      modal: {
        name: ""
      },
      generators: []
    };
  },
  methods: {
    loadData() {
      this.$http.get("/api/generators/get").then(data => {
        this.generators = data;
      });
    },
    add() {
      this.modal.name = "";
      this.isShow = true;
    },
    deleteGenerator(event, id) {
      event.stopPropagation();
      event.preventDefault();
      this.$modal.confirm({
        content: "确定删除这条信息?",
        onOk: () =>
          this.$http.delete(`/api/generator/${id}`).then(() => {
            this.loadData();
          })
      });
    },
    save() {
      if (
        this.generators.find(generator => generator.name === this.modal.name)
      ) {
        this.$notify.open({
          content: "当前名称与已有名称重复！",
          duration: 1000,
          type: "danger"
        });
      } else {
        this.$http
          .post("/api/generator/add", {
            name: this.modal.name
          })
          .then(data => {
            this.loadData();
          });
      }
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>
<style scoped>
.generator-block {
  display: inline-block;
  min-width: 100px;
  height: 100px;
  line-height: 100px;
  font-size: 16px;
  border: 1px solid #ccc;
  text-align: center;
  border-radius: 5px;
  margin: 10px;
  vertical-align: text-bottom;
  position: relative;
  padding: 0;
}
.generator-block .is-danger {
  height: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  overflow: hidden;
  transition: height 0.5s;
}
.generator-block:hover .is-danger {
  height: 20px;
}

.generator-block.add {
  font-size: 28px;
}
</style>


