import React, { useEffect, useState } from 'react';
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
  Checkbox,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, QuestionCircleOutlined, DownloadOutlined, BookOutlined } from '@ant-design/icons';
import AddToPracticeSetModal from '@/components/AddToPracticeSetModal';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import dayjs from 'dayjs';
import {
  createPart2Question,
  deletePart2Question,
  getPart2QuestionList,
  updatePart2Question,
} from '@/services/part2question/api';
import { getScenarioOptions } from '@/services/scenario/api';
import { getDifficultyLevelOptions } from '@/services/difficulty-level/api';
import { getTestList } from '@/services/test/api';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Text, Title } = Typography;

type Part2Question = Part2QuestionAPI.Part2Question;

const Part2QuestionManagement: React.FC = () => {
  const intl = useIntl();
  const [part2Questions, setPart2Questions] = useState<Part2Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPart2Question, setEditingPart2Question] = useState<Part2Question | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 下拉框选项数据
  const [scenarios, setScenarios] = useState<ScenarioAPI.Scenario[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevelAPI.DifficultyLevel[]>([]);
  const [tests, setTests] = useState<TestAPI.Test[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

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
  const [selectedQuestions, setSelectedQuestions] = useState<Part2Question[]>([]);
  const [selectAll, setSelectAll] = useState(false);



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

  // 加载下拉框选项数据
  const loadOptions = async () => {
    setOptionsLoading(true);
    try {
      const [scenarioData, difficultyData, testData] = await Promise.all([
        getScenarioOptions(),
        getDifficultyLevelOptions(),
        getTestList({ page: 1, page_size: 100 }),
      ]);
      setScenarios(scenarioData);
      setDifficultyLevels(difficultyData);
      setTests(testData.data);
    } catch (error) {
      console.error('Failed to load options:', error);
      message.error('Failed to load dropdown options');
    } finally {
      setOptionsLoading(false);
    }
  };

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
    const colors = { A: 'blue', B: 'green', C: 'orange' };
    return (
      <Tag color={colors[correctAnswer as keyof typeof colors] || 'default'}>
        {correctAnswer}
      </Tag>
    );
  };

  const fetchPart2Questions = async (params?: {
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
      };

      // 添加可选的过滤参数
      if (params?.start_date) queryParams.start_date = params.start_date;
      if (params?.end_date) queryParams.end_date = params.end_date;
      if (params?.scenario_id) queryParams.scenario_id = params.scenario_id;
      if (params?.difficulty_level_id) queryParams.difficulty_level_id = params.difficulty_level_id;
      if (params?.test_id) queryParams.test_id = Number(params.test_id);

      const response = await getPart2QuestionList(queryParams);

      // Transform the data to handle nullable types
      const transformedData = response.data.map((item: any) => ({
        ...item,
        correct_answer: item.correct_answer?.String || item.correct_answer || '',
        scenario_id: item.scenario_id?.Int32 !== undefined ? item.scenario_id.Int32 : (item.scenario_id || ''),
        difficulty_level_id: item.difficulty_level_id?.Int32 !== undefined ? item.difficulty_level_id.Int32 : (item.difficulty_level_id || ''),
      }));

      setPart2Questions(transformedData);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        current: response.page,
        pageSize: response.size,
      }));
    } catch (error) {
      console.error('获取Part2Question列表失败:', error);
      message.error('获取Part2Question列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (part2Question: Part2Question) => {
    setEditingPart2Question(part2Question);

    // Transform the data to handle nullable types
    const formData = {
      ...part2Question,
      correct_answer: (part2Question.correct_answer as any)?.String || part2Question.correct_answer || '',
      scenario_id: (part2Question.scenario_id as any)?.Int32 !== undefined ? (part2Question.scenario_id as any).Int32 : (part2Question.scenario_id || ''),
      difficulty_level_id: (part2Question.difficulty_level_id as any)?.Int32 !== undefined ? (part2Question.difficulty_level_id as any).Int32 : (part2Question.difficulty_level_id || ''),
    };

    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingPart2Question(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (part2Question: Part2Question) => {
    if (!part2Question.id) {
      message.error('无效的记录ID');
      return;
    }
    try {
      await deletePart2Question(part2Question.id);
      message.success('删除成功');
      fetchPart2Questions();
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
        question_number: parseInt(values.question_number, 10),
        scenario_id: parseInt(values.scenario_id, 10),
        difficulty_level_id: parseInt(values.difficulty_level_id, 10),
      };

      if (editingPart2Question) {
        if (!editingPart2Question.id) {
          message.error('无效的记录ID');
          return;
        }
        await updatePart2Question(editingPart2Question.id, processedValues);
        message.success('更新成功');
      } else {
        await createPart2Question(processedValues);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchPart2Questions();
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
    fetchPart2Questions({
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
    fetchPart2Questions({
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

      const response = await getPart2QuestionList(queryParams);

      // Transform the data
      const transformedData = response.data.map((item: any) => ({
        ...item,
        correct_answer: item.correct_answer?.String || item.correct_answer || '',
        scenario_id: item.scenario_id?.Int32 !== undefined ? item.scenario_id.Int32 : (item.scenario_id || ''),
        difficulty_level_id: item.difficulty_level_id?.Int32 !== undefined ? item.difficulty_level_id.Int32 : (item.difficulty_level_id || ''),
      }));

      // Generate filename
      let filename = 'toeic-part2';

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

      filename += `-${transformedData.length}-items.txt`;

      // Generate file content
      let content = '# TOEIC Part 2 - Response Questions\n\n';

      // Add metadata
      const difficultyLabel = searchParams.difficulty_level_id
        ? getDifficultyLevelName(parseInt(searchParams.difficulty_level_id))
        : 'Mixed';
      const scenarioLabel = searchParams.scenario_id
        ? getScenarioName(parseInt(searchParams.scenario_id))
        : 'Mixed';

      content += `**Difficulty:** ${difficultyLabel}\n`;
      content += `**Scenario:** ${scenarioLabel}\n`;
      content += `**Total Questions:** ${transformedData.length}\n\n`;

      // Add questions
      transformedData.forEach((item: any, index: number) => {
        content += `${index + 1}. ${safeRender(item.question_text)}\n`;
        content += `A. ${safeRender(item.option_a)}\n`;
        content += `B. ${safeRender(item.option_b)}\n`;
        content += `C. ${safeRender(item.option_c)}\n\n`;
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

      message.success(`Successfully exported ${transformedData.length} questions`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Selection handling functions
  const handleSelectQuestion = (question: Part2Question, checked: boolean) => {
    if (checked) {
      setSelectedQuestions(prev => [...prev, question]);
    } else {
      setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedQuestions([...part2Questions]);
    } else {
      setSelectedQuestions([]);
    }
  };

  const isQuestionSelected = (question: Part2Question) => {
    return selectedQuestions.some(q => q.id === question.id);
  };

  // Handle practice set creation with selected questions
  const handleAddSelectedToPracticeSet = () => {
    if (selectedQuestions.length === 0) {
      message.warning('Please select at least one question');
      return;
    }
    setPracticeSetModalVisible(true);
  };

  useEffect(() => {
    loadOptions();
    fetchPart2Questions();
  }, []);

  // Update selectAll state when questions change
  useEffect(() => {
    if (part2Questions.length > 0 && selectedQuestions.length === part2Questions.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedQuestions, part2Questions]);

  const buttonStyle = { marginBottom: 16 };

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'pages.part2Question.title' })}
      content={intl.formatMessage({ id: 'pages.part2Question.subTitle' })}
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
                label={intl.formatMessage({ id: 'pages.part2Question.form.name' })}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'pages.part2Question.form.name.placeholder',
                  })}
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
                  loading={optionsLoading}
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
                  loading={optionsLoading}
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
                  {intl.formatMessage({ id: 'pages.common.search' })}
                </Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  {intl.formatMessage({ id: 'pages.common.reset' })}
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
                  loading={optionsLoading}
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
                label={intl.formatMessage({ id: 'pages.part2Question.table.createdAt' })}
              >
                <DatePicker.RangePicker
                  placeholder={[
                    intl.formatMessage({ id: 'pages.common.startDate' }),
                    intl.formatMessage({ id: 'pages.common.endDate' }),
                  ]}
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
                  {intl.formatMessage({ id: 'pages.part2Question.button.add' })}
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
                  indeterminate={selectedQuestions.length > 0 && selectedQuestions.length < part2Questions.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  Select All
                </Checkbox>
                <Text type="secondary">
                  {selectedQuestions.length} selected
                </Text>
                <Button
                  type="primary"
                  icon={<BookOutlined />}
                  onClick={handleAddSelectedToPracticeSet}
                  disabled={selectedQuestions.length === 0}
                >
                  Add Selected to Practice Set
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <List
          loading={loading}
          dataSource={part2Questions}
          renderItem={(item: Part2Question) => (
            <List.Item
              key={item.id}
              actions={[
                <Checkbox
                  key="select"
                  checked={isQuestionSelected(item)}
                  onChange={(e) => handleSelectQuestion(item, e.target.checked)}
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
                  title="Are you sure you want to delete this question?"
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
                    <QuestionCircleOutlined />
                    <Text strong>Question #{safeRender(item.question_number)}</Text>
                    <Tag color="blue">{getTestName(Number(safeRender(item.test_id)))}</Tag>
                    <Tag color="purple">{getScenarioName(Number(safeRender(item.scenario_id)))}</Tag>
                    <Tag color="orange">{getDifficultyLevelName(Number(safeRender(item.difficulty_level_id)))}</Tag>
                  </Space>
                }
              >
                <div style={{ marginBottom: 16 }}>
                  <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                    {safeRender(item.question_text)}
                  </Title>
                </div>

                <div style={{ marginLeft: 16 }}>
                  <div style={{ marginBottom: 4 }}>
                    <Text strong>A: </Text>
                    <Text>{safeRender(item.option_a)}</Text>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <Text strong>B: </Text>
                    <Text>{safeRender(item.option_b)}</Text>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <Text strong>C: </Text>
                    <Text>{safeRender(item.option_c)}</Text>
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Text strong>Correct Answer:</Text>
                      {renderCorrectAnswerTag(safeRender(item.correct_answer))}
                    </Space>
                  </Col>
                  <Col>
                    <Text type="secondary">
                      {safeRender(item.created_at) ? dayjs(safeRender(item.created_at)).format('YYYY-MM-DD') : ''}
                    </Text>
                  </Col>
                </Row>
              </Card>
            </List.Item>
          )}
        />

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
              fetchPart2Questions({
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
            <QuestionCircleOutlined />
            {editingPart2Question ? 'Edit TOEIC Part 2 Question' : 'Add New TOEIC Part 2 Question'}
          </Space>
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
        confirmLoading={loading}
      >
        <Spin spinning={optionsLoading}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="test_id"
                  label="Test ID"
                  rules={[{ required: true, message: 'Please enter test ID' }]}
                >
                  <Input placeholder="Enter test ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="question_number"
                  label="Question Number"
                  rules={[{ required: true, message: 'Please enter question number' }]}
                >
                  <Input placeholder="Enter question number" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="question_text"
              label="Question Text"
              rules={[{ required: true, message: 'Please enter the question text' }]}
            >
              <TextArea
                rows={3}
                placeholder="Enter the TOEIC Part 2 question text..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Divider orientation="left">Answer Options</Divider>

            <Form.Item
              name="option_a"
              label="Option A"
              rules={[{ required: true, message: 'Please enter option A' }]}
            >
              <Input placeholder="Enter option A text" />
            </Form.Item>

            <Form.Item
              name="option_b"
              label="Option B"
              rules={[{ required: true, message: 'Please enter option B' }]}
            >
              <Input placeholder="Enter option B text" />
            </Form.Item>

            <Form.Item
              name="option_c"
              label="Option C"
              rules={[{ required: true, message: 'Please enter option C' }]}
            >
              <Input placeholder="Enter option C text" />
            </Form.Item>

            <Form.Item
              name="correct_answer"
              label="Correct Answer"
              rules={[{ required: true, message: 'Please select the correct answer' }]}
            >
              <Radio.Group>
                <Radio value="A">A</Radio>
                <Radio value="B">B</Radio>
                <Radio value="C">C</Radio>
              </Radio.Group>
            </Form.Item>

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
                    loading={optionsLoading}
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
                    loading={optionsLoading}
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
          // Clear selection after modal closes if it was for selected questions
          if (selectedQuestions.length > 0) {
            setSelectedQuestions([]);
            setSelectAll(false);
          }
        }}
        onSuccess={() => {
          message.success('Practice set created successfully!');
          // Clear selection after successful creation
          setSelectedQuestions([]);
          setSelectAll(false);
        }}
        toeicPart="part2"
        title={selectedQuestions.length > 0 ?
          `Add ${selectedQuestions.length} Selected Questions to Practice Set` :
          "Auto-Generate Part 2 Practice Set"}
        selectedQuestions={selectedQuestions}
        mode={selectedQuestions.length > 0 ? 'selected-questions' : 'auto-generate'}
      />
    </PageContainer>
  );
};

export default Part2QuestionManagement;
