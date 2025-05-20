import React, { useState } from 'react';
import { TetherProvider } from './context/TetherContext';
import { KitblockProvider } from './context/KitblockContext';
import Dashboard from './pages/Dashboard';
import TetherPage from './pages/TetherPage';
import KitblocksPage from './pages/KitblocksPage';
import TetherForm from './components/TetherForm';
import { useTether } from './context/TetherContext';
import { Clock, Blocks, Settings, Check, ChevronLeft } from 'lucide-react';

// App wrapper to use context
const AppContent: React.FC = () => {
  const { tethers, createTether, updateTether, startTether, activeTether } = useTether();
  const [view, setView] = useState<'dashboard' | 'create' | 'edit' | 'active' | 'blocks'>('dashboard');
  const [editingTetherId, setEditingTetherId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('grounded');
  
  const themes = [
    {
      id: 'grounded',
      name: 'Grounded Serenity',
      description: 'Natural & calming theme ideal for reducing overwhelm',
      colors: {
        bg: 'bg-rope-50',
        text: 'text-navy-800',
        accent: 'text-navy-500',
        surface: 'bg-white',
        highlight: 'bg-rope-100'
      }
    },
    {
      id: 'deep-focus',
      name: 'Deep Focus',
      description: 'Modern & minimal theme for enhanced concentration',
      colors: {
        bg: 'bg-charcoal-800',
        text: 'text-cloud-300',
        accent: 'text-signal-500',
        surface: 'bg-slate-800',
        highlight: 'bg-slate-700'
      }
    },
    {
      id: 'chrono-loop',
      name: 'Chrono Loop',
      description: 'Time-oriented theme with a touch of magic',
      colors: {
        bg: 'bg-twilight-800',
        text: 'text-sundial-400',
        accent: 'text-oceanteal-500',
        surface: 'bg-twilight-900',
        highlight: 'bg-twilight-700'
      }
    },
    {
      id: 'warm-tech',
      name: 'Warm Tech',
      description: 'Tech-enabled but emotionally safe interface',
      colors: {
        bg: 'bg-warm-tech-soft',
        text: 'text-warm-tech-sand',
        accent: 'text-warm-tech-blue',
        surface: 'bg-warm-tech-taupe',
        highlight: 'bg-warm-tech-ivory'
      }
    },
    {
      id: 'bubblegum',
      name: 'Bubblegum Bloom',
      description: 'Playful and energetic with a soft touch',
      colors: {
        bg: 'bg-bubblegum-50',
        text: 'text-bubblegum-900',
        accent: 'text-lavender-500',
        surface: 'bg-cotton-100',
        highlight: 'bg-lavender-300'
      }
    },
    {
      id: 'junk-punk',
      name: 'Junk Punk',
      description: 'Raw, grungy theme with a splash of neon rebellion',
      colors: {
        bg: 'bg-junkpunk-700',
        text: 'text-junkpunk-100',
        accent: 'text-neonpunk-300',
        surface: 'bg-junkpunk-800',
        highlight: 'bg-junkpunk-600'
      }
    }
  ];
  
  const handleStartTether = (id: string) => {
    startTether(id);
    setView('active');
  };
  
  const handleCreateTether = (name: string, tasks: any[], startTime?: string) => {
    createTether(name, tasks, startTime);
    setView('dashboard');
  };
  
  const handleUpdateTether = (name: string, tasks: any[], startTime?: string) => {
    if (editingTetherId) {
      updateTether(editingTetherId, name, tasks, startTime);
      setEditingTetherId(null);
      setView('dashboard');
    }
  };
  
  const handleEditTether = (id: string) => {
    setEditingTetherId(id);
    setView('edit');
  };

  const handleThemeSelect = (themeId: string) => {
    setCurrentTheme(themeId);
    setShowThemes(false);
    setShowSettings(false);
  };

  const currentThemeColors = themes.find(t => t.id === currentTheme)?.colors || themes[0].colors;
  
  const renderContent = () => {
    if (view === 'active') {
      return <TetherPage onExit={() => setView('dashboard')} />;
    }
    
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            onCreateNew={() => setView('create')}
            onEdit={handleEditTether}
            onStart={handleStartTether}
            onResumeActive={() => setView('active')}
          />
        );
      
      case 'create':
        return (
          <div className="container mx-auto max-w-2xl p-6">
            <h1 className={`text-2xl font-bold ${currentThemeColors.text} mb-6`}>Create New Tether</h1>
            <TetherForm
              onSave={handleCreateTether}
              onCancel={() => setView('dashboard')}
            />
          </div>
        );
      
      case 'edit':
        const tetherToEdit = tethers.find(t => t.id === editingTetherId);
        return (
          <div className="container mx-auto max-w-2xl">
            <div className="relative flex items-center justify-center h-14 px-4 mb-4">
              <button 
                onClick={() => {
                  setEditingTetherId(null);
                  setView('dashboard');
                }}
                className="absolute left-4 w-9 h-9 bg-Tidewake-buttonBg text-Tidewake-textBright rounded-full flex items-center justify-center shadow"
              >
                <ChevronLeft size={20} />
              </button>

              <h1 className="text-lg font-bold text-Tidewake-textBright">Edit Tether</h1>

              <button 
                onClick={() => setShowSettings(true)}
                className="absolute right-4 w-9 h-9 bg-Tidewake-buttonBg text-Tidewake-textBright rounded-full flex items-center justify-center shadow"
              >
                <Settings size={20} />
              </button>
            </div>

            {tetherToEdit && (
              <div className="px-6">
                <TetherForm
                  tether={tetherToEdit}
                  onSave={handleUpdateTether}
                  onCancel={() => {
                    setEditingTetherId(null);
                    setView('dashboard');
                  }}
                />
              </div>
            )}
          </div>
        );

      case 'blocks':
        return <KitblocksPage />;
        
      default:
        return (
          <Dashboard 
            onCreateNew={() => setView('create')}
            onEdit={handleEditTether}
            onStart={handleStartTether}
          />
        );
    }
  };
  
  return (
    <div className={`min-h-screen ${currentThemeColors.bg}`}>
      {renderContent()}
    </div>
  );
};

function App() {
  return (
    <TetherProvider>
      <KitblockProvider>
        <AppContent />
      </KitblockProvider>
    </TetherProvider>
  );
}

export default App;