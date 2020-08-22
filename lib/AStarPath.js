(function (w) {
  const AStarPath = function (opt = {}) {
    this.options = {
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
      ...opt,
    }

    // 十字检测
    this.cross = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    // * 检测
    this.star = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    // 路径分支栈（重点）
    this.branchs = [];
    // 已解决掉的矢量（重点）
    this.solved = new Set();
    // 结果（2维数组）
    this.resultRoute = [];
    // 计数器
    this.count = 0;
    // 计数器最大值（防止内存溢出）
    this.maxCount = 1000;

    this.__init__(opt);
  }

  // 工厂函数
  AStarPath.create = function (opt = {}) {
    return new AStarPath(opt)
  }

  // 直接获取路径
  AStarPath.prototype.getPath = function (startVector, endVector) {
    this.__startEndVerify__(startVector, endVector);
    this.__init__({ startVector,  endVector })
    this.__calculationPath__();
    return this.__getOncePath__();
  }

  // 直接获取路径
  AStarPath.prototype.getSovled = function (startVector, endVector) {
    this.__startEndVerify__(startVector, endVector);
    this.__init__({ startVector,  endVector })
    this.__calculationPath__();
    return [...this.solved].map(v => stringTransformVector(v))
  }

  // 直接获取路径
  AStarPath.prototype.getBranch = function (startVector, endVector) {
    this.__startEndVerify__(startVector, endVector);
    this.__init__({ startVector,  endVector })
    this.__calculationPath__();
    return [...this.branchs.values()];
  }

  // 运行
  AStarPath.prototype.run = function (opt = {}, cb = () => {}) {
    this.__init__(opt);
    this.__startEndVerify__(startVector, endVector);
    this.__calculationPath__();

    cb({
      path: this.__getOncePath__(),
      solved: [...this.solved].map(v => stringTransformVector(v)),
      branchs: [...this.branchs.values()],
    });
  }

  // 初始化
  AStarPath.prototype.__init__ = function (opt = {}) {
    const options = {
      ...this.options,
      ...opt,
    }

    this.isAstar = options.isAstar;
    this.isMustPath = options.isMustPath;
    this.startVector = options.startVector;
    this.endVector = options.endVector;
    this.screenSize = options.screenSize;
    this.directions = this.__getDirections__();
    this.obstacles = new Set(this.options.obstacles.map(v => vectorTransformString(v)));
    this.solved = new Set([vectorTransformString(this.startVector)]);
    this.branchs = new Map([[vectorTransformString(this.startVector), [this.startVector]]]);
    this.deadBrach = new Set();
    this.resultRoute = [];
    this.count = 0;
  }

  // 循环计算
  AStarPath.prototype.__startEndVerify__ = function (start, end) {

    if (this.__isVectorSame__(start, end)) throw '起点和终点矢量不能相等！！';
    if (this.__isObstacle__(start)) throw '起点不能与障碍矢量相等！！';
    if (this.__isObstacle__(end)) throw '终点不能与障碍矢量相等！！';
  }

  // 循环计算
  AStarPath.prototype.__calculationPath__ = function () {
    while (this.resultRoute.length < 1) {
      const branchs = new Map([...this.branchs]);
      branchs.forEach((v, k) => (!this.deadBrach.has(k) && this.__onceHandle__(v, k)));
      // branchs.forEach((v, k) => this.__onceHandle__(v, k));
      this.count ++;
      if (this.count >= this.maxCount) this.__calculationPath__();
    }
  }

  // 一次路径探索处理
  AStarPath.prototype.__onceHandle__ = function (value, key) {
    const route = [...value];
    const len = route.length;
    const vector = route[len - 1];
    const directions = this.directions;
    const nextVectors = [];

    // 当前路径是否到达终点
    if (this.__isOver__(vector)) {
      this.resultRoute.push([...route]);
      return;
    }

    // 方向矢量校验
    for (let i = 0; i < directions.length; i ++) {
      const newVector = [vector[0] + directions[i][0], vector[1] + directions[i][1]];

      // 检测场景溢出、已解决、障碍物
      if (this.__isOverflow__(newVector) || this.__isSolve__(newVector) || this.__isObstacle__(newVector)) continue;

      nextVectors.push(newVector);
    }

    // 宣告此分支无解
    if (nextVectors.length < 1) {
      // this.branchs.delete(key);
      this.deadBrach.add(key);
      return
    };

    // 生成分支
    nextVectors.forEach((v, i) => {
      const newRoute = [...route];
      const newKey = vectorTransformString(v);
      newRoute.push(v);
      this.solved.add(newKey);
      this.branchs.set(i === 0 ? key : newKey, newRoute);
    });
  }

  // 重新计算方向集
  AStarPath.prototype.__getDirections__ = function () {
    const seedDirections = [...(this.isAstar ? this.star : this.cross)];
    let newDirection = [];

    while (seedDirections.length > 0) {
      const len = seedDirections.length;
      const randomNum = (Math.random() * 1859137) & (len - 1);
      newDirection = newDirection.concat(seedDirections.splice(randomNum, 1));
    }
    return newDirection;
  }

  // 返回符合条件的路径）
  AStarPath.prototype.__getOncePath__ = function () {
    return this.resultRoute.length < 1 ? (this.isMustPath ? this.__getShortestPath__([...this.branchs.values()]) : []) : this.resultRoute[((Math.random() * (1 << 10)) << 0) % this.resultRoute.length];
  }

  // 获取最短路径
  AStarPath.prototype.__getShortestPath__ = function (paths) {
    if (paths.length <= 1) return paths[0];

    const path = paths.reduce((prev, current) => {
      const pLen = prev.length;
      const cLen = current.length;
      const pVector = prev[pLen - 1];
      const cVector = current[cLen - 1];

      return getDistance(pVector, this.endVector, this.isAstar) > getDistance(cVector, this.endVector, this.isAstar) ? current : prev;
    })

    return path;
  }
  
  // 是否为障碍
  AStarPath.prototype.__isObstacle__ = function (vector) {
    return this.obstacles.has(vectorTransformString(vector));
  }

  // 是否已经解决
  AStarPath.prototype.__isSolve__ = function (vector) {
    return this.solved.has(vectorTransformString(vector));
  }

  // 是否溢出场景
  AStarPath.prototype.__isOverflow__ = function ([x, y]) {
    const [X, Y] = this.screenSize;
    if (x < 0 || y < 0 || x >= X || y >= Y) return true;
    return false;
  }

  // 矢量是否相等
  AStarPath.prototype.__isVectorSame__ = function ([x1, y1], [x2, y2]) {
    return x1 === x2 && y1 === y2;
  }

  // 是否结束
  AStarPath.prototype.__isOver__ = function (vector = []) {
    return this.endVector[0] === vector[0] && this.endVector[1] === vector[1];
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
  const vectorTransformString = vector => `${vector[0]}_${vector[1]}`;

  // 字符串转还原成矢量
  const stringTransformVector = str => {
    const [x, y] = str.split('_');
    return [Number(x), Number(y)];
  };

  w.AStarPath = AStarPath;
})(window)