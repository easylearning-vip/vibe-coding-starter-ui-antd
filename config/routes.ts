export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { name: '登录', path: '/user/login', component: './user/login' },
      { name: '注册', path: '/user/register', component: './user/register' },
    ],
  },
  { path: '/welcome', name: '欢迎', icon: 'smile', component: './Welcome' },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/users' },
      { path: '/admin/users', name: '用户管理', component: './admin/users' },
      {
        path: '/admin/articles',
        name: '文章管理',
        component: './admin/articles',
      },
      { path: '/admin/dict', name: '数据字典', component: './admin/dict' },
      {
        path: '/admin/department',
        name: 'Department管理',
        component: './admin/department',
      },
    ],
  },
  { name: '文章管理', path: '/articles', component: './articles' },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
