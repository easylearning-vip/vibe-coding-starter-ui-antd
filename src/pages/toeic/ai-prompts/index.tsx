import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  ProTable,
  ActionType,
  ProColumns,
  ModalForm,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getToeicAiPromptList,
  createToeicAiPrompt,
  updateToeicAiPrompt,
  deleteToeicAiPrompt,
} from '@/services/toeic-ai-prompt/api';
import type {
  ToeicAiPrompt,
  CreateToeicAiPromptRequest,
  UpdateToeicAiPromptRequest,
} from '@/services/toeic-ai-prompt/typings';

const { Text } = Typography;

const ToeicAiPromptsPage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ToeicAiPrompt | null>(null);
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ToeicAiPrompt>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: 'Part 2 提示词',
      dataIndex: 'part2_prompt',
      ellipsis: true,
      width: 300,
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 280 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Part 3 提示词',
      dataIndex: 'part3_prompt',
      ellipsis: true,
      width: 300,
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 280 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Part 4 提示词',
      dataIndex: 'part4_prompt',
      ellipsis: true,
      width: 300,
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 280 }}>
          {text}
        </Text>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 180,
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      width: 180,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="确定要删除这个提示词吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  const handleEdit = (record: ToeicAiPrompt) => {
    setCurrentRecord(record);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteToeicAiPrompt(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCreate = async (values: CreateToeicAiPromptRequest) => {
    try {
      await createToeicAiPrompt(values);
      message.success('创建成功');
      setCreateModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      message.error('创建失败');
      return false;
    }
  };

  const handleUpdate = async (values: UpdateToeicAiPromptRequest) => {
    if (!currentRecord) return false;
    
    try {
      await updateToeicAiPrompt(currentRecord.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      setCurrentRecord(null);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      message.error('更新失败');
      return false;
    }
  };

  return (
    <PageContainer>
      <ProTable<ToeicAiPrompt>
        headerTitle="TOEIC AI 提示词管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建提示词
          </Button>,
        ]}
        request={async (params) => {
          const response = await getToeicAiPromptList({
            page: params.current,
            page_size: params.pageSize,
            search: params.keyword,
          });
          return {
            data: response.data,
            success: true,
            total: response.total,
          };
        }}
        columns={columns}
        scroll={{ x: 1200 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      {/* 创建提示词模态框 */}
      <ModalForm
        title="新建 TOEIC AI 提示词"
        width={800}
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={handleCreate}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormTextArea
          name="part2_prompt"
          label="Part 2 提示词"
          placeholder="请输入 TOEIC Part 2 的 AI 提示词"
          rules={[{ required: true, message: '请输入 Part 2 提示词' }]}
          fieldProps={{
            rows: 4,
            showCount: true,
          }}
        />
        <ProFormTextArea
          name="part3_prompt"
          label="Part 3 提示词"
          placeholder="请输入 TOEIC Part 3 的 AI 提示词"
          rules={[{ required: true, message: '请输入 Part 3 提示词' }]}
          fieldProps={{
            rows: 4,
            showCount: true,
          }}
        />
        <ProFormTextArea
          name="part4_prompt"
          label="Part 4 提示词"
          placeholder="请输入 TOEIC Part 4 的 AI 提示词"
          rules={[{ required: true, message: '请输入 Part 4 提示词' }]}
          fieldProps={{
            rows: 4,
            showCount: true,
          }}
        />
      </ModalForm>

      {/* 编辑提示词模态框 */}
      <ModalForm
        title="编辑 TOEIC AI 提示词"
        width={800}
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        onFinish={handleUpdate}
        initialValues={currentRecord || {}}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormTextArea
          name="part2_prompt"
          label="Part 2 提示词"
          placeholder="请输入 TOEIC Part 2 的 AI 提示词"
          rules={[{ required: true, message: '请输入 Part 2 提示词' }]}
          fieldProps={{
            rows: 4,
            showCount: true,
          }}
        />
        <ProFormTextArea
          name="part3_prompt"
          label="Part 3 提示词"
          placeholder="请输入 TOEIC Part 3 的 AI 提示词"
          rules={[{ required: true, message: '请输入 Part 3 提示词' }]}
          fieldProps={{
            rows: 4,
            showCount: true,
          }}
        />
        <ProFormTextArea
          name="part4_prompt"
          label="Part 4 提示词"
          placeholder="请输入 TOEIC Part 4 的 AI 提示词"
          rules={[{ required: true, message: '请输入 Part 4 提示词' }]}
          fieldProps={{
            rows: 4,
            showCount: true,
          }}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default ToeicAiPromptsPage;
