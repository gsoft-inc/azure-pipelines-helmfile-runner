const fs = require('fs-extra');
const path = require('path');

const taskDir = path.resolve(__dirname, '../task');

function renameOpenSslLicenseForVsixCompat() {
  const openSslPath = path.join(taskDir, 'node_modules/azure-pipelines-tasks-azure-arm-rest-v2/openssl');
  if (!fs.existsSync(path.join(openSslPath, 'OpenSSL License.txt'))) {
    return;
  }

  console.log(`renaming '${path.join(openSslPath, 'OpenSSL License.txt')}' for tfx package compat...`);
  fs.moveSync(path.join(openSslPath, 'OpenSSL License.txt'), path.join(openSslPath, 'OpenSSL_License.txt'));
  console.log('done!');
}

renameOpenSslLicenseForVsixCompat();
