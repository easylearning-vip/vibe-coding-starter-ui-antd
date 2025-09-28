import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Radio,
  Switch,
  Button,
  message,
  Space,
  Divider,
  Input,
  Typography,
  Card,
  List,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getScenarioOptions } from '@/services/scenario/api';
import { getDifficultyLevelOptions } from '@/services/difficulty-level/api';
import { autoGeneratePracticeSet as autoGeneratePart2PracticeSet, getPracticeSetList as getPart2PracticeSetList, createPracticeSet as createPart2PracticeSet, addQuestionsToPracticeSet as addQuestionsToPart2PracticeSet } from '@/services/part2-practice-set/api';
import { autoGeneratePracticeSet as autoGeneratePart3PracticeSet, getPracticeSetList as getPart3PracticeSetList, createPracticeSet as createPart3PracticeSet, addQuestionsToPracticeSet as addQuestionsToPart3PracticeSet } from '@/services/part3-practice-set/api';
import { autoGeneratePracticeSet as autoGeneratePart4PracticeSet, getPracticeSetList as getPart4PracticeSetList, createPracticeSet as createPart4PracticeSet, addQuestionsToPracticeSet as addQuestionsToPart4PracticeSet } from '@/services/part4-practice-set/api';

const { Text } = Typography;

interface AddToPracticeSetModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  toeicPart: 'part2' | 'part3' | 'part4';
  title?: string;
  selectedQuestions?: any[]; // Array of selected question IDs
  mode?: 'auto-generate' | 'selected-questions'; // Mode to determine workflow
}

const AddToPracticeSetModal: React.FC<AddToPracticeSetModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  toeicPart,
  title,
  selectedQuestions = [],
  mode = 'auto-generate',
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioAPI.Scenario[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevelAPI.DifficultyLevel[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [existingPracticeSets, setExistingPracticeSets] = useState<any[]>([]);
  const [practiceSetAction, setPracticeSetAction] = useState<'create' | 'existing'>('create');

  // Load dropdown options and existing practice sets
  const loadOptions = async () => {
    setOptionsLoading(true);
    try {
      const promises = [
        getScenarioOptions(),
        getDifficultyLevelOptions(),
      ];

      // Load existing practice sets if in selected-questions mode
      if (mode === 'selected-questions') {
        let practiceSetPromise;
        switch (toeicPart) {
          case 'part2':
            practiceSetPromise = getPart2PracticeSetList({ page: 1, page_size: 100 });
            break;
          case 'part3':
            practiceSetPromise = getPart3PracticeSetList({ page: 1, page_size: 100 });
            break;
          case 'part4':
            practiceSetPromise = getPart4PracticeSetList({ page: 1, page_size: 100 });
            break;
          default:
            practiceSetPromise = Promise.resolve({ data: [] });
        }
        promises.push(practiceSetPromise);
      }

      const results = await Promise.all(promises);
      setScenarios(results[0]);
      setDifficultyLevels(results[1]);

      if (mode === 'selected-questions' && results[2]) {
        setExistingPracticeSets(results[2].data || []);
      }
    } catch (error) {
      console.error('Failed to load options:', error);
      message.error('Failed to load dropdown options');
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadOptions();
      // Set default values based on mode
      if (mode === 'auto-generate') {
        form.setFieldsValue({
          mode: 'random',
          deduplicate: true,
          total_questions: 20,
        });
      } else {
        form.setFieldsValue({
          action: 'create',
        });
        setPracticeSetAction('create');
      }
    }
  }, [visible, form, mode]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (mode === 'auto-generate') {
        // Original auto-generation logic
        const requestData = {
          scenario_id: values.scenario_id,
          difficulty_level_id: values.difficulty_level_id,
          mode: values.mode,
          deduplicate: values.deduplicate,
          total_questions: values.total_questions,
        };

        let result;
        switch (toeicPart) {
          case 'part2':
            result = await autoGeneratePart2PracticeSet(requestData);
            break;
          case 'part3':
            result = await autoGeneratePart3PracticeSet(requestData);
            break;
          case 'part4':
            result = await autoGeneratePart4PracticeSet(requestData);
            break;
          default:
            throw new Error('Invalid TOEIC part');
        }

        message.success(`Successfully created practice set with ${result.items.length} questions!`);
      } else {
        // Selected questions logic
        if (practiceSetAction === 'create') {
          // Create new practice set with selected questions
          const practiceSetData = {
            name: values.practice_set_name,
            scenario_id: values.scenario_id,
            difficulty_level_id: values.difficulty_level_id,
          };

          let practiceSet;
          switch (toeicPart) {
            case 'part2':
              practiceSet = await createPart2PracticeSet(practiceSetData);
              await addQuestionsToPart2PracticeSet(practiceSet.id, { question_ids: selectedQuestions.map(q => q.id) });
              break;
            case 'part3':
              practiceSet = await createPart3PracticeSet(practiceSetData);
              await addQuestionsToPart3PracticeSet(practiceSet.id, { question_ids: selectedQuestions.map(q => q.id) });
              break;
            case 'part4':
              practiceSet = await createPart4PracticeSet(practiceSetData);
              await addQuestionsToPart4PracticeSet(practiceSet.id, { question_ids: selectedQuestions.map(q => q.id) });
              break;
            default:
              throw new Error('Invalid TOEIC part');
          }

          message.success(`Successfully created practice set "${values.practice_set_name}" with ${selectedQuestions.length} questions!`);
        } else {
          // Add to existing practice set
          const practiceSetId = values.existing_practice_set_id;

          switch (toeicPart) {
            case 'part2':
              await addQuestionsToPart2PracticeSet(practiceSetId, { question_ids: selectedQuestions.map(q => q.id) });
              break;
            case 'part3':
              await addQuestionsToPart3PracticeSet(practiceSetId, { question_ids: selectedQuestions.map(q => q.id) });
              break;
            case 'part4':
              await addQuestionsToPart4PracticeSet(practiceSetId, { question_ids: selectedQuestions.map(q => q.id) });
              break;
            default:
              throw new Error('Invalid TOEIC part');
          }

          const selectedSet = existingPracticeSets.find(set => set.id === practiceSetId);
          message.success(`Successfully added ${selectedQuestions.length} questions to "${selectedSet?.name || 'Practice Set'}"`);
        }
      }

      form.resetFields();
      onCancel();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to process practice set:', error);
      message.error('Failed to process practice set');
    } finally {
      setLoading(false);
    }
  };

  const getPartTitle = () => {
    switch (toeicPart) {
      case 'part2':
        return 'Part 2';
      case 'part3':
        return 'Part 3';
      case 'part4':
        return 'Part 4';
      default:
        return '';
    }
  };

  return (
    <Modal
      title={title || (mode === 'selected-questions' ?
        `Add ${selectedQuestions.length} Questions to ${getPartTitle()} Practice Set` :
        `Add to ${getPartTitle()} Practice Set`)}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText={mode === 'selected-questions' ?
        (practiceSetAction === 'create' ? 'Create Practice Set' : 'Add to Practice Set') :
        'Create Practice Set'}
      cancelText="Cancel"
    >
      {mode === 'selected-questions' && (
        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}>
          <Text strong>Selected Questions: {selectedQuestions.length}</Text>
          <div style={{ marginTop: 8 }}>
            {selectedQuestions.slice(0, 3).map((q, index) => (
              <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                Q{q.question_number || q.id}: {(q.question_text || '').substring(0, 30)}...
              </Tag>
            ))}
            {selectedQuestions.length > 3 && (
              <Tag color="blue">+{selectedQuestions.length - 3} more</Tag>
            )}
          </div>
        </Card>
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          mode: 'random',
          deduplicate: true,
          total_questions: 20,
        }}
      >
        {mode === 'selected-questions' && (
          <Form.Item
            name="action"
            label="Practice Set Action"
            rules={[{ required: true, message: 'Please select an action' }]}
          >
            <Radio.Group
              value={practiceSetAction}
              onChange={(e) => setPracticeSetAction(e.target.value)}
            >
              <Radio value="create">Create New Practice Set</Radio>
              <Radio value="existing">Add to Existing Practice Set</Radio>
            </Radio.Group>
          </Form.Item>
        )}

        {mode === 'selected-questions' && practiceSetAction === 'existing' && (
          <Form.Item
            name="existing_practice_set_id"
            label="Select Existing Practice Set"
            rules={[{ required: true, message: 'Please select a practice set' }]}
          >
            <Select
              placeholder="Select practice set"
              loading={optionsLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={existingPracticeSets.map(set => ({
                value: set.id,
                label: `${set.name || `Practice Set #${set.id}`} (${set.total_questions || 0} questions)`,
                title: set.name,
              }))}
            />
          </Form.Item>
        )}

        {mode === 'selected-questions' && practiceSetAction === 'create' && (
          <Form.Item
            name="practice_set_name"
            label="Practice Set Name"
            rules={[{ required: true, message: 'Please enter a practice set name' }]}
          >
            <Input placeholder="Enter practice set name" />
          </Form.Item>
        )}

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

        {mode === 'auto-generate' && (
          <>
            <Divider />

            <Form.Item
              name="total_questions"
              label="Number of Questions"
              rules={[
                { required: true, message: 'Please enter number of questions' },
                { type: 'number', min: 10, max: 30, message: 'Must be between 10 and 30' },
              ]}
            >
              <InputNumber
                min={10}
                max={30}
                style={{ width: '100%' }}
                placeholder="Enter number of questions (10-30)"
              />
            </Form.Item>

            <Form.Item
              name="mode"
              label="Generation Method"
              rules={[{ required: true, message: 'Please select generation method' }]}
            >
              <Radio.Group>
                <Radio value="random">Random Selection</Radio>
                <Radio value="sequential">Sequential Order</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="deduplicate"
              label="Remove Duplicates"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddToPracticeSetModal;
