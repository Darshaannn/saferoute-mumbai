import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  en: {
    brand_name: "Disha",
    brand_sub: "(Safe Route)",
    nav_map: "Map",
    nav_journey: "Journey",
    nav_dashboard: "Dashboard",
    nav_safety_guide: "Safety Guide",
    nav_rights: "Rights",
    nav_fake_call: "Fake Call",
    nav_sos: "SOS 112",
    nav_lang: "Language",
    eyebrow: "Mumbai · Safety & Civic Mobility",
    hero_title_1: "Know more",
    hero_title_2: "before you ",
    hero_title_3: "move.",
    hero_desc: "Compare routes by nearby police and medical resources, explore Mumbai's safety infrastructure, and reach emergency support quickly.",
    btn_plan_journey: "Plan a journey",
    btn_explore_map: "Explore safety map",
    call_112: "Call 112",
    women_helpline_103: "Women Helpline 103",
    rail_madad_139: "RailMadad 139",
    disclaimer_tag: "Civic Open Data & Multi-Modal Routing"
  },
  hi: {
    brand_name: "दिशा",
    brand_sub: "(सुरक्षित मार्ग)",
    nav_map: "सुरक्षा नक्शा",
    nav_journey: "सुरक्षित यात्रा",
    nav_dashboard: "डैशबोर्ड",
    nav_safety_guide: "सुरक्षा गाइड",
    nav_rights: "अधिकार व नियम",
    nav_fake_call: "फेक कॉल",
    nav_sos: "आपातकालीन 112",
    nav_lang: "भाषा",
    eyebrow: "मुंबई · नागरिक सुरक्षा एवं सुरक्षित आवागमन",
    hero_title_1: "निकलने से पहले",
    hero_title_2: "मार्ग की सुरक्षा ",
    hero_title_3: "जानें।",
    hero_desc: "नजदीकी पुलिस थानों और 24/7 अस्पतालों के आधार पर मार्गों की तुलना करें और आपातकालीन स्थिति में तुरंत सहायता प्राप्त करें।",
    btn_plan_journey: "सुरक्षित यात्रा प्लान करें",
    btn_explore_map: "सुरक्षा नक्शा देखें",
    call_112: "कॉल करें 112",
    women_helpline_103: "महिला हेल्पलाइन 103",
    rail_madad_139: "रेल मदद 139",
    disclaimer_tag: "ओपन डेटा एवं बहु-मॉडल सुरक्षित मार्ग"
  },
  mr: {
    brand_name: "दिशा",
    brand_sub: "(सुरक्षित मार्ग)",
    nav_map: "सुरक्षा नकाशा",
    nav_journey: "सुरक्षित प्रवास",
    nav_dashboard: "डॅशबोर्ड",
    nav_safety_guide: "सुरक्षा मार्गदर्शक",
    nav_rights: "कायदेशीर हक्क",
    nav_fake_call: "फेक कॉल",
    nav_sos: "तातडीची मदत 112",
    nav_lang: "भाषा",
    eyebrow: "मुंबई · महिला व नागरिक सुरक्षा मार्ग",
    hero_title_1: "प्रवासाला निघण्यापूर्वी",
    hero_title_2: "रस्त्याची सुरक्षितता ",
    hero_title_3: "जाणून घ्या.",
    hero_desc: "जवळपासचे पोलीस ठाणे आणि २४/७ रुग्णालय सुविधेनुसार सुरक्षित मार्गांची पडताळणी करा व तातडीची मदत मिळवा.",
    btn_plan_journey: "सुरक्षित प्रवास आखा",
    btn_explore_map: "सुरक्षा नकाशा पहा",
    call_112: "कॉल करा 112",
    women_helpline_103: "महिला हेल्पलाईन 103",
    rail_madad_139: "रेल्वे मदत 139",
    disclaimer_tag: "अधिकृत मुंबई डेटा व सुरक्षित मार्ग"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('disha_language') || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('disha_language', language);
    } catch (e) {
      console.warn("Storage error for language", e);
    }
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
