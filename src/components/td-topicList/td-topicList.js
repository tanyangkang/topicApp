Component({
  /**
   * 组件的属性列表
   */
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    topicList: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    linkToDetail (e) {
      wx.navigateTo({
        url: `/pages/forum/detail?topicid=${e.currentTarget.id}`,
      })
    }
  }
})
