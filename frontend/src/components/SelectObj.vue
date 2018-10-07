<template>
<div>
    <div class="meun">
        <div class="thumbnail">
            <div class="key-info clearfix"> <span class="pull-left">
                    <div class="checkbox-wrap"><label><strong>分类</strong></label></div>
                </span> <span class="pull-right"><i class="fa fa-plus-square" @click="addCategory()" title="点击可以添加更多关键词"></i></span>
            </div>
            <ul>
                <li class="checkbox-wrap" v-for="category in categories" :key="category.id">
                    <label :title="category"><input type="radio" :value="category.id" v-model="checkedCategoryId">{{category.name}}</label>
                    <span class="pull-right">
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
  props: ["categories"],
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
      if (!this.checkedCategoryId) {
        this.checkedCategoryId = val[0] && val[0].id;
      }
    }
  },
  methods: {
    addCategory() {
      let eventType = JSON.stringify(this.categories) + "addcategory";
      bus.$once(eventType, name => {
        if (this.categories.find(category => category.name === name)) {
          this.$notify.open({
            content: "当前名称与已有名称重复！",
            duration: 1000,
            type: "danger"
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
        this.plate.options[newVal] = plate.options[category];
        delete this.plate.options[category];
        this.changeData(this.plate);
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "编辑选项",
        type: "edit",
        data: category
      });
    },
    deleteCategory(id) {
      this.$modal.confirm({
        content: "确定删除该分类？",
        onOk: () =>
          this.$http.delete(`/api/category/${id}`).then(() => {
            bus.$emit("loadPlates");
          })
      });
    }
  }
};
</script>