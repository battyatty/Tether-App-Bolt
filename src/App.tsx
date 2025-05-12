import React, { useState } from 'react';
import { TetherProvider } from './context/TetherContext';
import { KitblockProvider } from './context/KitblockContext';
import Dashboard from './pages/Dashboard';
import TetherPage from './pages/TetherPage';
import KitblocksPage from './pages/KitblocksPage';
import TetherForm from './components/TetherForm';
import { useTether } from './context/TetherContext';
import { Clock, Blocks, Settings, Check } from 'lucide-react';

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
          <div className="container mx-auto max-w-2xl p-6">
            <h1 className={`text-2xl font-bold ${currentThemeColors.text} mb-6`}>Edit Tether</h1>
            {tetherToEdit && (
              <TetherForm
                tether={tetherToEdit}
                onSave={handleUpdateTether}
                onCancel={() => {
                  setEditingTetherId(null);
                  setView('dashboard');
                }}
              />
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
      {view !== 'active' && (
        <header className={`${currentThemeColors.surface} shadow-sm mb-6`}>
          <div className="container mx-auto py-4 px-6">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center cursor-pointer" 
                onClick={() => setView('dashboard')}
              >
                <Clock className={`${currentThemeColors.accent} mr-2`} size={24} />
                <h1 className={`text-2xl font-bold ${currentThemeColors.text}`}>Tether</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-4">
                  <button
                    onClick={() => setView('dashboard')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      view === 'dashboard'
                        ? `${currentThemeColors.surface} ${currentThemeColors.text}`
                        : `${currentThemeColors.text} opacity-80`
                    }`}
                  >
                    Tethers
                  </button>
                  <button
                    onClick={() => setView('blocks')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                      view === 'blocks'
                        ? `${currentThemeColors.surface} ${currentThemeColors.text}`
                        : `${currentThemeColors.text} opacity-80`
                    }`}
                  >
                    <Blocks size={18} className="mr-2" />
                    Kitblocks
                  </button>
                </nav>

                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-lg transition-colors ${
                      showSettings
                        ? `${currentThemeColors.surface} ${currentThemeColors.text}`
                        : `${currentThemeColors.text} opacity-80`
                    }`}
                  >
                    <Settings size={20} />
                  </button>

                  {showSettings && (
                    <div className={`absolute right-0 mt-2 w-48 ${currentThemeColors.surface} rounded-lg shadow-lg py-1 z-50`}>
                      <button
                        onClick={() => setShowThemes(true)}
                        className={`w-full text-left px-4 py-2 text-sm ${currentThemeColors.text} hover:${currentThemeColors.highlight} flex items-center justify-between`}
                      >
                        Theme
                        <span className={`${currentThemeColors.text} opacity-60`}>›</span>
                      </button>
                    </div>
                  )}

                  {showThemes && (
                    <div className={`absolute right-0 mt-2 w-64 ${currentThemeColors.surface} rounded-lg shadow-lg py-1 z-50`}>
                      <div className={`px-4 py-2 border-b border-opacity-10 ${currentThemeColors.text}`}>
                        <h3 className="text-sm font-medium">Select Theme</h3>
                      </div>
                      {themes.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeSelect(theme.id)}
                          className={`w-full text-left px-4 py-2 hover:${theme.colors.highlight} flex items-center justify-between group`}
                        >
                          <div>
                            <div className={`text-sm font-medium ${theme.colors.text}`}>
                              {theme.name}
                            </div>
                            <div className={`text-xs ${theme.colors.text} opacity-80`}>
                              {theme.description}
                            </div>
                          </div>
                          {currentTheme === theme.id && (
                            <Check size={16} className={theme.colors.accent} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}
      
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