let request = require('request');
let cheerio = require('cheerio');
let ImgDownloader = require('./imgDown.js');
let PdfParser = require('./pdfReader.js');
let RuCaptcha = require('rucaptcha');
let contentType = require('content-type')
let fs = require('fs');
let download = require('download-file')

let solver = new RuCaptcha({
    apiKey: 'cb9171694d582b1662e9834b0b454ad4', //required 
    tmpDir: './tmp',                //optional, default is './tmp' 
    checkDelay: 1000                    //optional, default is 1000 - interval between captcha checks 
});
//let urlPars = new UrlParser();
let iin = 1650283830;
let URL = 'https://egrul.nalog.ru/';
let random_ua = require('random-ua');

const imgNumbGet = (options) => new Promise((resolve, reject) => {
    console.log("8 ***************************");
    let anshwer = solver.solve("./tmp/1.jpg", function (err, anshwer) {
        console.log("9 ***************************");
        if (anshwer != null && anshwer != undefined)
            anshwer = anshwer.replace(" ","");
            options.body.captcha = anshwer;
        if (err)
            reject(err);
        resolve(options);

    });
});

const imgGet = (options) => new Promise((resolve, reject) => {
    console.log("6 ***************************");
    new ImgDownloader().download(options.body.captcha, "./tmp/1.jpg", function (err) {
        console.log("7 ***************************");
        if (err)
            reject(err);
                 resolve(options);

    });
});

const pdfGet = (data) => new Promise((resolve, reject) => {
      let option = {
             directory: "./tmp/",
             filename: "info.pdf"}
    console.log("116 ***************************");
     download(data.toString(), option, function(err){
        console.log("117 ***************************");
        if (err)
            reject(err);
                 resolve(String(option.directory)+ String(option.filename));

    });
});

const requestPromise = (type, url, options) => new Promise((resolve, reject) => {
    console.log("1 ***************************");
    if (options)
        request[type](url, options, (err, res) => {
            console.log("2 ***************************");
            if (err)
                reject(err);
                    resolve(res);
        })
    else request[type](url, (err, res) => {
        console.log("3 ***************************");
        if (err)
            reject(err);
        resolve(res);
    })
});

requestPromise("get", URL)
    .then(res => {
        console.log("4 ***************************");
        let body = res.body;
        let options = {
    headers: {
        "User-Agent": random_ua.generate(),
        "Content-Type": "application/x-www-form-urlencoded",
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpReques',
    },
    body: {
        'captcha': "",
        'captchaToken': "",
        'fam': '',
        'kind': 'ul',
        'nam': '',
        'namul': '',
        'ogrninnfl': '',
        'ogrninnul': String(iin),
        'otch': '',
        'region': '',
        'regionul': '',
        'srchFl': 'ogrn',
        'srchUl': 'ogrn'
    }
};
        //token getter by cheerio
        let $ = cheerio.load(body);
        $('input').each(function () {
            let link = $(this).attr('value');

            if (link) {
                options.body.captchaToken = link;
            };
        });
        //captcha image link getter
        $('img').each(function () {
            let link = $(this).attr('src');

            if (link) {
                options.body.captcha = URL + link;
            };
        });
        console.log("5 ***************************");
        return options;
    })
    /*.then(opt => {
        console.log("+++++++++++++++++++++++++++++")
        return opt;
    })*/
    .then(options => imgGet(options))
    .then(options => imgNumbGet(options)
        .then(options => requestPromise("post", URL, {
            form: {
                "captcha": options.body.captcha,
                'captchaToken': options.body.captchaToken,
                'fam': '',
                'kind': 'ul',
                'nam': '',
                'namul': '',
                'ogrninnfl': '',
                'ogrninnul': String(iin),
                'otch': '',
                'region': '',
                'regionul': '',
                'srchFl': 'ogrn',
                'srchUl': 'ogrn'
            },
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpReques',
                "User_Agent": options.headers.User_Agent,
                //"Content-Type": "application/json",
            }
        })
            .then((res, options)  => {
                console.log("10 ***************************");
                let parser = JSON.parse(res.body);
                if(res.statusCode == 400){
                    console.log("Error was interappted");
                    reject("captcha error");
                }
                let innerArray = parser.rows;
                //console.log(innerArray[0]);
                let data = [];
                for (let i = 0; i < innerArray.length; i++) {
                    data.push(URL + "download/" + innerArray[i].T);
                    console.log("11 ***************************");
                }
                
                /*fs.writeFile('./tmp/pdfUrls.txt', data, function (err) {
                    console.log("12 ***************************");
                    if (err) 
                        reject(err);
                            resolve(options);
                    console.log('Hell > helloworld.txt');
                } );*/
                console.log("13 -----------------------------------");
                return data;
            }).then(data  => pdfGet(data))
              .then(data2 => {
                  let y = new PdfParser(data2);
            })
))
    .catch(err => console.log(err))