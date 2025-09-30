import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  List,
  Modal,
  message,
  Popconfirm,
  Row,
  Space,
  Select,
  Radio,
  Tag,
  Typography,
  Divider,
  Spin,
  Pagination,
  Collapse,
  Checkbox,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, MessageOutlined, DownloadOutlined, BookOutlined } from '@ant-design/icons';
import AddToPracticeSetModal from '@/components/AddToPracticeSetModal';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import dayjs from 'dayjs';
import {
  createPart3Conversation,
  deletePart3Conversation,
  getPart3ConversationList,
  updatePart3Conversation,
  getPart3AnswerOptionsByConversation,
  batchCreatePart3AnswerOptions,
} from '@/services/part3question/api';
import { getScenarioOptions } from '@/services/scenario/api';
import { getDifficultyLevelOptions } from '@/services/difficulty-level/api';
import { getTestList } from '@/services/test/api';
import { useMultipleApiRequests } from '@/hooks/useApiRequest';
import { withDeduplication } from '@/utils/requestDeduplication';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Panel } = Collapse;

type Part3Conversation = Part3QuestionAPI.Part3Conversation;
type Part3AnswerOption = Part3QuestionAPI.Part3AnswerOption;

const Part3QuestionManagement: React.FC = () => {
  const intl = useIntl();
  const [part3Conversations, setPart3Conversations] = useState<Part3Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConversation, setEditingConversation] = useState<Part3Conversation | null>(null);
  const [initialFormValues, setInitialFormValues] = useState<any>({});
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 使用新的API请求hook来管理下拉框选项数据
  const {
    data: optionsData,
    loading: optionsLoading,
    errors: optionsErrors,
  } = useMultipleApiRequests({
    scenarios: {
      apiFunction: getScenarioOptions,
      cacheKey: 'scenario_options',
    },
    difficultyLevels: {
      apiFunction: getDifficultyLevelOptions,
      cacheKey: 'difficulty_level_options',
    },
    tests: {
      apiFunction: () => getTestList({ page: 1, page_size: 100 }),
      cacheKey: 'test_list_options',
    },
  }, {
    onError: (errors) => {
      console.error('Failed to load options:', errors);
      message.error('Failed to load dropdown options');
    },
  });

  // Aggregate loading state for options (useMultipleApiRequests returns an object)
  const isOptionsLoading = Object.values(optionsLoading || {}).some(Boolean);

  // 从API响应中提取数据
  const scenarios = optionsData.scenarios || [];
  const difficultyLevels = optionsData.difficultyLevels || [];
  const tests = optionsData.tests?.data || [];

  // 分页和查询状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchParams, setSearchParams] = useState({
    search: '',
    start_date: '',
    end_date: '',
    scenario_id: '',
    difficulty_level_id: '',
    test_id: '',
  });

  // Export loading state
  const [exportLoading, setExportLoading] = useState(false);

  // Practice set modal state
  const [practiceSetModalVisible, setPracticeSetModalVisible] = useState(false);

  // Multi-selection state
  const [selectedConversations, setSelectedConversations] = useState<Part3Conversation[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Answer options for each conversation
  const [conversationAnswers, setConversationAnswers] = useState<Record<number, Part3AnswerOption[]>>({});

  // Utility function to safely render any value
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      // Handle sql.NullString
      if (value.String !== undefined) return value.String || '';
      // Handle sql.NullInt32
      if (value.Int32 !== undefined) return String(value.Int32);
      // Handle other objects
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Normalize correct answer to uppercase A-D
  const normalizeAnswer = (val: any): string => {
    const v = safeRender(val).trim().toUpperCase();
    return ['A', 'B', 'C', 'D'].includes(v) ? v : '';
  };

  // Convert answer options array to form values object
  const answersToFormValues = (answers: any[]) => {
    const find = (n: number) => answers?.find((a: any) => a.question_number === n) || {};
    const a1: any = find(1);
    const a2: any = find(2);
    const a3: any = find(3);
    return {
      question1_options: {
        option_a: safeRender(a1.option_a),
        option_b: safeRender(a1.option_b),
        option_c: safeRender(a1.option_c),
        option_d: safeRender(a1.option_d),
        correct_answer: normalizeAnswer(a1.correct_answer),
      },
      question2_options: {
        option_a: safeRender(a2.option_a),
        option_b: safeRender(a2.option_b),
        option_c: safeRender(a2.option_c),
        option_d: safeRender(a2.option_d),
        correct_answer: normalizeAnswer(a2.correct_answer),
      },
      question3_options: {
        option_a: safeRender(a3.option_a),
        option_b: safeRender(a3.option_b),
        option_c: safeRender(a3.option_c),
        option_d: safeRender(a3.option_d),
        correct_answer: normalizeAnswer(a3.correct_answer),
      },
    };
  };

  // 创建带去重的API函数
  const dePart3ConversationList = withDeduplication(
    getPart3ConversationList,
    (params) => `/api/v1/admin/part3conversations?${JSON.stringify(params)}`,
    (params) => ({ params })
  );

  const dePart3AnswerOptionsByConversation = withDeduplication(
    getPart3AnswerOptionsByConversation,
    (conversationId) => `/api/v1/admin/part3answeroptions/conversation/${conversationId}`,
    (conversationId) => ({ params: { conversationId } })
  );

  // 获取场景名称
  const getScenarioName = (scenarioId: number): string => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    return scenario ? scenario.name || '' : `Scenario ${scenarioId}`;
  };

  // 获取难度级别名称
  const getDifficultyLevelName = (difficultyLevelId: number): string => {
    const level = difficultyLevels.find(l => l.id === difficultyLevelId);
    return level ? level.name || '' : `Level ${difficultyLevelId}`;
  };

  // 获取测试名称
  const getTestName = (testId: number): string => {
    const test = tests.find(t => t.id === testId);
    return test ? test.name || '' : `Test ${testId}`;
  };

  // 渲染正确答案标签
  const renderCorrectAnswerTag = (correctAnswer: string): React.ReactNode => {
    const colors = { A: 'blue', B: 'green', C: 'orange', D: 'red' };
    return (
      <Tag color={colors[correctAnswer as keyof typeof colors] || 'default'}>
        {correctAnswer}
      </Tag>
    );
  };

  // Load answer options for conversations - 使用去重版本
  const loadAnswerOptions = useCallback(async (conversationIds: number[]) => {
    try {
      const answerPromises = conversationIds.map(id =>
        dePart3AnswerOptionsByConversation(id).catch(() => [])
      );
      const answers = await Promise.all(answerPromises);

      const answerMap: Record<number, Part3AnswerOption[]> = {};
      conversationIds.forEach((id, index) => {
        answerMap[id] = answers[index];
      });

      setConversationAnswers(prev => ({ ...prev, ...answerMap }));
    } catch (error) {
      console.error('Failed to load answer options:', error);
    }
  }, [dePart3AnswerOptionsByConversation]);

  const fetchPart3Conversations = useCallback(async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
    scenario_id?: string;
    difficulty_level_id?: string;
    test_id?: string;
    sort?: string;
    order?: string;
  }) => {
    setLoading(true);
    try {
      const queryParams: any = {
        page: params?.page || pagination.current,
        page_size: params?.pageSize || pagination.pageSize,
        search: params?.search || searchParams.search,
        sort: params?.sort || 'created_at',
        order: params?.order || 'desc',
        include_answer_options: true, // 预加载答案选项
      };

      // 添加可选的过滤参数
      if (params?.start_date) queryParams.start_date = params.start_date;
      if (params?.end_date) queryParams.end_date = params.end_date;
      if (params?.scenario_id) queryParams.scenario_id = params.scenario_id;
      if (params?.difficulty_level_id) queryParams.difficulty_level_id = params.difficulty_level_id;
      if (params?.test_id) queryParams.test_id = Number(params.test_id);

      const response = await dePart3ConversationList(queryParams);

      // Transform the data to handle nullable types
      const transformedData = response.data.map((item: any) => ({
        ...item,
        title: item.title?.String || item.title || '',
        scenario_id: item.scenario_id?.Int32 !== undefined ? item.scenario_id.Int32 : (item.scenario_id || ''),
        difficulty_level_id: item.difficulty_level_id?.Int32 !== undefined ? item.difficulty_level_id.Int32 : (item.difficulty_level_id || ''),
      }));

      setPart3Conversations(transformedData);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        current: response.page,
        pageSize: response.size,
      }));

      // 从响应中提取答案选项，无需额外请求
      const answersMap: { [key: number]: Part3AnswerOption[] } = {};
      transformedData.forEach((conversation: any) => {
        if (conversation.id && conversation.answer_options) {
          answersMap[conversation.id] = conversation.answer_options;
        }
      });
      setConversationAnswers(answersMap);
    } catch (error) {
      console.error('获取Part3Conversation列表失败:', error);
      message.error('获取Part3Conversation列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchParams, dePart3ConversationList, loadAnswerOptions]);

  const handleEdit = async (conversation: Part3Conversation) => {
    setEditingConversation(conversation);

    // Base data mapping
    const baseFormData: any = {
      ...conversation,
      title: (conversation as any).title?.String || (conversation as any).title || '',
      scenario_id: (conversation as any).scenario_id?.Int32 !== undefined ? (conversation as any).scenario_id.Int32 : ((conversation as any).scenario_id || ''),
      difficulty_level_id: (conversation as any).difficulty_level_id?.Int32 !== undefined ? (conversation as any).difficulty_level_id.Int32 : ((conversation as any).difficulty_level_id || ''),
      content: (conversation as any).content?.String || (conversation as any).content || conversation.content || '',
      question1: (conversation as any).question1?.String || (conversation as any).question1 || (conversation as any).q1 || '',
      question2: (conversation as any).question2?.String || (conversation as any).question2 || (conversation as any).q2 || '',
      question3: (conversation as any).question3?.String || (conversation as any).question3 || (conversation as any).q3 || '',
    };

    // Prepare initial values including any cached answers for better UX
    const cachedAnswers: any[] = conversation.id
      ? ((conversation as any).answer_options || conversationAnswers[conversation.id] || [])
      : [];
    const mergedInitial = cachedAnswers && cachedAnswers.length > 0
      ? { ...baseFormData, ...answersToFormValues(cachedAnswers) }
      : baseFormData;
    setInitialFormValues(mergedInitial);

    // Set fields for currently mounted inputs, then show modal
    form.setFieldsValue(mergedInitial);
    setModalVisible(true);

    // Fetch fresh answer options to ensure correctness; if empty, keep cached values
    try {
      const freshAnswers: any[] = conversation.id ? await dePart3AnswerOptionsByConversation(conversation.id) : [];
      if (freshAnswers && freshAnswers.length > 0) {
        form.setFieldsValue(answersToFormValues(freshAnswers));
      }
    } catch (err) {
      console.warn('Failed to fetch fresh answer options for edit, falling back to cached if any:', err);
      // Keep whatever cached values we already set; no action needed
    }
  };

  const handleAdd = () => {
    setEditingConversation(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (conversation: Part3Conversation) => {
    if (!conversation.id) {
      message.error('无效的记录ID');
      return;
    }
    try {
      await deletePart3Conversation(conversation.id);
      message.success('删除成功');
      fetchPart3Conversations();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // Convert string values to appropriate types
      const processedValues = {
        ...values,
        test_id: parseInt(values.test_id, 10),
        conversation_number: parseInt(values.conversation_number, 10),
        scenario_id: parseInt(values.scenario_id, 10),
        difficulty_level_id: parseInt(values.difficulty_level_id, 10),
      };

      if (editingConversation) {
        if (!editingConversation.id) {
          message.error('无效的记录ID');
          return;
        }
        await updatePart3Conversation(editingConversation.id, processedValues);
        message.success('更新成功');
      } else {
        const newConversation = await createPart3Conversation(processedValues);

        // Create answer options if provided
        if (values.question1_options || values.question2_options || values.question3_options) {
          try {
            await batchCreatePart3AnswerOptions(newConversation.id!, {
              question1: values.question1_options,
              question2: values.question2_options,
              question3: values.question3_options,
            });
          } catch (error) {
            console.error('Failed to create answer options:', error);
            message.warning('Conversation created but failed to create answer options');
          }
        }

        message.success('创建成功');
      }

      setModalVisible(false);
      fetchPart3Conversations();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 搜索处理
  const handleSearch = (values: any) => {
    const newSearchParams = {
      search: values.search || '',
      start_date: values.date_range?.[0]?.format('YYYY-MM-DD') || '',
      end_date: values.date_range?.[1]?.format('YYYY-MM-DD') || '',
      scenario_id: values.scenario_id || '',
      difficulty_level_id: values.difficulty_level_id || '',
      test_id: values.test_id || '',
    };
    setSearchParams(newSearchParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchPart3Conversations({
      page: 1,
      ...newSearchParams,
    });
  };

  // 重置搜索
  const handleReset = () => {
    const resetParams = {
      search: '',
      start_date: '',
      end_date: '',
      scenario_id: '',
      difficulty_level_id: '',
      test_id: '',
    };
    setSearchParams(resetParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    searchForm.resetFields();
    fetchPart3Conversations({
      page: 1,
      ...resetParams,
    });
  };

  // Export functionality
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Fetch all data with current filters (no pagination)
      const queryParams: any = {
        page: 1,
        page_size: 10000, // Large number to get all results
        search: searchParams.search,
        sort: 'created_at',
        order: 'desc',
      };

      // Add filter parameters
      if (searchParams.start_date) queryParams.start_date = searchParams.start_date;
      if (searchParams.end_date) queryParams.end_date = searchParams.end_date;
      if (searchParams.scenario_id) queryParams.scenario_id = searchParams.scenario_id;
      if (searchParams.difficulty_level_id) queryParams.difficulty_level_id = searchParams.difficulty_level_id;

      const response = await dePart3ConversationList(queryParams);

      // Transform the data
      const transformedData = response.data.map((item: any) => ({
        ...item,
        title: item.title?.String || item.title || '',
        scenario_id: item.scenario_id?.Int32 !== undefined ? item.scenario_id.Int32 : (item.scenario_id || ''),
        difficulty_level_id: item.difficulty_level_id?.Int32 !== undefined ? item.difficulty_level_id.Int32 : (item.difficulty_level_id || ''),
      }));

      // Generate filename
      let filename = 'toeic-part3';

      // Add difficulty if filtered
      if (searchParams.difficulty_level_id) {
        const difficultyName = getDifficultyLevelName(parseInt(searchParams.difficulty_level_id));
        filename += `-${difficultyName.toLowerCase()}`;
      }

      // Add scenario if filtered
      if (searchParams.scenario_id) {
        const scenarioName = getScenarioName(parseInt(searchParams.scenario_id));
        const cleanScenarioName = scenarioName.replace(/[\/\s]/g, '-');
        filename += `-${cleanScenarioName}`;
      }

      filename += `-${transformedData.length}-conversations.txt`;

      // Generate file content
      let content = '# TOEIC Part 3 - Conversation Questions\n\n';

      // Add metadata
      const difficultyLabel = searchParams.difficulty_level_id
        ? getDifficultyLevelName(parseInt(searchParams.difficulty_level_id))
        : 'Mixed';
      const scenarioLabel = searchParams.scenario_id
        ? getScenarioName(parseInt(searchParams.scenario_id))
        : 'Mixed';

      content += `**Difficulty:** ${difficultyLabel}\n`;
      content += `**Scenario:** ${scenarioLabel}\n`;
      content += `**Total Conversations:** ${transformedData.length}\n\n`;

      // Add conversations
      transformedData.forEach((item: any, index: number) => {
        content += `## Conversation ${index + 1}\n`;
        if (item.title) content += `**Title:** ${safeRender(item.title)}\n`;
        content += `**Content:**\n${safeRender(item.content)}\n\n`;
        content += `**Questions:**\n`;
        content += `1. ${safeRender(item.question1)}\n`;
        content += `2. ${safeRender(item.question2)}\n`;
        content += `3. ${safeRender(item.question3)}\n\n`;
        content += '---\n\n';
      });

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(`Successfully exported ${transformedData.length} conversations`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Selection handling functions
  const handleSelectConversation = (conversation: Part3Conversation, checked: boolean) => {
    if (checked) {
      setSelectedConversations(prev => [...prev, conversation]);
    } else {
      setSelectedConversations(prev => prev.filter(c => c.id !== conversation.id));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedConversations([...part3Conversations]);
    } else {
      setSelectedConversations([]);
    }
  };

  const isConversationSelected = (conversation: Part3Conversation) => {
    return selectedConversations.some(c => c.id === conversation.id);
  };

  // Handle practice set creation with selected conversations
  const handleAddSelectedToPracticeSet = () => {
    if (selectedConversations.length === 0) {
      message.warning('Please select at least one conversation');
      return;
    }
    setPracticeSetModalVisible(true);
  };

  useEffect(() => {
    // 只调用fetchPart3Conversations，选项数据由useMultipleApiRequests自动管理
    fetchPart3Conversations();
  }, []);

  // Update selectAll state when conversations change
  useEffect(() => {
    if (part3Conversations.length > 0 && selectedConversations.length === part3Conversations.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedConversations, part3Conversations]);

  const buttonStyle = { marginBottom: 16 };

  return (
    <PageContainer
      title="TOEIC Part 3 Question Management"
      content="Manage TOEIC Part 3 conversation questions and answer options"
    >
      <Card>
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={ { marginBottom: 16 } }
        >
          <Row gutter={[16, 16]} style={ { width: '100%' } }>
            <Col span={6}>
              <Form.Item
                name="search"
                label="Search"
              >
                <Input
                  placeholder="Search conversations..."
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="scenario_id"
                label="Scenario"
              >
                <Select
                  placeholder="Select scenario"
                  allowClear
                  loading={isOptionsLoading}
                >
                  <Select.Option value="">All</Select.Option>
                  {scenarios.map((scenario) => (
                    <Select.Option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="difficulty_level_id"
                label="Difficulty"
              >
                <Select
                  placeholder="Select difficulty"
                  allowClear
                  loading={isOptionsLoading}
                >
                  <Select.Option value="">All</Select.Option>
                  {difficultyLevels.map((level) => (
                    <Select.Option key={level.id} value={level.id}>
                      {level.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  Search
                </Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  Reset
                </Button>
              </Space>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={ { width: '100%', marginTop: 16 } }>
            <Col span={6}>
              <Form.Item
                name="test_id"
                label="Test"
              >
                <Select
                  placeholder="Select test"
                  allowClear
                  loading={isOptionsLoading}
                >
                  <Select.Option value="">All</Select.Option>
                  {tests.map((test) => (
                    <Select.Option key={test.id} value={test.id}>
                      {test.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date_range"
                label="Created Date"
              >
                <DatePicker.RangePicker
                  placeholder={['Start Date', 'End Date']}
                  style={ { width: '100%' } }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <div style={buttonStyle}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  Add New Conversation
                </Button>
                <Button
                  icon={<BookOutlined />}
                  onClick={() => setPracticeSetModalVisible(true)}
                >
                  Auto-Generate Practice Set
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  loading={exportLoading}
                >
                  Export
                </Button>
              </Space>
            </Col>
            <Col>
              <Space>
                <Checkbox
                  checked={selectAll}
                  indeterminate={selectedConversations.length > 0 && selectedConversations.length < part3Conversations.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  Select All
                </Checkbox>
                <Text type="secondary">
                  {selectedConversations.length} selected
                </Text>
                <Button
                  type="primary"
                  icon={<BookOutlined />}
                  onClick={handleAddSelectedToPracticeSet}
                  disabled={selectedConversations.length === 0}
                >
                  Add Selected to Practice Set
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <div style={{ overflowX: 'auto', minWidth: '800px' }}>
          <List
          loading={loading}
          dataSource={part3Conversations}
          renderItem={(item: Part3Conversation) => {
            const answers = conversationAnswers[item.id!] || [];
            const question1Answer = answers.find(a => a.question_number === 1);
            const question2Answer = answers.find(a => a.question_number === 2);
            const question3Answer = answers.find(a => a.question_number === 3);

            return (
              <List.Item
                key={item.id}
                actions={[
                  <Checkbox
                    key="select"
                    checked={isConversationSelected(item)}
                    onChange={(e) => handleSelectConversation(item, e.target.checked)}
                  />,
                  <Button
                    key="edit"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Are you sure you want to delete this conversation?"
                    onConfirm={() => handleDelete(item)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Card
                  size="small"
                  style={{ width: '100%' }}
                  title={
                    <Space>
                      <MessageOutlined />
                      <Text strong>Conversation #{safeRender(item.conversation_number)}</Text>
                      <Tag color="blue">{getTestName(Number(safeRender(item.test_id)))}</Tag>
                      <Tag color="purple">{getScenarioName(Number(safeRender(item.scenario_id)))}</Tag>
                      <Tag color="orange">{getDifficultyLevelName(Number(safeRender(item.difficulty_level_id)))}</Tag>
                    </Space>
                  }
                >
                  {item.title && (
                    <div style={{ marginBottom: 16 }}>
                      <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                        {safeRender(item.title)}
                      </Title>
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Conversation Content:</Text>
                    <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                      <Text>{safeRender(item.content)}</Text>
                    </div>
                  </div>

                  <Collapse size="small" ghost>
                    <Panel header="Questions & Answers" key="1">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>Question 1: </Text>
                          <Text>{safeRender(item.question1)}</Text>
                          {question1Answer && (
                            <div style={{ marginTop: 4, marginLeft: 16 }}>
                              <div style={{ marginLeft: 16 }}>
                                <div style={{ marginBottom: 4 }}><Text>A: {safeRender(question1Answer.option_a)}</Text></div>
                                <div style={{ marginBottom: 4 }}><Text>B: {safeRender(question1Answer.option_b)}</Text></div>
                                <div style={{ marginBottom: 4 }}><Text>C: {safeRender(question1Answer.option_c)}</Text></div>
                                <div style={{ marginBottom: 4 }}><Text>D: {safeRender(question1Answer.option_d)}</Text></div>
                              </div>
                              <div style={{ marginTop: 4 }}>
                                <Text strong>Answer: </Text>
                                {renderCorrectAnswerTag(safeRender(question1Answer.correct_answer))}
                              </div>
                            </div>
                          )}
                        </div>

                        <Divider style={{ margin: '8px 0' }} />

                        <div>
                          <Text strong>Question 2: </Text>
                          <Text>{safeRender(item.question2)}</Text>
                          {question2Answer && (
                            <div style={{ marginTop: 4, marginLeft: 16 }}>
                              <div style={{ marginLeft: 16 }}>
                                <div style={{ marginBottom: 4 }}><Text>A: {safeRender(question2Answer.option_a)}</Text></div>
                                <div style={{ marginBottom: 4 }}><Text>B: {safeRender(question2Answer.option_b)}</Text></div>
                                <div style={{ marginBottom: 4 }}><Text>C: {safeRender(question2Answer.option_c)}</Text></div>
                                <div style={{ marginBottom: 4 }}><Text>D: {safeRender(question2Answer.option_d)}</Text></div>
                              </div>
                              <div style={{ marginTop: 4 }}>
                                <Text strong>Answer: </Text>
                                {renderCorrectAnswerTag(safeRender(question2Answer.correct_answer))}
                              </div>
                            </div>
                          )}
                        </div>

                        <Divider style={{ margin: '8px 0' }} />

                        <div>
                          <Text strong>Question 3: </Text>
                          <Text>{safeRender(item.question3)}</Text>
                          {question3Answer && (
                            <div style={{ marginTop: 4, marginLeft: 16 }}>
                              <div style={{ marginLeft: 16 }}>
                                <div style={{ marginBottom: 4 }}><Text>A: {safeRender(question3Answer.option_a)}</Text></div>
                                <div style={{ marginBottom: 4 }}><Text>B: {safeRender(question3Answer.option_b)}</Text></div>
                                <div style={{ marginBottom: 4 }}><Text>C: {safeRender(question3Answer.option_c)}</Text></div>
                                <div style={{ marginBottom: 4 }}><Text>D: {safeRender(question3Answer.option_d)}</Text></div>
                              </div>
                              <div style={{ marginTop: 4 }}>
                                <Text strong>Answer: </Text>
                                {renderCorrectAnswerTag(safeRender(question3Answer.correct_answer))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Space>
                    </Panel>
                  </Collapse>

                  <Divider style={{ margin: '12px 0' }} />

                  <Row justify="end" align="middle">
                    <Col>
                      <Text type="secondary">
                        {safeRender(item.created_at) ? dayjs(safeRender(item.created_at)).format('YYYY-MM-DD') : ''}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            );
          }}
        />
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Total ${total} records`}
            pageSizeOptions={['10', '20', '50', '100']}
            onChange={(page, pageSize) => {
              fetchPart3Conversations({
                page,
                pageSize,
                ...searchParams,
              });
            }}
          />
        </div>
      </Card>

      <Modal
        title={
          <Space>
            <MessageOutlined />
            {editingConversation ? 'Edit TOEIC Part 3 Conversation' : 'Add New TOEIC Part 3 Conversation'}
          </Space>
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={1000}
        confirmLoading={loading}
      >
        <Spin spinning={isOptionsLoading}>
          <Form key={(editingConversation?.id ?? 'new') + '-' + (modalVisible ? 'open' : 'closed')} form={form} layout="vertical" initialValues={initialFormValues}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="test_id"
                  label="Test ID"
                  rules={[
                    { required: true, message: 'Please enter test ID' },
                    { pattern: /^\d+$/, message: 'Test ID must be a number' },
                    { validator: (_, value) => {
                      if (value && (parseInt(value) < 1 || parseInt(value) > 999)) {
                        return Promise.reject(new Error('Test ID must be between 1 and 999'));
                      }
                      return Promise.resolve();
                    }}
                  ]}
                >
                  <Input placeholder="Enter test ID (1-999)" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="conversation_number"
                  label="Conversation Number"
                  rules={[
                    { required: true, message: 'Please enter conversation number' },
                    { pattern: /^\d+$/, message: 'Conversation number must be a number' },
                    { validator: (_, value) => {
                      if (value && (parseInt(value) < 1 || parseInt(value) > 99)) {
                        return Promise.reject(new Error('Conversation number must be between 1 and 99'));
                      }
                      return Promise.resolve();
                    }}
                  ]}
                >
                  <Input placeholder="Enter conversation number (1-99)" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="title"
                  label="Title (Optional)"
                  rules={[
                    { max: 255, message: 'Title cannot exceed 255 characters' }
                  ]}
                >
                  <Input placeholder="Enter conversation title (max 255 chars)" maxLength={255} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="content"
              label="Conversation Content"
              rules={[
                { required: true, message: 'Please enter the conversation content' },
                { min: 10, message: 'Content must be at least 10 characters long' },
                { max: 5000, message: 'Content cannot exceed 5000 characters' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter the TOEIC Part 3 conversation content (10-5000 chars)..."
                showCount
                maxLength={5000}
              />
            </Form.Item>

            <Divider orientation="left">Questions</Divider>

            <Form.Item
              name="question1"
              label="Question 1"
              rules={[
                { required: true, message: 'Please enter question 1' },
                { min: 5, message: 'Question must be at least 5 characters long' },
                { max: 500, message: 'Question cannot exceed 500 characters' }
              ]}
            >
              <TextArea
                rows={2}
                placeholder="Enter question 1 (5-500 chars)..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              name="question2"
              label="Question 2"
              rules={[{ required: true, message: 'Please enter question 2' }]}
            >
              <TextArea
                rows={2}
                placeholder="Enter question 2..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              name="question3"
              label="Question 3"
              rules={[{ required: true, message: 'Please enter question 3' }]}
            >
              <TextArea
                rows={2}
                placeholder="Enter question 3..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Divider orientation="left">Answer Options (Optional)</Divider>

            <Collapse ghost>
              <Panel header="Question 1 Answer Options" key="q1">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name={['question1_options', 'option_a']} label="Option A">
                      <Input placeholder="Enter option A" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['question1_options', 'option_b']} label="Option B">
                      <Input placeholder="Enter option B" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name={['question1_options', 'option_c']} label="Option C">
                      <Input placeholder="Enter option C" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['question1_options', 'option_d']} label="Option D">
                      <Input placeholder="Enter option D" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name={['question1_options', 'correct_answer']} label="Correct Answer">
                  <Radio.Group>
                    <Radio value="A">A</Radio>
                    <Radio value="B">B</Radio>
                    <Radio value="C">C</Radio>
                    <Radio value="D">D</Radio>
                  </Radio.Group>
                </Form.Item>
              </Panel>

              <Panel header="Question 2 Answer Options" key="q2">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name={['question2_options', 'option_a']} label="Option A">
                      <Input placeholder="Enter option A" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['question2_options', 'option_b']} label="Option B">
                      <Input placeholder="Enter option B" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name={['question2_options', 'option_c']} label="Option C">
                      <Input placeholder="Enter option C" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['question2_options', 'option_d']} label="Option D">
                      <Input placeholder="Enter option D" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name={['question2_options', 'correct_answer']} label="Correct Answer">
                  <Radio.Group>
                    <Radio value="A">A</Radio>
                    <Radio value="B">B</Radio>
                    <Radio value="C">C</Radio>
                    <Radio value="D">D</Radio>
                  </Radio.Group>
                </Form.Item>
              </Panel>

              <Panel header="Question 3 Answer Options" key="q3">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name={['question3_options', 'option_a']} label="Option A">
                      <Input placeholder="Enter option A" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['question3_options', 'option_b']} label="Option B">
                      <Input placeholder="Enter option B" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name={['question3_options', 'option_c']} label="Option C">
                      <Input placeholder="Enter option C" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['question3_options', 'option_d']} label="Option D">
                      <Input placeholder="Enter option D" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name={['question3_options', 'correct_answer']} label="Correct Answer">
                  <Radio.Group>
                    <Radio value="A">A</Radio>
                    <Radio value="B">B</Radio>
                    <Radio value="C">C</Radio>
                    <Radio value="D">D</Radio>
                  </Radio.Group>
                </Form.Item>
              </Panel>
            </Collapse>

            <Divider orientation="left">Classification</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="scenario_id"
                  label="Scenario"
                  rules={[{ required: true, message: 'Please select a scenario' }]}
                >
                  <Select
                    placeholder="Select scenario"
                    loading={isOptionsLoading}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={scenarios.map(scenario => ({
                      value: scenario.id,
                      label: scenario.name,
                      title: scenario.description,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="difficulty_level_id"
                  label="Difficulty Level"
                  rules={[{ required: true, message: 'Please select a difficulty level' }]}
                >
                  <Select
                    placeholder="Select difficulty level"
                    loading={isOptionsLoading}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={difficultyLevels.map(level => ({
                      value: level.id,
                      label: level.name,
                      title: level.description,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>

      <AddToPracticeSetModal
        visible={practiceSetModalVisible}
        onCancel={() => {
          setPracticeSetModalVisible(false);
          // Clear selection after modal closes if it was for selected conversations
          if (selectedConversations.length > 0) {
            setSelectedConversations([]);
            setSelectAll(false);
          }
        }}
        onSuccess={() => {
          message.success('Practice set created successfully!');
          // Clear selection after successful creation
          setSelectedConversations([]);
          setSelectAll(false);
        }}
        toeicPart="part3"
        title={selectedConversations.length > 0 ?
          `Add ${selectedConversations.length} Selected Conversations to Practice Set` :
          "Auto-Generate Part 3 Practice Set"}
        selectedQuestions={selectedConversations}
        mode={selectedConversations.length > 0 ? 'selected-questions' : 'auto-generate'}
      />
    </PageContainer>
  );
};

export default Part3QuestionManagement;
