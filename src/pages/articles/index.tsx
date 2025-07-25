import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import DictTag from '@/components/DictTag';
import type { Article } from '@/services/article/api';
import {
  createArticle,
  deleteArticle,
  getUserArticleList,
  updateArticle,
} from '@/services/article/api';
import { DICT_CATEGORIES } from '@/services/dict/api';

const ArticleList: React.FC = () => {
  const intl = useIntl();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
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
    status: '',
    category_id: '',
    start_date: '',
    end_date: '',
  });
  const [sorter, setSorter] = useState({
    field: 'created_at',
    order: 'descend' as 'ascend' | 'descend',
  });

  // 分类数据
  const [categories] = useState([
    { id: 1, name: '技术' },
    { id: 2, name: '前端' },
    { id: 3, name: '后端' },
    { id: 4, name: '数据库' },
  ]);

  const columns: ColumnsType<Article> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      fixed: 'left',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.articles.table.title' }),
      dataIndex: 'title',
      key: 'title',
      width: 200,
      sorter: true,
      ellipsis: {
        showTitle: false,
      },
      render: (title: string) => <span title={title}>{title}</span>,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.author' }),
      dataIndex: 'author',
      key: 'author',
      width: 100,
      render: (author: Article['author']) =>
        author?.username || intl.formatMessage({ id: 'pages.common.unknown' }),
    },
    {
      title: intl.formatMessage({ id: 'pages.common.category' }),
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: Article['category']) => (
        <Tag color="blue">
          {category?.name ||
            intl.formatMessage({ id: 'pages.common.uncategorized' })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.articles.table.status' }),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <DictTag
          categoryCode={DICT_CATEGORIES.ARTICLE_STATUS}
          itemKey={status}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.common.views' }),
      dataIndex: 'view_count',
      key: 'view_count',
      width: 80,
      align: 'right',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.articles.table.createdAt' }),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: intl.formatMessage({ id: 'pages.articles.table.actions' }),
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            {intl.formatMessage({ id: 'pages.common.view' })}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {intl.formatMessage({ id: 'pages.common.edit' })}
          </Button>
          <Popconfirm
            title={intl.formatMessage({
              id: 'pages.articles.delete.confirm.title',
            })}
            description={intl.formatMessage(
              { id: 'pages.articles.delete.confirm.description' },
              { title: record.title },
            )}
            onConfirm={() => handleDelete(record)}
            okText={intl.formatMessage({ id: 'pages.common.confirm' })}
            cancelText={intl.formatMessage({ id: 'pages.common.cancel' })}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              {intl.formatMessage({ id: 'pages.common.delete' })}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchArticles = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    category_id?: string;
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
      if (params?.status) queryParams.status = params.status;
      if (params?.category_id) queryParams.category_id = params.category_id;
      if (params?.start_date) queryParams.start_date = params.start_date;
      if (params?.end_date) queryParams.end_date = params.end_date;

      // 使用用户专用的API，后端会自动过滤当前用户的文章
      const response = await getUserArticleList(queryParams);
      setArticles(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        current: response.page,
        pageSize: response.size,
      }));
    } catch (error) {
      console.error('获取文章列表失败:', error);
      message.error(intl.formatMessage({ id: 'pages.articles.error.fetch' }));
    } finally {
      setLoading(false);
    }
  };

  const handleView = (article: Article) => {
    setViewingArticle(article);
    setViewModalVisible(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    form.setFieldsValue({
      title: article.title,
      content: article.content,
      summary: article.summary,
      status: article.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (article: Article) => {
    try {
      await deleteArticle(article.id);
      message.success(
        intl.formatMessage(
          { id: 'pages.articles.success.delete' },
          { title: article.title },
        ),
      );
      // 重新获取文章列表
      fetchArticles();
    } catch (error) {
      console.error('删除文章失败:', error);
      message.error(intl.formatMessage({ id: 'pages.articles.error.delete' }));
    }
  };

  const handleAdd = () => {
    setEditingArticle(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingArticle) {
        // 编辑文章
        await updateArticle(editingArticle.id, values);
        message.success(
          intl.formatMessage({ id: 'pages.articles.success.update' }),
        );
      } else {
        // 添加新文章
        await createArticle(values);
        message.success(
          intl.formatMessage({ id: 'pages.articles.success.create' }),
        );
      }

      setModalVisible(false);
      form.resetFields();
      setEditingArticle(null);
      // 重新获取文章列表
      fetchArticles();
    } catch (error) {
      console.error('操作失败:', error);
      message.error(
        editingArticle
          ? intl.formatMessage({ id: 'pages.articles.error.update' })
          : intl.formatMessage({ id: 'pages.articles.error.create' }),
      );
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingArticle(null);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // 搜索处理
  const handleSearch = (values: any) => {
    const newSearchParams = {
      search: values.search || '',
      status: values.status || '',
      category_id: values.category_id || '',
      start_date: values.date_range?.[0]?.format('YYYY-MM-DD') || '',
      end_date: values.date_range?.[1]?.format('YYYY-MM-DD') || '',
    };
    setSearchParams(newSearchParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchArticles({
      page: 1,
      ...newSearchParams,
    });
  };

  // 重置搜索
  const handleReset = () => {
    const resetParams = {
      search: '',
      status: '',
      category_id: '',
      start_date: '',
      end_date: '',
    };
    setSearchParams(resetParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    searchForm.resetFields();
    fetchArticles({
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

    fetchArticles({
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      sort: newSorter.field,
      order: newSorter.order === 'descend' ? 'desc' : 'asc',
    });
  };

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'pages.articles.title' })}
      content={intl.formatMessage({ id: 'pages.articles.description' })}
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
            <Col span={8}>
              <Form.Item
                name="search"
                label={intl.formatMessage({ id: 'pages.articles.form.title' })}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'pages.articles.search.title.placeholder',
                  })}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="status"
                label={intl.formatMessage({ id: 'pages.articles.form.status' })}
              >
                <Select
                  placeholder={intl.formatMessage({
                    id: 'pages.articles.search.status.placeholder',
                  })}
                  allowClear
                >
                  <Select.Option value="published">
                    {intl.formatMessage({
                      id: 'pages.articles.status.published',
                    })}
                  </Select.Option>
                  <Select.Option value="draft">
                    {intl.formatMessage({ id: 'pages.articles.status.draft' })}
                  </Select.Option>
                  <Select.Option value="archived">
                    {intl.formatMessage({
                      id: 'pages.articles.status.archived',
                    })}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="category_id"
                label={intl.formatMessage({ id: 'pages.common.category' })}
              >
                <Select
                  placeholder={intl.formatMessage({
                    id: 'pages.articles.search.category.placeholder',
                  })}
                  allowClear
                >
                  {categories.map((category) => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="date_range"
                label={intl.formatMessage({ id: 'pages.common.createdTime' })}
              >
                <DatePicker.RangePicker
                  placeholder={[
                    intl.formatMessage({ id: 'pages.common.startDate' }),
                    intl.formatMessage({ id: 'pages.common.endDate' }),
                  ]}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Col>
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

        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {intl.formatMessage({ id: 'pages.articles.create' })}
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) =>
              intl.formatMessage(
                { id: 'pages.common.total.records' },
                { total },
              ),
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 编辑/添加文章模态框 */}
      <Modal
        title={
          editingArticle
            ? intl.formatMessage({ id: 'pages.articles.modal.edit.title' })
            : intl.formatMessage({ id: 'pages.articles.modal.add.title' })
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft',
            category: '编程教程',
          }}
        >
          <Form.Item
            name="title"
            label={intl.formatMessage({ id: 'pages.articles.form.title' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.articles.form.title.required',
                }),
              },
              {
                max: 100,
                message: intl.formatMessage({
                  id: 'pages.articles.form.title.max',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.articles.form.title.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label={intl.formatMessage({ id: 'pages.articles.form.content' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.articles.form.content.required',
                }),
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder={intl.formatMessage({
                id: 'pages.articles.form.content.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="summary"
            label={intl.formatMessage({ id: 'pages.articles.form.summary' })}
            rules={[
              {
                max: 500,
                message: intl.formatMessage({
                  id: 'pages.articles.form.summary.max',
                }),
              },
            ]}
          >
            <Input.TextArea
              rows={2}
              placeholder={intl.formatMessage({
                id: 'pages.articles.form.summary.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={intl.formatMessage({ id: 'pages.articles.form.status' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.articles.form.status.required',
                }),
              },
            ]}
          >
            <Select
              placeholder={intl.formatMessage({
                id: 'pages.articles.form.status.placeholder',
              })}
            >
              <Select.Option value="draft">
                {intl.formatMessage({ id: 'pages.articles.status.draft' })}
              </Select.Option>
              <Select.Option value="published">
                {intl.formatMessage({ id: 'pages.articles.status.published' })}
              </Select.Option>
              <Select.Option value="archived">
                {intl.formatMessage({ id: 'pages.articles.status.archived' })}
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看文章模态框 */}
      <Modal
        title={intl.formatMessage({ id: 'pages.articles.modal.view.title' })}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            {intl.formatMessage({ id: 'pages.articles.modal.close' })}
          </Button>,
        ]}
        width={800}
      >
        {viewingArticle && (
          <div>
            <h3>{viewingArticle.title}</h3>
            <p>
              <strong>
                {intl.formatMessage({ id: 'pages.articles.view.author' })}
              </strong>
              {viewingArticle.author?.username ||
                intl.formatMessage({ id: 'pages.common.unknown' })}
            </p>
            <p>
              <strong>
                {intl.formatMessage({ id: 'pages.articles.view.category' })}
              </strong>
              {viewingArticle.category?.name ||
                intl.formatMessage({ id: 'pages.common.uncategorized' })}
            </p>
            <p>
              <strong>
                {intl.formatMessage({ id: 'pages.articles.view.status' })}
              </strong>
              <Tag
                color={
                  viewingArticle.status === 'published'
                    ? 'green'
                    : viewingArticle.status === 'draft'
                      ? 'orange'
                      : 'gray'
                }
              >
                {viewingArticle.status === 'published'
                  ? intl.formatMessage({
                      id: 'pages.articles.status.published',
                    })
                  : viewingArticle.status === 'draft'
                    ? intl.formatMessage({ id: 'pages.articles.status.draft' })
                    : intl.formatMessage({
                        id: 'pages.articles.status.archived',
                      })}
              </Tag>
            </p>
            <p>
              <strong>
                {intl.formatMessage({ id: 'pages.articles.view.views' })}
              </strong>
              {viewingArticle.view_count}
            </p>
            <p>
              <strong>
                {intl.formatMessage({ id: 'pages.articles.view.createdAt' })}
              </strong>
              {new Date(viewingArticle.created_at).toLocaleString()}
            </p>
            <p>
              <strong>
                {intl.formatMessage({ id: 'pages.articles.view.updatedAt' })}
              </strong>
              {new Date(viewingArticle.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ArticleList;
