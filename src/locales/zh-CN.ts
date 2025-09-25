import component from './zh-CN/component';
import department from './zh-CN/department';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pages from './zh-CN/pages';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import test from './zh-CN/test';
import part2question from './zh-CN/part2question';
import part3question from './zh-CN/part3question';
import part4talk from './zh-CN/part4talk';
import toeic from './zh-CN/toeic';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  ...pages,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...test,
  ...part2question,
  ...part3question,
  ...part4talk,
  ...department,
  ...toeic,
};
