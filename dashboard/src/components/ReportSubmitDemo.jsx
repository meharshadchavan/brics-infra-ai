import React, { useState } from 'react';
import { Send, Sparkles, Database, CheckCircle2, Languages, MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';

const SAMPLE_TEXTS = {
  English: "There is a massive pothole on MG Road near the metro station causing severe traffic jams.",
  Hindi: "मेट्रो स्टेशन के पास एमजी रोड पर एक बड़ा गड्ढा है जिससे भारी जाम लग रहा है।",
  Tamil: "மெட்ரோ நிலையம் அருகே எம்.ஜி சாலையில் ஒரு பெரிய பள்ளம் உள்ளது, இதனால் கடுமையான போக்குவரத்து நெரிசல் ஏற்படுகிறது.",
  Russian: "На улице Ленина возле станции метро огромная яма, вызывающая серьезные пробки.",
  Portuguese: "Há um buraco enorme na Avenida Paulista perto da estação de metrô causando grandes congestionamentos."
};

const ReportSubmitDemo = ({ onSimulateComplete }) => {
  const [text, setText] = useState(SAMPLE_TEXTS.English);
  const [lang, setLang] = useState('English');
  const [pincode, setPincode] = useState('411001');
  const [status, setStatus] = useState('idle'); // idle, processing, success
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('');

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    setText(SAMPLE_TEXTS[newLang] || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;

    setStatus('processing');
    setResult(null);

    // Simulate multi-step processing for visual effect
    setStep('Translating and structuring raw input...');
    await new Promise(r => setTimeout(r, 800));
    
    setStep('Analyzing context with Gemini AI...');
    await new Promise(r => setTimeout(r, 1200));

    setStep('Categorizing and assigning priority...');
    await new Promise(r => setTimeout(r, 800));

    setStep('Saving to geo-database...');
    
    try {
      // Simulate API call
      // await axios.post('/api/simulate', { text, lang, pincode });
      await new Promise(r => setTimeout(r, 600));
      
      const mockResult = {
        translatedText: "There is a massive pothole on MG Road near the metro station causing severe traffic jams.",
        category: "Roads",
        urgencyScore: 4,
        district: "Pune Central",
        detectedEntities: ["pothole", "MG Road", "metro station", "traffic jams"]
      };
      
      setResult(mockResult);
      setStatus('success');
      
      if (onSimulateComplete) {
        onSimulateComplete();
      }
      
      // Reset after a while
      setTimeout(() => {
        setStatus('idle');
        setStep('');
        setResult(null);
      }, 5000);
      
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert('Failed to submit demo report');
    }
  };

  return (
    <div className="h-full flex">
      {/* Left side: Form */}
      <div className="w-1/2 p-5 border-r border-slate-800 flex flex-col">
        <div className="flex items-center gap-2 mb-3 text-slate-300 font-semibold text-sm">
          <Sparkles size={16} className="text-primary" /> 
          Live Demo: Submit Citizen Report
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center bg-slate-800/80 rounded-md border border-slate-700 px-3 py-1.5 focus-within:border-primary transition-colors">
              <Languages size={14} className="text-slate-400 mr-2" />
              <select 
                value={lang} 
                onChange={handleLangChange}
                className="bg-transparent text-sm text-slate-200 outline-none w-full appearance-none"
                disabled={status !== 'idle'}
              >
                {Object.keys(SAMPLE_TEXTS).map(l => (
                  <option key={l} value={l} className="bg-slate-800 text-slate-200">{l}</option>
                ))}
              </select>
            </div>
            
            <div className="w-32 flex items-center bg-slate-800/80 rounded-md border border-slate-700 px-3 py-1.5 focus-within:border-primary transition-colors">
              <MapPin size={14} className="text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Pincode"
                className="bg-transparent text-sm text-slate-200 outline-none w-full"
                disabled={status !== 'idle'}
              />
            </div>
          </div>
          
          <div className="flex gap-3 flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-slate-800/80 rounded-md border border-slate-700 p-3 text-sm text-slate-200 resize-none outline-none focus:border-primary transition-colors"
              placeholder="Describe the infrastructure issue..."
              disabled={status !== 'idle'}
            />
            
            <button 
              type="submit"
              disabled={status !== 'idle' || !text}
              className="bg-primary hover:bg-primary-dark text-white rounded-md px-4 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 min-w-[100px]"
            >
              {status === 'idle' ? (
                <>
                  <Send size={18} />
                  <span className="text-xs font-semibold">Submit</span>
                </>
              ) : (
                <Loader2 size={20} className="animate-spin" />
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Right side: Pipeline visualization */}
      <div className="w-1/2 p-5 bg-slate-900/40 relative overflow-hidden">
        {status === 'idle' && !result && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Database size={32} className="mb-2 opacity-50" />
            <p className="text-sm text-center px-8">Submit a report to see the AI processing pipeline in real-time.</p>
          </div>
        )}
        
        {status === 'processing' && (
          <div className="h-full flex flex-col justify-center max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> AI Processing Pipeline
            </h3>
            
            <div className="relative border-l-2 border-slate-700 ml-3 pl-6 py-2 space-y-4">
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary pulse-red"></div>
                <p className="text-sm text-slate-200">{step}</p>
              </div>
            </div>
          </div>
        )}
        
        {status === 'success' && result && (
          <div className="h-full flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-2 text-success mb-3">
              <CheckCircle2 size={18} />
              <span className="text-sm font-semibold">Processed Successfully</span>
            </div>
            
            <div className="bg-slate-950 rounded border border-slate-800 p-3 text-xs font-mono text-slate-300 overflow-y-auto flex-1 custom-scrollbar">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSubmitDemo;
