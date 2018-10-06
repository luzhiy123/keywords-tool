<template>
<div>
    <div class="meun">
        <div class="thumbnail">
            <div class="key-info clearfix"> <span class="pull-left">
                    <div class="checkbox-wrap"><label><strong>分类</strong></label></div>
                </span> <span class="pull-right"><i class="fa fa-plus-square" @click="addCategory()" title="点击可以添加更多关键词"></i></span>
            </div>
            <ul>
                <li class="checkbox-wrap" v-for="category in categories" :key="category">
                    <label :title="category"><input type="radio" :value="category" v-model="checkedCategory">{{category}}</label>
                    <span class="pull-right">
                        <i class="fa fa-trash text-danger" @click="deleteCategory(category)" title="删除词语"></i>
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
      checkedCategory: ""
    };
  },
  props: ["categories"],
  watch: {
    checkedCategory(val) {
      this.category = val;
      bus.$emit("category-select-change", val);
    },
    categories(val) {
      if (!this.category) {
        this.checkedCategory = val[0];
      }
    }
  },
  methods: {
    addCategory() {
      let eventType = JSON.stringify(this.categories) + "addcategory";
      bus.$once(eventType, data => {
        if (this.categories.indexOf(data) > -1) {
          this.$notify.open({
            content: "当前名称与已有名称重复！",
            duration: 1000,
            type: "danger"
          });
        } else {
          let categories = [...this.categories, data]
          this.$http
            .post("/api/categories/change", {
              id: this.$route.params.id,
              categories: categories
            })
            .then(() => {
              this.checkedCategory = data;
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
    deleteCategory(category) {
      this.$http.delete(`/api/plate-by-category/${category}`).then(() => {
        bus.$emit("loadPlates");
      });
    }
  }
};
</script>