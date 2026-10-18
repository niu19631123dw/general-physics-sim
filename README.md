# 普通物理 · 课本仿真（General Physics Simulator）

> 面向本科生「普通物理 / 大学物理」教材的交互式仿真：把课本里难懂的概念、定律、公式做成可拖动的动态图。
> 纯前端、零依赖，打开即用。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 是什么

本科生学普通物理时，很多概念只看公式看不懂。本项目把教材五卷的**核心概念与定律**做成交互仿真：
**左图是动态的物理图景，右侧是实时物理量，底部是对应公式**。拖动滑块，看物理量如何随之变化。

- **37 个主题**，按教材五卷组织：力学 / 热学 / 电磁学 / 光学 / 近代物理
- 每个主题一张「概念 → 图 → 公式」
- 零外部依赖（HTML + CSS + 原生 JS + Canvas），**离线可用**
- 物理公式库由 `node verify.js` 核对：**107 项 PASS / 0 FAIL**

## 快速开始

###直接打开
 https://niu19631123dw.github.io/general-physics-sim/


## 目录结构

```text
general-physics-sim/
├── index.html                模块化入口（GitHub Pages 用这个）
├── standalone.html           单文件版（CSS/JS 全内联，双击即用）
├── css/style.css
├── js/
│   ├── plot.js               Canvas 2D 引擎
│   ├── sr-plot.js            SR.Plot = QM.Plot + setText / fmt / FONT
│   ├── gp.js                 公式库 GP.*（五卷 + 数值方法 + 常数）
│   ├── main.js               外壳：导航 + 主循环 + 演示速度
│   └── modules/              37 个主题模块
├── build.js                  生成 standalone.html
├── verify.js                 总核对入口
├── verify-gp-*.js            五卷分项核对
└── README.md
```

## 主题一览

### 第一卷 力学（12）
抛体运动 · 简谐振动 · 阻尼与受迫共振 · 机械波（行波/驻波/拍）· 多普勒效应 · 碰撞与动量守恒 ·
角动量守恒（花滑收臂）· 陀螺进动 · 功与能（机械能守恒）· 定轴转动（转动定律）· 纯滚动（刚体平面运动）· 复摆（物理摆）

### 第二卷 热学（5）
理想气体（微观）· 热力学第一定律 · 卡诺循环与熵 · 麦克斯韦速率分布 · 能量均分定理

### 第三卷 电磁学（7）
库仑定律与电场 · 高斯定理 · 电势与电场梯度 · 毕奥-萨伐尔定律 · 洛伦兹力 · 电磁感应 · 电磁波

### 第四卷 光学（7）
折射与全反射 · 薄透镜成像 · 杨氏双缝干涉 · 薄膜干涉 · 单缝衍射 · 光栅衍射 · 光的偏振

### 第五卷 近代物理（6）
黑体辐射 · 光电效应 · 康普顿散射 · 玻尔氢原子 · 德布罗意物质波 · 一维无限深势阱

## 操作

- 每个主题：拖动滑块改变参数，图与读数实时更新
- 顶部「演示速度」滑块：整体放慢/加快动画（默认 0.5×）
- 左上角导航按五卷分组，点击切换主题

## 物理核对

```bash
node verify.js
```

```text
  力学卷     : PASS 33   FAIL 0
  热学卷     : PASS 16   FAIL 0
  电磁学卷   : PASS 17   FAIL 0
  光学卷     : PASS 14   FAIL 0
  近代物理卷 : PASS 18   FAIL 0
  合计       : PASS 107  FAIL 0
```

## 重新生成单文件版

```bash
node build.js
```

## 单位与约定

- 经典部分用国际单位制（SI）
- 近代物理用真实常数：h、ħ、e、c、k_B、m_e、R_H、σ、b

## License

[MIT](LICENSE)
