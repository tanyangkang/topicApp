import * as util from '../../utils/util'
import api from '../../utils/api'
import { getAuth } from '../../services/auth'
import request from '../../utils/request'

const app = getApp()

const queryTopicDetail = `query topicDetail ($articleid: Int!, $openid: String!) {
  topicDetail (articleid: $articleid, openid: $openid) {
    articleDetail {
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
      isliked,
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
    }
  }
}`
const likeTopic = `mutation likeTopic ($liketopic: LikeInput) {
  likeTopic(liketopic: $liketopic)
}`
const saveCommentInfo = `mutation saveCommentInfo ($comment: CommentInput) {
  saveCommentInfo(comment: $comment)
}`
const queryCommentList = `query articleCommentList ($pager: CommentPagerInput!, $articleid: Int!) {
  articleCommentList (articleid: $articleid, pager: $pager) {
    list {
      id,
      authorid,
      articleid,
      text,
      replyid,
      reply {
        id,
        authorid,
        articleid,
        text,
        replyid,
        authorInfo {
          id,
          name,
          avatarUrl,
          joindate,
          nickName,
          openid,
          employeeId,
          description,
          isAdmin
        }
      },
      authorInfo {
        id,
        name,
        avatarUrl,
        joindate,
        nickName,
        openid,
        employeeId,
        description,
      }
      createdate
    },
    pager {
      page,
      size
    }
  }
}`
const deleteComment = `mutation deleteComment ($id: Int!) {
  deleteComment(id: $id)
}`
const deleteTopic = `mutation deleteTopic ($id: Int!) {
  deleteTopic(id: $id)
}`

Page({
  /**
   * 页面的初始数据
   */
  data: {
    authorInfo: {},
    result: '',
    commentstr: '',
    commentplaceholder: '说点什么...',
    replyid: null,
    replyprefix: '',
    canloadmore: false,
    page: 1,
    commentPageSize: 1000,
    commentlist: [],
    share: true,
    show: false,
    showThump: false
  },

  btnPicPreview: function (e) {
    const that = this
    const imgIndex = e.currentTarget.id.split('_')[1]
    const sources = that.data.result.newpics
    const medias = sources.filter(item => item.type !== 'video')
    wx.previewMedia({
      sources: medias,
      current: imgIndex,
      url: sources[imgIndex].url,
      success () {
        console.log('预览成功')
      }
    })
  },

  btnEdit: function () {
    const that = this
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (res) {
        if (res.tapIndex == 0) {
          that.deleteTopic()
        }
      }
    })
  },

  commentInput: function (e) {
    const that = this

    let replyid = that.data.replyid
    let replyprefix = that.data.replyprefix
    let commentstr = e.detail.value
    if (e.detail.value.indexOf(replyprefix) < 0) {
      replyid = ''
      replyprefix = ''
      commentstr = ''
    }
    this.setData({
      replyid: replyid,
      replyprefix: replyprefix,
      commentstr: commentstr
    })
  },

  async btnCommentAction (e) {
    const that = this
    const commentId = e.currentTarget.id.substr(3, e.currentTarget.id.length)
    wx.showActionSheet({
      itemList: ['删除此评论'],
      success: async(res) => {
        const result = await request({
          url: '/graphql',
          method: 'POST',
          data: {
            query: deleteComment,
            variables: {
              id: Number(commentId)
            }
          }
        })
        if (result) {
          wx.showToast({
            title: '删除成功！',
            success(res) {
              if (res) {
                that.data.result.commentSum -= 1
                that.setData({
                  result: that.data.result
                })
              }
            }
          })
        }
        that.getCommentList(1)
      }
    })
  },

  showMessage () {
    this.setData({
      show: true
    })
  },

  onClose () {
    this.setData({ show: false })
  },

  btnReply: function (e) {
    this.showMessage()
    const that = this
    const index = e.currentTarget.id.substr(3, e.currentTarget.id.length)
    const item = that.data.commentlist[index]
    const replyprefix = `回复${item.authorInfo.name}：`
    const replyid = item.id
    that.setData({
      replyid: replyid,
      replyprefix: replyprefix,
      commentstr: replyprefix
    })
  },

  async btnPostComment() {
    const that = this
    if (!that.data.authorInfo.openid) {
      wx.switchTab({
        url: '/pages/me/login'
      })
      app.authorizeCheck('scope.userInfo')
      return
    }

    let commentstr = this.data.commentstr
    commentstr = commentstr.substr(commentstr.indexOf(that.data.replyprefix) + that.data.replyprefix.length, commentstr.length)
    if (util.trimStr(commentstr) == '') {
      return wx.showToast({
        title: '还未输入评论哦',
        mask: true
      })
    }
    wx.showToast({
      title: '提交中',
      mask: true
    })
    const result = await request({
      url: '/graphql',
      method: 'POST',
      data: {
        query: saveCommentInfo,
        variables: {
          comment: {
            authorid: that.data.authorInfo.openid,
            articleid: that.data.result.id,
            text: commentstr,
            replyid: that.data.replyid
          }
        }
      }
    })
    if (result.data.saveCommentInfo) {
      wx.showToast({
        title: '评论成功！',
      })
      wx.hideLoading()
      this.setData({
        show: false
      })
      that.data.result.commentSum += 1
      that.setData({
        result: that.data.result,
        commentstr: ''
      })
      this.getCommentList(1)
    } else {
      wx.showToast({
        title: '评论失败！',
      })
    }
  },

  btnShowLocation: function (e) {
    const that = this
    const item = that.data.result
    const gps_arr = item.gps.split(',')
    wx.openLocation({
      latitude: parseFloat(gps_arr[0]),
      longitude: parseFloat(gps_arr[1]),
      name: item.gpsaddr,
      address: item.gpscity
    })
  },

  async btnLikeAction() {
    const that = this
    if (!that.data.authorInfo.openid) {
      app.authorizeCheck('scope.userInfo')
      return
    }
    wx.showLoading({
      title: '加载中...'
    })
    const { data } = await request({
      url: '/graphql',
      method: 'POST',
      data: {
        query: likeTopic,
        variables: {
          liketopic: {
            articleid: that.data.result.id,
            uid: that.data.authorInfo.openid
          }
        }
      }
    })
    if (data.likeTopic) {
      that.data.result.isliked = !that.data.result.isliked
      if (that.data.result.isliked == false) {
        that.data.result.likeSum -= 1
      } else that.data.result.likeSum += 1
      that.setData({
        result: that.data.result,
        showThump: !that.data.showThump
      })
      wx.hideLoading()
    } else wx.showToast({
      title: '点赞失败!',
    })
  },

  async getCommentList (page) {
    const pageSize = this.data.commentPageSize
    const comlist = await request({
      url: '/graphql',
      method: 'POST',
      data: {
        query: queryCommentList,
        variables: {
          articleid: this.data.topicid,
          pager: {
            page: page,
            size: pageSize
          }
        },
        bv: app.getBuildVersion(),
      }
    })
    const { list } = comlist.data.articleCommentList || []
    list.forEach(item => {
      item.createdate = util.formatTime(new Date(item.createdate * 1000))
      item.isOwnReply = this.data.authorInfo.openid == item.authorInfo.openid // resolve delete own comment
    })
    this.setData({
      commentlist: list
    })
  },

  async deleteTopic() {
    const that = this
    const result = await request({
      url: '/graphql',
      method: 'POST',
      data: {
        query: deleteTopic,
        variables: {
          id: that.data.result.id
        }
      }
    })
    if (result.data.deleteTopic) {
      wx.showToast({
        title: '话题删除成功！',
        icon: 'success',
        mask: true,
        duration: 4000,
        success(res) {
          if (res) {
            wx.navigateBack({
              delta: 1,
              success (e) {
                const page = getCurrentPages().pop()
                if (page == undefined || page == null) return
                page.onLoad({})
              }
            })
          }
        }
      })
    }
  },

  async updateTopicDetail() {
    const that = this
    const topicDetail = await request({
      url: '/graphql',
      method: 'POST',
      data: {
        query: queryTopicDetail,
        variables: {
          articleid: that.data.topicid,
          openid: that.data.authorInfo.openid
        },
        bv: app.getBuildVersion(),
        token: app.globalData.token
      }
    })
    const dealList = topicDetail.data.topicDetail.articleDetail
    const oldpics = dealList.pics !== null ? dealList.pics.split(',') : []
    let newpics = []
    const pics = oldpics.map(item => {
      const time = util.formatDate(new Date(parseInt(item))) // 处理时间戳
      const type = 'image'
      const url = api.resolveImageUrl(`${time}/${item}.jpg`)
      return { url: url, type: type }
    })
    if (dealList.newpics) {
      newpics = dealList.newpics.map(items => ({ url: api.resolveImageUrl(items), type: items.includes('mp4') ? 'video' : 'image' }))
    }
    dealList.createdate = util.formatTime(new Date(dealList.createdate * 1000))
    if (!dealList.text.includes('<a')) { // 处理重复处理话题标签
      dealList.text1 = util.ReplaceTopic(dealList.text) // 处理文本
    }
    if (dealList.pics !==null) {
      dealList.newpics = pics
    } else dealList.newpics = newpics
    dealList.isOwnTopic = that.data.authorInfo.openid === dealList.authorInfo.openid // 是否为自己发布的话题
    that.setData({
      result: dealList
    })
    this.getCommentList(1)
  },

  postShareAction (res) {
    wx.showToast({
      title: res.data.msg
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    const authorInfo = await getAuth()
    this.setData({
      topicid: Number(options.topicid),
      authorInfo
    })
    this.updateTopicDetail()
  },

  /**
   * 分享朋友圈
   */
  onShareTimeline: function () {
    return {
	      title: '梯度公社',
	      query: {
	        key: value
	      },
	      imageUrl: ''
	    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享（转发）
   */
  onShareAppMessage: function () {
    this.setData({
      share: false
    })
    const payload = {
      title: this.data.result.text,
      path: `/pages/forum/detail?topicid=${this.data.result.id}`,
      imageUrl: api.resolveImageUrl(this.data.newpics[0].url)
    }
    return {
      promise: promise = Promise.resolve(payload),
      success: res => {
        this.postShareAction(res)
      },
      fail: err => {
        console.error(err)
      }
    }
  }
})
