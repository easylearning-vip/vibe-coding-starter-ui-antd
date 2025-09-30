import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Modal,
  message,
  Popconfirm,
  Row,
  Space,
  Select,
  Tag,
  Typography,
  Divider,
  Spin,
  Pagination,
  Progress,
} from 'antd';
import { DeleteOutlined, EyeOutlined, PlayCircleOutlined, ReloadOutlined, SearchOutlined, BookOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import {
  getPracticeSetList,
  deletePracticeSet,
  getPracticeSetQuestions,
} from '@/services/part4-practice-set/api';
import { getScenarioOptions } from '@/services/scenario/api';
import { getDifficultyLevelOptions } from '@/services/difficulty-level/api';
import AddToPracticeSetModal from '@/components/AddToPracticeSetModal';
import PracticeMode from '@/components/PracticeMode';

const { Text, Title } = Typography;

type Part4PracticeSet = Part4PracticeSetAPI.Part4PracticeSet;

const Part4PracticeSetManagement: React.FC = () => {
  const [practiceSets, setPracticeSets] = useState<Part4PracticeSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();

  // 下拉框选项数据
  const [scenarios, setScenarios] = useState<ScenarioAPI.Scenario[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevelAPI.DifficultyLevel[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Practice set modal state
  const [practiceSetModalVisible, setPracticeSetModalVisible] = useState(false);

  // Practice mode state
  const [practiceModeVisible, setPracticeModeVisible] = useState(false);
  const [selectedPracticeSetId, setSelectedPracticeSetId] = useState<number>(0);

  // 分页和查询状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchParams, setSearchParams] = useState({
    scenario_id: '',
    difficulty_level_id: '',
  });

  // 加载下拉框选项数据
  const loadOptions = async () => {
    setOptionsLoading(true);
    try {
      const [scenarioData, difficultyData] = await Promise.all([
        getScenarioOptions(),
        getDifficultyLevelOptions(),
      ]);
      setScenarios(scenarioData);
      setDifficultyLevels(difficultyData);
    } catch (error) {
      console.error('Failed to load options:', error);
      message.error('Failed to load dropdown options');
    } finally {
      setOptionsLoading(false);
    }
  };

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

  // 获取场景名称
  const getScenarioName = (scenarioId: any): string => {
    // Handle different data formats
    let id = scenarioId;
    if (typeof scenarioId === 'object' && scenarioId !== null) {
      id = scenarioId.Int32 !== undefined ? scenarioId.Int32 : scenarioId.id;
    }
    id = Number(id);

    const scenario = scenarios.find(s => s.id === id);
    return scenario ? scenario.name || '' : `Scenario ${id}`;
  };

  // 获取难度级别名称
  const getDifficultyLevelName = (difficultyLevelId: any): string => {
    // Handle different data formats
    let id = difficultyLevelId;
    if (typeof difficultyLevelId === 'object' && difficultyLevelId !== null) {
      id = difficultyLevelId.Int32 !== undefined ? difficultyLevelId.Int32 : difficultyLevelId.id;
    }
    id = Number(id);

    const level = difficultyLevels.find(l => l.id === id);
    return level ? level.name || '' : `Level ${id}`;
  };

  const fetchPracticeSets = async (params?: {
    page?: number;
    pageSize?: number;
    scenario_id?: string;
    difficulty_level_id?: string;
    sort?: string;
    order?: string;
  }) => {
    setLoading(true);
    try {
      const queryParams: any = {
        page: params?.page || pagination.current,
        page_size: params?.pageSize || pagination.pageSize,
        sort: params?.sort || 'created_at',
        order: params?.order || 'desc',
      };

      // 添加可选的过滤参数
      if (params?.scenario_id) queryParams.scenario_id = Number(params.scenario_id);
      if (params?.difficulty_level_id) queryParams.difficulty_level_id = Number(params.difficulty_level_id);

      const response = await getPracticeSetList(queryParams);

      setPracticeSets(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        current: response.page,
        pageSize: response.size,
      }));
    } catch (error) {
      console.error('获取练习集列表失败:', error);
      message.error('获取练习集列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (practiceSet: Part4PracticeSet) => {
    if (!practiceSet.id) {
      message.error('无效的记录ID');
      return;
    }
    try {
      await deletePracticeSet(practiceSet.id);
      message.success('删除成功');
      fetchPracticeSets();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 搜索处理
  const handleSearch = (values: any) => {
    const newSearchParams = {
      scenario_id: values.scenario_id || '',
      difficulty_level_id: values.difficulty_level_id || '',
    };
    setSearchParams(newSearchParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchPracticeSets({
      page: 1,
      ...newSearchParams,
    });
  };

  // 重置搜索
  const handleReset = () => {
    const resetParams = {
      scenario_id: '',
      difficulty_level_id: '',
    };
    setSearchParams(resetParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    searchForm.resetFields();
    fetchPracticeSets({
      page: 1,
      ...resetParams,
    });
  };

  // 查看练习集详情
  const handleViewDetails = async (practiceSet: Part4PracticeSet) => {
    if (!practiceSet.id) return;
    
    try {
      const questions = await getPracticeSetQuestions(practiceSet.id);
      Modal.info({
        title: `Practice Set Details`,
        width: 800,
        content: (
          <div>
            <p><strong>Total Questions:</strong> {safeRender(practiceSet.total_questions)}</p>
            <p><strong>Completed:</strong> {safeRender(practiceSet.completed_count) || '0'}</p>
            <p><strong>Correct:</strong> {safeRender(practiceSet.correct_count) || '0'}</p>
            <p><strong>Accuracy:</strong> {practiceSet.completed_count ? 
              Math.round(((practiceSet.correct_count || 0) / practiceSet.completed_count) * 100) : 0}%</p>
            <Divider />
            <p><strong>Questions ({questions.length}):</strong></p>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {questions.map((q, index) => {
                // Get question text based on question index
                let questionText = '';
                switch (q.question_index) {
                  case 1:
                    questionText = safeRender(q.talk?.question1) || '';
                    break;
                  case 2:
                    questionText = safeRender(q.talk?.question2) || '';
                    break;
                  case 3:
                    questionText = safeRender(q.talk?.question3) || '';
                    break;
                  default:
                    questionText = '';
                }

                // Find answer options for this question
                const answerOption = q.talk?.answer_options?.find(
                  ao => ao.question_number === q.question_index
                );

                return (
                  <div key={q.item_id} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                    <p><strong>Q{index + 1} (Question {q.question_index}):</strong> {questionText}</p>
                    {answerOption && (
                      <>
                        <p>A: {safeRender(answerOption.option_a)}</p>
                        <p>B: {safeRender(answerOption.option_b)}</p>
                        <p>C: {safeRender(answerOption.option_c)}</p>
                        <p>D: {safeRender(answerOption.option_d)}</p>
                        <p><strong>Answer:</strong> {safeRender(answerOption.correct_answer)}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ),
      });
    } catch (error) {
      console.error('Failed to load practice set details:', error);
      message.error('Failed to load practice set details');
    }
  };

  // 开始练习
  const handleStartPractice = (practiceSet: Part4PracticeSet) => {
    if (!practiceSet.id) {
      message.error('Invalid practice set ID');
      return;
    }
    setSelectedPracticeSetId(practiceSet.id);
    setPracticeModeVisible(true);
  };

  useEffect(() => {
    loadOptions();
    fetchPracticeSets();
  }, []);

  const buttonStyle = { marginBottom: 16 };

  return (
    <PageContainer
      title="Part 4 Practice Sets"
      content="Manage your personal TOEIC Part 4 practice sets"
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
            <Col span={12}>
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
                <Button
                  icon={<BookOutlined />}
                  onClick={() => setPracticeSetModalVisible(true)}
                >
                  Create New Practice Set
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        <div style={{ overflowX: 'auto', minWidth: '800px' }}>
          <List
          loading={loading}
          dataSource={practiceSets}
          renderItem={(item: Part4PracticeSet) => {
            const completionRate = item.total_questions ? 
              Math.round(((item.completed_count || 0) / item.total_questions) * 100) : 0;
            const accuracyRate = item.completed_count ? 
              Math.round(((item.correct_count || 0) / item.completed_count) * 100) : 0;

            return (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(item)}
                  >
                    View Details
                  </Button>,
                  <Button
                    key="practice"
                    type="link"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleStartPractice(item)}
                  >
                    Practice
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Are you sure you want to delete this practice set?"
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
                      <BookOutlined />
                      <Text strong>Practice Set #{safeRender(item.id)}</Text>
                      <Tag color="purple">{getScenarioName(item.scenario_id)}</Tag>
                      <Tag color="orange">{getDifficultyLevelName(item.difficulty_level_id)}</Tag>
                    </Space>
                  }
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Progress: </Text>
                        <Text>{safeRender(item.completed_count) || '0'} / {safeRender(item.total_questions)}</Text>
                      </div>
                      <Progress 
                        percent={completionRate} 
                        size="small" 
                        status={completionRate === 100 ? 'success' : 'active'}
                      />
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Accuracy: </Text>
                        <Text>{accuracyRate}%</Text>
                      </div>
                      <Progress 
                        percent={accuracyRate} 
                        size="small" 
                        strokeColor={accuracyRate >= 80 ? '#52c41a' : accuracyRate >= 60 ? '#faad14' : '#ff4d4f'}
                      />
                    </Col>
                  </Row>

                  <Divider style={{ margin: '12px 0' }} />

                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <Text strong>Questions:</Text>
                        <Text>{safeRender(item.total_questions)}</Text>
                        <Text strong>Correct:</Text>
                        <Text>{safeRender(item.correct_count) || '0'}</Text>
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
            showTotal={(total) => `Total ${total} practice sets`}
            pageSizeOptions={['10', '20', '50']}
            onChange={(page, pageSize) => {
              fetchPracticeSets({
                page,
                pageSize,
                ...searchParams,
              });
            }}
          />
        </div>
      </Card>

      <AddToPracticeSetModal
        visible={practiceSetModalVisible}
        onCancel={() => setPracticeSetModalVisible(false)}
        onSuccess={() => {
          message.success('Practice set created successfully!');
          fetchPracticeSets();
        }}
        toeicPart="part4"
        title="Create Part 4 Practice Set"
      />

      <PracticeMode
        visible={practiceModeVisible}
        onClose={() => setPracticeModeVisible(false)}
        practiceSetId={selectedPracticeSetId}
        toeicPart="part4"
        onComplete={() => {
          fetchPracticeSets(); // Refresh the list to show updated progress
        }}
      />
    </PageContainer>
  );
};

export default Part4PracticeSetManagement;
