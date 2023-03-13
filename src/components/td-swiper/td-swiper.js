Component({
  /**
   * 组件的属性列表
   */
  properties: {
    items: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /* 这里实现控制自定义轮播指示点高亮 */
    handleSwiperChange (e) {
      this.setData({
        currentIndex: e.detail.current
      })
    },

    handleSwiperItemTap (e) {
      const data = this.data.items[e.currentTarget.dataset.index]
      this.triggerEvent('itemtap', data)
    }
  }
})
