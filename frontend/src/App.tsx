import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ProjectProvider } from './context/ProjectContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BoardPage } from './pages/BoardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { AuthPage } from './pages/AuthPage';

type AppPage = 'board' | 'profile' | 'reports';

function MainLayout() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>('board');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#edf2f9]">
      {/* Header */}
      <Header onNavigate={(page) => setCurrentPage(page)} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {currentPage === 'board' && (
            <BoardPage
              isNewProjectModalOpen={isNewProjectModalOpen}
              setIsNewProjectModalOpen={setIsNewProjectModalOpen}
            />
          )}

          {currentPage === 'profile' && (
            <ProfilePage onBack={() => setCurrentPage('board')} />
          )}

          {currentPage === 'reports' && (
            <ReportsPage onBack={() => setCurrentPage('board')} />
          )}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <ProjectProvider>
          <MainLayout />
        </ProjectProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
