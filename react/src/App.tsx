import './App.css'
import MainContainer from './pages/MainContainer'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'

import { AnimatePresence } from 'framer-motion';

import { BrowserRouter as Router, Routes, Route, useLocation  } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { RequireUnAuth } from './components/RequireUnAuth';
import { EncryptionProvider } from './components/context/EncryptionContext'

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={
                                <HomePage />
    } />
                    <Route path="/register" element={
                            <RequireUnAuth>
                                <RegisterPage />
                            </RequireUnAuth>} />
                    <Route path="/login" element={ 
                            <RequireUnAuth>
                                <LoginPage />
                            </RequireUnAuth>} />
                    <Route path="/editor" element={
                            <RequireAuth>
                                <MainContainer />
                            </RequireAuth> } />
                </Routes>
        </AnimatePresence>
    );
}


function App() {
  return (
    <>
      <EncryptionProvider>
        <Router>
            <AnimatedRoutes />
        </Router>
      </EncryptionProvider>
    </>
  )
}

export default App
