// Part3Question 国际化配置 - 中文
export default {
  // 页面标题
  'pages.part3Question.title': 'TOEIC Part 3 题目管理',
  'pages.part3Question.subTitle': '管理TOEIC Part 3对话题目和答案选项',

  // 搜索表单
  'pages.part3Question.search.label': '搜索',
  'pages.part3Question.search.placeholder': '搜索对话...',
  'pages.part3Question.scenario.label': '场景',
  'pages.part3Question.scenario.placeholder': '选择场景',
  'pages.part3Question.difficulty.label': '难度',
  'pages.part3Question.difficulty.placeholder': '选择难度',
  'pages.part3Question.test.label': '测试',
  'pages.part3Question.test.placeholder': '选择测试',
  'pages.part3Question.all': '全部',

  // 操作按钮
  'pages.part3Question.button.search': '搜索',
  'pages.part3Question.button.reset': '重置',
  'pages.part3Question.button.add': '新增对话',
  'pages.part3Question.button.export': '导出',
  'pages.part3Question.button.edit': '编辑',
  'pages.part3Question.button.delete': '删除',

  // 对话框标题
  'pages.part3Question.modal.add.title': '新增TOEIC Part 3对话',
  'pages.part3Question.modal.edit.title': '编辑TOEIC Part 3对话',

  // 表单标签
  'pages.part3Question.form.testId': '测试ID',
  'pages.part3Question.form.testId.placeholder': '输入测试ID (1-999)',
  'pages.part3Question.form.conversationNumber': '对话编号',
  'pages.part3Question.form.conversationNumber.placeholder': '输入对话编号 (1-30)',
  'pages.part3Question.form.title': '标题（可选）',
  'pages.part3Question.form.title.placeholder': '输入对话标题...',
  'pages.part3Question.form.content': '对话内容',
  'pages.part3Question.form.content.placeholder': '输入对话内容 (10-5000字符)...',
  'pages.part3Question.form.question1': '问题1',
  'pages.part3Question.form.question1.placeholder': '输入问题1 (5-500字符)...',
  'pages.part3Question.form.question2': '问题2',
  'pages.part3Question.form.question2.placeholder': '输入问题2...',
  'pages.part3Question.form.question3': '问题3',
  'pages.part3Question.form.question3.placeholder': '输入问题3...',
  'pages.part3Question.form.scenario': '场景',
  'pages.part3Question.form.scenario.placeholder': '选择场景',
  'pages.part3Question.form.difficultyLevel': '难度级别',
  'pages.part3Question.form.difficultyLevel.placeholder': '选择难度级别',

  // 表单分组
  'pages.part3Question.section.questions': '问题',
  'pages.part3Question.section.answerOptions': '答案选项（可选）',
  'pages.part3Question.section.classification': '分类',

  // 答案选项
  'pages.part3Question.answerOptions.question1': '问题1答案选项',
  'pages.part3Question.answerOptions.question2': '问题2答案选项',
  'pages.part3Question.answerOptions.question3': '问题3答案选项',
  'pages.part3Question.answerOptions.optionA': '选项A',
  'pages.part3Question.answerOptions.optionB': '选项B',
  'pages.part3Question.answerOptions.optionC': '选项C',
  'pages.part3Question.answerOptions.optionD': '选项D',
  'pages.part3Question.answerOptions.correctAnswer': '正确答案',
  'pages.part3Question.answerOptions.optionA.placeholder': '输入选项A',
  'pages.part3Question.answerOptions.optionB.placeholder': '输入选项B',
  'pages.part3Question.answerOptions.optionC.placeholder': '输入选项C',
  'pages.part3Question.answerOptions.optionD.placeholder': '输入选项D',

  // 显示标签
  'pages.part3Question.display.conversationContent': '对话内容',
  'pages.part3Question.display.questionsAnswers': '问题和答案',
  'pages.part3Question.display.question1': '问题1：',
  'pages.part3Question.display.question2': '问题2：',
  'pages.part3Question.display.question3': '问题3：',
  'pages.part3Question.display.answer': '答案：',

  // 验证消息
  'pages.part3Question.validation.testId.required': '请输入测试ID',
  'pages.part3Question.validation.testId.number': '测试ID必须是数字',
  'pages.part3Question.validation.testId.range': '测试ID必须在1到999之间',
  'pages.part3Question.validation.conversationNumber.required': '请输入对话编号',
  'pages.part3Question.validation.conversationNumber.number': '对话编号必须是数字',
  'pages.part3Question.validation.conversationNumber.range': '对话编号必须在1到30之间',
  'pages.part3Question.validation.content.required': '请输入对话内容',
  'pages.part3Question.validation.content.min': '内容至少需要10个字符',
  'pages.part3Question.validation.content.max': '内容不能超过5000个字符',
  'pages.part3Question.validation.question1.required': '请输入问题1',
  'pages.part3Question.validation.question1.min': '问题至少需要5个字符',
  'pages.part3Question.validation.question1.max': '问题不能超过500个字符',
  'pages.part3Question.validation.question2.required': '请输入问题2',
  'pages.part3Question.validation.question3.required': '请输入问题3',
  'pages.part3Question.validation.scenario.required': '请选择场景',
  'pages.part3Question.validation.difficultyLevel.required': '请选择难度级别',

  // 消息提示
  'pages.part3Question.message.delete.success': '删除成功',
  'pages.part3Question.message.delete.error': '删除失败',
  'pages.part3Question.message.update.success': '更新成功',
  'pages.part3Question.message.create.success': '创建成功',
  'pages.part3Question.message.create.warning': '对话创建成功但答案选项创建失败',
  'pages.part3Question.message.save.error': '保存失败',
  'pages.part3Question.message.export.success': '成功导出{count}个对话',
  'pages.part3Question.message.export.error': '导出失败',
  'pages.part3Question.message.loadOptions.error': '加载下拉选项失败',
  'pages.part3Question.message.loadConversations.error': '获取Part3对话列表失败',
  'pages.part3Question.message.invalidId.error': '无效的记录ID',

  // 确认对话框
  'pages.part3Question.confirm.delete.title': '确定要删除这个对话吗？',
  'pages.part3Question.confirm.delete.ok': '是',
  'pages.part3Question.confirm.delete.cancel': '否',

  // 分页
  'pages.part3Question.pagination.total': '共{total}条记录',
  'pages.part3Question.pagination.pageSize.10': '10',
  'pages.part3Question.pagination.pageSize.20': '20',
  'pages.part3Question.pagination.pageSize.50': '50',
  'pages.part3Question.pagination.pageSize.100': '100',
};
