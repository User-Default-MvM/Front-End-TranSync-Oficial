import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage("es")}
        className={`px-2 py-1 rounded ${i18n.language === "es" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      >
        ES
      </button>
      <button
        onClick={() => changeLanguage("en")}
        className={`px-2 py-1 rounded ${i18n.language === "en" ? "bg-green-600 text-white" : "bg-gray-200"}`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
