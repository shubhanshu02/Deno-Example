import { Router } from 'https://deno.land/x/opine@0.12.0/mod.ts';
import { config } from "https://deno.land/x/dotenv/mod.ts";

const auth = new Router();

// users routes
auth.get('/callback', async (req, res) => {
 const { issuer, clientId, clientSecret, redirectUrl, state } = config();

 if (req.query.state.split(':')[0] !== state) {
   res.send('State code does not match.').sendStatus(400);
 }

 const tokenUrl: string = `${issuer}/v1/token`;
 const code: string = req.query.code;

 const headers = new Headers();
 headers.append('Accept', 'application/json');
 headers.append('Authorization', `Basic ${btoa(clientId + ':' + clientSecret)}`);
 headers.append('Content-Type', 'application/x-www-form-urlencoded');

 const response = await fetch(tokenUrl, {
   method: 'POST',
   headers: headers,
   body: `grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUrl)}&code=${code}`
 });

 const data = await response.json();
 if (response.status !== 200) {
   res.send(data);
 }
 const user = parseJwt(data.id_token);
 req.app.locals.user = user;
 req.app.locals.isAuthenticated = true;
 res.location(req.query.state.split(':')[1] || '/').sendStatus(302);
});


function parseJwt (token:string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

export default auth;