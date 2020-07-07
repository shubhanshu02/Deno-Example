import { opine } from 'https://deno.land/x/opine@0.12.0/mod.ts';

const app = opine();

app.get('/', (req, res) => {
    res.send('Deno Sample');
});

app.listen(3000);
console.log('running on port 3000');