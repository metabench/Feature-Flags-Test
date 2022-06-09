const {each} = require('lang-mini');
const {promises: {readFile}} = require("fs");

const {
    createHash
  } = require('crypto');





const map_users = new Map();
const map_locations = new Map();
const map_features = new Map();


const load_users = async (filepath) => {
    const data = await readFile(filepath);
    const l_users = JSON.parse(data);

    each(l_users, user => {

        if (typeof user === 'string') {
            const [q_email, q_location] = user.split('&');
            const [q1, email] = q_email.split('=');
            const [q2, location] = q_location.split('=');


            const o_user = {
                email, location
            }
            //console.log('o_user', o_user);
            if (map_users.has(email)) {

            } else {
                map_users.set(email, o_user);
            }

        } else {
            const {email} = user;
            if (map_users.has(email)) {

            } else {
                map_users.set(email, user);
            }
        }
    });
}

const load_features = async (filepath) => {
    const data = await readFile(filepath);
    const l_features = JSON.parse(data);

    each(l_features, feature => {
        const {name, ratio, enabledEmails, includedCountries, excludedCountries} = feature;
        //console.log('feature', feature);

        if (map_features.has(name)) {
            throw 'Feature name ' + name + ' already exists';
        } else {

            // then make maps of enabled and disabled locations

            feature.map_included_countries = new Map();
            feature.map_excluded_countries = new Map();

            each(feature.includedCountries, includedCountry => {
                feature.map_included_countries.set(includedCountry, true);
            });
            each(feature.excludedCountries, excludedCountry => {
                feature.map_excluded_countries.set(excludedCountry, true);
            });

            map_features.set(name, feature);

            if (feature.enabledEmails) {
                each(feature.enabledEmails, feature_enabled_email => {
                    o_user = map_users.get(feature_enabled_email);
                    if (o_user) {
                        o_user.map_enabled_features = o_user.map_enabled_features || new Map();
                        o_user.map_enabled_features.set(name, true);
                    }
                });
            }
        }
    });
}

const calc_chance_ratio = (email, feature_name) => {
    //const str_seed_key = o_user.email + '|' + value.name;
    const str_seed_key = email + '|' + feature_name;
    //console.log('str_seed_key', str_seed_key);

    const hash = createHash('sha256');

    hash.update(str_seed_key);
    //console.log('hex digest ' + hash.digest('hex'));

    const hdigest = hash.digest('hex');
    const minidigest = hdigest.substring(0, 4);
    //console.log('minidigest', minidigest);

    const bmdigest = Buffer.from(minidigest, 'hex');

    //console.log('bmdigest', bmdigest);

    const ui16_mini_digest = bmdigest.readUint16LE(0);
    //console.log('ui16_mini_digest', ui16_mini_digest);
    const proportion = ui16_mini_digest / (255 * 256);
    return proportion;
}

const get_user_location_features = (username, location) => {
    // get the user from the username (email)

    const o_user = map_users.get(username);
    //console.log('o_user', o_user);

    // then lookup features that are enabled for that user...

    // and lookup features that are included / enabled because of the location.
    // if the username is not listed, its based on the location and info concerning the features.

    let arr_res_feature_names = [];
    let map_res = new Map();
    // and a map for the result, to prevent duplicate entries

    const iterate_features = () => {
        map_features.forEach((value, key) => {
            // is that feature either enabled or disabled in that location?

            //console.log('value', value);
            const {includedCountries, map_included_countries, excludedCountries, map_excluded_countries} = value;
            //console.log('map_included_countries', map_included_countries);
            //console.log('map_excluded_countries', map_excluded_countries);

            // List of countries the user must be from, if empty it is enabled for all countries

            //console.log('location', location);

            if (map_excluded_countries.has(location)) {

            } else {
                if (map_included_countries.size > 0) {
                    if (map_included_countries.has(location)) {
                        // add it according to chance

                        // get the seed key for the user and feature
                        const str_seed_key = o_user.email + '|' + value.name;
                        console.log('str_seed_key', str_seed_key);

                        throw 'NYI';

                        

                    } else {
                        // do not add it
                    }
    
                    /*
    
                    else if (map_excluded_countries.has(location)) {
        
                    } else {
                        // according to chance
        
                    }
    
    
                    */
                } else {
                    // add it according to chance

                    // needs an o_user.
                    //  without such an o_user...?

                    
                    const proportion = calc_chance_ratio(username, value.name);

                    if (proportion <= value.ratio) {
                        map_res.set(value.name, true);
                    }

                }
            }

        })
    }

    if (o_user) {
        // get the map of the user's enabled features
        //   (disabled features)
        if (o_user.map_enabled_features) {
            const user_enabled_feaures = o_user.map_enabled_features.keys();
            //console.log('user_enabled_feaures', user_enabled_feaures);

            // var arr = Array.from(map.entries());
            for (const featureName of user_enabled_feaures) {
                // Any Code Here
                map_res.set(featureName, true);
            }

            iterate_features();

            //user_enabled_feaures.
        }

        // then for the other features...

        



    } else {

        // Generic user (with location)

        iterate_features();

        //throw 'NYI';
    }

    return Array.from(map_res.keys());






}

if (require.main === module) {

    const o_users = require('./example_users.json');
    const o_features = require('./features.json');

    //console.log('o_users', o_users);
    //console.log('o_features', o_features);

    const path_users = './example_users.json';
    const path_features = './features.json';

    (async() => {
        await load_users(path_users);
        await load_features(path_features);

        //let res = get_user_location_features('fred@example.com', 'GB');

        const try_user_location = (username, location) => {
            let res = get_user_location_features(username, location);
            // "email=sam@example.com&location=FR"
            console.log('res', res);
        }

        try_user_location('sam2@example.com', 'FR');

        
    })();

    //console.log('called directly');
} else {
    //console.log('required as a module');
}

module.exports = {
    load_users,
    load_features,
    get_user_location_features,
    calc_chance_ratio
}