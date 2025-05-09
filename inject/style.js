
if (window.self !== window.top) {
  const style = document.createElement('style');
  style.innerHTML = `
  #navbar {
    display: none !important;
  }
  #sidebar {
    top: 0px !important;
    right: 32px !important;
    left: auto !important;
  }
  #sidebar-content {
    padding-left: 32px !important;
    padding-right: 0px !important;
  }  
  
  div:has(> #content-container) {
    max-width: 100% !important;
  }
  
  #content-container > div {
    padding-top: 20px !important;
    padding-right: 0px !important;
    gap: 24px !important;
  }  
  
  #content-area {
    margin-left: 0px !important;
    padding-left: 0px !important;
    padding-right: 0px !important;
    order: 2;
  }
  
  #content-side-layout {
    order: 1;
    top: 10px !important;
  }
  #table-of-contents-layout {
    padding-left: 0px !important;
    width: 14rem !important;
  }  
  
  #table-of-contents {
    width: 13.5rem !important;
  }
  
  @media (min-width: 850px) {
    #sidebar {
      display: block !important;
    }
  
    #content-container {
      padding-right: 300px !important;
    } 
  
    
    div:has(> #content-container) {
      padding-right: 32px !important;
      padding-left: 48px !important;
    }
  }
  
  `;
  document.head.appendChild(style);
}

if (window.self !== window.top) {
  const style = document.createElement('style');
  style.innerHTML = `
  div:has(> div > div > div > div > div > input[placeholder="enter bearer token"]) {
    display: none !important;
  }
    `;
  document.head.appendChild(style);
}