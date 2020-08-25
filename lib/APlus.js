/**
 * 
 * A*算法的javascript实现
 * 可以快速获取两点间的最短路径
 * 该代码由其作者applelee公开
 * 任何人或机构可以随意使用，但任何使用该代码产生的后果，作者不负任何责任
 * 
 * 版本2020-08-24
*/

(function (w) {
  // 可配置项
  let options = {
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

  let isAstar, isMustPath, startVector, endVector, screenSize, obstacles;

  // 十字检测
  const cross = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  // * 检测
  const star = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  // 有效路径分支集合
  let branchs = new Map();
  // 临时分支集合
  let tempBranchs = new Map();
  // 待删除分支索引集合
  let branchsKeys = new Set();
  // 无效路径分支集合
  let deadBrachs = new Map();
  // 已探索过的矢量
  let solved = new Set();
  // 结果（2维数组）
  let resultPath = [];
  // 递归计数器
  let recursionCount = 0;
  // 计数器最大值（防止内存溢出）
  const countMax = 1000;

  // 构造函数
  const APlus = function (opt = {}) {
    init(opt);
  }

  // 工厂函数
  APlus.create = function (opt = {}) {
    return new APlus(opt)
  }

  // 运行并从回调函数中获得返回值
  APlus.prototype.run = function (opt = {}, cb = () => {}) {
    init(opt);
    startEndVerify(startVector, endVector);
    calculationPath();

    cb({
      path: getOncePath(),
      solved: [...solved].map(v => stringTransformVector(v)),
      branchs: [...branchs.values(), ...deadBrachs.values()],
    });
  }

  // 直接获取路径
  APlus.prototype.getPath = function (startVector, endVector) {
    startEndVerify(startVector, endVector);
    init({ startVector,  endVector });
    calculationPath();
    return getOncePath();
  }

  // 直接获取路径
  APlus.prototype.getSovled = function (startVector, endVector) {
    startEndVerify(startVector, endVector);
    init({ startVector,  endVector });
    calculationPath();
    return [...solved].map(v => stringTransformVector(v))
  }

  // 直接获取路径
  APlus.prototype.getBranch = function (startVector, endVector) {
    startEndVerify(startVector, endVector);
    init({ startVector,  endVector })
    calculationPath();
    return [...branchs.values(), ...deadBrachs.values()];
  }

  // 初始化
  const init = (opt = {}) => {
    options = {
      ...options,
      ...opt,
    }

    isAstar = options.isAstar;
    isMustPath = options.isMustPath;
    startVector = options.startVector;
    endVector = options.endVector;
    screenSize = options.screenSize;
    obstacles = new Set(options.obstacles.map(v => vectorTransformString(v)));

    directions = getDirections();
    solved = new Set([vectorTransformString(startVector)]);
    branchs = new Map([[vectorTransformString(startVector), [startVector]]]);
    tempBranchs = new Map();
    branchsKeys = new Set();
    deadBrachs = new Map();
    resultPath = [];
    recursionCount = 0;
  }

  // 循环计算
  const startEndVerify = (start, end) => {
    if (isObstacle(start)) throw '起点不能选择障碍物！！';
    if (isObstacle(end)) throw '终点不能选额障碍物！！';
    if (isVectorSame(start, end)) throw '起点和终点不能相同！！';
  }

  // 递归求解
  const calculationPath = () => {
    // 迭代计数器
    let count = 0;

    // 三个条件判断迭代有效性（是否已经得到路径，有效分支路径不为空，迭代计数器未达到最大值）
    while (resultPath.length < 1 && branchs.size > 0 && count < countMax) {
      branchs.forEach((v, k) => {
        if (resultPath.length > 0) return;
        onceHandle(v, k);
      });
      branchs = new Map([...branchs, ...tempBranchs]);
      branchsKeys.forEach(v => branchs.delete(v));
      count += 1
    }

    // 递归计数器自增
    recursionCount += 1;
    // 保证递归不造成内存溢出（通常不会执行这一步）
    if (recursionCount < countMax && count >= countMax) calculationPath();
  }

  // 一次路径探索处理
  const onceHandle = (value, key) => {
    const route = [...value];
    const len = route.length;
    const vector = route[len - 1];
    const nextVectors = [];

    // 当前路径是否到达终点
    if (isOver(vector)) {
      resultPath.push([...route]);
      return;
    }

    // 方向矢量校验
    for (let i = 0; i < directions.length; i ++) {
      const [x, y] = directions[i];
      const newVector = [vector[0] + x, vector[1] + y];

      // 检测场景溢出、已解决、障碍物
      if (isOverflow(newVector) || isSolved(newVector) || isObstacle(newVector)) continue;
      nextVectors.push(newVector);
    }

    // 宣告此分支无解
    if (nextVectors.length < 1) {
      deadBrachs.set(key, value);
      branchsKeys.add(key);
      return
    };

    // 生成分支
    nextVectors.forEach((v, i) => {
      const newRoute = [...route];
      const newKey = vectorTransformString(v);

      newRoute.push(v);
      solved.add(newKey);
      // 第一个分支继承当前路径索引
      tempBranchs.set(i === 0 ? key : newKey, newRoute);
    });
  }

  // 重新计算方向集合
  const getDirections = () => {
    const seedDirections = [...(isAstar ? star : cross)];
    let newDirection = [];

    while (seedDirections.length > 0) {
      const len = seedDirections.length;
      const randomNum = (Math.random() * (1 << 10)) & (len - 1);
      newDirection = newDirection.concat(seedDirections.splice(randomNum, 1));
    }
    return newDirection;
  }

  // 返回符合条件的路径
  const getOncePath = () => {
    return resultPath.length < 1 ? (isMustPath ? getShortestPath([...branchs.values(), ...deadBrachs.values()]) : []) : resultPath[((Math.random() * (1 << 10)) << 0) % resultPath.length];
  }

  // 获取最短路径
  const getShortestPath = (paths) => {
    if (paths.length <= 1) return paths[0];

    const path = paths.reduce((prev, current) => {
      const pLen = prev.length;
      const cLen = current.length;
      const pVector = prev[pLen - 1];
      const cVector = current[cLen - 1];

      return getDistance(pVector, endVector, isAstar) > getDistance(cVector, endVector, isAstar) ? current : prev;
    })

    return path;
  }
  
  // 是否为障碍
  const isObstacle = vector => {
    return obstacles.has(vectorTransformString(vector));
  }

  // 是否已经解决
  const isSolved = vector => {
    return solved.has(vectorTransformString(vector));
  }

  // 是否溢出场景
  const isOverflow = ([x, y]) => {
    const [X, Y] = screenSize;
    if (x < 0 || y < 0 || x >= X || y >= Y) return true;
    return false;
  }

  // 矢量是否相等
  const isVectorSame = ([x1, y1], [x2, y2]) => {
    return x1 === x2 && y1 === y2;
  }

  // 是否结束
  const isOver = ([x, y]) => {
    const [X, Y] = endVector;
    return X === x && Y === y;
  }

  // 两点间距离
  const getDistance = ([x1, y1], [x2, y2], bool) => {
    const X = Math.abs(x2 - x1)
    const Y = Math.abs(y2 - y1)
    if (bool) {
      return X > Y ? Y : X;
    }
    return X + Y;
  }

  // 矢量转换成字符串
  const vectorTransformString = ([x, y]) => `${x}_${y}`;

  // 字符串转还原成矢量
  const stringTransformVector = str => {
    const [x, y] = str.split('_');
    return [Number(x), Number(y)];
  };

  w.APlus = APlus;
})(window)