import React, { useState, useEffect } from 'react';
import { RiMoreFill, RiAddLine } from '@remixicon/react';
import cn from 'classnames';
import CustomPopover from '@/components/base/popover';

interface TemplateQuestionsProps {
  className?: string;
  title: string;
  items: TemplateQuestion[];
  onItemClick: (question: TemplateQuestion) => void;
  onChange?: (questions: TemplateQuestion[]) => void;
  readOnly?: boolean;
}

/**
 * Editable Template Questions Component
 * Displays template questions in a grid layout with CustomPopover for operations
 */
const TemplateQuestions: React.FC<TemplateQuestionsProps> = ({
  className = '',
  title = '🤔 你或许想问:',
  items = [],
  onItemClick,
  onChange,
  readOnly = false,
}) => {
  const [questions, setQuestions] = useState<TemplateQuestion[]>(items);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<string>('');

  // Update local state when items prop changes
  useEffect(() => {
    setQuestions(items);
  }, [items]);

  if (!readOnly && !onChange) {
    console.warn('TemplateQuestions: onChange prop is required when readOnly is false');
  }

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setEditedContent(questions[index].content);
  };

  const handleDeleteClick = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
    onChange?.(updatedQuestions);
  };

  const handleSaveEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent triggering onItemClick

    if (editingIndex !== null && editedContent.trim()) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = {
        ...updatedQuestions[editingIndex],
        content: editedContent.trim(),
      };

      setQuestions(updatedQuestions);
      setEditingIndex(null);
      onChange?.(updatedQuestions);
    }
  };

  const handleAddNew = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();

    if (newQuestion.trim()) {
      const updatedQuestions = [...questions, { content: newQuestion.trim() }];

      setQuestions(updatedQuestions);
      setNewQuestion('');
      setIsAddingNew(false);
      onChange?.(updatedQuestions);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setEditingIndex(null);
  };

  const handleCancelAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingNew(false);
    setNewQuestion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'edit' | 'add') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (type === 'edit') {
        handleSaveEdit(e);
      } else {
        handleAddNew(e);
      }
    } else if (e.key === 'Escape') {
      if (type === 'edit') {
        handleCancelEdit(e);
      } else {
        setIsAddingNew(false);
        setNewQuestion('');
      }
    }
  };

  if (!items && items.length === 0 && !isAddingNew && readOnly) {
    return null;
  }

  // Operations menu for each question
  const getOperationsMenu = (index: number) => {
    return (
      <div className="py-2">
        <button
          onClick={() => handleEditClick(index)}
          className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-gray-100"
        >
          <span>编辑</span>
        </button>
        <button
          onClick={() => handleDeleteClick(index)}
          className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-red-50 text-red-500"
        >
          <span>删除</span>
        </button>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-700 flex items-center">
          <span>{title}</span>
          <div className="flex-grow border-t border-gray-200 ml-3 mr-4"></div>
        </h3>

        {!readOnly && (
          <button
            className="text-gray-400 hover:text-gray-700 flex items-center text-sm bg-transparent border-none cursor-pointer"
            onClick={() => setIsAddingNew(true)}
          >
            <RiAddLine className="h-4 w-4 mr-1" />
            <span>添加问题</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Display questions */}
        {questions.map((item, index) => (
          <div
            key={item.id || index}
            className={`
              relative border rounded-lg group
              ${editingIndex === index ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white'}
              transition-all duration-200 ease-in-out
            `}
          >
            {editingIndex === index ? (
              // Edit mode
              <div className="p-3 flex flex-col">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'edit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition duration-200"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-md text-sm transition duration-200"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="relative flex px-4 py-3">
                <button
                  className="flex items-center space-x-3 flex-grow text-left pr-10"
                  onClick={() => onItemClick(item)}
                >
                  <div className="text-blue-600 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700 line-clamp-2">{item.content}</span>
                </button>

                {/* CustomPopover for operations menu */}
                {!readOnly && (
                  <div className="!hidden shrink-0 group-hover:!flex absolute right-2 top-2">
                    <CustomPopover
                      htmlContent={getOperationsMenu(index)}
                      position="br"
                      trigger="click"
                      btnElement={
                        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md">
                          <RiMoreFill className="h-4 w-4 text-text-tertiary" />
                        </div>
                      }
                      btnClassName={(open) =>
                        cn(
                          open ? '!bg-black/5 !shadow-none' : '!bg-transparent',
                          'h-8 w-8 rounded-md border-none !p-2 hover:!bg-black/5',
                        )
                      }
                      popupClassName={'!w-[64px] translate-x-[-64px]'}
                      className={'!z-40 h-fit'}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add new question input */}
        {!readOnly && isAddingNew && (
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 flex flex-col">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'add')}
              placeholder="输入新的模板问题..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              rows={2}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-800 text-white px-3 py-1 rounded-md text-sm transition duration-200"
              >
                添加
              </button>
              <button
                onClick={handleCancelAdd}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-md text-sm transition duration-200"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateQuestions;
