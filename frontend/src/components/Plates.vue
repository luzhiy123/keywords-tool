<template>
<div>
    <EditModel/>
     <router-link :to="{name: 'generator'}" class="back">> 返回</router-link>
    <a class="button is-danger is-outlined is-fullwidth"  @click="build()">生成标题</a>
    <div class="btn-group clearfix">
      <input type="file" @change="parseExcel" id="parseExcel" v-show="false" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
      <button @click="parseClick" class="button r is-primary bottom-btn">导入</button>
      <button @click="exportExcel" class="button r is-primary bottom-btn">导出</button>
      <button @click="add" class="button r is-primary bottom-btn">添加</button>
       <a href="" download="plate.xlsx" id="hf"></a>
    </div>
    <div class="clearfix">
        <div  v-for="(plate, index) in plates" :key="plate.id">
          <Select :plate="plate" :index="index" v-if="isArray(plate.options)"></Select>
          <SelectObj :plate="plate" :index="index" v-if="!isArray(plate.options)"></SelectObj>
        </div>
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
    loadData() {
      this.$http
        .get("/api/plates/get", {
          params: {
            generatorid: this.$route.params.id
          }
        })
        .then(data => {
          this.plates = data;
        });
    },
    deletePlate(id) {
      this.$http.delete(`/api/plate/${id}`).then(() => {
        this.loadData();
      });
    },
    exportExcel() {
      let data = [[]];
      let row = 0;
      this.plates.forEach(plate => {
        if (_.isArray(plate.options)) {
          let col = 0;
          addData(row, col++, plate.name);
          plate.options.forEach(option => {
            addData(row, col++, option);
          });
          row++;
        } else {
          let col = 0;
          addData(row, col++, "分类", plate.name);
          for (let key in plate.options) {
            plate.options[key].forEach(option => {
              addData(row, col++, key, option);
            });
          }
          row = row + 2;
        }
      });
      function addData(row, col, ...arr) {
        console.log(row, col, arr);
        if (!data[col]) {
          data[col] = [];
        }
        while (data[col].length < row) {
          data[col].push("");
        }
        data[col].push(...arr);
      }
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
            _.forEach(data, (col, colIndex) => {
              _.forEach(col, (item, rowIndex) => {
                if (colIndex === 0) {
                  platesData.push({
                    name: item,
                    options: item === "分类" ? {} : []
                  });
                } else {
                  let plate = platesData[rowIndex];
                  if (_.isArray(plate.options)) {
                    item && plate.options.push(item);
                  } else {
                    let nextValue = col[parseInt(rowIndex) + 1];
                    if (plate.options[item]) {
                      plate.options[item].push(nextValue);
                    } else {
                      plate.options[item] = [nextValue];
                    }
                  }
                }
              });
            });
            let category;
            let promise = [];
            let maxIndex = this.getNewIndex();
            let importData = {
              changes: [],
              adds: []
            };
            platesData.forEach((item, index) => {
              if (item.name === "分类") {
                category = item;
              } else {
                if (category) {
                  item.options = category.options;
                  category = undefined;
                }
                let plate = this.plates.find(plate => plate.name === item.name);
                if (plate) {
                  plate.options = item.options;
                  importData.changes.push(plate);
                } else {
                  importData.adds.push({
                    name: item.name,
                    options: item.options,
                    index: maxIndex + index,
                    generatorid: this.$route.params.id
                  });
                }
              }
            });

            this.$http.post("/api/plates/import", importData).then(() => {
              this.loadData();
              this.$notify.open({
                content: "导入成功",
                duration: 1000,
                type: "success"
              });
            });
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
        index: this.getNewIndex(),
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
        } else if (this.plates.find(plate => plate.name === name)) {
          this.$notify.open({
            content: "名称重复！",
            duration: 1000,
            type: "danger"
          });
        } else {
          modal.name = name;
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
    getNewIndex() {
      let index = 0;
      this.plates.forEach(plate => {
        if (plate.index > index) {
          index = plate.index;
        }
      });
      return ++index;
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
                buildList.push(val + item);
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
  }
};
</script>
