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
  {
    path: '/toeic',
    name: '托业考试',
    icon: 'book',
    access: 'canAdmin',
    routes: [
      { path: '/toeic', redirect: '/toeic/test' },
      { path: '/toeic/test', name: '题库管理', component: './admin/test' },
      { path: '/toeic/part2question', name: 'Part2题库', component: './toeic/part2question' },
      { path: '/toeic/part3question', name: 'Part3题库', component: './toeic/part3question' },
      { path: '/toeic/part4talk', name: 'Part4题库', component: './toeic/part4talk' },
    ],
  },
  {
    path: '/mytoeic',
    name: '我的托业',
    icon: 'user',
    routes: [
      { path: '/mytoeic', redirect: '/mytoeic/part2PracticeSet' },
      { path: '/mytoeic/part2PracticeSet', name: 'Part2练习集', component: './mytoeic/part2PracticeSet' },
      { path: '/mytoeic/part3PracticeSet', name: 'Part3练习集', component: './mytoeic/part3PracticeSet' },
      { path: '/mytoeic/part4PracticeSet', name: 'Part4练习集', component: './mytoeic/part4PracticeSet' },
    ],
  },
  { name: '文章管理', path: '/articles', component: './articles' },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
