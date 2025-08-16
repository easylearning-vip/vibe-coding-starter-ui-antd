import {
  DeleteOutlined,
  EditOutlined,
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
  InputNumber,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  TreeSelect,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategoryList,
  updateProductCategory,
} from '@/services/productcategory/api';

type ProductCategory = ProductCategoryAPI.ProductCategory;

const ProductCategoryManagement: React.FC = () => {
  const intl = useIntl();
  const [productCategorys, setProductCategorys] = useState<ProductCategory[]>(
    [],
  );
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProductCategory, setEditingProductCategory] =
    useState<ProductCategory | null>(null);
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

  const columns: ColumnsType<ProductCategory> = [
    {
      title: intl.formatMessage({ id: 'pages.productCategory.table.id' }),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.productCategory.table.name' }),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string) => <span title={name}>{name}</span>,
      sorter: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.productCategory.table.parent_id',
      }),
      dataIndex: 'parent_id',
      key: 'parent_id',
      width: 100,
      align: 'right',
      sorter: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.productCategory.table.sort_order',
      }),
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
      align: 'right',
      sorter: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.productCategory.table.is_active',
      }),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (is_active: boolean) => <Switch checked={is_active} disabled />,
    },
    {
      title: intl.formatMessage({
        id: 'pages.productCategory.table.created_at',
      }),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
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
              id: 'pages.productCategory.delete.confirm.title',
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

  // 构建树形结构数据
  const buildTreeData = (categories: ProductCategory[]): any[] => {
    const map = new Map<number, any>();
    const roots: any[] = [];

    // 首先创建所有节点的映射
    categories.forEach((category) => {
      map.set(category.id, {
        ...category,
        title: category.name,
        key: category.id,
        value: category.id,
        children: [],
      });
    });

    // 然后构建树形结构
    categories.forEach((category) => {
      const node = map.get(category.id);
      if (category.parent_id && map.has(category.parent_id)) {
        map.get(category.parent_id)?.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // 将扁平数据转换为层级数据
  const buildHierarchyData = (
    categories: ProductCategory[],
  ): ProductCategory[] => {
    const map = new Map<number, ProductCategory>();
    const result: ProductCategory[] = [];

    categories.forEach((category) => {
      map.set(category.id, { ...category, children: [] } as any);
    });

    categories.forEach((category) => {
      const node = map.get(category.id);
      if (category.parent_id && map.has(category.parent_id)) {
        (map.get(category.parent_id) as any)?.children.push(node);
      } else {
        result.push(node!);
      }
    });

    return result;
  };

  const fetchProductCategorys = async (params?: {
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

      const response = await getProductCategoryList(queryParams);
      setProductCategorys(response.data);
      setTreeData(buildTreeData(response.data));
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        current: response.page,
        pageSize: response.size,
      }));
    } catch (error) {
      console.error('获取ProductCategory列表失败:', error);
      message.error('获取ProductCategory列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (productCategory: ProductCategory) => {
    setEditingProductCategory(productCategory);
    form.setFieldsValue(productCategory);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingProductCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (productCategory: ProductCategory) => {
    try {
      await deleteProductCategory(productCategory.id);
      message.success('删除成功');
      fetchProductCategorys();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingProductCategory) {
        await updateProductCategory(editingProductCategory.id, values);
        message.success('更新成功');
      } else {
        await createProductCategory(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchProductCategorys();
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
    fetchProductCategorys({
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
    fetchProductCategorys({
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

    fetchProductCategorys({
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      sort: newSorter.field,
      order: newSorter.order === 'descend' ? 'desc' : 'asc',
    });
  };

  useEffect(() => {
    fetchProductCategorys();
  }, []);

  const buttonStyle = { marginBottom: 16 };

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'pages.productCategory.title' })}
      content={intl.formatMessage({ id: 'pages.productCategory.subTitle' })}
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
                label={intl.formatMessage({
                  id: 'pages.productCategory.form.name',
                })}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'pages.productCategory.form.name.placeholder',
                  })}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="date_range"
                label={intl.formatMessage({
                  id: 'pages.productCategory.table.createdAt',
                })}
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
            {intl.formatMessage({ id: 'pages.productCategory.button.add' })}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={productCategorys}
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

      <Modal
        title={
          editingProductCategory ? '编辑ProductCategory' : '新增ProductCategory'
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: '请输入Name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="parent_id"
            label={intl.formatMessage({
              id: 'pages.productCategory.form.parent_id',
            })}
          >
            <TreeSelect
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.productCategory.form.parent_id.placeholder',
              })}
              treeData={treeData}
              treeDefaultExpandAll
              allowClear
            />
          </Form.Item>
          <Form.Item name="sort_order" label="SortOrder">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="IsActive">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProductCategoryManagement;
