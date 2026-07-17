import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from './lib/context/AuthContext';
import { Layout } from './components/layout/Layout';

import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import SellPage from './pages/SellPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  }
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/book/:id" component={BookDetailPage} />
        <Route path="/sell" component={SellPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/chat/:id" component={ChatPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;