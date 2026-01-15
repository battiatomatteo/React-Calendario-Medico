import React from "react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const Section: React.FC<SectionProps> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="section">
      <button className="section-title" onClick={onToggle}>
        {title}
      </button>
      {isOpen && <div className="section-content">{children}</div>}
    </div>
  );
};

export default Section;
