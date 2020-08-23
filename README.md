# 说明

基于javascript的A*算法例子，可用于获取两点之间的最短距离。<br/>

## DEMO运行起来
example/a+.html 文件扔浏览器<br/>

## 引入FastFill

### 引用
```javascript
<script src='/lib/AstarPath.js'></script>
```

## AstarPath API

### 创建实例 instance
__new AstarPath(options)__
```javascript
var ASP = new AstarPath({
  screenSize: [col, row],
  // ...
})
```
or
__FastFill.create(options)__
```javascript
var ASP = AstarPath.create({
  screenSize: [col, row],
  // ...
})
```  

#### instance.run void
参数1 options
参数2 对象有三个属性 path最短路径，sovled探索过的矢量合集，branchs探索过的路径合集
```javascript
ASP.run(options, ({ path, solved, branchs }) => {})
```  

### 实例的方法 method  
#### instance.getPath array
获取最短路径<br/>
参数1 startVector 起点矢量
参数2 endVector 终点矢量
```javascript
ASP.getPath(startVector, endVector)
```  

#### instance.getSolved array
获取探索过的矢量集合<br/>
参数1 startVector 起点矢量
参数2 endVector 终点矢量
```javascript
ASP.getSolved(startVector, endVector)
```  

#### instance.getBranchs array
获取探索过的所有路径<br/>
参数1 startVector 起点矢量
参数2 endVector 终点矢量
```javascript
ASP.getBranchs(startVector, endVector)
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
