<template>
<div class="meun">
    <div class="thumbnail">
        <div class="key-info"> <span class="pull-left">
                <div class="checkbox-wrap"><label><input type="checkbox" value="all" v-model="selectedAll" title="点击可以全选当前分类词语"><strong>{{plate.name}}</strong></label></div>
            </span> <span class="pull-right">
              <i class="fa fa-minus-square" v-if="index>3" @click="deleteConfirm()"></i>
              <i class="fa fa-plus-square" @click="add()" title="点击可以添加更多关键词"></i>
              </span>
        </div>
        <ul>
            <li class="checkbox-wrap" v-for="(option, index) in plate.options" :key="option">
                <label :title="option"><input type="checkbox" :value="option" v-model="checkedNames">{{option}}</label>
                <span class="pull-right">
                    <i class="fa fa-pencil-square text-gray" @click="editOption(option, index)" title="编辑词语"></i>
                    <i class="fa fa-trash text-danger" @click="deleteOption(option)" title="删除词语"></i>
                </span>
            </li>
        </ul>
    </div>
    <button class="button is-warning is-fullwidth" type="button" @click="clear()">清空{{plate.name}}</button>
</div>
</template>

<script>
import * as _ from "lodash";
import EditModel from "./EditModel";
import { bus } from "./bus";
import { setTimeout } from "timers";

export default {
  data() {
    return {
      selectedAll: [],
      checkedNames: []
    };
  },
  props: ["index", "plate"],
  watch: {
    selectedAll(val) {
      if (val.find(item => item === "all")) {
        this.checkedNames = this.plate.options;
      } else {
        this.checkedNames = [];
      }
    },
    checkedNames(val) {
      bus.$emit("plate-select-change", {
        index: this.index,
        list: val
      });
    }
  },
  methods: {
    changeData(plate) {
      this.$http.put("/api/plate/change", plate).then(() => {
        bus.$emit("loadPlates");
      });
    },
    editOption(option, index) {
      let eventType = JSON.stringify(this.plate) + "option";
      bus.$once(eventType, newVal => {
        let plate = _.cloneDeep(this.plate);
        plate.options.splice(index, 1, newVal);
        this.changeData(plate);
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "编辑选项",
        type: "edit",
        data: option
      });
    },
    deleteOption(option) {
      _.remove(this.plate.options, item => item === option);
      this.changeData(this.plate);
    },
    clear() {
      this.plate.options = [];
      this.changeData(this.plate);
    },
    deleteConfirm() {
      this.$modal.confirm({
        content: '确定删除这条信息?',
        onOk: this.deletePlate,
      });
    },
    deletePlate() {
      this.$http.delete(`/api/plate/${this.plate.id}`).then(() => {
        bus.$emit("loadPlates");
      });
    },
    add() {
      let eventType = JSON.stringify(this.plate) + "change";
      bus.$once(eventType, options => {
        let plate = _.cloneDeep(this.plate);
        plate.options.push(...options);
        this.changeData(plate);
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: `添加${this.plate.name}`,
        type: "add",
        data: []
      });
    }
  },
  mounted() {}
};
</script>
<style>
.fa {
  cursor: pointer;
}
.pull-left {
  margin-top: 4px;
}
.thumbnail {
  border: 1px solid #f9d8a2;
  margin-bottom: 10px;
  display: block;
  margin-bottom: 20px;
  line-height: 1.42857143;
  background-color: #fff;
  border: 1px solid #ddd;
  -webkit-transition: border 0.2s ease-in-out;
  -o-transition: border 0.2s ease-in-out;
  transition: border 0.2s ease-in-out;
}
.key-info {
  background-color: #f2e6d2;
  color: #b08133;
  overflow: hidden;
  padding: 5px 6px 8px 13px;
}
.key-info .pull-right {
  margin-top: 5px;
  margin-right: 7px;
}
ul {
  list-style: none;
  padding: 0 5px;
  margin-top: 0px;
  padding-top: 5px;
  height: 400px;
  overflow: auto;
}
ul li {
  height: 30px;
  padding-left: 8px;
}
.checkbox-wrap {
  position: relative;
  display: block;
  margin-top: 0px;
  margin-bottom: 0px;
  line-height: normal !important;
}
.checkbox-wrap label {
  cursor: pointer;
  width: 50%;
  display: inline-block;
}
.pull-left .checkbox-wrap label {
  width: auto;
}
.checkbox-wrap input {
  vertical-align: text-bottom;
  margin-right: 5px;
}

.text-gray,
.text-danger {
  color: #aaa;
  cursor: pointer;
}
.checkbox-wrap + .checkbox-wrap,
.radio + .radio {
  margin-top: -5px;
}
</style>

