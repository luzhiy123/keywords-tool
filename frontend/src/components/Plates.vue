<template>
<div>
    <EditModel/>
     <router-link :to="{name: 'generator'}" class="back">> 返回</router-link>
    <button class="button is-danger is-fullwidth"  @click="build()" :disabled="!categoryid">生成标题</button>
    <div class="btn-group clearfix">
      <a href="" download="标题生成器.xlsx" id="hf"  v-show="false"></a>
      <input type="file" @change="parseExcel" id="parseExcel" v-show="false" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
      <button @click="parseClick" class="button r is-primary bottom-btn">导入</button>
      <button @click="exportExcel" class="button r is-primary bottom-btn">导出</button>
      <button @click="add" class="button r is-primary bottom-btn">添加关键词类</button>
      <button @click="clearSelected" class="button r is-primary bottom-btn">重置选择</button>
    </div>
    <div class="clearfix">
        <SelectObj :categories="categories" :plates="plates"></SelectObj>
        <div></div>
        <div v-for="(plate, index) in filteredPlates" :key="plate.id" class="plate-item" v-dragging="{ item: plate, list: filteredPlates, group: 'plates' }">
          <Select :plate="plate" :index="index" :plates="plates" ></Select>
        </div>
        <div v-if="!filteredPlates.length && categories.length" class="letter center">
          <span>当前分类没有关键词类，请先</span>
          <a @click="add" class="link">添加关键词类</a>
        </div>
        <div v-if="!categories.length" class="letter center">
          <span>当前还未有分类，请先</span>
          <a @click="addCategory" class="link">添加分类</a>
          <span>或</span>
          <a @click="parseClick" class="link">导入数据</a>
        </div>
    </div>
    <modal title="已生成标题"  :is-show="isShowTitle" :on-cancel="() => isShowTitle=false" :on-ok="copyTitle" ok-text="复制" cancel-text="关闭">
      <p class="control">
          添加间隔：<b-switch on-text="开" off-text="关" v-model="withSeptal"></b-switch>
          <textarea class="textarea title-content" v-model="titleContent"></textarea>
      </p>
    </modal>
</div>

</template>


<script>
import * as _ from "lodash";
import { bus } from "./bus";
import Select from "./Select";
import EditModel from "./EditModel";
import SelectObj from "./SelectObj";
import exportExcel from "./../excel/exportExcel";
import parseExcel from "./../excel/parseExcel";

export default {
  components: {
    SelectObj,
    Select,
    EditModel
  },
  data() {
    return {
      withSeptal: false,
      categories: [],
      categoryid: null,
      selected: [],
      plates: [],
      isShowTitle: false,
      titleContent: "",
      isSlice: true,
      filteredPlates: []
    };
  },
  watch: {
    withSeptal(val) {
      this.build();
    }
  },
  methods: {
    isArray(arr) {
      return _.isArray(arr);
    },

    clearSelected() {
      this.selected = {};
      bus.$emit("clearSelected");
    },
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
            this.loadData();
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

    addCategory() {
      let eventType = JSON.stringify(this.categories) + "addcategory";
      bus.$once(eventType, data => {
        this.$http
          .post("/api/category/add", {
            generatorid: this.$route.params.id,
            name: data
          })
          .then(data => {
            this.loadData();
          });
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: `添加分类`,
        type: "edit",
        data: []
      });
    },
    loadData() {
      Promise.all([
        this.$http.get("/api/categories/get", {
          params: {
            id: this.$route.params.id
          }
        }),
        this.$http.get("/api/plates/get", {
          params: {
            generatorid: this.$route.params.id
          }
        })
      ]).then(res => {
        this.categories = res[0];
        this.plates = res[1];
      });
    },
    getCategoryid(name) {
      let category =
        this.categories.find(category => category.name === name) || {};
      return category.id;
    },
    getCategoryName(id) {
      let category = this.categories.find(category => category.id === id) || {};
      return category.name;
    },
    exportExcel() {
      let data = [["类别", "关键词类"]];
      let plates = _.orderBy(this.plates, "categoryid");
      let lastCategoryId;
      plates.forEach(plate => {
        let row = [
          lastCategoryId === plate.categoryid
            ? ""
            : this.getCategoryName(plate.categoryid),
          plate.name,
          ...plate.options
        ];
        while (row.length > data[0].length) {
          data[0].push("");
        }
        lastCategoryId = plate.categoryid;
        data.push(row);
      });
      console.log(data);
      exportExcel(data);
    },
    parseClick() {
      // let evt = new MouseEvent("click", { bubbles: false, cancelable: true, view: window });
      document.querySelector("#parseExcel").click();
    },
    parseExcel(e) {
      if (e.target.files[0]) {
        parseExcel(e.target.files[0])
          .then(data => {
            let platesData = [];
            e.target.value = "";
            let importData = {
              generatorid: this.$route.params.id,
              changes: [],
              adds: []
            };
            let lastCategoryName = "";
            _.forEach(data, row => {
              row = _.toArray(row);
              if (row[0] !== "类别" && row.length >= 3) {
                let [categoryName, name, ...options] = row;
                lastCategoryName = categoryName || lastCategoryName;
                let plate = this.plates.find(
                  plate =>
                    plate.name === name &&
                    this.getCategoryid(lastCategoryName) === plate.categoryid
                );
                if (plate) {
                  plate = _.cloneDeep(plate);
                  plate.options = options;
                  importData.changes.push(plate);
                } else {
                  importData.adds.push({
                    name: name,
                    options: options,
                    categoryName: lastCategoryName
                  });
                }
              }
            });
            if (importData.adds.length || importData.changes.length) {
              this.$http.post("/api/plates/import", importData).then(() => {
                this.loadData();
                this.$modal.alert({
                  content: "导入成功！",
                  type: "success"
                });
              });
            }
          })
          .catch(msg => {
            this.$modal.alert({
              content: msg
            });
          });
      }
    },
    add() {
      let modal = {
        name: "",
        options: [],
        generatorid: this.$route.params.id
      };
      let eventType = JSON.stringify(modal) + "add";
      bus.$once(eventType, name => {
        if (name === "分类") {
          this.$modal.alert({
            content: "不能命名为‘分类’！"
          });
        } else if (
          this.plates.find(plate => {
            return plate.name === name && plate.categoryid === this.categoryid;
          })
        ) {
          this.$modal.alert({
            content: "当前分类已有该项属性！"
          });
        } else {
          modal.name = name;
          modal.categoryid = this.categoryid;
          this.$http.post("/api/plate/add", modal).then(() => {
            this.loadData();
          });
        }
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "添加关键词类",
        type: "edit",
        data: ""
      });
    },
    copyTitle() {
      let currentFocus = document.activeElement;
      let titleContent = document.querySelector(".title-content");
      titleContent.focus();
      titleContent.setSelectionRange(0, titleContent.value.length);
      document.execCommand("copy", true);
      currentFocus.focus();
    },
    build() {
      this.isShowTitle = true;
      let list = [];
      _.forEach(this.selected, group => {
        let buildList = [];
        if (list.length) {
          group.forEach(item => {
            list.forEach(val => {
              val = val + (this.withSeptal ? " " : "") + item;
              buildList.push(val);
            });
          });
        } else {
          group.forEach(item => {
            buildList.push(item);
          });
        }
        list = buildList;
      });
      this.titleContent = list.join("\n");
    }
  },
  mounted() {
    this.loadData();
    bus.$on("loadPlates", () => {
      this.loadData();
    });

    bus.$on("plate-select-change", msg => {
      this.selected[msg.index] = msg.list;
    });

    bus.$on("category-select-change", val => {
      this.categoryid = val;
      this.filteredPlates = this.plates.filter(
        plate => plate.categoryid === this.categoryid
      );
      this.selected = {};
    });

    this.$dragging.$on("dragend", aaa => {
      let ids = this.filteredPlates.map(item => item.id);
      this.$http.put("/api/plate/order/change", { ids: ids }).then(() => {
        this.clearSelected();
      });
    });
  },
  beforeDestroy() {
    bus.$off("loadPlates");
    bus.$off("plate-select-change");
    bus.$off("category-select-change");
  },
  computed: {
    // filteredPlates() {
    //   return this.plates.filter(plate => plate.categoryid === this.categoryid);
    // }
  }
};
</script>
<style>
.letter {
  margin-top: 50px;
}
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
  display: inline-block;
  vertical-align: middle;
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
