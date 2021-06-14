//client init
var client = ZAFClient.init();

var accountId = 'TSTDRV1724328';
var consumerKey =
  '35f13daf104282ea3edfdd67cf3f21f58b8d9b1914305d7ec451aee0888ed112';
var consumerSecret =
  '0a410d4fb4c5b9219b4593ef3abe7fd4efb52ad351ed1199e82e9ad92cf1dfff';
var tokenId =
  '580ba69efedcd8f4bdd7ac7bec6bc0324245a56d24a66d52ab061e1c5cf3ab41';
var tokenSecret =
  'ba3426be5d771f1346ef0b66e40c5da6796301ce2413ec0de3a210dfa2d0be5e';

var restDomainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`;
var httpMethod = 'GET';

/// EDITANDO EMI FER
function transmitToNetsuite(
  url,
  accId,
  key,
  secret,
  tokId,
  tokSecret,
  scriptDeploy,
  action,
  formValues,
  callback
) {
  // Function to unify transmitions of differents actions with netsuit
  // url is the current Rest Domain Base
  // accId is the currect account Id
  // key and secret is the current consumer Key and Secret
  // tokId and tokSecret is the current Id and Secret of token
  // scriptDeploy is the current script using into netsuit
  // action is the action to be executed
  // formValues is the object with the data to be transmited to NetSuite into path
  // callback is the callback to be used when all work as expected
  function setPath(baseObject) {
    var result = '';
    Object.entries(baseObject).forEach(([item, prop]) => {
      if (prop.trim() !== '')
        result += `${result.length > 0 ? '&' : ''}${item}=${prop.trim()}`;
    });
    return result;
  }
  const params = serviceNestsuite(
    url,
    accId,
    key,
    secret,
    tokId,
    tokSecret,
    `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(
      formValues
    )}`
  );
  client
    .request(params)
    .then((results) => callback(results))
    .catch((e) => console.log('Error Handling', e));
}
document
  .querySelector('#modal')
  .addEventListener('submit', this.onModalSubmit.bind());
//SUBMIT
function onModalSubmit() {
  event.preventDefault();
  submitData();
}

async function submitData() {
  // //addCostumization propose NS
  const result = getFormData();
  const createdProposed = {
    proposed: result,
    ticketID: localStorage.getItem('zendesk-tiquet-id'),
  };
  const scriptDeploy = 'flo_cr_api';
  const action = 'addCustomizations';
  const callback = (results) => {
    if (results.proposedCusts != '') {
      localStorage.setItem(
        'ProposedCustomization',
        JSON.stringify(results.proposedCusts.split(','))
      );
    } else {
      localStorage.setItem('ProposedCustomization', JSON.stringify([]));
    }
    client.invoke('destroy');
  };
  transmitToNetsuite(
    restDomainBase,
    accountId,
    consumerKey,
    consumerSecret,
    tokenId,
    tokenSecret,
    scriptDeploy,
    action,
    createdProposed,
    callback
  );
}
$('#inp-type').change(function () {
  var prefix = $(this).val();
  if (prefix != '99999') {
    document.getElementById('inp-scriptid').value = $(this).val() + '_';
  } else {
    document.getElementById('inp-scriptid').value = '';
  }
});
function getFormData() {
  return (scriptid = document.getElementById('inp-scriptid').value);
}
function serviceNestsuite(
  domainBase,
  account_id,
  consumer_key,
  consumer_secret,
  token_id,
  token_secret,
  path
) {
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
    headerWithRealm.Authorization += ',realm="' + accountId + '"';

    return headerWithRealm;
  }
  var restUrl = domainBase + path;

  //OPTIONS CREATION
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
  return options;
}
