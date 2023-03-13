import api from '../../utils/api'
import request from '../../utils/request'
import {
  rotate,
  increase
} from '../../utils/animation'

let self = {}
const app = getApp()
const page = {
  data: {
    memberList: [],
    filterOptions: [
      { key: 'all', label: '全部' },
      { key: 'noname', label: '未设名称' },
      { key: 'isAdmin', label: '管理员' },
      { key: 'name', label: '名称' }
    ],
    filterIndex: 0,
    filterValue: '',
    editable: false,
    editSubmitting: false,
    editItem: {}
  },
  bindPickerChange: function (e) {
    this.setData({
      filterIndex: e.detail.value
    })
    this.onPullDownRefresh()
  },
  onsearch: function (e) {
    this.setData({ filterValue: e.detail.value })
    this.onPullDownRefresh()
  },
  onLoad: function (options) {
    self = this
    this.onPullDownRefresh()
  },
  memberFilter: function (member) {
    const filterKey = this.data.filterOptions[this.data.filterIndex].key
    return filterKey === 'all' || (filterKey === 'noname' && !member.name) || (filterKey === 'isAdmin' && member.isAdmin) || (filterKey === 'name' && (member.name || '').includes(this.data.filterValue))
  },
  onPullDownRefresh () {
    request({
      url: 'wxapi/members',
      data: {
        openid: app.globalData.userInfo.openid
      },
      success (result) {
        if (result.data) {
          const list = result.data
          list.forEach((item, index) => {
            if (index === 0) item.className = 'last'
            if (list.length - 1 === index) item.className = 'first'
          })
          setTimeout(() => {
            list.forEach(item => {
              item.animationIncrease = increase(null, null, item.ratio)
              item.animationRotate = rotate(null, null)
            })
            self.setData({
              memberList: list.filter(self.memberFilter)
            })
          }, 200)
        } else {
          api.showModal({
            title: '查询失败',
            message: result.data.message
          })
        }
      }
    })
    api.stopPullDownRefresh()
  },
  edit (e) {
    const item = e.currentTarget.dataset.item
    self.setData({
      editable: true,
      editItem: { ...item, isAdmin: !!item.isAdmin }
    })
  },
  cancelEdit (e) {
    self.setData({
      editable: false,
      editItem: {}
    })
  },
  submitEdit (e) {
    if (self.data.editSubmitting) return
    const item = self.data.editItem
    if (item.openid) {
      self.setData({
        editSubmitting: true
      })
      request({
        url: 'wxapi/member',
        method: 'PUT',
        data: {
          openid: item.openid,
          isAdmin: e.detail.value.isAdmin,
          name: e.detail.value.name
        },
        success: function (res) {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          self.setData({
            editable: false,
            editSubmitting: false
          })
          self.onPullDownRefresh()
        },
        fail: function (res) {
          self.setData({
            editSubmitting: false
          })
        }
      })
    }
  },
  delete (e) {
    const item = e.currentTarget.dataset.item
    wx.showModal({
      title: '提示',
      content: `您确定删除所选成员${item.name || item.nickName}？`,
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          request({
            url: 'wxapi/member',
            method: 'DELETE',
            data: {
              openid: item.openid
            },
            success: function (res) {
              wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000
              })
              self.onPullDownRefresh()
            },
            fail: function (res) {
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
}

Page(page)
