import React from 'react';
import Configuration, { ConfigLayout } from './configuration';
import { LoginPage } from './login';
import '@cloudsop/eview-ui/style/aui3.1.less';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/user-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/protected-route';
import AgentsDashboard from './dashboard';
import Layout from './layout';
import Debugging from './debugging';
import { ToastProvider } from './components/base/toast';
import TestSetManager from './debugging/test-set-manager';
import TestExecutor from './debugging/test-executor';
import ResultsAnalyzer from './debugging/results-analyzer';
import './prel-mock';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Layout />}>
                <Route
                  index
                  element={
                    <ProtectedRoute>
                      <Navigate to="/apps" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/:id"
                  element={
                    <ProtectedRoute>
                      <ConfigLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="config" element={<Configuration />} />
                  <Route path="test" element={<Debugging />} />
                </Route>
                <Route
                  index
                  path="/apps"
                  element={
                    <ProtectedRoute>
                      <AgentsDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/debugging"
                  element={
                    <ProtectedRoute>
                      <Debugging />
                    </ProtectedRoute>
                  }
                >
                  <Route index path="testset" element={<TestSetManager />} />
                  <Route path="execution" element={<TestExecutor />} />
                  <Route path="results" element={<ResultsAnalyzer />} />
                </Route>
              </Route>

              {/* <Route path="*" element={<Configuration />} /> */}
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
