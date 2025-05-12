const NEXT_PUBLIC_TRIEVE_API_KEY = 'tr-Ef0O1GG473PDFHfclCabtti5n0mHNolw';

function storeEncrypted(key, value) {
  if (window.injectSrcipt) {
    const cryptoJS = window.injectSrcipt(36023);
    if (cryptoJS) {
      const aes = window.injectSrcipt.n(cryptoJS)();
      const stringifiedValue = JSON.stringify(value);
      const encryptedValue = aes.AES.encrypt(stringifiedValue, key).toString();
      localStorage.setItem('mintlify-auth', encryptedValue);
    }
  }
}

function loadEncrypted(key) {
  if (window.injectSrcipt) {
    const cryptoJS = window.injectSrcipt(36023);
    if (cryptoJS) {
      const encryptedString = localStorage.getItem('mintlify-auth');
      if (encryptedString != null) {
        try {
          const decryptedString = aes.AES.decrypt(encryptedString, key).toString(aes.enc.Utf8);
          const decryptedValue = JSON.parse(decryptedString);
          return decryptedValue;
        } catch (e) {
          console.log(`unable to decrypt stored credentials: ${e}`);
        }
      }
    }
  }
}
//window.postMessage({ dentity: 'ls', Authorization: '123' })
window.addEventListener('message', (e) => {
  const data = e?.data;
  if (data?.dentity === 'ls') {
    if (data.Authorization) {
      const Authorization = data.Authorization;
      const match = document.cookie.match(/(?:^|;\s*)mintlify-auth-key=([^;]*)/);
      if (match?.[1]) {
        console.log('Authorization', Authorization);
        const key = match[1];
        let obj = loadEncrypted(key);
        if (obj?.header) {
          obj.header.Authorization = Authorization;
          storeEncrypted(key, obj);
        }
      }
    }
  }
})

if (window.injectSrcipt) {
  // if (window.__NEXT_DATA__) {
  //   window.__NEXT_DATA__.props.pageProps.subdomain = "docs.hhw31.com";
  //   window.__NEXT_DATA__.props.pageProps.actualSubdomain = "hc-2ade1025";
  //   window.__NEXT_DATA__.props.pageProps.trieve = {
  //     "datasetId": "236e3901-9a2c-46db-9c07-13723d537375"
  //   }
  // }

  const F9 = window.injectSrcipt(65289)?.F9;
  if (F9) {
    F9.ENV = 'production';
    F9.TRIEVE_API_KEY = NEXT_PUBLIC_TRIEVE_API_KEY;
  }

  // const jsx = window.injectSrcipt(52322)?.jsx;
  // const jb = window.injectSrcipt(63326)?.Jb;
  // if (jsx && jb) {
  //   jsx(jb.Provider, {
  //     value: {
  //       "subdomain": "docs.hhw31.com",
  //       "actualSubdomain": "hc-2ade1025",
  //       "trieve": {
  //           "datasetId": "236e3901-9a2c-46db-9c07-13723d537375"
  //       },
  //     }
  //   })  
  // }
}
