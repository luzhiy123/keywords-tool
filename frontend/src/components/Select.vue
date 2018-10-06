<template>
<div class="meun">
    <div class="thumbnail">
        <div class="key-info clearfix"> <span class="pull-left">
                <div class="checkbox-wrap"><label><input type="checkbox" value="all" v-model="selectedAll" title="点击可以全选当前分类词语"><strong>{{plate.name}}</strong></label></div>
            </span> <span class="pull-right">
              <i class="fa fa-minus-square" @click="deleteConfirm()"></i>
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
        if (plate.options.indexOf(newVal) > -1) {
          this.$notify.open({
            content: "当前名称与已有名称重复或者未修改当前名称！",
            duration: 1000,
            type: "danger"
          });
        } else {
          plate.options.splice(index, 1, newVal);
          this.changeData(plate);
        }
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
        content: "确定删除这条信息?",
        onOk: this.deletePlate
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
        let repetition = [];
        let newOptions = [];
        options.forEach(option => {
          if (plate.options.indexOf(option) === -1) {
            newOptions.push(option);
          } else {
            repetition.push(option);
          }
        });
        plate.options.push(...newOptions);
        if (repetition.length) {
          this.$notify.confirm({
            content: `以下选项重复：${repetition.toString()}，将不会被添加到！`,
            onOk: () => this.changeData(plate)
          });
        } else if (options.length) {
          this.changeData(plate);
        }
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