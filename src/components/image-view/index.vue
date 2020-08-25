<template>
  <!-- 提供图片预览，webp格式/尺寸调整设置 -->
  <div class="image-view">
    <img :class="klass"
      :style="{'display': imgLoadType !== 'img' ? 'none' : 'block'}"
      :src="trueImgSrc"
      ref="img"
      alt=""
      @error='onError'
      v-lazy="lazyImgObj(trueImgSrc)">
    <div :class="klass" 
      v-show="imgLoadType !== 'img'" 
      ref="backgroundImage"
      v-lazy:background-image="lazyImgObj(trueImgSrc)">
    </div>
  </div>
</template>

<script>
/**
 * 可支持的图片尺寸
 * 注：传入不同的参数并不会让图片比例发生变化
 */
const IMG_SIZE_LIST = [
  '240x180',
  '320x240',
  '480x360',
  '960x720',
  '240x240',
  '320x320',
  '480x480',
  '960x960'
]
export default {
  name: '',
  props: {
    // 支持属性传入
    klass: {
      type: Array,
      default: () => []
    },
    // 服务端下发的/需要加载的图片地址
    src: {
      type: String,
      default: ''
    },
    // 加载时的占位图
    loadingSrc: {
      type: String,
      default: ''
    },
    // 是否需要webp格式
    isWebp: {
      type: Boolean,
      default: false
    },
    isNeedSized: {
      type: Boolean,
      default: true
    },
    /**
     * 支持指定尺寸拼接
     * 可接收值：240x180 320x240 480x360 960x720 240x240 320x320 480x480 960x960
     */
    size: {
      type: String,
      default: '240x180'
    },
    // 图片加载的类型。 backgroundImage 或者 img标签两种
    imgLoadType: {
      require: true,
      type: String,
      default: 'img'
    },
    // 默认占位图
    defaultImage: {
      type: String,
      default: ''
    },
    lazyLoad: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      isWebpError: false,
      isSizedError: false,
      isOriginalError: false
    }
  },
  methods: {
    // 当出现错误时，进行状态处理，切换为默认图
    onError (e) {
      const { trueImgSrc, src } = this
      // webp版本报错
      if (trueImgSrc && trueImgSrc.indexOf('webp') !== -1) {
        this.isWebpError = true
        this.isSizedError = false
      // 切割版本报错
      } else if (trueImgSrc && trueImgSrc.indexOf('_m') !== -1) {
        this.isWebpError = false
        this.isSizedError = true
      // 原图报错
      } else if (trueImgSrc && trueImgSrc === src) {
        this.isOriginalError = true
      }
      this.$emit('error', src, trueImgSrc, e)
    },
    lazyImgObj (value) {
      return {
        src: value,
        loading: this.loadingSrc
      }
    }
  },
  computed: {
    trueImgSrc () {
      const { src, isWebp, isNeedSized, size, defaultImage, isWebpError, isSizedError, isOriginalError } = this
      let targetSize = size
      // 图片尺寸拼接串
      let sizedStr = ''
      if (isNeedSized) {
        // 用户传入的图片裁剪尺寸不符合规则，则选取默认图尺寸
        if (IMG_SIZE_LIST.indexOf(size) === -1) {
          targetSize = '240x180'
        }
        sizedStr = `!${targetSize}_m`
      }
      // 如果地址为空或者原图报错，返回默认logo
      if (src === '' || isOriginalError) {
        return defaultImage
      // webp报错，返回原图切割版
      } else if (isWebpError && !isSizedError) {
        return `${src}${sizedStr}`
      // 切割版报错，返回原图
      } else if (isSizedError) {
        return `${src}`
      } else {
        return `${src}${isWebp ? '.webp' : ''}${sizedStr}`
      }
    }
  },
  mounted () {
    // 监听lazyload图片加载失败事件。失败则尝试降级方案
    this.$Lazyload.$on('error', ({ bindType, el }) => {
      if (bindType === 'background-image') {
        if (this.$refs.backgroundImage !== el) return
      } else {
        if (this.$refs.img !== el) return
      }
      this.onError(new Error('load error'))
    })
    this.$Lazyload.$on('loaded', ({el}) => {
      let imgRefs = [this.$refs.img, this.$refs.backgroundImage]
      if (imgRefs.includes(el)) {
        this.$emit('imageLoaded')
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.image-view {
  width: 100%;
  height: 100%;
}
img {
  object-fit: cover;
  object-position: center;
}
.hidden {
  display: none;
}
</style>
