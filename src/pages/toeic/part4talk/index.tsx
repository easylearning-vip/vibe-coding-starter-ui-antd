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
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, MessageOutlined, DownloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import dayjs from 'dayjs';
import {
  createPart4Talk,
  deletePart4Talk,
  getPart4TalkList,
  updatePart4Talk,
  getPart4AnswerOptionsByTalk,
  batchCreatePart4AnswerOptions,
} from '@/services/part4talk/api';
import { getScenarioOptions } from '@/services/scenario/api';
import { getDifficultyLevelOptions } from '@/services/difficulty-level/api';
import { getTestList } from '@/services/test/api';
import { useMultipleApiRequests } from '@/hooks/useApiRequest';
import { withDeduplication } from '@/utils/requestDeduplication';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Panel } = Collapse;

type Part4Talk = Part4TalkAPI.Part4Talk;
type Part4AnswerOption = Part4TalkAPI.Part4AnswerOption;

const Part4TalkManagement: React.FC = () => {
  const intl = useIntl();
  const [part4Talks, setPart4Talks] = useState<Part4Talk[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTalk, setEditingTalk] = useState<Part4Talk | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 使用新的API请求hook来管理下拉框选项数据
  const {
    data: optionsData,
    loading: optionsLoading,
    errors: optionsErrors,
    runSingle: runSingleOption,
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

  // 分页相关状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 答案选项状态
  const [talkAnswers, setTalkAnswers] = useState<{ [key: number]: Part4AnswerOption[] }>({});

  // 安全渲染函数
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object' && value.String !== undefined) {
      return value.Valid ? value.String : '';
    }
    if (typeof value === 'object' && value.Int32 !== undefined) {
      return value.Valid ? value.Int32.toString() : '';
    }
    return String(value);
  };

  // 获取场景名称
  const getScenarioName = (id: number): string => {
    const scenario = scenarios.find(s => s.id === id);
    return scenario ? safeRender(scenario.name) : 'Unknown';
  };

  // 获取难度级别名称
  const getDifficultyLevelName = (id: number): string => {
    const level = difficultyLevels.find(l => l.id === id);
    return level ? safeRender(level.name) : 'Unknown';
  };

  // 获取测试名称
  const getTestName = (testId: number): string => {
    const test = tests.find(t => t.id === testId);
    return test ? test.name || '' : `Test ${testId}`;
  };

  // 渲染正确答案标签
  const renderCorrectAnswerTag = (answer: string): React.ReactNode => {
    const colors: { [key: string]: string } = {
      'A': 'red',
      'B': 'orange', 
      'C': 'green',
      'D': 'blue'
    };
    return <Tag color={colors[answer] || 'default'}>{answer}</Tag>;
  };

  // 创建带去重的API函数
  const dePart4TalkList = withDeduplication(
    getPart4TalkList,
    (params) => `/api/v1/admin/part4talks?${JSON.stringify(params)}`,
    (params) => ({ params })
  );

  const dePart4AnswerOptionsByTalk = withDeduplication(
    getPart4AnswerOptionsByTalk,
    (talkId) => `/api/v1/admin/part4answeroptions/talk/${talkId}`,
    (talkId) => ({ params: { talkId } })
  );

  // 获取Part4Talk列表 - 使用去重版本，现在包含答案选项
  const fetchPart4Talks = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const searchValues = searchForm.getFieldsValue();
      const requestParams = {
        page: params?.page || pagination.current,
        page_size: params?.page_size || pagination.pageSize,
        include_answer_options: true, // 预加载答案选项
        ...searchValues,
        ...params,
      };

      // 处理日期范围
      if (searchValues.dateRange && searchValues.dateRange.length === 2) {
        requestParams.start_date = searchValues.dateRange[0].format('YYYY-MM-DD');
        requestParams.end_date = searchValues.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await dePart4TalkList(requestParams);
      setPart4Talks(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        current: response.page || 1,
        pageSize: response.size || 10,
      }));

      // 从响应中提取答案选项，无需额外请求
      const answersMap: { [key: number]: Part4AnswerOption[] } = {};
      (response.data || []).forEach((talk: Part4Talk) => {
        if (talk.id && talk.answer_options) {
          answersMap[talk.id] = talk.answer_options;
        }
      });
      setTalkAnswers(answersMap);

    } catch (error) {
      console.error('获取Part4Talk列表失败:', error);
      message.error('获取Part4Talk列表失败');
    } finally {
      setLoading(false);
    }
  }, [searchForm, dePart4TalkList]);

  // 搜索处理
  const handleSearch = (values: any) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPart4Talks();
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPart4Talks();
  };

  // 分页变化处理
  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
    fetchPart4Talks({ page, page_size: pageSize });
  };

  // 初始化 - 只调用fetchPart4Talks，选项数据由useMultipleApiRequests自动管理
  useEffect(() => {
    fetchPart4Talks();
  }, []); // 移除fetchPart4Talks依赖，避免无限循环

  // 新增对话
  const handleAdd = () => {
    setEditingTalk(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑对话
  const handleEdit = async (talk: Part4Talk) => {
    setEditingTalk(talk);
    
    // 加载答案选项 - 使用去重版本
    let answers: Part4AnswerOption[] = [];
    if (talk.id) {
      try {
        answers = await dePart4AnswerOptionsByTalk(talk.id);
      } catch (error) {
        console.error('Failed to load answer options:', error);
      }
    }

    // 设置表单值
    const formValues: any = {
      test_id: safeRender(talk.test_id),
      talk_number: safeRender(talk.talk_number),
      title: safeRender(talk.title),
      content: safeRender(talk.content),
      question1: safeRender(talk.question1),
      question2: safeRender(talk.question2),
      question3: safeRender(talk.question3),
      scenario_id: safeRender(talk.scenario_id),
      difficulty_level_id: safeRender(talk.difficulty_level_id),
    };

    // 设置答案选项
    answers.forEach(answer => {
      const questionKey = `question${answer.question_number}_options`;
      formValues[questionKey] = {
        option_a: safeRender(answer.option_a),
        option_b: safeRender(answer.option_b),
        option_c: safeRender(answer.option_c),
        option_d: safeRender(answer.option_d),
        correct_answer: safeRender(answer.correct_answer),
      };
    });

    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  // 删除对话
  const handleDelete = async (talk: Part4Talk) => {
    if (!talk.id) {
      message.error('无效的记录ID');
      return;
    }
    try {
      await deletePart4Talk(talk.id);
      message.success('删除成功');
      fetchPart4Talks();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // Convert string values to appropriate types
      const processedValues = {
        ...values,
        test_id: parseInt(values.test_id, 10),
        talk_number: parseInt(values.talk_number, 10),
        scenario_id: parseInt(values.scenario_id, 10),
        difficulty_level_id: parseInt(values.difficulty_level_id, 10),
      };

      if (editingTalk) {
        if (!editingTalk.id) {
          message.error('无效的记录ID');
          return;
        }
        await updatePart4Talk(editingTalk.id, processedValues);
        message.success('更新成功');
      } else {
        const newTalk = await createPart4Talk(processedValues);

        // Create answer options if provided
        if (values.question1_options || values.question2_options || values.question3_options) {
          try {
            await batchCreatePart4AnswerOptions(newTalk.id!, {
              question1: values.question1_options,
              question2: values.question2_options,
              question3: values.question3_options,
            });
          } catch (error) {
            console.error('Failed to create answer options:', error);
            message.warning('Talk created but failed to create answer options');
          }
        }

        message.success('创建成功');
      }

      setModalVisible(false);
      form.resetFields();
      fetchPart4Talks();
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    }
  };

  return (
    <PageContainer
      title="TOEIC Part 4 Talk Management"
      content="Manage TOEIC Part 4 talk questions and answer options"
    >
      <Card>
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item
                name="search"
                label="Search"
              >
                <Input
                  placeholder="Search talks..."
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
              <Form.Item
                name="dateRange"
                label="Date Range"
              >
                <RangePicker />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ width: '100%', marginTop: 8 }}>
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
            <Col>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  Search
                </Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  Reset
                </Button>
                <Button type="primary" onClick={handleAdd} icon={<PlusOutlined />}>
                  Add New Talk
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        <List
          loading={loading}
          dataSource={part4Talks}
          renderItem={(item: Part4Talk) => {
            const answers = talkAnswers[item.id!] || [];
            const question1Answer = answers.find(a => a.question_number === 1);
            const question2Answer = answers.find(a => a.question_number === 2);
            const question3Answer = answers.find(a => a.question_number === 3);

            return (
              <List.Item
                key={item.id}
                actions={[
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
                    title="Are you sure you want to delete this talk?"
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
                      <Text strong>Talk #{safeRender(item.talk_number)}</Text>
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
                    <Text strong>Content: </Text>
                    {safeRender(item.content) ? (
                      <Text>{safeRender(item.content)}</Text>
                    ) : (
                      <Text type="secondary" italic>No content available</Text>
                    )}
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

                  <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                    <Text>Created: {item.created_at ? dayjs(item.created_at).format('YYYY-MM-DD HH:mm') : 'N/A'}</Text>
                    {item.updated_at && (
                      <>
                        <Divider type="vertical" />
                        <Text>Updated: {dayjs(item.updated_at).format('YYYY-MM-DD HH:mm')}</Text>
                      </>
                    )}
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />

        {/* 分页 */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
          />
        </div>
      </Card>

      {/* 添加/编辑模态框 */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            {editingTalk ? 'Edit TOEIC Part 4 Talk' : 'Add New TOEIC Part 4 Talk'}
          </Space>
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={1000}
        confirmLoading={loading}
      >
        <Spin spinning={isOptionsLoading}>
          <Form form={form} layout="vertical">
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
                  name="talk_number"
                  label="Talk Number"
                  rules={[
                    { required: true, message: 'Please enter talk number' },
                    { pattern: /^\d+$/, message: 'Talk number must be a number' },
                    { validator: (_, value) => {
                      if (value && (parseInt(value) < 1 || parseInt(value) > 30)) {
                        return Promise.reject(new Error('Talk number must be between 1 and 30'));
                      }
                      return Promise.resolve();
                    }}
                  ]}
                >
                  <Input placeholder="Enter talk number (1-30)" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="title"
                  label="Title (Optional)"
                >
                  <Input placeholder="Enter talk title" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="scenario_id"
                  label="Scenario"
                >
                  <Select
                    placeholder="Select scenario"
                    allowClear
                    loading={isOptionsLoading}
                  >
                    {scenarios.map((scenario) => (
                      <Select.Option key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="difficulty_level_id"
                  label="Difficulty Level"
                >
                  <Select
                    placeholder="Select difficulty level"
                    allowClear
                    loading={isOptionsLoading}
                  >
                    {difficultyLevels.map((level) => (
                      <Select.Option key={level.id} value={level.id}>
                        {level.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="content"
              label="Talk Content"
              rules={[{ required: true, message: 'Please enter talk content' }]}
            >
              <TextArea
                rows={4}
                placeholder="Enter the talk content/script..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="question1"
                  label="Question 1"
                  rules={[{ required: true, message: 'Please enter question 1' }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Enter question 1..."
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="question2"
                  label="Question 2"
                  rules={[{ required: true, message: 'Please enter question 2' }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Enter question 2..."
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="question3"
                  label="Question 3"
                  rules={[{ required: true, message: 'Please enter question 3' }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Enter question 3..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Answer Options (Optional)</Divider>

            {/* Question 1 Answer Options */}
            <Card size="small" title="Question 1 Answer Options" style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col span={6}>
                  <Form.Item name={['question1_options', 'option_a']} label="Option A">
                    <Input placeholder="Option A" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['question1_options', 'option_b']} label="Option B">
                    <Input placeholder="Option B" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['question1_options', 'option_c']} label="Option C">
                    <Input placeholder="Option C" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['question1_options', 'option_d']} label="Option D">
                    <Input placeholder="Option D" />
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
            </Card>

            {/* Question 2 Answer Options */}
            <Card size="small" title="Question 2 Answer Options" style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col span={6}>
                  <Form.Item name={['question2_options', 'option_a']} label="Option A">
                    <Input placeholder="Option A" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['question2_options', 'option_b']} label="Option B">
                    <Input placeholder="Option B" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['question2_options', 'option_c']} label="Option C">
                    <Input placeholder="Option C" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['question2_options', 'option_d']} label="Option D">
                    <Input placeholder="Option D" />
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
            </Card>

            {/* Question 3 Answer Options */}
            <Card size="small" title="Question 3 Answer Options" style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col span={6}>
                  <Form.Item name={['question3_options', 'option_a']} label="Option A">
                    <Input placeholder="Option A" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['question3_options', 'option_b']} label="Option B">
                    <Input placeholder="Option B" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['question3_options', 'option_c']} label="Option C">
                    <Input placeholder="Option C" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['question3_options', 'option_d']} label="Option D">
                    <Input placeholder="Option D" />
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
            </Card>
          </Form>
        </Spin>
      </Modal>
    </PageContainer>
  );
};

export default Part4TalkManagement;
