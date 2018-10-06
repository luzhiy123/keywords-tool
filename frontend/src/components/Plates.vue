<template>
<div>
    <EditModel/>
     <router-link :to="{name: 'generator'}" class="back">> 返回</router-link>
    <button class="button is-danger is-fullwidth"  @click="build()" :disabled="!category">生成标题</button>
    <div class="btn-group clearfix">
      <input type="file" @change="parseExcel" id="parseExcel" v-show="false" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
      <button @click="parseClick" class="button r is-primary bottom-btn">导入</button>
      <button @click="exportExcel" class="button r is-primary bottom-btn">导出</button>
      <button @click="add" class="button r is-primary bottom-btn">添加关键词</button>
       <a href="" download="标题生成器.xlsx" id="hf"></a>
    </div>
    <div class="clearfix">
      
        <SelectObj :categories="categories"></SelectObj>
        <div v-for="(plate, index) in filteredPlates" :key="plate.id">
          <Select :plate="plate" :index="index"></Select>
        </div>
        <div v-if="!filteredPlates.length && categories.length" class="center"> 当前分类没有关键词，请先<a @click="add" class="link">添加关键词</a></div>
        <div v-if="!categories.length" class="center"> 当前还未有分类，请先<a @click="addCategory" class="link">添加分类</a></div>
    </div>
    <modal title="已生成标题"  :is-show="isShowTitle" @close="isShowTitle=false">
      <p class="control">
          <textarea class="textarea" v-model="titleContent"></textarea>
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
      categories: [],
      category: "",
      selected: [],
      plates: [],
      isShowTitle: false,
      titleContent: ""
    };
  },
  methods: {
    isArray(arr) {
      return _.isArray(arr);
    },

    addCategory() {
      let eventType = JSON.stringify(this.categories) + "addcategory";
      bus.$once(eventType, data => {
        this.$http
          .post("/api/categories/change", {
            id: this.$route.params.id,
            categories: [data]
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
    deletePlate(id) {
      this.$http.delete(`/api/plate/${id}`).then(() => {
        this.loadData();
      });
    },
    exportExcel() {
      let data = [["类别", "关键词类"]];
      let plates = _.orderBy(this.plates, "category");
      plates.forEach(plate => {
        let row = [plate.category, plate.name, ...plate.options];
        while (row.length > data[0].length) {
          data[0].push("");
        }
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
              changes: [],
              adds: []
            };
            _.forEach(data, row => {
              row = _.toArray(row);
              if (row[0] !== "类别" && row.length >= 3) {
                let [category, name, ...options] = row;
                let plate = this.plates.find(
                  plate =>
                    plate.name === item.name && plate.category === category
                );
                if (plate) {
                  plate.options = options;
                  importData.changes.push(plate);
                } else {
                  importData.adds.push({
                    name: name,
                    options: options,
                    generatorid: this.$route.params.id,
                    category: category
                  });
                }
              }
            });
            if (importData.adds.length || importData.changes.length) {
              this.$http.post("/api/plates/import", importData).then(() => {
                this.loadData();
                this.$notify.open({
                  content: "导入成功",
                  duration: 1000,
                  type: "success"
                });
              });
            }
          })
          .catch(msg => {
            this.$notify.open({
              content: msg,
              duration: 1000,
              type: "danger"
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
          this.$notify.open({
            content: "不能命名为‘分类’！",
            duration: 1000,
            type: "danger"
          });
        } else if (
          this.plates.find(plate => {
            return plate.name === name && plate.category === this.category;
          })
        ) {
          this.$notify.open({
            content: "当前分类已有该项属性！",
            duration: 1000,
            type: "danger"
          });
        } else {
          modal.name = name;
          modal.category = this.category;
          this.$http.post("/api/plate/add", modal).then(() => {
            this.loadData();
          });
        }
      });
      bus.$emit("open-model", {
        eventType: eventType,
        title: "添加新列",
        type: "edit",
        data: ""
      });
    },
    build() {
      this.isShowTitle = true;
      let list = [];
      this.selected.forEach(group => {
        let buildList = [];
        if (list.length) {
          group.forEach(item => {
            if (list.length) {
              list.forEach(val => {
                buildList.push(this.category + val + item);
              });
            }
          });
        } else {
          buildList = [...group];
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
      this.category = val;
    });
  },
  computed: {
    filteredPlates() {
      return this.plates.filter(plate => plate.category === this.category);
    }
  }
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
