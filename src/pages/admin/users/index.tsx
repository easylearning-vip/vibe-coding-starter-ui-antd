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
  DatePicker,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import DictSelect from '@/components/DictSelect';
import DictTag from '@/components/DictTag';
import { useUserRole, useUserStatus } from '@/hooks/useDict';
import { DICT_CATEGORIES } from '@/services/dict/api';
import {
  createUser,
  deleteUser,
  getUserList,
  updateUser,
} from '@/services/user/api';

// 使用API类型定义
type User = UserAPI.User;

const UserManagement: React.FC = () => {
  const intl = useIntl();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 使用数据字典Hook
  const _userRole = useUserRole();
  const _userStatus = useUserStatus();

  // 分页和查询状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({
    search: '',
    role: '',
    status: '',
    start_date: '',
    end_date: '',
  });
  const [sorter, setSorter] = useState({
    field: 'created_at',
    order: 'descend' as 'ascend' | 'descend',
  });

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.users.table.username' }),
      dataIndex: 'username',
      key: 'username',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.users.table.email' }),
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.users.table.nickname' }),
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: intl.formatMessage({ id: 'pages.users.table.role' }),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <DictTag categoryCode={DICT_CATEGORIES.USER_ROLE} itemKey={role} />
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.users.table.status' }),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <DictTag categoryCode={DICT_CATEGORIES.USER_STATUS} itemKey={status} />
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.users.table.createdAt' }),
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: intl.formatMessage({ id: 'pages.users.table.actions' }),
      key: 'action',
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
              id: 'pages.users.delete.confirm.title',
            })}
            description={intl.formatMessage(
              { id: 'pages.users.delete.confirm.description' },
              { username: record.username },
            )}
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

  const fetchUsers = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    status?: string;
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
      if (params?.role) queryParams.role = params.role;
      if (params?.status) queryParams.status = params.status;
      if (params?.start_date) queryParams.start_date = params.start_date;
      if (params?.end_date) queryParams.end_date = params.end_date;

      const response = await getUserList(queryParams);
      setUsers(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        current: response.page,
        pageSize: response.size,
      }));
    } catch (error) {
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      status: user.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user.id);
      message.success(`用户 "${user.username}" 删除成功`);
      // 重新获取用户列表
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败');
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // 编辑用户
        await updateUser(editingUser.id, values);
        message.success('用户信息更新成功');
      } else {
        // 添加新用户
        await createUser(values);
        message.success('用户添加成功');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      // 重新获取用户列表
      fetchUsers();
    } catch (error) {
      console.error('操作失败:', error);
      message.error(editingUser ? '更新用户失败' : '添加用户失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 搜索处理
  const handleSearch = (values: any) => {
    const newSearchParams = {
      search: values.search || '',
      role: values.role || '',
      status: values.status || '',
      start_date: values.date_range?.[0]?.format('YYYY-MM-DD') || '',
      end_date: values.date_range?.[1]?.format('YYYY-MM-DD') || '',
    };
    setSearchParams(newSearchParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchUsers({
      page: 1,
      ...newSearchParams,
    });
  };

  // 重置搜索
  const handleReset = () => {
    const resetParams = {
      search: '',
      role: '',
      status: '',
      start_date: '',
      end_date: '',
    };
    setSearchParams(resetParams);
    setPagination((prev) => ({ ...prev, current: 1 }));
    searchForm.resetFields();
    fetchUsers({
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

    fetchUsers({
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      sort: newSorter.field,
      order: newSorter.order === 'descend' ? 'desc' : 'asc',
    });
  };

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'pages.users.title' })}
      content={intl.formatMessage({ id: 'pages.users.description' })}
    >
      <Card>
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="search"
            label={intl.formatMessage({ id: 'pages.common.search' })}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.users.search.placeholder',
              })}
              allowClear
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item
            name="role"
            label={intl.formatMessage({ id: 'pages.users.table.role' })}
          >
            <DictSelect
              categoryCode={DICT_CATEGORIES.USER_ROLE}
              placeholder={intl.formatMessage({
                id: 'pages.users.search.role.placeholder',
              })}
              allowClear
              style={{ width: 120 }}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label={intl.formatMessage({ id: 'pages.users.table.status' })}
          >
            <DictSelect
              categoryCode={DICT_CATEGORIES.USER_STATUS}
              placeholder={intl.formatMessage({
                id: 'pages.users.search.status.placeholder',
              })}
              allowClear
              style={{ width: 120 }}
            />
          </Form.Item>
          <Form.Item
            name="date_range"
            label={intl.formatMessage({ id: 'pages.common.createdTime' })}
          >
            <DatePicker.RangePicker
              placeholder={[
                intl.formatMessage({ id: 'pages.common.startDate' }),
                intl.formatMessage({ id: 'pages.common.endDate' }),
              ]}
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item>
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
          </Form.Item>
        </Form>

        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {intl.formatMessage({ id: 'pages.users.create' })}
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
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
          editingUser
            ? intl.formatMessage({ id: 'pages.users.edit' })
            : intl.formatMessage({ id: 'pages.users.create' })
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
            status: 'active',
            role: 'user',
          }}
        >
          <Form.Item
            name="username"
            label={intl.formatMessage({ id: 'pages.users.table.username' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.users.form.username.required',
                }),
              },
              {
                min: 3,
                message: intl.formatMessage({
                  id: 'pages.users.form.username.min',
                }),
              },
              {
                max: 20,
                message: intl.formatMessage({
                  id: 'pages.users.form.username.max',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.users.form.username.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={intl.formatMessage({ id: 'pages.users.table.email' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.users.form.email.required',
                }),
              },
              {
                type: 'email',
                message: intl.formatMessage({
                  id: 'pages.users.form.email.invalid',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.users.form.email.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="nickname"
            label={intl.formatMessage({ id: 'pages.users.table.nickname' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.users.form.nickname.required',
                }),
              },
              {
                max: 50,
                message: intl.formatMessage({
                  id: 'pages.users.form.nickname.max',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.users.form.nickname.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="role"
            label={intl.formatMessage({ id: 'pages.users.table.role' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.users.form.role.required',
                }),
              },
            ]}
          >
            <DictSelect
              categoryCode={DICT_CATEGORIES.USER_ROLE}
              placeholder={intl.formatMessage({
                id: 'pages.users.form.role.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={intl.formatMessage({ id: 'pages.users.table.status' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.users.form.status.required',
                }),
              },
            ]}
          >
            <DictSelect
              categoryCode={DICT_CATEGORIES.USER_STATUS}
              placeholder={intl.formatMessage({
                id: 'pages.users.form.status.placeholder',
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UserManagement;
