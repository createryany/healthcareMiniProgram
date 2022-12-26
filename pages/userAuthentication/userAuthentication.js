// pages/userAuthentication/userAuthentication.js
import request from '../../utils/request'
import wxuuid from '../../utils/wxuuid'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    certificatesTypeList: [], // 证件类型信息
    certificatesName: '', // 证件姓名
    certificatesType: '', // 证件类型
    certificatesNo: '', // 证件号码
    certificatesUrl: '', // 证件url
    hiddenDialog: true, //true-隐藏  false-显示
    animationData: {},
    ertificatesTypeModal: 'white',
    currentTab: 20001,
    certificatesImgUploadStatus: false, // 人证合一图片提示
    certificatesImgUploadImgStatus: true, // 人证合一图片
    certificatesTypeStatus: false, // 证件类型提示
    certificatesNumStatus: false, // 证件号码提示
    certificatesNameStatus: false, // 认证姓名提示
    certificatesSpecialStatus: false, // 特殊字符
    isFocus: false, // 聚焦
  },
  // 点击上传图片
  handleUploadImage() {
    wx.showLoading({
      title: '上传照片中',
    })
    this.setData({
      certificatesImgUploadImgStatus: false
    })
    wx.chooseMedia({
      success: (res) => {
        this.addWaterAndUpload(res)
      },
      fail: () => {
        wx.hideLoading()
        this.setData({
          certificatesImgUploadImgStatus: true,
          certificatesImgUploadStatus: true
        })
      }
    })
  },
  // 更换图片
  handleChangeUploadImage() {
    wx.showLoading({
      title: '上传照片中',
    })
    this.setData({
      certificatesImgUploadImgStatus: false
    })
    wx.chooseMedia({
      success: (res) => {
        // 删除原来提交的
        wx.cloud.deleteFile({
          fileList: [this.data.certificatesUrl],
          success: () => {
            this.setData({
              certificatesUrl: ''
            })
            // 提交新的图片
            this.addWaterAndUpload(res)
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        if(!this.data.certificatesUrl) {
          this.setData({
            certificatesImgUploadImgStatus: true
          })
        }
      }
    })
  },
  // 图片加水印并上传
  addWaterAndUpload(res) {
    if (res.tempFiles[0].size > 3145728) {
      wx.showToast({
        title: '文件不能超过3M',
        icon: 'none'
      })
      if(!this.data.certificatesUrl) {
        this.setData({
          certificatesImgUploadImgStatus: true
        })
      }
      return;
    }
    let filePath = res.tempFiles[0].tempFilePath
    wx.createSelectorQuery()
      .select('#healthcare')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        // Canvas 对象
        const canvas = res[0].node
        // 渲染上下文
        const ctx = canvas.getContext('2d')

        // Canvas 画布的实际绘制宽高
        const width = res[0].width
        const height = res[0].height

        // 初始化画布大小
        const dpr = wx.getWindowInfo().pixelRatio
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        // 图片对象
        const image = canvas.createImage()
        // 图片加载完成回调
        image.src = filePath
        image.onload = () => {
          // 将图片绘制到 canvas 上
          ctx.drawImage(image, 0, 0, width, height)
          ctx.fillStyle = '#4d80fd'
          ctx.font = `bold 13px sans-serif`
          ctx.fillText('healthcare实名认证专用', 8, 80)
        }
        setTimeout(() => {
          // 将canvas转为图片
        wx.canvasToTempFilePath({
          canvas,
          success: (res) => {
            filePath = res.tempFilePath
            let now = new Date()
            this.setData({
              certificatesUrl: 'authenticationForRealName/' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + wxuuid.wxuuid() + '.jpg'
            })
            wx.cloud.uploadFile({
              // 指定上传到的云路径
              cloudPath: this.data.certificatesUrl,
              // 指定要上传的文件的小程序临时文件路径
              filePath,
              // 成功回调
              success: () => {
                this.setData({
                  certificatesUrl: 'https://636c-cloud1-0gvofamwb2eb3304-1311518014.tcb.qcloud.la/' + this.data.certificatesUrl,
                  certificatesImgUploadStatus: false
                })
                wx.hideLoading()
              },
            })
          },
        })
        }, 1000)
      })
  },
  addSpecialShow() {
    this.setData({
      certificatesSpecialStatus: true
    })
  },
  handleCertificatesTypeSelection(event) {
    this.setData({
      currentTab: event.target.dataset.current
    })
  },
  // 获取输入值
  handleCertificatesNoInput(event) {
    this.setData({
      certificatesNo: event.detail.value
    })
    if (this.data.certificatesNo) {
      this.setData({
        certificatesNumStatus: false
      })
    } else {
      this.setData({
        certificatesNumStatus: true
      })
    }
  },
  handleCertificatesNameInput(event) {
    this.setData({
      certificatesName: event.detail.value
    })
    if (this.data.certificatesName) {
      this.setData({
        certificatesNameStatus: false
      })
    } else {
      this.setData({
        certificatesNameStatus: true
      })
    }
  },
  // 提交
  async handleSubmit() {
    let flag = true
    if (!this.data.certificatesType) {
      this.setData({
        certificatesTypeStatus: true
      })
      flag = false
    }
    if (!this.data.certificatesNo) {
      this.setData({
        certificatesNumStatus: true
      })
      flag = false
    }
    if (!this.data.certificatesUrl) {
      this.setData({
        certificatesImgUploadStatus: true
      })
      flag = false
    }
    if (!this.data.certificatesName) {
      this.setData({
        certificatesNameStatus: true
      })
      flag = false
    }
    if(flag) {
      wx.showLoading({
        title: '正在提交',
      })
      // 提交实名认证信息
      const userAuthVo = JSON.stringify({
        name: this.data.certificatesName,
        certificatesType: this.data.certificatesType,
        certificatesNo: this.data.certificatesNo,
        certificatesUrl: this.data.certificatesUrl,
      })
      let token = JSON.parse(wx.getStorageSync('userInfo').trim()).token
      let result = await request('/api/user/auth/userAuth', userAuthVo, 'POST', token)
      wx.hideLoading()
      if(result.code === 200) {
        // 返回之前更新下用户信息
        wx.removeStorageSync('userMessage')
        wx.removeStorageSync('userInfo')
        let userMessageResult = await request('/api/user/auth/getUserInfo', {}, 'GET', token)
        let userMessage = userMessageResult.data
        let userInfo = {
          authStatus: userMessage.authStatus,
          name: userMessage.name,
          token: token
        }
        wx.setStorageSync('userMessage', JSON.stringify(userMessage))
        wx.setStorageSync('userInfo', JSON.stringify(userInfo))
        wx.navigateBack()
      } else if(result.code === 219) {
        wx.showToast({
          title: '实名信息已被绑定',
          icon: 'none'
        })
      } else if(result.code === 2070) {
        wx.showToast({
          title: '身份证号码不正确',
          icon: 'none'
        })
      } else if(result.code === 206) {
        wx.showToast({
          title: '身份证号码长度不正确',
          icon: 'none'
        })
      }
    }
  },
  // 向证件姓名中添加特殊字符
  addSpecial() {
    this.setData({
      isFocus: true
    })
    let certificatesName = this.data.certificatesName
    if (certificatesName && certificatesName.charAt(certificatesName.length - 1) !== '·') {
      this.setData({
        certificatesName: certificatesName + '·'
      })
    }
  },
  handleCertificatesNoInputBlur() {
    let that = this
    if (!that.data.certificatesNo) {
      that.setData({
        certificatesNumStatus: true,
      })
    }
  },
  handleCertificatesNameInputBlur() {
    let that = this
    if (!that.data.certificatesName) {
      that.setData({
        certificatesNameStatus: true,
      })
    }
  },
  // 显示认证信息弹窗
  handleCertificatesTypeModal() {
    let that = this
    if (!that.data.certificatesType) {
      that.setData({
        certificatesTypeStatus: true,
      })
    }
    that.setData({
      hiddenDialog: false,
      ertificatesTypeModal: '#f7f5f6'
    })
    setTimeout(() => {
      that.setData({
        ertificatesTypeModal: 'white'
      })
    }, 100)
    // 创建动画实例
    let animation = wx.createAnimation({
      duration: 300, //动画的持续时间
      timingFunction: 'ease', //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变 慢
    })
    this.animation = animation; //将animation变量赋值给当前动画
    that.slideIn();
  },
  // 确认类型选择
  confirmSelection() {
    let certificatesTypeList = this.data.certificatesTypeList
    let currentId = this.data.currentTab
    for (let index = 0; index < certificatesTypeList.length; index++) {
      const element = certificatesTypeList[index];
      if (currentId === element.id) {
        this.setData({
          certificatesType: element.name,
          certificatesTypeStatus: false
        })
        this.hideModal()
      }
    }
  },
  // 隐藏遮罩层
  hideModal() {
    let that = this
    let animation = wx.createAnimation({
      duration: 200, //动画的持续时间 默认400ms
      timingFunction: 'ease', //动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown(); //调用动画--滑出
    that.setData({
      hiddenDialog: true
    })
  },
  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  //动画 -- 滑出
  slideDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.setNavigationBarTitle({
      title: '实名认证'
    })
    // 查询证件类型信息
    let certificatesTypeResult = await request('/admin/cmn/dict/findByDictCode/CertificatesType')
    if(certificatesTypeResult.code === 200) {
      let certificatesTypeList = certificatesTypeResult.data
      this.setData({
        certificatesTypeList
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})