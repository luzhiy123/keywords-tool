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
                        <i class="fa fa-pencil-square text-gray" @click="editCategory(category)" title="编辑词语"></i>
                        <i class="fa fa-trash text-danger" @click="deleteCategory(category)" title="删除词语"></i>
                    </span>
                </li>
            </ul>
        </div>
        <!-- <button class="button is-warning is-fullwidth" type="button" @click="clearCategory()">清空{{object.name}}</button> -->
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
      object: {
        name: "分类",
        options: []
      },
      checkedCategory: ""
    };
  },
  props: ["categories"],
  watch: {
    checkedCategory(val) {
      this.category = val;
      bus.$emit("category-select-change", val);
    },
  },
  methods: {
    addCategory() {
      let eventType = JSON.stringify(this.plate) + "addcategory";
      bus.$once(eventType, arr => {
        arr.forEach(item => {
          // if (!this.plate.options[item]) {
          //   this.plate.options[item] = [];
          // }
        });
        this.categories.push(...arr);
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: `添加分类`,
        type: "add",
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
      })
      }
  }
};
</script>