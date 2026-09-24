import React, { useState } from 'react';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { Navbar } from './components/Navbar';
import { CleanButtonPortal } from './components/CleanButtonPortal';
import { LoginModal } from './components/LoginModal';
import { ToastContainer } from './components/ToastContainer';

function DashboardContent() {
  const { currentUser } = useWorkflow();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/15 to-slate-100/50 text-slate-900 flex flex-col font-sans selection:bg-[#0f9d58] selection:text-white">
      {/* Main Top Navigation: D2D on left, active department in center, settings & logout on right */}
      <Navbar
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {!currentUser ? (
          /* When page opens or refreshes: Login option appears first immediately */
          <LoginModal isOpen={true} inline={true} />
        ) : (
          /* Colorful Clean Buttons Portal once logged in */
          <CleanButtonPortal
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            isSettingsOpen={isSettingsModalOpen}
            setIsSettingsOpen={setIsSettingsModalOpen}
          />
        )}
      </main>

      {/* Switch Department Modal (only when user is already logged in and requests switch) */}
      {currentUser && isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          canDismiss={true}
        />
      )}

      {/* Floating Notifications */}
      <ToastContainer />

      {/* Clean Minimal Footer: Made by Manoj with red heart */}
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-4 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-1.5">
          <span className="text-slate-600 font-medium">Made by Two Fellows</span>
          <span className="text-red-500 text-xs inline-block transform hover:scale-125 transition-transform select-none" title="Love">
            😎
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WorkflowProvider>
      <DashboardContent />
    </WorkflowProvider>
  );
}
