import api from '../../utils/api'
import request from '../../utils/request'
import * as util from '../../utils/util'
import { getLogger } from '../../utils/logging'
import * as appService from '../../services/app'
import { fromNow } from '../../utils/datetime'

const logger = getLogger('billboard')
const app = getApp()

const homeQuery = `query posterList ($page: Int!, $size: Int!, $searchKey: String) {
  posterList (pager: { page: $page, size: $size }, searchKey: $searchKey) {
    list {
      id,
      name,
      imageUrl,
      linkType,
      linkValue,
      createTime,
      description,
      order
    },
    pager {
      page,
      size,
      total
    }
  }
  noticeList(pager: {page: 1, size: 1 }, filter: {}) {
    list {
      id
      type
      title
      text
      url
    }
  }
}`
const queryTopicList = `query historyTopicList ($page: Int!, $size: Int!, $searchKey: String) {
  historyTopicList (pager: { page: $page, size: $size }, searchKey: $searchKey) {
    list {
      id,
      authorid,
      createdate,
      updatetime,
      text,
      pics,
      newpics,
      type,
      title,
      authorid,
      commentSum,
      likeSum,
      gps,
      gpsaddr,
      gpscity,
      istop,
      authorInfo {
        name,
        nickName,
        coin,
        avatarUrl,
        openid,
        mobile,
        lastlogin,
        joindate,
        wechatid
      },
    },
    pager {
      page,
      size,
      total
    }
  }
}`

Page({
  data: {
    ready: false,
    Top: true,
    list: [],
    topNotice: null,
    isopened: false,
    noticereaded: true,
    page: 1,
    canloadmore: false,
    topbanner: [],
    topicPageSize: 10,
    refresh: false
  },

  btnLoadMore: function () {
    if (this.data.canloadmore) {
      this.data.page += 1
      this.loadTopicList(this.data.page)
    }
  },

  srollViewTop: function (e) {
    if (e.detail.scrollTop < 900) {
      this.setData({
        Top: true
      })
    } else {
      this.setData({
        Top: false
      })
    }
  },

  goTocreatTopic () {
    wx.switchTab({
      url: '/pages/forum/create',
    })
  },

  btnLikeAction: function (e) {
    const that = this
    const index = e.currentTarget.id.substr(3, e.currentTarget.id.length)
    const item = that.data.list[index]

    wx.request({
      url: app.resolveApi('/likeaction.php'),
      method: 'POST',
      header: {
        Cookie: `PHPSESSID=${app.globalData.sessionid}`
      },
      data: {
        articleid: item.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (parseInt(res.data.err) == 0) {
          if (parseInt(res.data.result.action) == 0) {
            item.likecount = parseInt(item.likecount) - 1
            item.isliked = false
          } else {
            item.likecount = parseInt(item.likecount) + 1
            item.isliked = true
          }
          that.setData({
            list: that.data.list
          })
        }
      }
    })
  },

  // load home data bundle (with banner, notice, topics, etc,.)
  async loadHomeData () {
    const { data } = await request({
      url: '/graphql',
      method: 'POST',
      data: {
        query: homeQuery,
        variables: { page: 1, size: 5 }
      }
    })

    const topbanner = data.posterList?.list?.map(item => ({
      ...item,
      imageUrl: api.resolveImageUrl(item.imageUrl)
    }))

    this.setData({
      topbanner,
      topNotice: data.noticeList?.list[0] || null
    })

    await this.loadTopicList(1)
  },

  async loadTopicList (page) {
    wx.stopPullDownRefresh()
    const pageSize = this.data.topicPageSize
    try {
      const newlist = await request({
        url: '/graphql',
        method: 'POST',
        header: {
          Cookie: `PHPSESSID=${app.globalData.sessionid}`
        },
        data: {
          query: queryTopicList,
          variables: {
            page: page,
            size: pageSize
          },
          bv: app.getBuildVersion(),
        }
      })
      const dealList = newlist.data.historyTopicList.list
      for (var i = 0; i < dealList.length; i++) {
        // 处理旧话题pics，合并到新创建的newpics
        const pics = dealList[i].pics !== null ? dealList[i].pics.split(',') : []
        let newpics = []
        let oldpics = []
        if (dealList[i].newpics) {
          newpics = dealList[i].newpics.map(items => ({ url: api.resolveImageUrl(items), type: items.includes('mp4') ? 'video' : 'image' }))
        }
        oldpics = pics.map(item => {
          // 处理旧数据没有文件后缀
          const time = util.formatDate(new Date(parseInt(item))) // 处理时间戳
          const type = 'image'
          pics[item] = api.resolveImageUrl(`${time}/${item}.jpg`)
          return { url: pics[item], type: type }
        })
        if (dealList[i].pics !==null) {
          dealList[i].newpics = oldpics
        } else dealList[i].newpics = newpics
      }
      let list = []
      if (page <= 1) {
        list = dealList
      } else {
        list = this.data.list.concat(dealList)
      }

      for (var i = 0; i < list.length; i++) {
        list[i].timedistance = fromNow(new Date(list[i].createdate * 1000))
        list[i].index = i
        if (!list[i].text.includes('<a')) { // 处理重复处理话题标签
          list[i].text = util.ReplaceTopic(list[i].text) // 处理文本
        }
      }
      this.setData({
        list,
        page,
        canloadmore: dealList.length >= pageSize
      })
    } catch (e) {
      logger.error(e)
    }
  },

  refresh () {
    this.loadHomeData()
  },
   // 自定义下拉刷新
  loadRefresh () {
    wx.showLoading({
      title: '加载中...',
    })
    setTimeout(() => {
      this.setData({
        refresh: false
      })
      wx.hideLoading()
    }, 2000)
    this.refresh()
  },

  onBannerItemTap (e) {
    const { linkValue, linkType } = e.detail
    let url = ''
    if (linkType === 1 && linkValue) {
      url = `/pages/forum/detail?topicid=${linkValue}`
    } else if (linkType === 2 && linkValue) {
      url = `/pages/webview/index?url=${linkValue}`
    }
    if (url) {
      wx.navigateTo({
        url,
        success (res) {
          res.eventChannel.emit('pageExtraData', e.detail)
        }
      })
    }
  },

  async initPage (options) {
    wx.setNavigationBarTitle({
      title: app.getAppName()
    })
    if (options.topicid) {
      wx.navigateTo({
        url: `/pages/forum/detail?topicid=${options.topicid}`
      })
    } else if (options.url) {
      wx.navigateTo({
        url: `/pages/webview/index?url=${escape(options.url)}`
      })
    } else if (app.checkAuth()) {
        await this.loadHomeData()
      } else {
        logger.error('checkAuth failed, redirecting to login...')
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const from = `/${currentPage.route}`
        wx.navigateTo({
          url: `/pages/me/login?return=${from}`
        })
      }
  },

  onLoad (options) {
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })
    appService.onAppReady(async (err, state) => {
      if (!err) {
        await this.initPage(options)
        this.setData({ ready: true })
        wx.hideLoading()
      } else {
        logger.error('load page error', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    wx.setNavigationBarTitle({
      title: app.getAppName()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadHomeData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
