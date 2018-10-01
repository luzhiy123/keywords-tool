
import axios from 'axios'
import * as _ from 'lodash'
import Vue from 'vue'
import config from './config.json'


axios.defaults.baseURL = config.api;

axios.interceptors.request.use(
    config => {
        const token = sessionStorage.getItem("token"); //获取存储在本地的token
        let user = JSON.parse(localStorage.getItem('user'))
        config.params = _.merge({}, config.params, { user: user });
        config.data = JSON.stringify(config.data);
        config.headers = {
            'Content-Type': 'application/json' //设置跨域头部,虽然很多浏览器默认都是使用json传数据，但咱要考虑IE浏览器。
        };
        if (token) {
            config.headers.Authorization = "Token " + token; //携带权限参数
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);
axios.interceptors.response.use(
    response => {
        if (response.status == 401) {
            router.push({ 
                path: 'login'
            })
        } else if (response.status == 200) {
            if (response.data.detail) {
                Vue.prototype.$notify.open({ content: response.data.detail, type: "danger" });
                return Promise.reject();
            } else {
                return response.data
            }
        }
        return response;
    },
    error => {
        return Promise.reject(error);
    });

export default axios