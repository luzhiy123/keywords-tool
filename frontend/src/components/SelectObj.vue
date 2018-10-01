<template>
<div>
    <div class="meun">
        <div class="thumbnail">
            <div class="key-info"> <span class="pull-left">
                    <div class="checkbox-wrap"><label><strong>{{object.name}}</strong></label></div>
                </span> <span class="pull-right"><i class="fa fa-plus-square" @click="addCategory()" title="点击可以添加更多关键词"></i></span>
            </div>
            <ul>
                <li class="checkbox-wrap" v-for="(category, index) in object.options" :key="category">
                    <label :title="category"><input type="radio" :value="category" v-model="checkedCategory">{{category}}</label>
                    <span class="pull-right">
                        <i class="fa fa-pencil-square text-gray" @click="editCategory(category, index)" title="编辑词语"></i>
                        <i class="fa fa-trash text-danger" @click="deleteCategory(category)" title="删除词语"></i>
                    </span>
                </li>
            </ul>
        </div>
        <button class="button is-warning is-fullwidth" type="button" @click="clearCategory()">清空{{object.name}}</button>
    </div>
    <div class="meun">
        <div class="thumbnail">
            <div class="key-info"> <div class="pull-left">
                <div class="checkbox-wrap">
                    <label><input type="checkbox" value="all" v-model="selectedAll" title="点击可以全选当前分类词语" v-if="checkedCategory"><strong>{{plate.name}}</strong></label>
                </div>
                </div> 
                <span class="pull-right"><i class="fa fa-plus-square" v-if="checkedCategory"  @click="addOptions()" title="点击可以添加更多关键词"></i></span>
            </div>
            <ul>
                <li class="checkbox-wrap" v-for="(option, index) in selectOptions" :key="option">
                    <label :title="option"><input type="checkbox" :value="option" v-model="checkedNames">{{option}}</label>
                    <span class="pull-right">
                        <i class="fa fa-pencil-square text-gray" @click="editOption(option, index)" title="编辑词语"></i>
                        <i class="fa fa-trash text-danger" @click="deleteOption(option)" title="删除词语"></i>
                    </span>
                </li>
            </ul>
        </div>
        <button class="button is-warning is-fullwidth" type="button" @click="clearOption()">清空{{object.name}}</button>
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
      selectOptions: [],
      selectedAll: [],
      checkedNames: [],
      checkedCategory: ""
    };
  },
  props: ["index", "plate"],
  watch: {
    checkedCategory(val) {
      this.selectOptions = this.plate.options[val];
    },
    selectedAll(val) {
      if (val.find(item => item === "all")) {
        this.checkedNames = this.plate.options[this.checkedCategory];
      } else {
        this.checkedNames = [];
      }
    },
    checkedNames(val) {
      bus.$emit("plate-select-change", {
        index: this.index,
        list: val.map(item => this.checkedCategory + item)
      });
    }
  },
  methods: {
    initCategory() {
      this.object.options = Object.keys(this.plate.options);
      this.selectPlate = {
        name: this.plate.name,
        options: [],
        index: this.plate.index
      };
      this.selectOptions = this.plate.options[this.checkedCategory];
    },
    changeData(plate) {
      this.$http.put("/api/plate/change", plate).then(() => {
        this.initCategory();
        bus.$emit("loadPlates");
      });
    },
    addCategory() {
      let eventType = JSON.stringify(this.plate) + "addcategory";
      bus.$once(eventType, arr => {
        arr.forEach(item => {
          if (!this.plate.options[item]) {
            this.plate.options[item] = [];
          }
        });
        this.changeData(this.plate);
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
      delete this.plate.options[category];
      if (this.checkedCategory === category) {
        this.checkedCategory = "";
      }
      this.changeData(this.plate);
    },
    clearCategory() {
      this.plate.options = {};
      this.checkedCategory = "";
      this.changeData(this.plate);
    },
    addOptions() {
      if (this.checkedCategory) {
        let eventType = JSON.stringify(this.plate) + "addOptions";
        let plate = this.plate;
        bus.$once(eventType, options => {
          plate.options[this.checkedCategory].push(...options);
          this.changeData(plate);
        });
        bus.$emit("open-model", {
          eventType: eventType,
          title: `添加关键词`,
          type: "add",
          data: []
        });
      }
    },
    editOption(option, index) {
      let eventType = JSON.stringify(this.plate) + "editoption";
      bus.$once(eventType, newVal => {
        this.plate.options[this.checkedCategory].splice(index, 1, newVal);
        this.changeData(this.plate);
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "编辑选项",
        type: "edit",
        data: option
      });
    },
    deleteOption(option) {
      _.remove(
        this.plate.options[this.checkedCategory],
        item => item === option
      );
      this.changeData(this.plate);
    },
    clearOption() {
      if (this.checkedCategory) {
        this.plate.options[this.checkedCategory] = [];
        this.changeData(this.plate);
      }
    }
  },
  mounted() {
    this.initCategory();
  }
};
</script>