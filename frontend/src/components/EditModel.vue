<template>
    <modal :title="title" :on-ok="save" :on-cancel="cancelCb" :is-show="isShow" @close="isShow=false">
    <div v-if="type==='add'">
      <p class="control">
          <textarea class="textarea" v-model="modal" placeholder="添加多个请使用逗号（，或,）分割"></textarea>
      </p>
    </div>
    <div v-if="type==='edit'">
      <p class="control">
        <input class="input" type="text" v-model="modal" placeholder="编辑单个词语">
      </p>
    </div>
    </modal>
</template>

<script>
import * as _ from "lodash";
import { bus } from "./bus";

export default {
  data() {
    return {
      type: "",
      title: "",
      isShow: false,
      modal: ""
    };
  },
  methods: {
    save() {
      this.modal = this.modal.replace(/[\r\n]/g,"")
      if (this.type === "add") {
        this.modal = _.chain(this.modal)
          .split(/，|,/)
          .uniq()
          .compact()
          .value();
      }
      bus.$emit(this.eventType, this.modal);
      this.isShow = false;
    },
    cancelCb() {
      // 取消
    }
  },
  mounted() {
    bus.$on("open-model", msg => {
      this.type = msg.type;
      this.title = msg.title;
      this.eventType = msg.eventType;
      this.modal = _.cloneDeep(msg.data);
      this.isShow = true;
    });
  },
  beforeDestroy() {
    bus.$off("open-model");
  },
};
</script>