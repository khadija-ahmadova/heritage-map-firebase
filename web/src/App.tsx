import './index.css'
import {Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import Header from './components/Header.tsx';


function App() {
  return (
    <>
    <Header/>
      <Routes>
        <Route path='/' element={<LandingPage />}>
        </Route>
      </Routes>
    </>
  );
};

export default App
