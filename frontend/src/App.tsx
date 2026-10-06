import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Recommend from './pages/Recommend'
import Results from './pages/Results'

function App() {


  return (
    <>
          <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'ui-monospace, monospace',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            maxWidth: '360px',
          },
          success: {
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#1e293b',
            },
            style: {
              border: '1px solid rgba(245,158,11,0.3)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
            style: {
              border: '1px solid rgba(239,68,68,0.3)',
            },
          },
        }}
      />

    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recommend" element={<Recommend />} />
      <Route path="/results" element={<Results />} />
    </Routes>

    </>
  )
}

export default App
