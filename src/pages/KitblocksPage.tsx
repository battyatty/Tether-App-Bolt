import React, { useState } from 'react';
import { useKitblock } from '../context/KitblockContext';
import { useTether } from '../context/TetherContext';
import KitblockCard from '../components/KitblockCard';
import KitblockForm from '../components/KitblockForm';
import { Plus, Blocks } from 'lucide-react';
import { Kitblock } from '../types';

const KitblocksPage: React.FC = () => {
  const { Kitblocks, createKitblock, updateKitblock, deleteKitblock, duplicateKitblock } = useKitblock();
  const { createTether } = useTether();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const handleCreateBlock = (name: string, description: string | undefined, tasks: Task[]) => {
    createKitblock(name, description, tasks);
    setView('list');
  };

  const handleUpdateBlock = (name: string, description: string | undefined, tasks: Task[]) => {
    if (editingBlockId) {
      updateKitblock(editingBlockId, name, description, tasks);
      setEditingBlockId(null);
      setView('list');
    }
  };

  const handleEditBlock = (id: string) => {
    setEditingBlockId(id);
    setView('edit');
  };

  const handleUseBlock = (block: Kitblock) => {
    createTether(block.name, block.tasks);
  };

  const renderContent = () => {
    switch (view) {
      case 'create':
        return (
          <div className="container mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Kitblock</h1>
            <KitblockForm
              onSave={handleCreateBlock}
              onCancel={() => setView('list')}
            />
          </div>
        );

      case 'edit':
        const blockToEdit = Kitblocks.find(b => b.id === editingBlockId);
        return (
          <div className="container mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Kitblock</h1>
            {blockToEdit && (
              <KitblockForm
                block={blockToEdit}
                onSave={handleUpdateBlock}
                onCancel={() => {
                  setEditingBlockId(null);
                  setView('list');
                }}
              />
            )}
          </div>
        );

      default:
        return (
          <div className="container mx-auto max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Kitblocks</h1>
              <button
                onClick={() => setView('create')}
                className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Plus size={18} className="mr-2" />
                New Block
              </button>
            </div>

            <div className="space-y-4">
              {Kitblocks.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Blocks className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't created any Kitblocks yet.</p>
                  <button
                    onClick={() => setView('create')}
                    className="inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Block
                  </button>
                </div>
              ) : (
                Kitblocks.map(block => (
                  <KitblockCard
                    key={block.id}
                    block={block}
                    onEdit={handleEditBlock}
                    onDelete={deleteKitblock}
                    onDuplicate={duplicateKitblock}
                    onUse={handleUseBlock}
                  />
                ))
              )}
            </div>
          </div>
        );
    }
  };

  return renderContent();
};

export default KitblocksPage;