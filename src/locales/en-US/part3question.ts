// Part3Question Internationalization Configuration - English
export default {
  // Page titles
  'pages.part3Question.title': 'TOEIC Part 3 Question Management',
  'pages.part3Question.subTitle': 'Manage TOEIC Part 3 conversation questions and answer options',

  // Search form
  'pages.part3Question.search.label': 'Search',
  'pages.part3Question.search.placeholder': 'Search conversations...',
  'pages.part3Question.scenario.label': 'Scenario',
  'pages.part3Question.scenario.placeholder': 'Select scenario',
  'pages.part3Question.difficulty.label': 'Difficulty',
  'pages.part3Question.difficulty.placeholder': 'Select difficulty',
  'pages.part3Question.test.label': 'Test',
  'pages.part3Question.test.placeholder': 'Select test',
  'pages.part3Question.all': 'All',

  // Action buttons
  'pages.part3Question.button.search': 'Search',
  'pages.part3Question.button.reset': 'Reset',
  'pages.part3Question.button.add': 'Add New Conversation',
  'pages.part3Question.button.export': 'Export',
  'pages.part3Question.button.edit': 'Edit',
  'pages.part3Question.button.delete': 'Delete',

  // Modal titles
  'pages.part3Question.modal.add.title': 'Add New TOEIC Part 3 Conversation',
  'pages.part3Question.modal.edit.title': 'Edit TOEIC Part 3 Conversation',

  // Form labels
  'pages.part3Question.form.testId': 'Test ID',
  'pages.part3Question.form.testId.placeholder': 'Enter test ID (1-999)',
  'pages.part3Question.form.conversationNumber': 'Conversation Number',
  'pages.part3Question.form.conversationNumber.placeholder': 'Enter conversation number (1-30)',
  'pages.part3Question.form.title': 'Title (Optional)',
  'pages.part3Question.form.title.placeholder': 'Enter conversation title...',
  'pages.part3Question.form.content': 'Conversation Content',
  'pages.part3Question.form.content.placeholder': 'Enter conversation content (10-5000 chars)...',
  'pages.part3Question.form.question1': 'Question 1',
  'pages.part3Question.form.question1.placeholder': 'Enter question 1 (5-500 chars)...',
  'pages.part3Question.form.question2': 'Question 2',
  'pages.part3Question.form.question2.placeholder': 'Enter question 2...',
  'pages.part3Question.form.question3': 'Question 3',
  'pages.part3Question.form.question3.placeholder': 'Enter question 3...',
  'pages.part3Question.form.scenario': 'Scenario',
  'pages.part3Question.form.scenario.placeholder': 'Select scenario',
  'pages.part3Question.form.difficultyLevel': 'Difficulty Level',
  'pages.part3Question.form.difficultyLevel.placeholder': 'Select difficulty level',

  // Form sections
  'pages.part3Question.section.questions': 'Questions',
  'pages.part3Question.section.answerOptions': 'Answer Options (Optional)',
  'pages.part3Question.section.classification': 'Classification',

  // Answer options
  'pages.part3Question.answerOptions.question1': 'Question 1 Answer Options',
  'pages.part3Question.answerOptions.question2': 'Question 2 Answer Options',
  'pages.part3Question.answerOptions.question3': 'Question 3 Answer Options',
  'pages.part3Question.answerOptions.optionA': 'Option A',
  'pages.part3Question.answerOptions.optionB': 'Option B',
  'pages.part3Question.answerOptions.optionC': 'Option C',
  'pages.part3Question.answerOptions.optionD': 'Option D',
  'pages.part3Question.answerOptions.correctAnswer': 'Correct Answer',
  'pages.part3Question.answerOptions.optionA.placeholder': 'Enter option A',
  'pages.part3Question.answerOptions.optionB.placeholder': 'Enter option B',
  'pages.part3Question.answerOptions.optionC.placeholder': 'Enter option C',
  'pages.part3Question.answerOptions.optionD.placeholder': 'Enter option D',

  // Display labels
  'pages.part3Question.display.conversationContent': 'Conversation Content',
  'pages.part3Question.display.questionsAnswers': 'Questions & Answers',
  'pages.part3Question.display.question1': 'Question 1: ',
  'pages.part3Question.display.question2': 'Question 2: ',
  'pages.part3Question.display.question3': 'Question 3: ',
  'pages.part3Question.display.answer': 'Answer: ',

  // Validation messages
  'pages.part3Question.validation.testId.required': 'Please enter test ID',
  'pages.part3Question.validation.testId.number': 'Test ID must be a number',
  'pages.part3Question.validation.testId.range': 'Test ID must be between 1 and 999',
  'pages.part3Question.validation.conversationNumber.required': 'Please enter conversation number',
  'pages.part3Question.validation.conversationNumber.number': 'Conversation number must be a number',
  'pages.part3Question.validation.conversationNumber.range': 'Conversation number must be between 1 and 30',
  'pages.part3Question.validation.content.required': 'Please enter conversation content',
  'pages.part3Question.validation.content.min': 'Content must be at least 10 characters long',
  'pages.part3Question.validation.content.max': 'Content cannot exceed 5000 characters',
  'pages.part3Question.validation.question1.required': 'Please enter question 1',
  'pages.part3Question.validation.question1.min': 'Question must be at least 5 characters long',
  'pages.part3Question.validation.question1.max': 'Question cannot exceed 500 characters',
  'pages.part3Question.validation.question2.required': 'Please enter question 2',
  'pages.part3Question.validation.question3.required': 'Please enter question 3',
  'pages.part3Question.validation.scenario.required': 'Please select a scenario',
  'pages.part3Question.validation.difficultyLevel.required': 'Please select a difficulty level',

  // Messages
  'pages.part3Question.message.delete.success': '删除成功',
  'pages.part3Question.message.delete.error': '删除失败',
  'pages.part3Question.message.update.success': '更新成功',
  'pages.part3Question.message.create.success': '创建成功',
  'pages.part3Question.message.create.warning': 'Conversation created but failed to create answer options',
  'pages.part3Question.message.save.error': '保存失败',
  'pages.part3Question.message.export.success': 'Successfully exported {count} conversations',
  'pages.part3Question.message.export.error': 'Export failed',
  'pages.part3Question.message.loadOptions.error': 'Failed to load dropdown options',
  'pages.part3Question.message.loadConversations.error': '获取Part3Conversation列表失败',
  'pages.part3Question.message.invalidId.error': '无效的记录ID',

  // Confirm dialogs
  'pages.part3Question.confirm.delete.title': 'Are you sure you want to delete this conversation?',
  'pages.part3Question.confirm.delete.ok': 'Yes',
  'pages.part3Question.confirm.delete.cancel': 'No',

  // Pagination
  'pages.part3Question.pagination.total': 'Total {total} records',
  'pages.part3Question.pagination.pageSize.10': '10',
  'pages.part3Question.pagination.pageSize.20': '20',
  'pages.part3Question.pagination.pageSize.50': '50',
  'pages.part3Question.pagination.pageSize.100': '100',
};
