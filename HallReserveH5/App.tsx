
import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Detail } from './pages/Detail';
import { Success } from './pages/Success';
import { Admin } from './pages/Admin';
import { ViewState, Scenario } from './types';

function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const handleSelectScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setView(ViewState.DETAIL);
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setView(ViewState.HOME);
    setActiveScenario(null);
  };

  const handleOpenAdmin = () => {
    setView(ViewState.ADMIN);
    window.scrollTo(0, 0);
  };

  const handleBookingSuccess = (data: any) => {
    setSuccessData(data);
    setView(ViewState.SUCCESS);
    window.scrollTo(0, 0);
  };

  return (
    <div className="antialiased w-full max-w-[430px] mx-auto min-h-screen shadow-2xl relative overflow-hidden transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-[#050505] dark:text-gray-100">
      
      {view === ViewState.HOME && (
        <Home onSelectScenario={handleSelectScenario} onOpenAdmin={handleOpenAdmin} />
      )}

      {view === ViewState.DETAIL && activeScenario && (
        <Detail 
          scenario={activeScenario} 
          onBack={handleBackToHome}
          onSuccess={handleBookingSuccess}
        />
      )}

      {view === ViewState.SUCCESS && successData && (
        <Success 
          data={successData} 
          onHome={handleBackToHome} 
        />
      )}

      {view === ViewState.ADMIN && (
        <Admin onBack={handleBackToHome} />
      )}
    </div>
  );
}

export default App;
