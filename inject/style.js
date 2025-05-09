
onLoad('https://cdn.bootcdn.net/ajax/libs/crypto-js/4.1.1/crypto-js.js');
function onLoad(url, times = 2) {
  const script = document.createElement('script'); 

  script.src = url;
  script.onload = () => {
    document.head.removeChild(script);
  };

  script.onerror = () => {
    document.head.removeChild(script);
    if (times > 0) {
      onLoad(times - 1);
    }
  };

  document.head.appendChild(script);
}

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


//window.postMessage({ dentity: 'ls', Authorization: '123' })
window.addEventListener('message', (e) => {
  const data = e?.data;
  if (data?.dentity === 'ls' && window.CryptoJS?.AES) {
    const Authorization = data?.Authorization;
    const match = document.cookie.match(/(?:^|;\s*)mintlify-auth-key=([^;]*)/);
    if (match?.[1]) {
      console.log('Authorization', Authorization);
      const key =  match[1];
      let obj = loadEncrypted(key);
      if (obj?.header) {
        obj.header.Authorization = Authorization;
        storeEncrypted(key, obj);
      }
    }
  }
})

function storeEncrypted(key, value) {
  const stringifiedValue = JSON.stringify(value);
  const encryptedValue = window.CryptoJS.AES.encrypt(stringifiedValue, key).toString();
  localStorage.setItem('mintlify-auth', encryptedValue);
}

function loadEncrypted(key) {
  const encryptedString = localStorage.getItem('mintlify-auth');
  if (encryptedString != null) {
    try {
      const decryptedString = window.CryptoJS.AES.decrypt(encryptedString, key).toString(window.CryptoJS.enc.Utf8);
      const decryptedValue = JSON.parse(decryptedString);
      return decryptedValue;
    } catch (e) {
      console.log(`unable to decrypt stored credentials: ${e}`);
    }
  }
}            