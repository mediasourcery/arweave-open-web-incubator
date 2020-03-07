const argv = require('yargs').argv;

require('.')({
  action: 'serve',
  port: argv.port || 1234,
  watch: true
});
