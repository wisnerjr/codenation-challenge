const sha1 = require('js-sha1');
const fetch = require('node-fetch');
const fs = require('file-system');
const FormData = require('form-data');

class API {
    constructor() {
        this.token = '91bf23b41c560e9297e6f483c5e3ae206063ff84';
        this.urlGet = `https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${this.token}`;
        this.urlPost = `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${this.token}`;
    }
    async get() {
        const response = await fetch(this.urlGet);

        const data = await response.json();

        return data;
    }

    async post() {
        const form = new FormData();
        form.append('answer', fs.createReadStream(new URL('file://D:/projects/codenation-challenge/answer.json')));

        const response = await fetch(this.urlPost, {
            method: 'POST',
            body: form
        });

        const resData = await response.json();
        return resData;
    }
}

const api = new API;

const charCode_A = 'a'.charCodeAt();
const charCode_Z = 'z'.charCodeAt();
const rangeBetweenZtoA = charCode_Z - charCode_A + 1;

api.get()
.then(async data => { 
    let response = await {...data};
    
    let threshold = charCode_A - response.numero_casas;

    let undecoded = '';

    [...response.cifrado].forEach(letter => {
        let charCode = letter.toLowerCase().charCodeAt() - response.numero_casas;
        let charCodeUndecoded;

        if (charCode < charCode_A) {
            if (charCode < threshold) {
                charCodeUndecoded = charCode + response.numero_casas;
            } else {
                charCodeUndecoded = charCode + rangeBetweenZtoA;
            }
        } else if (charCode_A <= charCode <= charCode_Z) charCodeUndecoded = charCode;

        undecoded += String.fromCharCode(charCodeUndecoded);
    });

    response.decifrado = undecoded;

    response.resumo_criptografico = sha1(response.decifrado);

    // console.log(response);

    fs.writeFile('./answer.json', JSON.stringify(response), error => { if (error) return console.log('error writing file') ; });

})
.catch(error => console.log(error));

api.post()
.then(data => {
    console.log(data);
})
.catch(error => console.log(error));

