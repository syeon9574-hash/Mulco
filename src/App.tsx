import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/common/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { SetupPage } from './pages/SetupPage';
import { MainPage } from './pages/MainPage';
import { ProfilePage } from './pages/ProfilePage';
import { DMPage } from './pages/DMPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/dm/:userId" element={<DMPage />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
