Page({
    data: {
        code :[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        next_round: '',
        //**倒计时 */
        isopen:false,//是否启动
        interval: '', //用于后面停止定时器
        timeText: '',//展示 
        num: 0,
        strM: 0,
        strS: 0,
        //**canvas */
        pen: 50,//涂抹直径
        pencolor: 'rgba(255,255,255,1)',//涂抹颜色
        startX: 0, //保存X坐标轴变量
        startY: 0, //保存Y坐标轴变量
    },
//**cavas 开始

    touchStart: function (e) {
        //触摸点坐标
        this.startX = e.changedTouches[0].x;
        this.startY = e.changedTouches[0].y;
        this.context = wx.createContext();
        this.context.setStrokeStyle(this.data.pencolor);//设置线条样式 此处设置为画布的背景颜色  橡皮擦原理就是：利用擦过的地方被填充为画布的背景颜色一致 从而达到橡皮擦的效果
        this.context.setLineWidth(this.data.pen);//设置线条宽度
        this.context.setLineCap('round');//让线条圆润
        this.context.beginPath()
    },
    touchMove: function (e) {
        let startX1 = e.changedTouches[0].x;
        let startY1 = e.changedTouches[0].y;
        //**设置涂抹点形状为圆形
        let clearArc = function (x, y, radius, context) {//圆心(x,y)，半径radius 
            let calcWidth = radius - stepClear;
            let calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth);
            let posX = x - calcWidth;
            let posY = y - calcHeight;
            let widthX = 2 * calcWidth;
            let heightY = 2 * calcHeight;
            if (stepClear <= radius) {
                context.clearRect(posX, posY, widthX, heightY);
                stepClear += 1;
                clearArc(x, y, radius, context);
            }
        }
        let stepClear = 1;//别忘记这一步  
        let this_arc = clearArc(this.startX, this.startY, this.data.pen / 2, this.context);
        //**
        this.context.this_arc;//这边有this的问题，所以这么写
        this.context.lineTo(startX1, startY1);
        this.context.stroke();
        this.startX = startX1;
        this.startY = startY1;
        //只是一个记录调用的容器，用于生成记录绘制行为的actions数组，context跟不存在对应关系，一个context生成画布的绘制动作数组可以应用于多个
        wx.drawCanvas({
            canvasId: 'mainCanvas',
            reserve: true,
            actions: this.context.getActions()//获取绘制动作数组
        })
    },
    touchEnd: function () { },
    
//**canvas 结束
    onLoad: function() {
        let that = this
        //canvas 加入前景涂抹图片
        let ctx = wx.createCanvasContext('mainCanvas');
        ctx.drawImage('../../images/clear-top2.png', 0, 0, 270, 160);
        ctx.draw();  
    //** websocket 开始
        //1- 创建WebSocket连接
        wx.connectSocket({
            url: 'Socket地址',
            success:function(){ //执行成功回调
                console.log('WebSocket连接打开成功！') 
            },
            fail: function () {  //执行失败回调
                console.log('WebSocket连接打开失败！') 
            }
        });
        //2- 监听WebSocket接受到服务器的消息事件。
        wx.onSocketOpen(function(res) { 
            console.log('WebSocket连接已打开！')
        });
        //4- 监听WebSocket错误。
        wx.onSocketError(function(res){
            console.log('WebSocket连接已关闭！');
        });
        //5- 监听WebSocket接受到服务器的消息事件。
        wx.onSocketMessage(function (res) {
            that.setData({
                num: JSON.parse(res.data).down_time,
                next_round: JSON.parse(res.data).round
            })
        });
        // this.move()
        setTimeout(that.move, 1000)
        this.data.interval = setInterval(that.move, 1000) //用于后面停止定时器
        that.bid_num()
        //** websocket 结束
        wx.showShareMenu({ withShareTicket: true })//开启右上角分享小程序功能
    },
//** 倒计时 开始
    move() {
        this.setData({
            isopen:true
        })
        console.log(this.data.num);
        if (this.data.num <= -1) {
            this.setData({
                timeText: '等待开奖...'
            })
        } else {
            this.setData({
                strM: this.zeroFill('' + parseInt(this.data.num / 60 % 24), 2),
                strS: this.zeroFill('' + parseInt(this.data.num % 60), 2),
                timeText: this.data.strM + ':' + this.data.strS,
                num: this.data.num - 1
            })
        }
    },
    zeroFill(str, n) {
        //补零方法，str为数字字符串 n为需要的位数，不够补零  
        if (str.length < n) {
            str = '0' + str
        }
        return str
    },
//** 倒计时 结束
//** 投注号码 开始
    bid_num(){
        //转成随机排列
        let ten_num = this.data.code
        ten_num.sort(function () { return 0.5 - Math.random() })
        this.setData({
            code:ten_num
        })
    },
//** 投注号码 结束
//*  复制粘贴 方法
    copy(){
        let data = this.data.code.toString();//获取需要复制的内容
        wx.showToast({
            title: '复制成功！',
            icon:'success'
        }),
        wx.setClipboardData({   //设置系统剪贴板的内容
            data: data, 
            success: function (res) {
                wx.getClipboardData({  //获取系统剪贴板内容
                    success: function (res) {
                        console.log('选中复制的内容为：'+res.data) 
                    } 
                }) 
            } 
        })
    },
//*  刷新 方法
    replay(){
        if (this.data.isopen){
            clearInterval(this.data.interval)
            this.onLoad()
        }
    }
});
