const http = require('http');
http.get('http://localhost:3000/api/salesforce/picklists?accountId=something&contactId=something', (res) => {
  let data = '';
  res.on('data', (d) => data += d);
  res.on('end', () => console.log(data));
});
