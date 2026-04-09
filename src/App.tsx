import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { AuthGuard } from './components/layout/AuthGuard';
import { ToastContainer } from './components/ui/Toast';
import { ToastContext, useToastState } from './hooks/useToast';
import { LandingPage } from './routes/LandingPage';
import { AuthPage } from './routes/AuthPage';
import { Dashboard } from './routes/Dashboard';
import { MeetingEditor } from './routes/MeetingEditor';
import { BingoBoard } from './routes/BingoBoard';
import { LiveView } from './routes/LiveView';
import { ResetPasswordPage } from './routes/ResetPasswordPage';

export default function App() {
  const toast = useToastState();

  return (
    <ToastContext.Provider value={toast}>
      <BrowserRouter>
        <Routes>
          {/* Public routes without header */}
          <Route path="/live/:shareCode" element={<LiveView />} />

          {/* Routes with header */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route
                      path="/dashboard"
                      element={
                        <AuthGuard>
                          <Dashboard />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/meeting/new"
                      element={
                        <AuthGuard>
                          <MeetingEditor />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/meeting/:id/edit"
                      element={
                        <AuthGuard>
                          <MeetingEditor />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/meeting/:id/play"
                      element={
                        <AuthGuard>
                          <BingoBoard />
                        </AuthGuard>
                      }
                    />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </ToastContext.Provider>
  );
}
