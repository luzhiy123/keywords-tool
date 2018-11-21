<template>
<div class="meun">
    <div class="thumbnail">
        <div class="key-info clearfix"> <span class="pull-left">
                <div class="checkbox-wrap"><label><input type="checkbox" value="all" v-model="selectedAll" title="点击可以全选当前分类词语"><strong>{{plate.name}}</strong></label></div>
            </span> <span class="pull-right">
              <i class="fa fa-minus-square" @click="deleteConfirm()"  title="删除"></i>
              <i class="fa fa-plus-square" @click="add()" title="点击可以添加更多关键词"></i>
              <i class="fa fa-clipboard" @click="copyPlate(plate)" title="复制列"></i>
              <i class="fa fa-pencil-square" @click="changeName(plate)" title="修改名字"></i>
              </span>
        </div>
        <ul>
            <li class="checkbox-wrap" v-for="(option, index) in plate.options" :key="option.v">
                <label :title="option.v"><input type="checkbox" :value="option.v" v-model="checkedNames">{{option.v}}</label>
                <span class="pull-right">
                    <i class="fa fa-empire comment-icon" aria-hidden="true" 
                        @click="addComment(option)" 
                        :class="option.c && option.c.length ? 'bright' : 'text-gray'">
                        <textarea  v-if="option.c && option.c[0] && option.c[0].t" v-model="option.c[0].t" disabled></textarea>
                    </i>
                    <i class="fa fa-pencil-square text-gray" @click="editOption(option, index)" title="编辑词语"></i>
                    <i class="fa fa-trash text-danger" @click="deleteOption(option)" title="删除词语"></i>
                </span>
            </li>
        </ul>
    </div>
    <button class="button is-warning is-fullwidth" type="button" @click="deleteSelected()">删除选中关键词</button>
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
  props: ["index", "plate", "plates"],
  watch: {
    selectedAll(val) {
      if (val.find(item => item === "all")) {
        this.checkedNames = this.plate.options.map(item => item.v);
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
    copyPlate(plate) {
      let eventType = JSON.stringify(plate) + "addPlate";
      bus.$once(eventType, newVal => {
        plate = _.cloneDeep(plate);
        if (this.plates.find(item => item.name === newVal)) {
          this.$modal.alert({
            content: "当前名称与已有名称重复或者未修改当前名称！"
          });
        } else {
          plate.name = newVal;
          this.$http.post("/api/plate/add", plate).then(() => {
            bus.$emit("loadPlates");
          });
        }
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "拷贝列",
        type: "edit",
        data: plate.name + "_copy"
      });
    },
    changeName(plate) {
      let eventType = JSON.stringify(plate) + "editPlateName";
      bus.$once(eventType, newVal => {
        plate = _.cloneDeep(plate);
        if (this.plates.find(item => item.name === newVal)) {
          this.$modal.alert({
            content: "当前名称与已有名称重复或者未修改当前名称！"
          });
        } else {
          plate.name = newVal;
          this.$http.put("/api/plate/change", plate).then(() => {
            bus.$emit("loadPlates");
          });
        }
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "编辑名称",
        type: "edit",
        data: plate.name
      });
    },
    changeData(plate) {
      this.$http.put("/api/plate/change", plate).then(() => {
        bus.$emit("loadPlates");
      });
    },
    addComment(option) {
      let eventType = JSON.stringify(this.plate) + "addComment";
      bus.$once(eventType, newVal => {
        if (!option.c) {
          option.c = [];
        }
        if (newVal) {
          option.c[0] = {
            a: "SheetJS",
            t: newVal
          };
        } else {
          option.c = [];
        }
        this.changeData(this.plate);
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "编辑备注",
        type: "comment",
        data: option.c && option.c[0] ? option.c[0].t : ""
      });
    },
    editOption(option) {
      let eventType = JSON.stringify(this.plate) + "editOption";
      bus.$once(eventType, newVal => {
        let plate = this.plate;
        if (plate.options.find(item => item.v === newVal)) {
          this.$modal.alert({
            content: "当前名称与已有名称重复或者未修改当前名称！"
          });
        } else {
          option.v = newVal;
          this.changeData(plate);
        }
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "编辑选项",
        type: "edit",
        data: option.v
      });
    },
    deleteOption(option) {
      this.$modal.confirm({
        content: "确定删除该词语？",
        onOk: () => {
          _.remove(this.plate.options, item => item === option);
          _.remove(this.checkedNames, item => item === option);
          this.changeData(this.plate);
        }
      });
    },
    deleteSelected() {
      this.plate.options = this.plate.options.filter(
        item => !this.checkedNames.includes(item.v)
      );
      this.checkedNames = [];
      this.changeData(this.plate);
    },
    deleteConfirm() {
      if (this.plate.options.length) {
        this.$modal.alert({
          content: "该列不为空，禁止删除！"
        });
      } else {
        this.$modal.confirm({
          content: "确定删除这列?",
          onOk: this.deletePlate
        });
      }
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
          if (
            plate.options.find(item => {
              item.v === option;
            })
          ) {
            repetition.push(option);
          } else {
            newOptions.push({
              v: option,
              c: []
            });
          }
        });
        plate.options.push(...newOptions);
        if (repetition.length) {
          this.$modal.confirm({
            content: `以下选项重复：${repetition.toString()}，将不会被添加到，确认添加？`,
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
  mounted() {
    bus.$on("clearSelected", () => {
      this.selectedAll = [];
      this.checkedNames = [];
    });
  },
  beforeDestroy() {
    bus.$off("clearSelected");
  }
};
</script>