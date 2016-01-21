const connect = require('connect');
const serveStatic = require('serve-static');

const port = process.env.PORT || 3000;

connect().use(serveStatic(__dirname)).listen(port, () => {
	console.log('Running on port: ' + port);
});