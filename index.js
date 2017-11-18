// Creating App instance
var xml2js = require('xml2js'),parser = new xml2js.Parser({explicitArray : false}),http = require('http'),jsdom = require('jsdom'),kmp = require('kmp');
const { JSDOM } = jsdom;
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const line = require('@line/bot-sdk');
const middleware = require('@line/bot-sdk').middleware;
const app = express();
var crawler = require('./newsCrawler');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 5000));

const config = {
    channelAccessToken: '5T0Ter+WeMhWyPhCkh9DULTAkq1MyKNLaSZscQBQ2tRJSUfj9+JHlI+M2BmyNvWBSGHB6qTAbeMMkuPzf2T2x7bE+ROvxr6prGZu5awO6dB5a1V/BM7J20GG9pLX92kwGuiRDTWM2wwTTHYkzGtZvgdB04t89/1O/w1cDnyilFU=',
    channelSecret: '3d4009bee32c80a68b725e3cbb45d13c',
}
const client = new line.Client(config);
line.middleware(config);

// Main handler
app.get('/', function(request, response) {
    response.send('Bang Teti GET Handler');
});

app.post('/', function(request, response) {
    console.log('Get new POST request from ' + request.originalUrl + ' with type ' + request.get('content-type'));
    console.log('\t' + JSON.stringify(request.body));
    
    var events = request.body.events;
    events.forEach(function(event) {
        var replyToken = event.replyToken;
        var type = event.type;
        
        switch (type) {
            case 'message' :
                var message = event.message;
                if (message.type == "text") {
                    console.log(message.text + " from " + message.id);
                    handleCommand(message.text, replyToken)
                } else {
                    handleError(replyToken);
                }
                break;
            case 'follow' :
                handleFollow(replyToken);
                break;
            default :
                handleError(replyToken);
        }

    });
    
    response.status(200).send("OK");
});

// Helper function

function xmlToJson(url, callback) {
	var request = http.get(url, function(response) {
		var xml = '';
						   
		response.on('data', function(chunk) {
			xml += chunk;
		});
						   
		response.on('error', function(e) {
			callback(e, null);
		});
						   
		response.on('timeout', function(e) {
			callback(e, null);
		});
						   
		response.on('end', function() {
			parser.parseString(xml, function(err, result) {
				callback(null, result);
			});
		});
	});
}

function handleFollow(replyToken) {
    console.log("\tGive introduction with token " + replyToken);
    var message = {
        type: 'text',
        text: 'Hai perkenalkan, saya Bang Teti. Saya akan melaporkan berita yang dapat dipercaya!'
    };
    client.replyMessage(replyToken, message)
        .then(() => console.log("\tSending reply " + replyToken))
        .catch((err) => {
            console.log("\tTerjadi kesalahan " + err)
        });
}

function handleCommand(command, replyToken) {
    console.log("\tProcessing command " + command + " with token " + replyToken);

    command = command.trim();

    const pattern = new RegExp("^cari");
    if (pattern.test(command.toLowerCase())) {
        handleSearch(command, replyToken);
        return;
    }

    switch (command.toLowerCase()) {
        case 'abc' : 
            var reply = { type: 'text', text: "ABC adalah sebuah keyword yang valid" };
            client.replyMessage(replyToken, reply)
            .then(() => console.log("\tSending reply " + replyToken))
            .catch((err) => {
                console.log("\tTerjadi kesalahan " + err)
            });;
            break;
		case 'cari' :
			//var reply = { type: 'text', text: JSON.stringify(crawler.searchNews("all",keyword)) };
			//client.replyMessage(replyToken, reply)
			//.then(() => console.log("\tSending reply " + replyToken))
			//.catch((err) => {
				   //console.log("\tTerjadi kesalahan " + err)
				   //});;
			handleSearch(command, replyToken);
			break;
        case 'image' :
            var reply = { type: 'image', originalContentUrl: "https://img.okezone.com/content/2017/10/03/33/1787616/pasrah-jeremy-teti-mengaku-kesulitan-mencari-jodoh-C1LQd3TusT.jpg" , previewImageUrl : "https://ruclip.com/chimg/e4/UCvYygswZM7vKjdMA90d0YIg.jpg"};
            client.replyMessage(replyToken, reply)
            .then(() => console.log("\tSending reply " + replyToken))
            .catch((err) => {
                console.log("\tTerjadi kesalahan " + err)
            });;
            break;
        case 'top10':
        case 'top 10':
        case 'top-10':
            handleTop10(replyToken);              
            break;
        case 'bang':
        case '?':
        case 'abang':
        case 'help':
        case 'bantuan':
            handleHelp(replyToken);
            break;
        case 'feedback':
            handleFeedback(replyToken);
            break;
        default :
            var reply = { type: 'text', text: 'Ehhmm, Bang Teti bingung nih, "'+command+'" maksudnya apa ya?' };
            client.replyMessage(replyToken, reply)
            .then(() => console.log("\tSending reply " + replyToken))
            .catch((err) => {
                console.log("\tTerjadi kesalahan " + err)
            });;
    }

}

function handleHelp(replyToken) {
    var reply = { 
        type: 'text', 
        text: 'Hai gan, kamu perlu bantuan? \nTenang aja, apapun kesulitannya Bang Teti bakal bantu kok. \n\n- Kalo kamu mau nyari berita ketik aja "Cari <sesuatu>", ntar Bang Teti bakal nyariin berita buat kamu. \n- Nah kalo kamu mau nyari berita yang lagi viral kamu bisa ketik "top10" \n\nGampang kan! Kalo masih bingung panggil Abang lagi aja, ntar bakal dibantu kok \uDBC0\uDC84' };
    client.replyMessage(replyToken, reply)
    .then(() => console.log("\tSending reply " + replyToken))
    .catch((err) => {
        console.log("\tTerjadi kesalahan " + err)
    });;
}

/*function handleTop10(replyToken) {
    var reply = { 
        type: 'text', 
        text: 'Pagi, ini nih 10 berita terheboh yang kamu harus tau:' };
    client.replyMessage(replyToken, reply)
    .then(() => console.log("\tSending reply " + replyToken))
    .catch((err) => {
        console.log("\tTerjadi kesalahan " + err)
    });;
}*/

function handleTop10(replyToken) {
    const baseURL = process.env.BASE_URL;
    const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
    var reply = { 
        type: 'template',
        altText: 'Carousel alt text',
        template: {
          type: 'carousel',
          columns: [
            {
              thumbnailImageUrl: buttonsImageURL,
              title: 'hoge',
              text: 'fuga',
              actions: [
                { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' }
              ]
            },
            {
              thumbnailImageUrl: buttonsImageURL,
              title: 'hoge',
              text: 'fuga',
              actions: [
                { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                { label: 'Say message', type: 'message', text: 'Rice=米' }
              ]
            }
          ]
        }
    };
    client.replyMessage(replyToken, reply)
    .then(() => console.log("\tSending reply " + replyToken))
    .catch((err) => {
        console.log("\tTerjadi kesalahan " + err)
    });;
}


function handleSearch(command, replyToken) {
    var keyword = command.substring(4).trim();
	console.log("Keyword : " + keyword);
    var reply = {
        type: 'text', 
        text: 'Hasil pencarian : "' + keyword + '"'};
    client.replyMessage(replyToken, reply)
    .then(() => console.log("\tSending reply " + JSON.stringify(news,null,2)))//replyToken))
    .catch((err) => {
        console.log("\tTerjadi kesalahan " + err)
    });;
}

function handleError(replyToken) {
    console.log("\tBang Teti bingung!");

    const reply = { type: 'text', text: "Bang Teto bingung!" };
    client.replyMessage(replyToken, reply)
    .then(() => console.log("\tSending reply " + replyToken))
    .catch((err) => {
        console.log("\tTerjadi kesalahan " + err)
    });;
}

function handleFeedback(replyToken) {
    const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
    console.log("\tBang Teti asks for feedback.");
    const reply = {
      "type": "template",
      "altText": "this is a buttons template",
      "template": {
          "type": "buttons",
          "thumbnailImageUrl": buttonsImageURL,
          "title": "Menu",
          "text": "Please select",
          "actions": [
              {
                "type": "postback",
                "label": "Buy",
                "data": "action=buy&itemid=123"
              },
              {
                "type": "postback",
                "label": "Add to cart",
                "data": "action=add&itemid=123"
              },
              {
                "type": "uri",
                "label": "View detail",
                "uri": "http://example.com/page/123"
              }
          ]
      }
    };
    handleError(replyToken);
}

// Start server
app.listen(app.get('port'), function() {
    console.log('Bang Teti is listening on port', app.get('port'));
	var keyword = "anies";
    crawler.searchNews("all",keyword);
    pushBreakingNews();
});


function pushBreakingNews() {
    const targetId = 'U064ad36afebade93b31fee05090207b0';
    const judul = 'Setya Novanto Menabrak Tiang Listrik'
    const message = {
        type: 'template',
        altText: 'Breaking News! ' + judul,
        template: {
            type: 'carousel',
            'columns': [
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/16/9304f5ed-f4fb-4c75-b657-ef146cc77c1c.jpeg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Jakarta - KPK tetap mencari tahu peristiwa kecelakaan mobil yang ditumpangi Setya Novanto. Koordinasi akan dilakukan KPK dengan Ditlantas Polda Metro Jaya ...',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                },
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/17/c9c6db6c-1cb3-49cd-9a6f-0f6455e05d6c_169.jpg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Presiden Joko Widodo meminta Setya Novanto mengikuti proses hukum di Komisi Pemberantasan Korupsi (KPK). Permintaan ini dinilai sebagai peringatan keras untuk Novanto agar tak lari dari kasus dugaan korupsi proyek e-KTP....',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                },
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/16/9304f5ed-f4fb-4c75-b657-ef146cc77c1c.jpeg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Bla bla bla bla bla ....',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                },
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/17/c9c6db6c-1cb3-49cd-9a6f-0f6455e05d6c_169.jpg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Bla bla bla bla bla ....',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                },
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/16/9304f5ed-f4fb-4c75-b657-ef146cc77c1c.jpeg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Bla bla bla bla bla ....',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                },
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/17/c9c6db6c-1cb3-49cd-9a6f-0f6455e05d6c_169.jpg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Bla bla bla bla bla ....',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                },
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/16/9304f5ed-f4fb-4c75-b657-ef146cc77c1c.jpeg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Bla bla bla bla bla ....',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                },
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/17/c9c6db6c-1cb3-49cd-9a6f-0f6455e05d6c_169.jpg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Bla bla bla bla bla ....',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                },
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/16/9304f5ed-f4fb-4c75-b657-ef146cc77c1c.jpeg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Bla bla bla bla bla ....',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                },
                {
                    thumbnailImageUrl: 'https://akcdn.detik.net.id/community/media/visual/2017/11/17/c9c6db6c-1cb3-49cd-9a6f-0f6455e05d6c_169.jpg?w=780&q=90',
                    title: 'Setya Novanto menabrak tiang',
                    text: 'Bla bla bla bla bla ....',
                    actions: [
                        {
                            type: 'postback',
                            label: 'Selengkapnya',
                            data: 'action=buy&itemid=111'
                        },
                        {
                            type: 'postback',
                            label: 'Beri Feedback',
                            data: 'action=buy&itemid=111'
                        },
                    ]
                }                                
            ]
        }
    }
    client.pushMessage(targetId, message)
        .then(() => {
            console.log('Breaking News sent to ' + targetId);
        })
        .catch((err) => {
            console.log('Breaking News error: ' + err);
        });
}