import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SafetyMap from './pages/SafetyMap';
import SafeJourney from './pages/SafeJourney';
import AIAssistant from './pages/AIAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navigation />
        <main className="pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<SafetyMap />} />
            <Route path="/journey" element={<SafeJourney />} />
            <Route path="/assistant" element={<AIAssistant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
