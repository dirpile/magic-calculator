import { useEffect, useMemo, useState } from 'react';

const buttons = [
  { label: 'AC', type: 'utility', action: 'clear' },
  { label: 'DEL', type: 'utility', action: 'delete' },
  { label: '%', type: 'utility', value: '%' },
  { label: '÷', type: 'operator', value: '÷' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '×', type: 'operator', value: '×' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '-', type: 'operator', value: '-' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '+', type: 'operator', value: '+' },
  { label: '0', value: '0', wide: true },
  { label: '.', value: '.' },
  { label: '=', type: 'equals', action: 'submit' },
];

const operatorPattern = /[+\-×÷]$/;

function normalizeForBaidu(value) {
  return value
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('％', '%')
    .trim();
}

function getCurrentNumber(value) {
  const parts = value.split(/[+\-×÷]/);
  return parts[parts.length - 1] ?? '';
}

function appendToken(display, token) {
  if (token === '.') {
    const currentNumber = getCurrentNumber(display);
    if (currentNumber.includes('.')) return display;
    return `${display}${token}`;
  }

  if (/[+×÷]/.test(token) || token === '-') {
    if (display === '0' && token !== '-') return display;
    if (display === '-' && token !== '-') return display;
    if (operatorPattern.test(display)) return `${display.slice(0, -1)}${token}`;
    return `${display}${token}`;
  }

  if (token === '%') {
    if (display === '0' || display === '-') return display;
    if (operatorPattern.test(display)) return display;
    return `${display}${token}`;
  }

  if (display === '0') return token;
  return `${display}${token}`;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [status, setStatus] = useState('等待输入');

  const baiduUrl = useMemo(() => {
    const query = normalizeForBaidu(display);
    return `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
  }, [display]);

  function clear() {
    setDisplay('0');
    setStatus('等待输入');
  }

  function removeLast() {
    setDisplay((current) => {
      const next = current.length > 1 ? current.slice(0, -1) : '0';
      return next === '-' ? '0' : next;
    });
    setStatus('已删除一位');
  }

  function submit() {
    const query = normalizeForBaidu(display);
    if (!query || query === '0' || operatorPattern.test(display) || display.endsWith('.')) {
      setStatus('表达式还没写完整');
      return;
    }

    setStatus('正在交给百度计算器');
    window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  }

  function press(button) {
    if (button.action === 'clear') {
      clear();
      return;
    }

    if (button.action === 'delete') {
      removeLast();
      return;
    }

    if (button.action === 'submit') {
      submit();
      return;
    }

    setDisplay((current) => appendToken(current, button.value));
    setStatus('本机不计算，等号会跳转');
  }

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key;

      if (/^\d$/.test(key)) {
        event.preventDefault();
        setDisplay((current) => appendToken(current, key));
        setStatus('本机不计算，等号会跳转');
        return;
      }

      const keyMap = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷',
        '.': '.',
        '%': '%',
      };

      if (keyMap[key]) {
        event.preventDefault();
        setDisplay((current) => appendToken(current, keyMap[key]));
        setStatus('本机不计算，等号会跳转');
        return;
      }

      if (key === 'Enter' || key === '=') {
        event.preventDefault();
        submit();
        return;
      }

      if (key === 'Backspace') {
        event.preventDefault();
        removeLast();
        return;
      }

      if (key === 'Escape') {
        event.preventDefault();
        clear();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display]);

  return (
    <main className="page-shell">
      <section className="calculator" aria-label="神奇计算器">
        <div className="brand-row">
          <span className="brand-mark" aria-hidden="true">
            =
          </span>
          <div>
            <h1>神奇计算器</h1>
            <p>{status}</p>
          </div>
        </div>

        <div className="screen" aria-live="polite">
          <span className="screen-label">表达式</span>
          <output>{display}</output>
        </div>

        <div className="keypad">
          {buttons.map((button) => (
            <button
              className={[
                'key',
                button.type ? `key-${button.type}` : '',
                button.wide ? 'key-wide' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={button.label}
              onClick={() => press(button)}
              type="button"
              aria-label={button.label === 'DEL' ? '删除' : button.label}
            >
              {button.label}
            </button>
          ))}
        </div>

        <a className="fallback-link" href={baiduUrl} target="_blank" rel="noreferrer">
          在新页面用当前表达式打开百度
        </a>
      </section>
    </main>
  );
}
