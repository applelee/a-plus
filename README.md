# 说明

基于javascript的A*算法例子，可用于获取两点之间的最短距离。<br/>

## DEMO运行起来
example/a+.html 文件扔浏览器<br/>

## 引入APlus

### 引用
```javascript
<script src='/lib/APlus.js'></script>
```

## APlus API

### 创建实例 instance
__new APlus(options)__
```javascript
var aPlus = new APlus({
  screenSize: [col, row],
  // ...
})
```
__FastFill.create(options)__
```javascript
var aPlus = APlus.create({
  screenSize: [col, row],
  // ...
})
```  

#### instance.run void
参数1 options<br/>
参数2 callback 返回一个对象包含三个属性 path最短路径，sovled探索过的矢量集合，branchs探索过的路径集合
```javascript
aPlus.run(options, ({ path, solved, branchs }) => {})
```  

### 实例的方法 method  
#### instance.getPath array
获取最短路径<br/>
参数1 startVector 起点矢量<br/>
参数2 endVector 终点矢量
```javascript
aPlus.getPath(startVector, endVector)
```  

#### instance.getSolved array
获取探索过的矢量集合<br/>
参数1 startVector 起点矢量<br/>
参数2 endVector 终点矢量
```javascript
aPlus.getSolved(startVector, endVector)
```  

#### instance.getBranchs array
获取探索过的所有路径<br/>
参数1 startVector 起点矢量<br/>
参数2 endVector 终点矢量
```javascript
aPlus.getBranchs(startVector, endVector)
```  

### options配置及初始值
```javascript
opstions = {
  // 是否开启 *
  isAstar: false,
  // 当路径无解时是否返回近似的解
  isMustPath: false,
  // 开始矢量
  startVector: [0, 0],
  // 终点矢量
  endVector: [1, 1],
  // 场景大小 width height
  screenSize: [1, 1],
  // 障碍矢量集合
  obstacles: [],
}
```  

# License
__MIT__
