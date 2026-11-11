import React from 'react';

/**
 * Reusable UNIX Terminal Card
 * Renders a stylized CLI interface signaling technical developer fluency
 */
export function TerminalCard({
  user = 'hil@portfolio',
  path = '~',
  command = 'whoami',
  output = 'data_analyst',
  secondaryCommand = 'toolkit --list',
  listItems = [
    '01 analysis & cleaning',
    '02 business intelligence',
    '03 databases & APIs',
    '04 data storytelling',
  ],
  readyText = 'ready to explore',
}) {
  return (
    <div className="terminal-card" aria-label="Terminal demonstration">
      <div className="terminal-bar">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <small>{user}:{path}</small>
      </div>
      <div className="terminal-body">
        <p>
          <b>$</b> {command}
        </p>
        <strong>{output}</strong>
        <p>
          <b>$</b> {secondaryCommand}
        </p>
        <div className="terminal-list">
          {listItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <span>{item.slice(0, 2)}</span> {item.slice(3)}
              <br />
            </React.Fragment>
          ))}
        </div>
        <p className="terminal-ready">
          <b>✓</b> {readyText}
        </p>
        <span className="cursor" aria-hidden="true">_</span>
      </div>
    </div>
  );
}

export default TerminalCard;
