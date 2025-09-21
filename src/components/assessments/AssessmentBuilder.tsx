import React, { useState, useCallback } from 'react';
import { 
  Assessment, 
  AssessmentSection, 
  Question, 
  QuestionType,
  SingleChoiceQuestion,
  MultiChoiceQuestion,
  ShortTextQuestion,
  LongTextQuestion,
  NumericQuestion,
  FileUploadQuestion
} from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Settings, 
  Move,
  ChevronDown,
  ChevronRight,
  GripVertical
} from 'lucide-react';

interface QuestionFormProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateQuestion = (updates: any) => {
    onUpdate({ ...question, ...updates } as Question);
  };

  const renderTypeSpecificFields = () => {
    switch (question.type) {
      case 'single-choice':
      case 'multi-choice':
        const choiceQuestion = question as SingleChoiceQuestion | MultiChoiceQuestion;
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {choiceQuestion.options.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Input
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...choiceQuestion.options];
                    newOptions[index] = { ...option, label: e.target.value, value: e.target.value.toLowerCase() };
                    updateQuestion({ options: newOptions });
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const newOptions = choiceQuestion.options.filter((_, i) => i !== index);
                    updateQuestion({ options: newOptions });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const newOption = {
                  id: crypto.randomUUID(),
                  label: '',
                  value: ''
                };
                updateQuestion({ options: [...choiceQuestion.options, newOption] });
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
            {question.type === 'multi-choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Selections
                </label>
                <Input
                  type="number"
                  value={(question as MultiChoiceQuestion).maxSelections || ''}
                  onChange={(e) => updateQuestion({ maxSelections: parseInt(e.target.value) || undefined })}
                  placeholder="No limit"
                  min="1"
                />
              </div>
            )}
          </div>
        );

      case 'short-text':
      case 'long-text':
        const textQuestion = question as ShortTextQuestion | LongTextQuestion;
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <Input
                value={textQuestion.placeholder || ''}
                onChange={(e) => updateQuestion({ placeholder: e.target.value })}
                placeholder="Enter placeholder text..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Length
              </label>
              <Input
                type="number"
                value={textQuestion.maxLength || ''}
                onChange={(e) => updateQuestion({ maxLength: parseInt(e.target.value) || undefined })}
                placeholder="No limit"
                min="1"
              />
            </div>
          </div>
        );

      case 'numeric':
        const numericQuestion = question as NumericQuestion;
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Value
              </label>
              <Input
                type="number"
                value={numericQuestion.min || ''}
                onChange={(e) => updateQuestion({ min: parseFloat(e.target.value) || undefined })}
                placeholder="No minimum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Value
              </label>
              <Input
                type="number"
                value={numericQuestion.max || ''}
                onChange={(e) => updateQuestion({ max: parseFloat(e.target.value) || undefined })}
                placeholder="No maximum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step
              </label>
              <Input
                type="number"
                value={numericQuestion.step || ''}
                onChange={(e) => updateQuestion({ step: parseFloat(e.target.value) || undefined })}
                placeholder="1"
                min="0.01"
                step="0.01"
              />
            </div>
          </div>
        );

      case 'file-upload':
        const fileQuestion = question as FileUploadQuestion;
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accepted File Types
              </label>
              <Input
                value={fileQuestion.acceptedTypes.join(', ')}
                onChange={(e) => updateQuestion({ acceptedTypes: e.target.value.split(',').map(t => t.trim()) })}
                placeholder=".pdf, .doc, .docx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max File Size (MB)
              </label>
              <Input
                type="number"
                value={fileQuestion.maxSize}
                onChange={(e) => updateQuestion({ maxSize: parseInt(e.target.value) || 5 })}
                min="1"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            Question {question.order}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            {question.type}
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Basic Question Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title *
            </label>
            <Input
              value={question.title}
              onChange={(e) => updateQuestion({ title: e.target.value })}
              placeholder="Enter your question..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={question.description || ''}
              onChange={(e) => updateQuestion({ description: e.target.value })}
              placeholder="Additional context or instructions..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion({ required: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Required</span>
            </label>
          </div>

          {/* Type-specific Fields */}
          {renderTypeSpecificFields()}
        </div>
      )}
    </div>
  );
};

interface SectionFormProps {
  section: AssessmentSection;
  onUpdate: (section: AssessmentSection) => void;
  onDelete: () => void;
}

const SectionForm: React.FC<SectionFormProps> = ({ section, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateSection = (updates: Partial<AssessmentSection>) => {
    onUpdate({ ...section, ...updates });
  };

  const addQuestion = (type: QuestionType) => {
    let newQuestion: Question;
    
    const baseQuestion = {
      id: crypto.randomUUID(),
      title: '',
      required: false,
      order: section.questions.length + 1,
    };

    switch (type) {
      case 'single-choice':
        newQuestion = {
          ...baseQuestion,
          type: 'single-choice',
          options: []
        } as SingleChoiceQuestion;
        break;
      case 'multi-choice':
        newQuestion = {
          ...baseQuestion,
          type: 'multi-choice',
          options: []
        } as MultiChoiceQuestion;
        break;
      case 'short-text':
        newQuestion = {
          ...baseQuestion,
          type: 'short-text'
        } as ShortTextQuestion;
        break;
      case 'long-text':
        newQuestion = {
          ...baseQuestion,
          type: 'long-text'
        } as LongTextQuestion;
        break;
      case 'numeric':
        newQuestion = {
          ...baseQuestion,
          type: 'numeric'
        } as NumericQuestion;
        break;
      case 'file-upload':
        newQuestion = {
          ...baseQuestion,
          type: 'file-upload',
          acceptedTypes: ['.pdf'],
          maxSize: 5
        } as FileUploadQuestion;
        break;
      default:
        throw new Error(`Unknown question type: ${type}`);
    }

    updateSection({
      questions: [...section.questions, newQuestion]
    });
  };

  const updateQuestion = (questionId: string, updatedQuestion: Question) => {
    const newQuestions = section.questions.map(q => 
      q.id === questionId ? updatedQuestion : q
    );
    updateSection({ questions: newQuestions });
  };

  const deleteQuestion = (questionId: string) => {
    const newQuestions = section.questions.filter(q => q.id !== questionId);
    updateSection({ questions: newQuestions });
  };

  const questionTypes: { type: QuestionType; label: string }[] = [
    { type: 'single-choice', label: 'Single Choice' },
    { type: 'multi-choice', label: 'Multiple Choice' },
    { type: 'short-text', label: 'Short Text' },
    { type: 'long-text', label: 'Long Text' },
    { type: 'numeric', label: 'Number' },
    { type: 'file-upload', label: 'File Upload' },
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            Section {section.order}: {section.title || 'Untitled Section'}
          </h3>
        </div>
        <Button variant="secondary" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Section Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Title *
              </label>
              <Input
                value={section.title}
                onChange={(e) => updateSection({ title: e.target.value })}
                placeholder="e.g., Technical Skills"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={section.description || ''}
              onChange={(e) => updateSection({ description: e.target.value })}
              placeholder="Describe what this section covers..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Questions</h4>
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addQuestion(e.target.value as QuestionType);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Add Question...</option>
                  {questionTypes.map(({ type, label }) => (
                    <option key={type} value={type}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {section.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No questions yet. Add your first question above.
                </div>
              ) : (
                section.questions.map((question) => (
                  <QuestionForm
                    key={question.id}
                    question={question}
                    onUpdate={(updatedQuestion) => updateQuestion(question.id, updatedQuestion)}
                    onDelete={() => deleteQuestion(question.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AssessmentBuilderProps {
  assessment: Assessment;
  onUpdate: (assessment: Assessment) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({
  assessment,
  onUpdate,
  onSave,
  isSaving
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const updateAssessment = (updates: Partial<Assessment>) => {
    onUpdate({ ...assessment, ...updates });
  };

  const addSection = () => {
    const newSection: AssessmentSection = {
      id: crypto.randomUUID(),
      title: '',
      order: assessment.sections.length + 1,
      questions: []
    };

    updateAssessment({
      sections: [...assessment.sections, newSection]
    });
  };

  const updateSection = (sectionId: string, updatedSection: AssessmentSection) => {
    const newSections = assessment.sections.map(s => 
      s.id === sectionId ? updatedSection : s
    );
    updateAssessment({ sections: newSections });
  };

  const deleteSection = (sectionId: string) => {
    const newSections = assessment.sections.filter(s => s.id !== sectionId);
    updateAssessment({ sections: newSections });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assessment Builder</h2>
          <p className="text-gray-600 mt-1">
            Create and customize your assessment
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            onClick={onSave}
            loading={isSaving}
          >
            Save Assessment
          </Button>
        </div>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {/* Builder Panel */}
        <div className="space-y-6">
          {/* Assessment Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Title *
                </label>
                <Input
                  value={assessment.title}
                  onChange={(e) => updateAssessment({ title: e.target.value })}
                  placeholder="e.g., Frontend Developer Assessment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={assessment.description || ''}
                  onChange={(e) => updateAssessment({ description: e.target.value })}
                  placeholder="Describe the purpose of this assessment..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (minutes)
                  </label>
                  <Input
                    type="number"
                    value={assessment.timeLimit || ''}
                    onChange={(e) => updateAssessment({ timeLimit: parseInt(e.target.value) || undefined })}
                    placeholder="No time limit"
                    min="1"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assessment.isPublished}
                      onChange={(e) => updateAssessment({ isPublished: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sections</h3>
              <Button onClick={addSection}>
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {assessment.sections.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-gray-500 mb-4">
                    No sections yet. Create your first section to get started.
                  </div>
                  <Button onClick={addSection}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Section
                  </Button>
                </div>
              ) : (
                assessment.sections.map((section) => (
                  <SectionForm
                    key={section.id}
                    section={section}
                    onUpdate={(updatedSection) => updateSection(section.id, updatedSection)}
                    onDelete={() => deleteSection(section.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
            <div className="border border-gray-200 rounded-lg p-6 max-h-[600px] overflow-y-auto">
              {/* Assessment Preview would be rendered here */}
              <div className="text-center text-gray-500">
                Assessment preview will be rendered here
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
