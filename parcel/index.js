const Bundler = require('parcel-bundler');
const loadEnv = require('parcel-bundler/lib/utils/env');
const path = require('path');

module.exports = async function(opts = {}) {
  const envFile = path.join(__dirname, '../.env');
  await loadEnv(envFile);

  const entryFile = path.join(__dirname, '../src/index.html');
  const bundler = new Bundler(entryFile, {
    publicUrl: process.env.PUBLIC_URL,
    watch: opts.watch === true
  });

  if (opts.action === 'bundle') {
    await bundler.bundle();
  } else if (opts.action === 'serve') {
    await bundler.serve(opts.port || 1234);
  }
}
