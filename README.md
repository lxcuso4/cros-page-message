# cros-page-message
> cros-page-message 是一个跨页面传递消息的js插件，基于localstore实现，在此原理的基础上做了订阅/发布模式的实现，支持订阅所有消息，广播消息，多标签页同时可以收到消息，本table也不会收到本页面消息


### 前置依赖
+ 多个浏览器table页必须是同源
+ 浏览器支持localstore

### 开始

#### 接入项目
 
 ```
  import message from "cros-page-message";
  // options 默认配置项
  const options = {
    project: 'default', // 这个大概率需要修改，其它选项可以使用默认值，任意非空且不包括'.'的字符串
    crosKey: '__cros_page_message',
    identifier: '.',
    parseData: true,
  }
  const o = new message(options)
 ```
 + project | string: 用于区分不同项目的事件，相当于命名空间，项目A和项目B必须使用不同的配置，除非你想在项目A监听项目B的事件，相当于是订阅事件在你是用的域名下的生效范围
 + crosKey | string: localstore的key前缀，为了避免和你正常业务存储在localstore中的key值冲突，除非你项目有在localstore中存储key为 __cros_page_message的业务数据，否则无需修改
 + identifier | string: 用于连接project、crosKey和你到时候发送的消息名称，故在配置project和 crosKey 的字符传中不能包含 identifier，如无特殊需求不建议修改
 + parseData | boolean: 如果为false只能收发string，true可以收发复杂类型数据，内部是在发送消息的时候使用 [JSON.stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) 和 收到消息后JSON.paser , 如果有特殊转换需求可以自定义消息的toJSON方法定义转换逻辑

  **注意：** 使用parseData参数也并非所有类型数据都会被重新还原出来,请确保知道以下信息

  ```
    var o = {a:0,b:"",c:null,d:undefined,e:[],f:{},g:new Date(),h:Symbol('test'),l:function(){},k:Object,l:NaN,m:Infinity,o:new RegExp('test'),p:o}
    
    var s = JSON.stringify(o)
    //s: "{"a":0,"b":"","c":null,"e":[],"f":{},"g":"2020-08-11T09:38:25.984Z","l":null,"m":null,"o":{}}"
    // 可以看到经过JSON.stringify 后 undefined 循环引用 连值带key直接被丢弃了，function NAN被转成了null

    JSON.parse(s)
    // 转换后的值
    {
        a: 0
        b: ""
        c: null
        e: []
        f: {}
        g: "2020-08-11T09:38:25.984Z"
        l: null
        m: null
        o: {}
    }


  ```

  #### API

 > 总共有3个api 和通常的订阅发布模式接口基本类似

  + on
  ```
    // 浏览器标签页A
    const o = new message(options)
    // 订阅somechange事件
    o.on('somechange', function(data){ // do something})
    // 订阅任何事件，相同project下所有消息均会收到
    o.on(function(data){// do something})
  ```

  + emit

  ```
    // 浏览器标签页A
    const o = new message(options)
    // 会被除过A标签的其它标签页订阅 'somechange' 事件的函数收到
    o.emit('somechange', dataString)
    // 广播消息给所有的绑定事件
    o.emit(dataString)
  ```

  + off 

  ```
    // 浏览器标签页A
    const o = new message(options)
    // 订阅somechange事件
    function callbackHandle (data){
      // do something
    }
    o.on('somechange', callbackHandle)
    // 取消订阅
    o.off('somechange', callbackHandle)

    o.on(callbackHandle)

    o.off(callbackHandle)

    o.off('somechange')
  
  ```
