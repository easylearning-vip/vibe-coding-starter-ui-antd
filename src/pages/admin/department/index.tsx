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
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tree,
} from 'antd';
import React, { useEffect, useState } from 'react';
import {
  createDepartment,
  deleteDepartment,
  getDepartmentTree,
  moveDepartment,
  updateDepartment,
} from '@/services/department/api';

type Department = DepartmentAPI.Department;

const { DirectoryTree } = Tree;
const { Option } = Select;

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
  data: Department;
}

const DepartmentManagement: React.FC = () => {
  const intl = useIntl();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 获取部门树
  const fetchDepartmentTree = async () => {
    setLoading(true);
    try {
      const response = await getDepartmentTree();
      const treeNodes = convertToTreeNodes(response);
      setTreeData(treeNodes);

      // 默认展开第一层
      const firstLevelKeys = treeNodes.map((node) => node.key);
      setExpandedKeys(firstLevelKeys);
    } catch (error) {
      console.error('获取部门树失败:', error);
      message.error('获取部门树失败');
    } finally {
      setLoading(false);
    }
  };

  // 转换数据为树节点格式
  const convertToTreeNodes = (departments: Department[]): TreeNode[] => {
    return departments.map((dept) => ({
      title: (
        <Space>
          <span>{dept.name}</span>
          <Tag color="blue">{dept.code}</Tag>
          {dept.status !== 'active' && <Tag color="orange">{dept.status}</Tag>}
        </Space>
      ),
      key: dept.id.toString(),
      children: dept.children ? convertToTreeNodes(dept.children) : [],
      data: dept,
    }));
  };

  // 处理树选择
  const handleTreeSelect = (keys: string[], _info: any) => {
    setSelectedKeys(keys);
  };

  // 处理树展开
  const handleTreeExpand = (keys: string[]) => {
    setExpandedKeys(keys);
  };

  // 编辑部门
  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue(department);
    setModalVisible(true);
  };

  // 添加子部门
  const handleAddChild = (parentDepartment: Department) => {
    setEditingDepartment(null);
    form.resetFields();
    form.setFieldsValue({ parent_id: parentDepartment.id });
    setModalVisible(true);
  };

  // 添加根部门
  const handleAddRoot = () => {
    setEditingDepartment(null);
    form.resetFields();
    form.setFieldsValue({ parent_id: 0 });
    setModalVisible(true);
  };

  // 删除部门
  const handleDelete = async (department: Department) => {
    try {
      await deleteDepartment(department.id);
      message.success('删除成功');
      fetchDepartmentTree();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 保存部门
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, values);
        message.success('更新成功');
      } else {
        await createDepartment(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchDepartmentTree();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 移动部门
  const _handleMove = async (departmentId: number, newParentId: number) => {
    try {
      await moveDepartment(departmentId, { new_parent_id: newParentId });
      message.success('移动成功');
      fetchDepartmentTree();
    } catch (error) {
      console.error('移动失败:', error);
      message.error('移动失败');
    }
  };

  // 渲染树节点操作按钮
  const renderTreeNodeActions = (nodeData: Department) => (
    <Space size="small">
      <Button
        type="link"
        size="small"
        icon={<EditOutlined />}
        onClick={() => handleEdit(nodeData)}
      >
        {intl.formatMessage({ id: 'pages.common.edit' })}
      </Button>
      <Button
        type="link"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => handleAddChild(nodeData)}
      >
        {intl.formatMessage({ id: 'pages.department.add.child' })}
      </Button>
      <Popconfirm
        title={intl.formatMessage({
          id: 'pages.department.delete.confirm.title',
        })}
        onConfirm={() => handleDelete(nodeData)}
        okText={intl.formatMessage({ id: 'pages.common.confirm' })}
        cancelText={intl.formatMessage({ id: 'pages.common.cancel' })}
      >
        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
          {intl.formatMessage({ id: 'pages.common.delete' })}
        </Button>
      </Popconfirm>
    </Space>
  );

  // 自定义树节点渲染
  const renderTreeNode = (nodeData: any) => {
    const department = nodeData.data as Department;
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Space>
          <span>{department.name}</span>
          <Tag color="blue">{department.code}</Tag>
          {department.status !== 'active' && (
            <Tag color="orange">{department.status}</Tag>
          )}
          {department.description && (
            <span style={{ color: '#666', fontSize: '12px' }}>
              {department.description}
            </span>
          )}
        </Space>
        {renderTreeNodeActions(department)}
      </div>
    );
  };

  useEffect(() => {
    fetchDepartmentTree();
  }, []);

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'pages.department.title' })}
      content={intl.formatMessage({ id: 'pages.department.subTitle' })}
    >
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddRoot}
            >
              {intl.formatMessage({ id: 'pages.department.add.root' })}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDepartmentTree}
              loading={loading}
            >
              {intl.formatMessage({ id: 'pages.common.refresh' })}
            </Button>
          </Space>
        </div>

        <DirectoryTree
          treeData={treeData}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          onExpand={handleTreeExpand}
          onSelect={handleTreeSelect}
          showIcon={false}
          blockNode
          titleRender={renderTreeNode}
        />
      </Card>

      <Modal
        title={
          editingDepartment
            ? intl.formatMessage({ id: 'pages.department.edit' })
            : intl.formatMessage({ id: 'pages.department.add' })
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'pages.department.form.name' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.department.form.name.required',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.department.form.name.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="code"
            label={intl.formatMessage({ id: 'pages.department.form.code' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.department.form.code.required',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.department.form.code.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={intl.formatMessage({
              id: 'pages.department.form.description',
            })}
          >
            <Input.TextArea
              rows={3}
              placeholder={intl.formatMessage({
                id: 'pages.department.form.description.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="parent_id"
            label={intl.formatMessage({
              id: 'pages.department.form.parent_id',
            })}
          >
            <Select
              placeholder={intl.formatMessage({
                id: 'pages.department.form.parent_id.placeholder',
              })}
            >
              <Option value={0}>
                {intl.formatMessage({
                  id: 'pages.department.form.parent_id.root',
                })}
              </Option>
              {flattenDepartments(treeData).map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {'  '.repeat(dept.level - 1)}
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sort"
            label={intl.formatMessage({ id: 'pages.department.form.sort' })}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.department.form.sort.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={intl.formatMessage({ id: 'pages.department.form.status' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.department.form.status.required',
                }),
              },
            ]}
          >
            <Select
              placeholder={intl.formatMessage({
                id: 'pages.department.form.status.placeholder',
              })}
            >
              <Option value="active">
                {intl.formatMessage({ id: 'pages.department.status.active' })}
              </Option>
              <Option value="inactive">
                {intl.formatMessage({ id: 'pages.department.status.inactive' })}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="manager_id"
            label={intl.formatMessage({
              id: 'pages.department.form.manager_id',
            })}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.department.form.manager_id.placeholder',
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

// 扁平化部门数据用于下拉选择
const flattenDepartments = (
  treeNodes: TreeNode[],
  level: number = 1,
): Department[] => {
  let result: Department[] = [];

  treeNodes.forEach((node) => {
    result.push({ ...node.data, level });
    if (node.children) {
      result = result.concat(flattenDepartments(node.children, level + 1));
    }
  });

  return result;
};

export default DepartmentManagement;
