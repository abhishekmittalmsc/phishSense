import React from 'react';
import './HighlightedEmailBody.css';

interface HighlightedEmailBodyProps {
  emailBody: string;
  highlightedPhrases: string[];
}

const HighlightedEmailBody: React.FC<HighlightedEmailBodyProps> = ({ emailBody, highlightedPhrases }) => {
  const getHighlightedText = () => {
    let text = emailBody;
    highlightedPhrases.forEach(phrase => {
      const regex = new RegExp(`(${phrase})`, 'gi');
      text = text.replace(regex, '<mark>$1</mark>');
    });
    return { __html: text };
  };

  return (
    <div className="highlighted-email-body">
      <h3>Email Content</h3>
      <div
        className="email-content"
        dangerouslySetInnerHTML={getHighlightedText()}
      />
    </div>
  );
};

export default HighlightedEmailBody;