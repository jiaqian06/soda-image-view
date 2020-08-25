import Vue from 'vue'
import Lazyload from 'vue-lazyload'
import Imageview from './components/image-view/index.vue'

Vue.config.productionTip = false
Vue.use(Lazyload, {
  preLoad: 1.2,
  attempt: 3, // 尝试计数
  filter: {}
})
const ImageView = {
  install: (Vue) => {
    Vue.component('image-view', Imageview)
  }
}

export default {
  ImageView
}
