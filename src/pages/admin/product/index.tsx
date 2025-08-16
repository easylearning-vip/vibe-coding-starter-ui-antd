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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import {
  createProduct,
  deleteProduct,
  getProductList,
  updateProduct,
} from '@/services/product/api';
import { getProductCategoryList } from '@/services/productcategory/api';

type Product = ProductAPI.Product;

const ProductManagement: React.FC = () => {
  const intl = useIntl();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [categories, setCategories] = useState<
    ProductCategoryAPI.ProductCategory[]
  >([]);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);

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

  const columns: ColumnsType<Product> = [
    {
      title: intl.formatMessage({ id: 'pages.product.table.id' }),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.product.table.name' }),
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
      title: intl.formatMessage({ id: 'pages.product.table.category_id' }),
      dataIndex: 'category_id',
      key: 'category_id',
      width: 120,
      render: (categoryId: number) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : categoryId;
      },
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.product.table.sku' }),
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (sku: string) => <span title={sku}>{sku}</span>,
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.product.table.price' }),
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.product.table.cost_price' }),
      dataIndex: 'cost_price',
      key: 'cost_price',
      width: 100,
      align: 'right',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.product.table.stock_quantity' }),
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 100,
      align: 'right',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.product.table.min_stock' }),
      dataIndex: 'min_stock',
      key: 'min_stock',
      width: 100,
      align: 'right',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.product.table.is_active' }),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (is_active: boolean) => <Switch checked={is_active} disabled />,
    },
    {
      title: intl.formatMessage({ id: 'pages.product.table.created_at' }),
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
              id: 'pages.product.delete.confirm.title',
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

  const fetchProducts = async (params?: {
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

      const response = await getProductList(queryParams);
      setProducts(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        current: response.page,
        pageSize: response.size,
      }));
    } catch (error) {
      console.error('获取Product列表失败:', error);
      message.error('获取Product列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      message.success('删除成功');
      fetchProducts();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
        message.success('更新成功');
      } else {
        await createProduct(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchProducts();
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
    fetchProducts({
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
    fetchProducts({
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

    fetchProducts({
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      sort: newSorter.field,
      order: newSorter.order === 'descend' ? 'desc' : 'asc',
    });
  };

  // 构建分类选项
  const buildCategoryOptions = (
    categories: ProductCategoryAPI.ProductCategory[],
  ): any[] => {
    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  };

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await getProductCategoryList({
        page: 1,
        page_size: 100,
      });
      setCategories(response.data);
      setCategoryOptions(buildCategoryOptions(response.data));
    } catch (error) {
      console.error('获取分类列表失败:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const buttonStyle = { marginBottom: 16 };

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'pages.product.title' })}
      content={intl.formatMessage({ id: 'pages.product.subTitle' })}
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
                label={intl.formatMessage({ id: 'pages.product.form.name' })}
              >
                <Input
                  placeholder={intl.formatMessage({
                    id: 'pages.product.form.name.placeholder',
                  })}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="date_range"
                label={intl.formatMessage({
                  id: 'pages.product.table.createdAt',
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
            {intl.formatMessage({ id: 'pages.product.button.add' })}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
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
        title={editingProduct ? '编辑Product' : '新增Product'}
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
            name="category_id"
            label={intl.formatMessage({ id: 'pages.product.form.category_id' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.product.form.category_id.required',
                }),
              },
            ]}
          >
            <Select
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.product.form.category_id.placeholder',
              })}
              options={categoryOptions}
            />
          </Form.Item>
          <Form.Item
            name="sku"
            label="Sku"
            rules={[{ required: true, message: '请输入Sku' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: '请输入Price' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="cost_price"
            label="CostPrice"
            rules={[{ required: true, message: '请输入CostPrice' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock_quantity" label="StockQuantity">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="min_stock" label="MinStock">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="IsActive">
            <Switch />
          </Form.Item>
          <Form.Item name="weight" label="Weight">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dimensions" label="Dimensions">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProductManagement;
