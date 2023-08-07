import corsProxy from 'cors-anywhere'

// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8000;

corsProxy.createServer({
    removeHeader: [],
    originWhitelist: [], // Allow all origins
    requireHeader: [],
    removeHeaders: [],
    httpProxyOptions: {
      coockieDomainRewrite: false,
      coockiePathRewrite: false,
    }

}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});
