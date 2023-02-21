import 'regenerator-runtime/runtime';

import EasySeeSo from 'seeso/easy-seeso';

const licenseKey = 'dev_fbpjqcqmqji0bq6asinisgv2tzv6ybwaikbnzlw4';

(async () => {
const seeso = new EasySeeSo();
// Don't forget to enter your license key.
await seeso.init(licenseKey, afterInitialized, afterFailed)
})()

function afterInitialized () {
   console.log('sdk init success!')
}

function afterFailed () {
   console.log('sdk init fail!')
}