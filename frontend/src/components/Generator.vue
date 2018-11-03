<template>
<div>
  <EditModel/>
    <modal title="添加" :on-ok="save" :is-show="isShow" @close="isShow=false">
    <label class="label">名称：</label>
    <p class="control">
        <input class="input" type="text" v-model="modal.name" placeholder="输入生成器名称">
    </p>
    </modal>
  <a class="generator-block button is-info is-outlined add" @click="add">+</a>
  <router-link v-for="generator in generators" :key="generator.id" :to="{ path: 'plates', query: generator}" class="generator-block button is-primary" >
    <span>{{generator.name}}</span>
    <a class="button is-success bottom-btn l" title="编辑"  @click.stop="editGenerator($event, generator)">编辑</a>
    <a class="button is-danger bottom-btn r" title="删除"  @click.stop="deleteGenerator($event, generator.id)">删除</a>
  </router-link>
  
</div>

</template>


<script>
import * as _ from "lodash";
import { bus } from "./bus";
import EditModel from "./EditModel";

export default {
  components: {
    EditModel
  },
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
    editGenerator(event, generator) {
      event.stopPropagation();
      event.preventDefault();
    let eventType = JSON.stringify(generator) + "editGenerator";
      bus.$once(eventType, newVal => {
        if (this.generators.find(item => item.name === newVal)) {
          this.$modal.alert({
            content: "当前名称与已有名称重复！"
          });
        } else {
          this.$http
            .post(`/api/generator/change`, {
              id: generator.id,
              name: newVal
            })
            .then(() => {
              this.loadData();
            });
        }
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "编辑选项",
        type: "edit",
        data: generator.name
      });
    },
    save() {
      if (
        this.generators.find(generator => generator.name === this.modal.name)
      ) {
        this.$modal.alert({
          content: "当前名称与已有名称重复！"
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
.generator-block .bottom-btn {
  height: 0;
  position: absolute;
  bottom: 0;
  overflow: hidden;
  transition: height 0.5s;
  border-radius: 0;
}
.generator-block .bottom-btn.l {
  left: 0;
}
.generator-block .bottom-btn.r {
  right: 0;
}
.generator-block:hover .bottom-btn {
  height: 22px;
  line-height: 22px;
}

.generator-block.add {
  font-size: 28px;
}
</style>


