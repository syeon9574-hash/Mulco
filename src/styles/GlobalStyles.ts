import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

export const GlobalStyles = createGlobalStyle`
  ${reset}

  /* Import Google Fonts and Icons */
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

  /* Material Symbols styling */
  .ms {
    font-family: 'Material Symbols Rounded';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
  }

  :root {
    --bg: #F9F9F7;
    --main: #D1E6E8;
    --sub: #E2EFE7;
    --point: #3A6073;
    --text: #2C2C2C;
    --muted: #E0E0DB;
    --white: #FFFFFF;
    --danger: #FF4D62;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 24px;
    --transition: all 0.25s ease;
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
    --font: 'Noto Sans KR', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: #f0f0f2;
    font-family: var(--font);
    color: var(--text);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root {
    width: 100%;
    max-width: 430px;
    min-height: 100vh;
    background-color: var(--bg);
    box-shadow: 0 0 32px rgba(0, 0, 0, 0.08);
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
  .text-muted { color: var(--muted); }
  .text-point { color: var(--point); }
  .text-sm { font-size: 0.8rem; }
  
  /* Animations */
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pageSlideIn {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
