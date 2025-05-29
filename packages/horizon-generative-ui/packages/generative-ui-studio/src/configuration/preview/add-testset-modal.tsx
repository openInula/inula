import React, { useState, useEffect } from 'react';
import Modal from '@/components/base/modal';
import { SimpleSelect } from '@/components/base/select';
import { Button } from '@/components/base/button';
import Input from '@/components/base/input';
import TextArea from '@/components/base/textarea';
import { PlusIcon, XIcon } from 'lucide-react';
import { useCreateTestSet, useTestSets } from '@/service/test-sets';
import { useToastContext } from '@/components/base/toast';

const TestSetModal = ({ isShow, onClose, onSelectTestSet }) => {
  const { data: testSets = [], isLoading } = useTestSets();
  const createTestSetMutation = useCreateTestSet();
  const { notify } = useToastContext();

  const [selectedTestSet, setSelectedTestSet] = useState('');
  const [isAddingTestSet, setIsAddingTestSet] = useState(false);
  const [newTestSet, setNewTestSet] = useState({ name: '', description: '' });

  // Reset form when modal closes
  useEffect(() => {
    if (!isShow) {
      setIsAddingTestSet(false);
      setNewTestSet({ name: '', description: '' });
    }
  }, [isShow]);

  // Handle test set selection and confirm
  const handleConfirm = () => {
    if (selectedTestSet) {
      onSelectTestSet(selectedTestSet);
      onClose();
    } else {
      notify({ type: 'warning', message: '请选择一个测试集' });
    }
  };

  // Handle add new test set
  const handleAddTestSet = () => {
    if (newTestSet.name.trim() === '') {
      notify({ type: 'warning', message: '测试集名称不能为空' });
      return;
    }

    createTestSetMutation.mutate(
      {
        name: newTestSet.name,
        description: newTestSet.description,
        testCases: [],
      },
      {
        onSuccess: (newTestSet) => {
          setNewTestSet({ name: '', description: '' });
          setIsAddingTestSet(false);
          setSelectedTestSet(newTestSet.id);
          notify({ type: 'success', message: '测试集创建成功' });
        },
        onError: (error) => {
          notify({ type: 'error', message: '创建测试集失败：' + (error?.message || '未知错误') });
        },
      },
    );
  };

  return (
    <Modal title="添加到评测集" isShow={isShow} onClose={onClose} className="overflow-visible">
      <div className="flex flex-col space-y-4 w-full">
        {/* Test Set Selection */}
        <div className="w-full">
          <div className="flex justify-between items-center my-4">
            <label className="text-sm font-medium text-gray-700">测试集列表</label>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              onClick={() => setIsAddingTestSet(true)}
            >
              <PlusIcon size={16} className="mr-1" />
              <span>新建测试集</span>
            </button>
          </div>

          <SimpleSelect
            placeholder="选择测试集"
            className="w-full"
            value={selectedTestSet}
            onSelect={(item) => setSelectedTestSet(item.value)}
            items={testSets.map((testSet) => ({
              value: testSet.id,
              name: testSet.name
            }))}
          />
        </div>

        {/* New Test Set Form */}
        {isAddingTestSet && (
          <div className="w-full border border-gray-200 rounded-md p-4 relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsAddingTestSet(false)}
            >
              <XIcon size={16} />
            </button>

            <h3 className="text-sm font-medium mb-3">新建测试集</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <Input
                  placeholder="输入测试集名称"
                  value={newTestSet.name}
                  onChange={(e) => setNewTestSet({ ...newTestSet, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <TextArea
                  placeholder="输入测试集描述（可选）"
                  value={newTestSet.description}
                  onChange={(e) => setNewTestSet({ ...newTestSet, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleAddTestSet}
                  isLoading={createTestSetMutation.isPending}
                  disabled={newTestSet.name.trim() === ''}
                >
                  创建测试集
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedTestSet}
            isLoading={isLoading}
          >
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TestSetModal;
