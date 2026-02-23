# 26scouting - FRC球队侦查系统 v1

一个为FIRST Robotics Competition (FRC)设计的球队侦查和数据管理系统。支持双主题切换（蓝方/红方），具有完整的权限管理功能。

## 功能特性

### 📊 问卷系统
- **Prescouting问卷**：赛前详细信息收集
  - 球队基本信息（号码、名称、经验）
  - 机器配置（底盘类型、坡道选择、发射器等）
  - 战术分析（起始位置、手动策略、自动得分等）
  - 机器人功能分类（Feeder、Shooter、防守、其他）
  - 自动和手动准确率统计
  - 图片上传与预览

### 🎨 双主题系统
- 蓝方主题（#5990C0 为主色）
- 红方主题（#891309 为主色）
- 黄色滑块切换器，平滑动画过渡
- 根据主题自动切换Logo

### 👥 权限管理
- **管理员功能**：
  - 批量分配队伍给普通用户
  - 单个队伍分配管理
  - 删除用户账户
  - 删除问卷数据
- **普通用户功能**：
  - 查看和编辑分配给他们的队伍问卷
  - 查看问卷结果统计
  - 上传和管理团队照片
- **访客权限**：
  - 查看问卷格式和字段
  - 不能提交或编辑数据
  - 不能查看现有问卷结果

### 📈 数据管理
- 本地存储（localStorage）所有数据
- 队伍分配管理
- 用户账户管理
- 问卷数据收集和展示

## 快速开始

### 1. 克隆或下载项目
```bash
git clone https://github.com/Cirrostratus-fibratus/9597_26_scouting.git
cd 9597_26_scouting
```

### 2. 打开应用
直接用浏览器打开 `index.html` 文件即可

```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### 3. 初始登录
默认进入登录/注册界面，您可以：
- **注册新账户**：创建新用户名和密码
- **以访客身份进入**：点击"以访客身份继续"体验只读模式

### 4. 基本操作

#### 作为管理员
1. 注册并让其他用户将账户设置为管理员（需要修改localStorage）
2. 访问"管理员面板"：
   - 批量分配队伍给多个用户
   - 单个管理队伍分配
   - 删除账户或问卷

#### 作为普通用户
1. 在Prescouting页面查看分配给您的队伍
2. 填写每个队伍的详细问卷
3. 上传队伍照片
4. 查看其他用户提交的问卷结果

#### 作为访客
1. 浏览所有问卷字段和格式
2. 查看队伍列表
3. 无法提交或编辑任何数据

## 项目结构

```
26scouting/
├── index.html          # 主应用界面
├── script.js           # 应用逻辑（1100+行）
├── style.css           # 样式表（包含双主题CSS变量）
├── logo.png            # 蓝方Logo
├── logo_r.png          # 红方Logo
├── 配置.png            # 配置示例图
└── README.md           # 本文件
```

## 技术栈

- **前端**：HTML5 + CSS3 + Vanilla JavaScript
- **存储**：浏览器 localStorage
- **样式系统**：CSS自定义属性（CSS Variables）
- **兼容性**：所有现代浏览器

## 颜色主题

### 蓝方主题
- 主题色：#5990C0
- 深色：#10206B
- 中度：#49273F
- 亮色：#FAF0D7

### 红方主题
- 主题色：#891309
- 深色：#211828
- 中度：#015185
- 亮色：#D42C1A

## 数据存储

所有数据存储在浏览器的 localStorage 中，包括：

```javascript
{
  users: {},                    // 用户账户信息
  currentUser: {},              // 当前登录用户
  userTeamAssignments: {},      // 用户-队伍分配关系
  prescoutingData: {            // 所有Prescouting问卷数据
    [teamNumber]: {
      teamNumber, teamName, coachTime, competitionCount,
      chassisType, rampChoice, shooterCount, climbLevel,
      maxBalls, shootTime, startingPosition, manualStrategy,
      robotFunction, otherFunction, autoScore, autoAccuracy,
      autoClimb, manualAccuracy, strategyOverview, notes,
      photoData, createdBy, createdAt, lastEditedBy, lastEditedAt
    }
  },
  theme: 'blue'                 // 当前主题选择
}
```

## 主要功能详解

### Prescouting 问卷字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| 队伍号 | 数字 | ✓ | 队伍编号 |
| 队伍名称 | 文本 | | 自动关联 |
| 操作手练习时长 | 文本 | | 例：3个月 |
| 操作手参加比赛次数 | 数字 | | 次数 |
| 机器底盘种类 | 下拉 | ✓ | Swerve/Tank |
| 走斜坡还是下面 | 下拉 | ✓ | 斜坡/下面/都可 |
| 有几个发射通道 | 数字 | | 发射器数量 |
| 能够爬升至 | 下拉 | | 0-3级 |
| 最大储球量 | 数字 | | 球数 |
| 满仓发射时长 | 数字 | | 秒数 |
| 功能/位置 | 下拉 | ✓ | Feeder/Shooter/防守/其他 |
| 自动程序得分 | 文本 | | 得分详情 |
| 自动准确率 | 文本 | | 例：95% |
| 手动发射准确率 | 文本 | | 例：80% |
| 自动爬升 | 下拉 | | 是/否 |
| 策略概述 | 文本 | | 战术总结 |
| 队伍照片 | 图片 | | JPG/PNG格式 |

## 自定义开发

### 修改颜色主题
编辑 `style.css` 中的 CSS 变量：

```css
:root {
  --color-primary-dark: #10206B;
  --color-primary-medium: #49273F;
  --color-primary: #5990C0;
  --color-light: #FAF0D7;
}

body.red-theme {
  --color-primary-dark: #211828;
  --color-primary-medium: #015185;
  --color-primary: #891309;
  --color-light: #D42C1A;
}
```

### 添加新问卷字段
1. 在 `index.html` 中添加表单字段
2. 在 `script.js` 中的数据收集逻辑中添加该字段
3. 在 `displayPrescoutingData()` 函数中添加显示逻辑

## 常见问题

**Q: 数据会丢失吗？**  
A: 不会。所有数据存储在浏览器的 localStorage 中。但如果清除浏览器缓存会丢失数据。建议定期备份或导出数据。

**Q: 如何导出数据？**  
A: 目前可以在浏览器开发者工具中查看 localStorage。未来会添加导出功能。

**Q: 支持多设备同步吗？**  
A: 目前不支持。每台设备有独立的数据存储。

**Q: 如何重置所有数据？**  
A: 在浏览器开发者工具的 Application → localStorage 中删除所有项目。

## 部署到网络

### 方案1：使用GitHub Pages（免费）
1. Fork本仓库
2. 在仓库设置中启用GitHub Pages
3. 选择main分支作为源

### 方案2：部署到自己的服务器
1. 克隆仓库到服务器
2. 配置web服务器指向 `index.html`
3. 访问您的服务器地址

### 方案3：使用云服务
- Netlify、Vercel等即可直接部署HTML/CSS/JS项目

## 许可证

此项目采用 MIT 许可证。详见 LICENSE 文件。

## 贡献

欢迎提交问题报告和拉取请求！

## 联系方式

- 项目维护者：Cirrostratus-fibratus
- GitHub：https://github.com/Cirrostratus-fibratus/9597_26_scouting

## 更新日志

### v1.0.0 (2026-02-23)
- ✅ 初始版本发布
- ✅ Prescouting问卷系统
- ✅ 双主题支持（蓝方/红方）
- ✅ 权限管理系统（管理员/普通用户/访客）
- ✅ 批量队伍分配功能
- ✅ 可折叠式管理面板

---

**祝您使用愉快！** 🚀

如有任何问题或建议，请在GitHub上提出Issue。
