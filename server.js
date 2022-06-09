const {
    load_users,
    load_features,
    get_user_location_features,
    calc_chance_ratio
} = require('./feature_flag');

const http = require('http');
//const { parse: parseQuery } = require('querystring');

//create a server object:

const parse_param = (s_param) => {
    console.log('s_param', s_param);
    const [name, value] = s_param.split('=');
    return [name, value];

}

http.createServer((req, res) => {
    console.log('req.url', req.url);
    //const url = new URL(req.url);
    let email, location;

    const s1_url = req.url.split('?');
    if (s1_url.length === 2) {
        //const s2 = s1_url[1].split('&');
        //const 

        const s_params = s1_url[1].split('&');

        let [name, value] = parse_param(s_params[0]);
        console.log('[name, value]', [name, value]);
        if (name === 'email') {
            email = value;
        } else if (name === 'location') {
            location = value;
        }
        [name, value] = parse_param(s_params[1]);
        console.log('[name, value]', [name, value]);
        if (name === 'email') {
            email = value;
        } else if (name === 'location') {
            location = value;
        }

        if (email && location) {
            const arr_features = get_user_location_features(email, location);
            res.writeHead(200,{'Content-Type':'application/json'});

            res.write(JSON.stringify(arr_features));
            //res.setHeader("Content-Type", "application/json");
            res.end();
        } else {
            console.log('missing email and location query parameters');


        }





    } else {

    }

    //let u = req.url;
    //if (u === '/') u = '';

    //const q = parseQuery(u);

    //console.log('url', url);
    //console.log('q', q);


    //const email = myURL.searchParams.get('email');
    //const location = myURL.searchParams.get('location');

    

    //console.log(myURL.searchParams.get('abc'));

  //res.write('Hello World!'); //write a response to the client
  //res.end(); //end the response
}).listen(8080); //the server object listens on port 8080

