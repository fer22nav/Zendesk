export function serviceNestsuite(
  domainBase,
  account_id,
  consumer_key,
  consumer_secret,
  token_id,
  token_secret,
  path
) {
  var restUrl = domainBase + path;

  console.log(restUrl);
  var headerWithRealm = generateTbaHeader(
    restUrl,
    account_id,
    consumer_key,
    consumer_secret,
    token_id,
    token_secret
  );
  let options = {
    url: restUrl,
    type: 'GET',
    headers: headerWithRealm,
    cors: false,
    contentType: 'application/json',
  };

  return client.request(options).then((results) => {
    var objectResp = JSON.parse(results);
    console.log(results);
    console.log(objectResp);
  });
}

function generateTbaHeader(
  restDomainBase,
  accountId,
  consumerKey,
  consumerSecret,
  tokenId,
  tokenSecret,
  httpMethod
) {
  httpMethod =
    httpMethod == undefined || httpMethod == null ? 'GET' : httpMethod;
  //console.log("token based authentication generateTbaHeader " + restDomainBase)
  var base_url = restDomainBase.split('?')[0];
  //console.log("token based authentication generateTbaHeader base_url " + base_url)
  var query_params = restDomainBase.split('?')[1];
  //console.log(query_params);
  var params = query_params.split('&');
  //console.log(params)
  var parameters = {};
  for (var i = 0; i < params.length; i++) {
    parameters[params[i].split('=')[0]] = params[i].split('=')[1];
  }
  //console.log("token based authentication generateTbaHeader parameters " + JSON.stringify(parameters) );
  var token = {
    key: tokenId,
    secret: tokenSecret,
  };
  var oauth = new OAuth({
    consumer: {
      key: consumerKey,
      secret: consumerSecret,
    },
    signature_method: 'HMAC-SHA256',
    hash_function: function (base_string, key) {
      //console.log("generateTbaHeader base_string " + base_string);
      return CryptoJS.HmacSHA256(base_string, key).toString(
        CryptoJS.enc.Base64
      );
    },
  });

  var request_data = {
    url: base_url,
    method: httpMethod,
    data: parameters,
  };

  var headerWithRealm = oauth.toHeader(oauth.authorize(request_data, token));
  console.log(headerWithRealm);
  headerWithRealm.Authorization += ',realm="' + accountId + '"';

  return headerWithRealm;
}
