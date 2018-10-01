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
    <a @click.stop>
    <i class="fa fa-trash" title="删除"  @click.stop="deleteGenerator($event, generator.id)"></i>
    </a>
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
      this.$http.delete(`/api/generator/${id}`).then(() => {
        this.loadData();
      });
    },
    save() {
      this.$http
        .post("/api/generator/add", {
          name: this.modal.name
        })
        .then(data => {
          this.loadData();
        });
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>
<style>
.generator-block {
  display: inline-block;
  min-width: 100px;
  height: 100px;
  line-height: 100px;
  font-size: 16px;
  border: 1px solid #ccc;
  text-align: center;
  border-radius: 5px;
  padding: 0 15px;
  margin: 10px;
  vertical-align: text-bottom;
  position: relative;
}
.generator-block:hover .fa-trash {
  display: block;
}
.generator-block .fa-trash {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  color: #f56954;
}
.generator-block .fa-trash:hover {

  color: #fff;
}
.generator-block.add {
  font-size: 28px;
}
</style>


