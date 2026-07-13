import React, { useState } from 'react';
import './QuestionNode.css';

const QuestionNode = ({ question, level = 1, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showChoiceDetail, setShowChoiceDetail] = useState(false);

  // Helper to handle text updates
  const handleTextChange = (lang, value) => {
    let newText = question.text;
    if (typeof newText === 'string') {
      newText = { [lang]: value };
    } else {
      newText = { ...newText, [lang]: value };
    }
    onUpdate(question.id, { text: newText });
  };

  const handleMarksChange = (e) => {
    onUpdate(question.id, { marks: e.target.value });
  };

  const handleDiagramRequiredChange = (e) => {
    onUpdate(question.id, { diagramRequired: e.target.checked });
  };

  // Rubrics
  const addRubric = () => {
    const newRubrics = [...(question.rubric || []), ''];
    onUpdate(question.id, { rubric: newRubrics });
  };

  const updateRubric = (index, value) => {
    const newRubrics = [...(question.rubric || [])];
    newRubrics[index] = value;
    onUpdate(question.id, { rubric: newRubrics });
  };

  const removeRubric = (index) => {
    const newRubrics = (question.rubric || []).filter((_, i) => i !== index);
    onUpdate(question.id, { rubric: newRubrics });
  };

  // Options
  const updateOptionText = (optIndex, lang, value) => {
    const newOptions = [...(question.options || [])];
    const opt = newOptions[optIndex];
    let newText = opt.text;
    if (typeof newText === 'string') {
      newText = { [lang]: value };
    } else {
      newText = { ...newText, [lang]: value };
    }
    newOptions[optIndex] = { ...opt, text: newText };
    onUpdate(question.id, { options: newOptions });
  };

  // Text values for rendering
  const enText = typeof question.text === 'object' ? (question.text?.en || '') : question.text;
  const hiText = typeof question.text === 'object' ? (question.text?.hi || '') : '';

  // Type badge helper
  const typeBadgeClass = question.type
    ? `type-badge type-badge--${question.type.toLowerCase()}`
    : null;

  // Check if choiceInformation has meaningful content
  const hasChoiceInfo = question.choiceInformation &&
    (question.choiceInformation.summary || question.choiceInformation.detailedDescription);

  // Check if matchData has meaningful content
  const hasMatchData = question.matchData &&
    ((question.matchData.matchFrom && question.matchData.matchFrom.length > 0) ||
      (question.matchData.matchTo && question.matchData.matchTo.length > 0));

  // Check if attachments have meaningful content
  const hasAttachments = question.attachments && question.attachments.length > 0;

  // Attachment icon lookup
  const getAttachmentIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('diagram')) return '📐';
    if (t.includes('graph')) return '📊';
    if (t.includes('image') || t.includes('photo')) return '🖼️';
    if (t.includes('table') || t.includes('matrix')) return '📋';
    if (t.includes('map')) return '🗺️';
    if (t.includes('circuit')) return '⚡';
    return '📎';
  };

  return (
    <div className={`level-${level} question-wrapper`}>
      <div className="question-node">
        <div className="question-header" onClick={() => setIsExpanded(!isExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h3 className="question-title">
              {question.id} {question.children && question.children.length > 0 ? `(${question.children.length} sub-questions)` : ''}
            </h3>
            {typeBadgeClass && (
              <span className={typeBadgeClass}>{question.type}</span>
            )}
            {question.marks && question.marks !== 'infer from children and choice description' && (
              <span style={{
                fontSize: '12px',
                color: '#94a3b8',
                background: 'rgba(148, 163, 184, 0.1)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.15)'
              }}>
                {question.marks} marks
              </span>
            )}
          </div>
          <span style={{ color: '#8b5cf6', fontSize: '14px' }}>{isExpanded ? '▼' : '▶'}</span>
        </div>

        {isExpanded && (
          <div className="question-body">

            {/* Choice Information Banner */}
            {hasChoiceInfo && (
              <div className="choice-info-banner">
                <div className="choice-info-header">
                  <span>🔀</span>
                  <span className="choice-info-label">Choice Information</span>
                </div>
                {question.choiceInformation.summary && (
                  <div className="choice-info-summary">{question.choiceInformation.summary}</div>
                )}
                {question.choiceInformation.detailedDescription && (
                  <>
                    <button
                      className="choice-info-toggle"
                      onClick={() => setShowChoiceDetail(!showChoiceDetail)}
                    >
                      {showChoiceDetail ? '▲ Hide details' : '▼ Show details'}
                    </button>
                    {showChoiceDetail && (
                      <div className="choice-info-detail">
                        {question.choiceInformation.detailedDescription}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Text Inputs */}
            <div className="field-group">
              <label>Question Text (English)</label>
              <textarea
                value={enText}
                onChange={(e) => handleTextChange('en', e.target.value)}
                placeholder="Question text in English..."
              />
            </div>

            <div className="field-group">
              <label>Question Text (Hindi)</label>
              <textarea
                value={hiText}
                onChange={(e) => handleTextChange('hi', e.target.value)}
                placeholder="Question text in Hindi..."
              />
            </div>

            {/* Marks & Diagram Required */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="field-group" style={{ flex: '1', minWidth: '150px' }}>
                <label>Marks</label>
                <input
                  type="text"
                  value={question.marks || ''}
                  onChange={handleMarksChange}
                  placeholder="e.g. 2, or infer..."
                />
              </div>
              <div className="checkbox-group" style={{ flex: '1', minWidth: '150px', marginTop: 'auto', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  id={`diagram-${question.id}`}
                  checked={!!question.diagramRequired}
                  onChange={handleDiagramRequiredChange}
                />
                <label htmlFor={`diagram-${question.id}`}>Diagram required in answer</label>
              </div>
            </div>

            {/* Attachments Panel */}
            {hasAttachments && (
              <div className="field-group">
                <label>Attachments ({question.attachments.length})</label>
                <div className="attachments-panel">
                  {question.attachments.map((att, i) => (
                    <div key={i} className="attachment-card">
                      <div className="attachment-icon">
                        {getAttachmentIcon(att.type)}
                      </div>
                      <div>
                        <div className="attachment-type">{att.type || 'Attachment'}</div>
                        <div className="attachment-desc">{att.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MCQ Options */}
            {question.options && question.options.length > 0 && (
              <div className="field-group">
                <label>Options</label>
                <div className="options-container">
                  {question.options.map((opt, i) => {
                    const optEnText = typeof opt.text === 'object' ? (opt.text?.en || '') : opt.text;
                    const optHiText = typeof opt.text === 'object' ? (opt.text?.hi || '') : '';
                    return (
                      <div key={opt.optionId || i} className="option-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 600 }}>Option {opt.optionId}</div>
                        <input
                          type="text"
                          value={optEnText}
                          onChange={(e) => updateOptionText(i, 'en', e.target.value)}
                          placeholder="Option text (EN)"
                        />
                        <input
                          type="text"
                          value={optHiText}
                          onChange={(e) => updateOptionText(i, 'hi', e.target.value)}
                          placeholder="Option text (HI)"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MTF Match Data Table */}
            {hasMatchData && (
              <div className="field-group">
                <label>Match The Following</label>
                <div className="match-table-wrapper">
                  <table className="match-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50%' }}>Match From</th>
                        <th style={{ width: '50%' }}>Match To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({
                        length: Math.max(
                          (question.matchData.matchFrom || []).length,
                          (question.matchData.matchTo || []).length
                        )
                      }).map((_, i) => {
                        const from = (question.matchData.matchFrom || [])[i];
                        const to = (question.matchData.matchTo || [])[i];
                        return (
                          <tr key={i}>
                            <td>
                              {from ? (
                                <>
                                  {from.en && <div><span className="match-lang-label">EN</span>{from.en}</div>}
                                  {from.hi && <div style={{ marginTop: '4px' }}><span className="match-lang-label">HI</span>{from.hi}</div>}
                                </>
                              ) : '—'}
                            </td>
                            <td>
                              {to ? (
                                <>
                                  {to.en && <div><span className="match-lang-label">EN</span>{to.en}</div>}
                                  {to.hi && <div style={{ marginTop: '4px' }}><span className="match-lang-label">HI</span>{to.hi}</div>}
                                </>
                              ) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Rubrics */}
            <div className="field-group">
              <label>Rubrics</label>
              <div className="rubrics-container">
                {(question.rubric || []).map((rubricItem, i) => (
                  <div key={i} className="rubric-item">
                    <input
                      type="text"
                      value={rubricItem}
                      onChange={(e) => updateRubric(i, e.target.value)}
                      placeholder="Enter rubric criterion..."
                    />
                    <button className="btn-icon" onClick={() => removeRubric(i)} title="Remove Rubric">✕</button>
                  </div>
                ))}
                <button className="btn-secondary" onClick={addRubric}>+ Add Rubric</button>
              </div>
            </div>

            {/* Nested Children */}
            {question.children && question.children.length > 0 && (
              <div className="children-container">
                {question.children.map(child => (
                  <QuestionNode
                    key={child.id}
                    question={child}
                    level={level + 1}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionNode;
