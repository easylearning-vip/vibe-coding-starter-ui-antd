import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Popconfirm,
  Row,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { useDict } from '@/hooks/useDict';
import {
  type CreateItemRequest,
  createDictCategory,
  createDictItem,
  type DictCategory,
  type DictItem,
  deleteDictCategory,
  deleteDictItem,
  getDictItems,
  updateDictItem,
} from '@/services/dict/api';

const { TabPane } = Tabs;

const DictManagement: React.FC = () => {
  const intl = useIntl();
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
    clearCache,
  } = useDict();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [items, setItems] = useState<DictItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // 模态框状态
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DictItem | null>(null);

  // 表单实例
  const [categoryForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  // 分类表格列定义
  const categoryColumns: ColumnsType<DictCategory> = [
    {
      title: intl.formatMessage({ id: 'pages.dict.table.id' }),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: intl.formatMessage({ id: 'pages.dict.table.code' }),
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: intl.formatMessage({ id: 'pages.dict.table.name' }),
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: intl.formatMessage({ id: 'pages.dict.table.description' }),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.dict.table.sort' }),
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
      align: 'center',
    },
    {
      title: intl.formatMessage({ id: 'pages.dict.table.createdAt' }),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: intl.formatMessage({ id: 'pages.dict.table.actions' }),
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => setSelectedCategory(record.code)}
          >
            {intl.formatMessage({ id: 'pages.dict.category.view' })}
          </Button>
          <Popconfirm
            title={intl.formatMessage({
              id: 'pages.dict.category.delete.confirm.title',
            })}
            description={intl.formatMessage(
              { id: 'pages.dict.category.delete.confirm.description' },
              { name: record.name },
            )}
            onConfirm={() => handleDeleteCategory(record.id, record.name)}
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

  // 字典项表格列定义
  const itemColumns: ColumnsType<DictItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '项键值',
      dataIndex: 'item_key',
      key: 'item_key',
      width: 120,
    },
    {
      title: '项显示值',
      dataIndex: 'item_value',
      key: 'item_value',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
          >
            {intl.formatMessage({ id: 'pages.common.edit' })}
          </Button>
          <Popconfirm
            title={intl.formatMessage({
              id: 'pages.dict.item.delete.confirm.title',
            })}
            description={intl.formatMessage(
              { id: 'pages.dict.item.delete.confirm.description' },
              { value: record.item_value },
            )}
            onConfirm={() => handleDeleteItem(record)}
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

  // 获取字典项列表
  const fetchItems = async (categoryCode: string) => {
    if (!categoryCode) return;

    setItemsLoading(true);
    try {
      const response = await getDictItems(categoryCode);
      if (response.code === 200) {
        setItems(response.data);
      } else {
        message.error(
          response.message ||
            intl.formatMessage({ id: 'pages.dict.item.fetch.error' }),
        );
      }
    } catch (error) {
      console.error('获取字典项失败:', error);
      message.error(intl.formatMessage({ id: 'pages.dict.item.fetch.error' }));
    } finally {
      setItemsLoading(false);
    }
  };

  // 创建分类
  const handleCreateCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      const response = await createDictCategory(values);
      if (response.code === 200) {
        message.success(
          intl.formatMessage({ id: 'pages.dict.category.create.success' }),
        );
        setCategoryModalVisible(false);
        categoryForm.resetFields();
        fetchCategories();
        clearCache();
      } else {
        message.error(
          response.message ||
            intl.formatMessage({ id: 'pages.dict.category.create.error' }),
        );
      }
    } catch (error) {
      console.error('创建分类失败:', error);
      message.error(
        intl.formatMessage({ id: 'pages.dict.category.create.error' }),
      );
    }
  };

  // 删除分类
  const handleDeleteCategory = async (id: number, name: string) => {
    try {
      const response = await deleteDictCategory(id);
      if (response.code === 200) {
        message.success(
          intl.formatMessage(
            { id: 'pages.dict.category.delete.success' },
            { name },
          ),
        );
        fetchCategories();
        clearCache();
        // 如果删除的是当前选中的分类，清空选中状态
        const deletedCategory = categories.find((cat) => cat.id === id);
        if (deletedCategory && selectedCategory === deletedCategory.code) {
          setSelectedCategory('');
          setItems([]);
        }
      } else {
        message.error(
          response.message ||
            intl.formatMessage({ id: 'pages.dict.category.delete.error' }),
        );
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      message.error(
        intl.formatMessage({ id: 'pages.dict.category.delete.error' }),
      );
    }
  };

  // 编辑字典项
  const handleEditItem = (item: DictItem) => {
    setEditingItem(item);
    itemForm.setFieldsValue({
      item_value: item.item_value,
      description: item.description,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setItemModalVisible(true);
  };

  // 创建/更新字典项
  const handleSaveItem = async () => {
    try {
      const values = await itemForm.validateFields();

      if (editingItem) {
        // 更新字典项
        const response = await updateDictItem(editingItem.id, values);
        if (response.code === 200) {
          message.success(
            intl.formatMessage({ id: 'pages.dict.item.update.success' }),
          );
        } else {
          message.error(
            response.message ||
              intl.formatMessage({ id: 'pages.dict.item.update.error' }),
          );
        }
      } else {
        // 创建字典项
        const createData: CreateItemRequest = {
          category_code: selectedCategory,
          ...values,
        };
        const response = await createDictItem(createData);
        if (response.code === 200) {
          message.success(
            intl.formatMessage({ id: 'pages.dict.item.create.success' }),
          );
        } else {
          message.error(
            response.message ||
              intl.formatMessage({ id: 'pages.dict.item.create.error' }),
          );
        }
      }

      setItemModalVisible(false);
      itemForm.resetFields();
      setEditingItem(null);
      fetchItems(selectedCategory);
      clearCache(selectedCategory);
    } catch (error) {
      console.error('保存字典项失败:', error);
      message.error(intl.formatMessage({ id: 'pages.dict.item.save.error' }));
    }
  };

  // 删除字典项
  const handleDeleteItem = async (item: DictItem) => {
    try {
      const response = await deleteDictItem(item.id);
      if (response.code === 200) {
        message.success(
          intl.formatMessage({ id: 'pages.dict.item.delete.success' }),
        );
        fetchItems(selectedCategory);
        clearCache(selectedCategory);
      } else {
        message.error(
          response.message ||
            intl.formatMessage({ id: 'pages.dict.item.delete.error' }),
        );
      }
    } catch (error) {
      console.error('删除字典项失败:', error);
      message.error(intl.formatMessage({ id: 'pages.dict.item.delete.error' }));
    }
  };

  // 当选中分类改变时，获取对应的字典项
  useEffect(() => {
    if (selectedCategory) {
      fetchItems(selectedCategory);
    } else {
      setItems([]);
    }
  }, [selectedCategory]);

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'pages.dict.title' })}
      content={intl.formatMessage({ id: 'pages.dict.description' })}
    >
      <Card>
        <Tabs
          activeKey={selectedCategory || 'categories'}
          onChange={(key) => {
            if (key === 'categories') {
              setSelectedCategory('');
            } else {
              setSelectedCategory(key);
            }
          }}
          tabBarExtraContent={
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCategoryModalVisible(true)}
              >
                {intl.formatMessage({ id: 'pages.dict.category.create' })}
              </Button>
              {selectedCategory && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingItem(null);
                    itemForm.resetFields();
                    setItemModalVisible(true);
                  }}
                >
                  {intl.formatMessage({ id: 'pages.dict.item.create' })}
                </Button>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchCategories();
                  if (selectedCategory) {
                    fetchItems(selectedCategory);
                  }
                }}
              >
                {intl.formatMessage({ id: 'pages.common.refresh' })}
              </Button>
            </Space>
          }
        >
          <TabPane
            tab={intl.formatMessage({ id: 'pages.dict.category.management' })}
            key="categories"
          >
            <Table
              columns={categoryColumns}
              dataSource={categories}
              rowKey="id"
              loading={categoriesLoading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) =>
                  intl.formatMessage(
                    { id: 'pages.common.total.records' },
                    { total },
                  ),
              }}
            />
          </TabPane>

          {categories.map((category) => (
            <TabPane tab={category.name} key={category.code}>
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="id"
                loading={itemsLoading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </TabPane>
          ))}
        </Tabs>
      </Card>

      {/* 创建分类模态框 */}
      <Modal
        title={intl.formatMessage({ id: 'pages.dict.category.create.title' })}
        open={categoryModalVisible}
        onOk={handleCreateCategory}
        onCancel={() => {
          setCategoryModalVisible(false);
          categoryForm.resetFields();
        }}
        width={600}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          initialValues={{
            sort_order: 1,
          }}
        >
          <Form.Item
            name="code"
            label={intl.formatMessage({ id: 'pages.dict.category.form.code' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.dict.category.form.code.required',
                }),
              },
              {
                pattern: /^[a-z_]+$/,
                message: intl.formatMessage({
                  id: 'pages.dict.category.form.code.pattern',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.dict.category.form.code.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'pages.dict.category.form.name' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.dict.category.form.name.required',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.dict.category.form.name.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={intl.formatMessage({
              id: 'pages.dict.category.form.description',
            })}
          >
            <Input.TextArea
              placeholder={intl.formatMessage({
                id: 'pages.dict.category.form.description.placeholder',
              })}
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label={intl.formatMessage({ id: 'pages.dict.category.form.sort' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.dict.category.form.sort.required',
                }),
              },
            ]}
          >
            <InputNumber
              min={1}
              max={999}
              placeholder={intl.formatMessage({
                id: 'pages.dict.category.form.sort.placeholder',
              })}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建/编辑字典项模态框 */}
      <Modal
        title={
          editingItem
            ? intl.formatMessage({ id: 'pages.dict.item.edit.title' })
            : intl.formatMessage({ id: 'pages.dict.item.create.title' })
        }
        open={itemModalVisible}
        onOk={handleSaveItem}
        onCancel={() => {
          setItemModalVisible(false);
          itemForm.resetFields();
          setEditingItem(null);
        }}
        width={600}
      >
        <Form
          form={itemForm}
          layout="vertical"
          initialValues={{
            sort_order: 1,
            is_active: true,
          }}
        >
          {!editingItem && (
            <Form.Item
              name="item_key"
              label={intl.formatMessage({ id: 'pages.dict.item.form.key' })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'pages.dict.item.form.key.required',
                  }),
                },
                {
                  pattern: /^[a-z_]+$/,
                  message: intl.formatMessage({
                    id: 'pages.dict.item.form.key.pattern',
                  }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: 'pages.dict.item.form.key.placeholder',
                })}
              />
            </Form.Item>
          )}

          <Form.Item
            name="item_value"
            label={intl.formatMessage({ id: 'pages.dict.item.form.value' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.dict.item.form.value.required',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.dict.item.form.value.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={intl.formatMessage({
              id: 'pages.dict.item.form.description',
            })}
          >
            <Input.TextArea
              placeholder={intl.formatMessage({
                id: 'pages.dict.item.form.description.placeholder',
              })}
              rows={3}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sort_order"
                label={intl.formatMessage({ id: 'pages.dict.item.form.sort' })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.dict.item.form.sort.required',
                    }),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={999}
                  placeholder={intl.formatMessage({
                    id: 'pages.dict.item.form.sort.placeholder',
                  })}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label={intl.formatMessage({
                  id: 'pages.dict.item.form.status',
                })}
                valuePropName="checked"
              >
                <Switch
                  checkedChildren={intl.formatMessage({
                    id: 'pages.dict.item.form.status.active',
                  })}
                  unCheckedChildren={intl.formatMessage({
                    id: 'pages.dict.item.form.status.inactive',
                  })}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DictManagement;
