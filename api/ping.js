export default function handler(req, res) {
  // Check if it's a curl request based on user agent
  const userAgent = req.headers['user-agent'] || '';
  const isCurl = userAgent.toLowerCase().includes('curl');

  if (!isCurl) {
    // If not curl, just redirect to the main site
    return res.redirect('/');
  }

  // ASCII Art Easter Egg for curl users
  const asciiArt = `
  \\ \`    /  ___  ___   ____  ____  ___   _____    _   _
  /   \\  /  | __]| _ \\ [__  | __]| _ \\ | __|  \\  // | |
  \\_// \\/   | _] | _ < ___] | _] |  _/ |  _|\\  \\//  | |
    \\__/    |___]|___/ |___]|___]|_\\   |_|   \\__/   |_|


  You've found the hidden terminal endpoint! 
  
  Want to play a game?
  Visit: https://parjadm.ca
  And open the Terminal App on the Web OS desktop.
  
  (Type 'ping www.parjadm.ca' inside the Web OS terminal for a surprise!)
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(asciiArt);
}
