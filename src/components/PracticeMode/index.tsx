import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Radio,
  Space,
  Typography,
  Progress,
  message,
  Modal,
  Divider,
  Row,
  Col,
  Tag,
  Result,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { getPracticeSetQuestions as getPart2Questions, submitAnswer as submitPart2Answer } from '@/services/part2-practice-set/api';
import { getPracticeSetQuestions as getPart3Questions, submitAnswer as submitPart3Answer } from '@/services/part3-practice-set/api';
import { getPracticeSetQuestions as getPart4Questions, submitAnswer as submitPart4Answer } from '@/services/part4-practice-set/api';

const { Title, Text, Paragraph } = Typography;

interface PracticeModeProps {
  visible: boolean;
  onClose: () => void;
  practiceSetId: number;
  toeicPart: 'part2' | 'part3' | 'part4';
  onComplete?: () => void;
}

type QuestionData = any; // Will be typed based on the part

const PracticeMode: React.FC<PracticeModeProps> = ({
  visible,
  onClose,
  practiceSetId,
  toeicPart,
  onComplete,
}) => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  }>({
    total: 0,
    correct: 0,
    incorrect: 0,
    accuracy: 0,
  });

  // Load questions when modal opens
  useEffect(() => {
    if (visible && practiceSetId) {
      loadQuestions();
    }
  }, [visible, practiceSetId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let questionsData;
      switch (toeicPart) {
        case 'part2':
          questionsData = await getPart2Questions(practiceSetId);
          break;
        case 'part3':
          questionsData = await getPart3Questions(practiceSetId);
          break;
        case 'part4':
          questionsData = await getPart4Questions(practiceSetId);
          break;
        default:
          throw new Error('Invalid TOEIC part');
      }
      setQuestions(questionsData);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setSelectedAnswer('');
      setShowResults(false);
    } catch (error) {
      console.error('Failed to load questions:', error);
      message.error('Failed to load practice questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      message.warning('Please select an answer before proceeding');
      return;
    }

    // Save the answer
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: selectedAnswer,
    };
    setAnswers(newAnswers);

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(newAnswers[currentQuestionIndex + 1] || '');
    } else {
      // All questions answered, submit the practice set
      submitPracticeSet(newAnswers);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer
      const newAnswers = {
        ...answers,
        [currentQuestionIndex]: selectedAnswer,
      };
      setAnswers(newAnswers);

      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(newAnswers[currentQuestionIndex - 1] || '');
    }
  };

  const submitPracticeSet = async (finalAnswers: Record<number, string>) => {
    setSubmitting(true);
    try {
      let correctCount = 0;
      const total = questions.length;

      // Submit each answer and calculate results
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = finalAnswers[i];
        
        if (!userAnswer) continue;

        let isCorrect = false;
        let correctAnswer = '';

        // Determine correct answer based on part type
        if (toeicPart === 'part2') {
          correctAnswer = question.question?.correct_answer || '';
          isCorrect = userAnswer === correctAnswer;
        } else if (toeicPart === 'part3') {
          const answerOption = question.conversation?.answer_options?.find(
            (ao: any) => ao.question_number === question.question_index
          );
          correctAnswer = answerOption?.correct_answer || '';
          isCorrect = userAnswer === correctAnswer;
        } else if (toeicPart === 'part4') {
          const answerOption = question.talk?.answer_options?.find(
            (ao: any) => ao.question_number === question.question_index
          );
          correctAnswer = answerOption?.correct_answer || '';
          isCorrect = userAnswer === correctAnswer;
        }

        if (isCorrect) {
          correctCount++;
        }

        // Submit answer to backend
        try {
          const submitData = {
            selected_answer: userAnswer as 'A' | 'B' | 'C' | 'D',
            is_correct: isCorrect,
          };

          switch (toeicPart) {
            case 'part2':
              await submitPart2Answer(question.item_id, submitData);
              break;
            case 'part3':
              await submitPart3Answer(question.item_id, submitData);
              break;
            case 'part4':
              await submitPart4Answer(question.item_id, submitData);
              break;
          }
        } catch (error) {
          console.error(`Failed to submit answer for question ${i + 1}:`, error);
        }
      }

      const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      
      setResults({
        total,
        correct: correctCount,
        incorrect: total - correctCount,
        accuracy,
      });

      setShowResults(true);
      message.success('Practice completed successfully!');
      onComplete?.();
    } catch (error) {
      console.error('Failed to submit practice set:', error);
      message.error('Failed to submit practice results');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setAnswers({});
    setShowResults(false);
    onClose();
  };

  const renderQuestion = () => {
    if (questions.length === 0) return null;

    const question = questions[currentQuestionIndex];
    
    if (toeicPart === 'part2') {
      return (
        <div>
          <Title level={4}>Question {currentQuestionIndex + 1}</Title>
          <Paragraph style={{ fontSize: '16px', marginBottom: 24 }}>
            {question.question?.question_text}
          </Paragraph>
          
          <Radio.Group
            value={selectedAnswer}
            onChange={(e) => handleAnswerSelect(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="A" style={{ fontSize: '16px' }}>
                A. {question.question?.option_a}
              </Radio>
              <Radio value="B" style={{ fontSize: '16px' }}>
                B. {question.question?.option_b}
              </Radio>
              <Radio value="C" style={{ fontSize: '16px' }}>
                C. {question.question?.option_c}
              </Radio>
            </Space>
          </Radio.Group>
        </div>
      );
    } else if (toeicPart === 'part3') {
      // Get question text based on question index
      let questionText = '';
      switch (question.question_index) {
        case 1:
          questionText = question.conversation?.question1 || '';
          break;
        case 2:
          questionText = question.conversation?.question2 || '';
          break;
        case 3:
          questionText = question.conversation?.question3 || '';
          break;
      }

      // Find answer options for this question
      const answerOption = question.conversation?.answer_options?.find(
        (ao: any) => ao.question_number === question.question_index
      );

      return (
        <div>
          <Title level={4}>Question {currentQuestionIndex + 1} (Part 3 - Question {question.question_index})</Title>
          <Card style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
            <Text strong>Conversation:</Text>
            <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-line' }}>
              {question.conversation?.conversation_text}
            </Paragraph>
          </Card>
          
          <Paragraph style={{ fontSize: '16px', marginBottom: 24 }}>
            {questionText}
          </Paragraph>
          
          {answerOption && (
            <Radio.Group
              value={selectedAnswer}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="A" style={{ fontSize: '16px' }}>
                  A. {answerOption.option_a}
                </Radio>
                <Radio value="B" style={{ fontSize: '16px' }}>
                  B. {answerOption.option_b}
                </Radio>
                <Radio value="C" style={{ fontSize: '16px' }}>
                  C. {answerOption.option_c}
                </Radio>
                <Radio value="D" style={{ fontSize: '16px' }}>
                  D. {answerOption.option_d}
                </Radio>
              </Space>
            </Radio.Group>
          )}
        </div>
      );
    } else if (toeicPart === 'part4') {
      // Get question text based on question index
      let questionText = '';
      switch (question.question_index) {
        case 1:
          questionText = question.talk?.question1 || '';
          break;
        case 2:
          questionText = question.talk?.question2 || '';
          break;
        case 3:
          questionText = question.talk?.question3 || '';
          break;
      }

      // Find answer options for this question
      const answerOption = question.talk?.answer_options?.find(
        (ao: any) => ao.question_number === question.question_index
      );

      return (
        <div>
          <Title level={4}>Question {currentQuestionIndex + 1} (Part 4 - Question {question.question_index})</Title>
          <Card style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
            <Text strong>Talk:</Text>
            <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-line' }}>
              {question.talk?.talk_text}
            </Paragraph>
          </Card>
          
          <Paragraph style={{ fontSize: '16px', marginBottom: 24 }}>
            {questionText}
          </Paragraph>
          
          {answerOption && (
            <Radio.Group
              value={selectedAnswer}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="A" style={{ fontSize: '16px' }}>
                  A. {answerOption.option_a}
                </Radio>
                <Radio value="B" style={{ fontSize: '16px' }}>
                  B. {answerOption.option_b}
                </Radio>
                <Radio value="C" style={{ fontSize: '16px' }}>
                  C. {answerOption.option_c}
                </Radio>
                <Radio value="D" style={{ fontSize: '16px' }}>
                  D. {answerOption.option_d}
                </Radio>
              </Space>
            </Radio.Group>
          )}
        </div>
      );
    }

    return null;
  };

  const renderResults = () => {
    return (
      <Result
        icon={<TrophyOutlined style={{ color: '#52c41a' }} />}
        title="Practice Completed!"
        subTitle={`You've completed all ${results.total} questions in this practice set.`}
        extra={[
          <Row key="stats" gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                <div>
                  <Text strong style={{ fontSize: 18, display: 'block' }}>{results.correct}</Text>
                  <Text type="secondary">Correct</Text>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <CloseCircleOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 8 }} />
                <div>
                  <Text strong style={{ fontSize: 18, display: 'block' }}>{results.incorrect}</Text>
                  <Text type="secondary">Incorrect</Text>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <TrophyOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
                <div>
                  <Text strong style={{ fontSize: 18, display: 'block' }}>{results.accuracy}%</Text>
                  <Text type="secondary">Accuracy</Text>
                </div>
              </Card>
            </Col>
          </Row>,
          <Button key="close" type="primary" onClick={handleClose}>
            Close
          </Button>,
        ]}
      />
    );
  };

  return (
    <Modal
      title={`TOEIC ${toeicPart.toUpperCase()} Practice Mode`}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <PlayCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <div>Loading practice questions...</div>
        </div>
      ) : showResults ? (
        renderResults()
      ) : questions.length > 0 ? (
        <div>
          {/* Progress Bar */}
          <div style={{ marginBottom: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
              <Col>
                <Text strong>Progress: {currentQuestionIndex + 1} / {questions.length}</Text>
              </Col>
              <Col>
                <Tag color="blue">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </Tag>
              </Col>
            </Row>
            <Progress 
              percent={Math.round(((currentQuestionIndex + 1) / questions.length) * 100)} 
              showInfo={false}
            />
          </div>

          <Divider />

          {/* Question Content */}
          {renderQuestion()}

          <Divider />

          {/* Navigation Buttons */}
          <Row justify="space-between">
            <Col>
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={handleNextQuestion}
                loading={submitting}
                disabled={!selectedAnswer}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Practice' : 'Next Question'}
              </Button>
            </Col>
          </Row>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text>No questions available for this practice set.</Text>
        </div>
      )}
    </Modal>
  );
};

export default PracticeMode;
