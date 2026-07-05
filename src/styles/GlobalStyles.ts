import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

export const GlobalStyles = createGlobalStyle`
  ${reset}

  /* Import Google Fonts and Icons */
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,300,0,0&display=block');

  /* Material Symbols styling */
  .ms {
    font-family: 'Material Symbols Rounded';
    font-weight: normal;
    font-style: normal;
    font-size: 22px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
    user-select: none;
    pointer-events: none;
  }

  :root {
    --bg: #FDF9F7;
    --main: #FFE5E5;
    --sub: #EAF6EC;
    --point: #FF8E9E;
    --point-dark: #E57385;
    --text: #3C3535;
    --text-light: #8A7E7E;
    --muted: #F3EAEA;
    --muted-dark: #DBC5C5;
    --white: #ffffff;
    --danger: #FF8383;
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --radius-full: 9999px;
    --shadow-sm: 0 4px 10px rgba(255,142,158,0.06);
    --shadow-md: 0 6px 20px rgba(255,142,158,0.12);
    --shadow-lg: 0 10px 30px rgba(255,142,158,0.16);
    --transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    --font: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow-x: hidden;
  }

  #root {
    width: 100%;
    max-width: 500px;
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.05);
  }

  input, button, textarea {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    border: none;
    outline: none;
  }

  button {
    cursor: pointer;
    background: none;
  }

  /* Utility classes */
  .text-center { text-align: center; }
  .text-muted { color: var(--text-light); }
  .text-point { color: var(--point); }
  .text-sm { font-size: 0.8rem; }
  .spacer { flex: 1; }
  .divider { height: 1px; background: var(--muted); margin: 4px 0; }
  
  /* Animations */
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0px); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
