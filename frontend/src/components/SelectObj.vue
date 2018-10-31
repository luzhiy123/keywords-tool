<template>
<div>
    <div class="meun">
        <div class="category thumbnail">
            <div class="key-info clearfix"> <span class="pull-left">
                    <div class="checkbox-wrap"><label><strong>分类</strong></label></div>
                </span> <span class="pull-right"><i class="fa fa-plus-square" @click="addCategory()" title="点击可以添加更多关键词"></i></span>
            </div>
            <ul>
                <li class="checkbox-wrap" v-for="category in categories" :key="category.id">
                    <label :title="category"><input type="radio" :value="category.id" v-model="checkedCategoryId">{{category.name}}</label>
                    <span class="pull-right">
                    <i class="fa fa-pencil-square text-gray" @click="editCategory(category)" title="编辑词语"></i>
                        <i class="fa fa-trash text-danger" @click="deleteCategory(category.id)" title="删除词语"></i>
                    </span>
                </li>
            </ul>
        </div>
    </div>
                </div>
</template>

<script>
import * as _ from "lodash";
import EditModel from "./EditModel";
import { bus } from "./bus";
import { setTimeout } from "timers";
import Select from "./Select";

export default {
  components: {
    Select
  },
  data() {
    return {
      checkedCategoryId: ""
    };
  },
  props: ["categories", "plates"],
  watch: {
    checkedCategoryId(val) {
      this.checkedCategoryId = val;
      bus.$emit("category-select-change", val);
    },
    categories(val) {
      if (this.addName) {
        let category = _.find(val, category => category.name === this.addName);
        this.addName = null;
        if (category) {
          this.checkedCategoryId = category.id;
        }
      }
      if (!this.checkedCategoryId || !_.find(val, category => category.id === this.checkedCategoryId)) {
        this.checkedCategoryId = val[0] && val[0].id;
      }
    }
  },
  methods: {
    addCategory() {
      let eventType = JSON.stringify(this.categories) + "addcategory";
      bus.$once(eventType, name => {
        if (this.categories.find(category => category.name === name)) {
          this.$modal.alert({
            content: "当前名称与已有名称重复！"
          });
        } else {
          this.$http
            .post("/api/category/add", {
              generatorid: this.$route.params.id,
              name: name
            })
            .then(() => {
              this.addName = name;
              bus.$emit("loadPlates");
            });
        }
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: `添加分类`,
        type: "edit",
        data: []
      });
    },
    editCategory(category) {
      let eventType = JSON.stringify(this.plate) + "editcategory";
      bus.$once(eventType, newVal => {
        if (this.categories.find(item => item.name === newVal)) {
          this.$modal.alert({
            content: "当前名称与已有名称重复！"
          });
        } else {
          this.$http
            .post(`/api/category/change`, {
              id: category.id,
              name: newVal
            })
            .then(() => {
              bus.$emit("loadPlates");
            });
        }
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "编辑选项",
        type: "edit",
        data: category.name
      });
    },
    deleteCategory(id) {
      if (this.plates.filter(item => item.categoryid === id).length) {
        this.$modal.alert({
          content: "该分类不为空，禁止删除！"
        });
      } else {
        this.$modal.confirm({
          content: "确定删除该分类？",
          onOk: () =>
            this.$http.delete(`/api/category/${id}`).then(() => {
              bus.$emit("loadPlates");
            })
        });
      }
    }
  }
};
</script>
<style scoped>
.category.thumbnail {
  border: 2px solid #b3b0b0;
}
.category .key-info {
  background-color: #d0ac71;
}
</style>
