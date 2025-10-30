
import React from 'react';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-['Cairo']">
        <h1 className="text-4xl font-bold mb-2 text-cyan-400">شات بوت محمد</h1>
        <p className="text-gray-400 mb-8">مساعدك الذكي والمتطور</p>
        <div className="w-full max-w-2xl h-[70vh] flex flex-col">
            <Chatbot />
        </div>
    </div>
  );
};

export default App;
