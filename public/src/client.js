'use strict'

require('./app')

// scripts-client.js is generated during build, it contains javascript files
// from plugins that add files to "scripts" block in plugin.json
// eslint-disable-next-line
require('../scripts-client');

app.onDomReady()
