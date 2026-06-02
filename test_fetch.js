async function run() {
  const url = 'http://localhost:3000/api/salesforce/orders?action=contacts&accountId=001g000001someone&contactId=003g000001someone';
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Response:", data);
  } catch(e) {
    console.log("Error", e);
  }
}
run();
