import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Popconfirm,
  Row,
  Space,
  Table
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';
import {
  createPart2Question,
  deletePart2Question,
  getPart2QuestionList,
  updatePart2Question,
} from '@/services/part2question/api';

type Part2Question = Part2QuestionAPI.Part2Question;

const Part2QuestionManagement: React.FC = () => {
  const intl = useIntl();
  const [part2Questions, setPart2Questions] = useState<Part2Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPart2Question, setEditingPart2Question] = useState<Part2Question | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

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
  });

  const [sorter, setSorter] = useState({
    field: 'created_at',
    order: 'descend' as 'ascend' | 'descend',
  });

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

  const columns: ColumnsType<Part2Question> = [
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.id' }),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.test_id' }),
      dataIndex: 'test_id',
      key: 'test_id',
      width: 100,
      align: 'right',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.question_number' }),
      dataIndex: 'question_number',
      key: 'question_number',
      width: 100,
      align: 'right',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.question_text' }),
      dataIndex: 'question_text',
      key: 'question_text',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (question_text: any) => {
        const value = safeRender(question_text);
        return <span title={value}>{value}</span>;
      },
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.option_a' }),
      dataIndex: 'option_a',
      key: 'option_a',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (option_a: any) => {
        const value = safeRender(option_a);
        return <span title={value}>{value}</span>;
      },
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.option_b' }),
      dataIndex: 'option_b',
      key: 'option_b',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (option_b: any) => {
        const value = safeRender(option_b);
        return <span title={value}>{value}</span>;
      },
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.option_c' }),
      dataIndex: 'option_c',
      key: 'option_c',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (option_c: any) => {
        const value = safeRender(option_c);
        return <span title={value}>{value}</span>;
      },
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.correct_answer' }),
      dataIndex: 'correct_answer',
      key: 'correct_answer',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (correct_answer: any) => {
        const value = safeRender(correct_answer);
        return <span title={value}>{value}</span>;
      },
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.scenario_id' }),
      dataIndex: 'scenario_id',
      key: 'scenario_id',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (scenario_id: any) => {
        const value = safeRender(scenario_id);
        return <span title={value}>{value}</span>;
      },
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.difficulty_level_id' }),
      dataIndex: 'difficulty_level_id',
      key: 'difficulty_level_id',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (difficulty_level_id: any) => {
        const value = safeRender(difficulty_level_id);
        return <span title={value}>{value}</span>;
      },
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.part2Question.table.created_at' }),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: intl.formatMessage({ id: 'pages.common.actions' }),
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {intl.formatMessage({ id: 'pages.common.edit' })}
          </Button>
          <Popconfirm
            title={intl.formatMessage({
              id: 'pages.part2Question.delete.confirm.title',
            })}
            onConfirm={() => handleDelete(record)}
            okText={intl.formatMessage({ id: 'pages.common.confirm' })}
            cancelText={intl.formatMessage({ id: 'pages.common.cancel' })}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {intl.formatMessage({ id: 'pages.common.delete' })}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchPart2Questions = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
    sort?: string;
    order?: string;
  }) => {
    setLoading(true);
    try {
      const queryParams: any = {
        page: params?.page || pagination.current,
        page_size: params?.pageSize || pagination.pageSize,
        search: params?.search || searchParams.search,
        sort: params?.sort || sorter.field,
        order: params?.order || (sorter.order === 'descend' ? 'desc' : 'asc'),
      };

      // 添加可选的过滤参数
      if (params?.start_date) queryParams.start_date = params.start_date;
      if (params?.end_date) queryParams.end_date = params.end_date;

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
    };
    setSearchParams(resetParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    searchForm.resetFields();
    fetchPart2Questions({
      page: 1,
      ...resetParams,
    });
  };

  // 表格变化处理（分页、排序）
  const handleTableChange = (
    paginationConfig: any,
    _filters: any,
    sorterConfig: any,
  ) => {
    const newSorter = {
      field: sorterConfig.field || 'created_at',
      order: sorterConfig.order || 'descend',
    };
    setSorter(newSorter);

    fetchPart2Questions({
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      sort: newSorter.field,
      order: newSorter.order === 'descend' ? 'desc' : 'asc',
    });
  };

  useEffect(() => {
    fetchPart2Questions();
  }, []);

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
            <Col span={8}>
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
            <Col span={8}>
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
            <Col span={8}>
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
        </Form>

        <div style={buttonStyle}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {intl.formatMessage({ id: 'pages.part2Question.button.add' })}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={ part2Questions}
          rowKey="id"
          loading={loading}
          scroll={ { x: 800 } }
          pagination={ {
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) =>
              intl.formatMessage(
                { id: 'pages.common.total.records' },
                { total },
              ),
            pageSizeOptions: ['10', '20', '50', '100'],
          } }
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingPart2Question ? '编辑Part2Question' : '新增Part2Question'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="test_id"
            label="TestId"
          >
            <InputNumber style={ { width: '100%' } } />
          </Form.Item>
          <Form.Item
            name="question_number"
            label="QuestionNumber"
          >
            <InputNumber style={ { width: '100%' } } />
          </Form.Item>
          <Form.Item
            name="question_text"
            label="QuestionText"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="option_a"
            label="OptionA"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="option_b"
            label="OptionB"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="option_c"
            label="OptionC"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="correct_answer"
            label="CorrectAnswer"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="scenario_id"
            label="ScenarioId"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="difficulty_level_id"
            label="DifficultyLevelId"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Part2QuestionManagement;
