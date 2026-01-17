
import { useLanguage } from "../context/LanguageContext";

export default function Dashboard({ onLogout }) {
  const { dir } = useLanguage();

  return (
    
      <div dir={dir} className="flex min-h-screen w-full">
        <h1>HELLO WORLD</h1>
      </div>
   
  );
}