#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const bhttp = require('bhttp');



const local_file_name1 = path.join(__dirname, 'po/template.pot');

// Similar to Github, normalize all line breaks to CRLF so that different people
// using different OSes to update does not constantly swith format back and forth.
let local_file1_text = fs.readFileSync(local_file_name1, 'utf8');
local_file1_text = local_file1_text.replace(/\r\n/g, '\n');
local_file1_text = local_file1_text.replace(/\n/g, '\r\n');
fs.writeFileSync(local_file_name1, local_file1_text);

const local_file1 = fs.createReadStream(local_file_name1);
// obtain the crowdin api key

  const payload = {
    'files[template.pot]': local_file1
  };

  bhttp.post(`https://api.crowdin.com/api/project/dagcoin/update-file?key=2d35202b85cb18d797dcb1ef7565c3c6`, payload, {}, (err, response) => {
    console.log('\nResponse from update file call:\n', response.body.toString());

    // This call will tell the server to generate a new zip file for you based on most recent translations.
    https.get(`https://api.crowdin.com/api/project/dagcoin/export?key=2d35202b85cb18d797dcb1ef7565c3c6`, (res) => {
      console.log(`Export Got response: ${res.statusCode}`);
      res.on('data', (chunk) => {
        console.log(chunk.toString('utf8'));
      });
    }).on('error', (e) => {
      console.log(`Export Got error: ${e.message}`);
    });
  });
