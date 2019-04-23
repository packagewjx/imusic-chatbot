# 爱音乐智能对话机器人Web前端

本项目是基于[React](https://reactjs.org)与[React-Simple-Chatbot](https://github.com/LucasBassetti/react-simple-chatbot)打造的智能对话机器人Web前端，与华南理工大学智能对话机器人接口结合，为爱音乐用户提供歌曲搜索服务。

# 安装依赖

首先执行常规命令：`npm install`。如果有网络问题请先添加国内镜像源，如[淘宝](https://npm.taobao.org/)。

安装完成后，可能警告提示需要安装peer dependency。步骤如下

1. 首先安装一个工具，`npm-install-peers`：`npm install -g npm-install-peers`。
2. 安装完成后，进入需要安装peer dependency的依赖库，查看错误信息看得出是这里是`ts-pnp`和`react-simple-chatbot`。
3. 在依赖库中，执行`npm-install-peers`即可。

# 可用脚本

在项目中，可以运行

### `npm start`

在开发者模式下运行应用。打开网页<http://localhost:3000>以浏览应用。

页面会随着修改而自动更新，同时你可以在控制台查看任何lint错误。

### `npm run build`

构建应用，输出到`build`文件夹。<br>将会把应用所需组件，以生产模式进行打包，获取最佳的页面性能。

最小化构建，文件名包含哈希值。应用能够直接部署了。

# 已知bug

## 1

疯狂搜索 `与阎罗王妥协(feat. Rama)(Brown Sugar Remix)` ，找 `FatDoo` 歌手的时候，会返回`你知道专辑名是什么吗？查找到的专辑有）`。

注意其中遇到选择歌名的时候，需要输入`与阎罗王妥协(feat. Rama)(Brown Sugar Remix)`，如果没的话，就手动输入
