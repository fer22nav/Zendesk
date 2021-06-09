//client init
var client = ZAFClient.init();
localStorage.setItem('filter1','[]');
//console.log('filtro', filter);


document.querySelector('#modal').addEventListener('submit', this.onModalSubmit.bind());



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

/*SELECT MODIFY BY*/
const opciones = serviceNestsuite(
  restDomainBase,
  accountId,
  consumerKey,
  consumerSecret,
  tokenId,
  tokenSecret,
  '/app/site/hosting/restlet.nl?script=customscript_flo_customization_api&deploy=customdeploy_flo_customization_api&action=allEmployees&value=customer'
);
client.request(opciones).then((results) => {
  objectResp = JSON.parse(results);
  const impmodif = document.querySelector('#inp-modif');
  impmodif.innerHTML = objectResp.results;
});

//SUBMIT
function onModalSubmit() {
  document.querySelector('#modal').classList.add('colapse');
  document.querySelector('.header').classList.add('colapse');
  document.querySelector('.header2').classList.add('visible');
  document.querySelector('.header2').classList.remove('colapse');
  document.querySelector('.header').classList.add('pb-0');
  document.querySelector('.header').classList.remove('pb-4');
  document.querySelector('.look-list').classList.remove('colapse');
  event.preventDefault();
  getFilterData();
}

function getFilterData() {
  function setPath(baseObject) {
    var result = '';
    Object.entries(baseObject).forEach(([item, prop]) => {
      if (prop.trim() !== '')
        result += `${result.length > 0 ? '&' : ''}${item}=${prop.trim()}`;
    });
    return result;
  }
  const filter = obtData()

  const opciones = serviceNestsuite(
    restDomainBase,
    accountId,
    consumerKey,
    consumerSecret,
    tokenId,
    tokenSecret,
    `/app/site/hosting/restlet.nl?script=customscript_flo_customization_api&deploy=customdeploy_flo_customization_api&action=search&${setPath(
      filter
    )}`
  );

  console.log('2', opciones);
  client.request(opciones).then((results) => {
    objectResp = JSON.parse(results);
    objectResp = objectResp.results
    console.log('esto es lo q me responde', objectResp);
    renderlook(objectResp);
  });
}



function obtData() {
  value = document.getElementById('inp-name').value;
  modifiedby = document.getElementById('inp-modif').value;
  scriptid = document.getElementById('inp-scriptid').value;
  type = document.getElementById('inp-type').value;
  bundleid = document.getElementById('inp-bundleid').value;
  from = document.getElementById('inp-date-from').value;
  to = document.getElementById('inp-date-to').value;

  var r = {
    value: value,
    modifiedby: modifiedby,
    scriptId: scriptid,
    type: type,
    bundleId: bundleid,
    from: from,
    to: to,
  };
  return r;
}
function renderlook(res) {
  let resultList = document.querySelector('.resultList');
  resultList.innerHTML = '';
  for (let i = 0; i < res.length; i++) {
     console.log(res[i])
    if (res[i] !== '') {
      const tr = document.createElement('tr');
      tr.className = 'look-tr';
      tr.innerHTML = `
                        <td headers="name" class="d-flex w-60">
                            <input type="checkbox" class="lookupSelectedCusts my-auto check" name="lookupSelectedCusts" value="${res[i].values.name}">
                            <span class="my-auto os-12">${res[i].values.name}</span>                            
                        </td>
                        <td class="look-th d-flex w-40">
                            <p class="os-12"><strong>Record Type</strong>:<i>${res[i].recordType}</i></p>
                        </td>`;
      resultList.appendChild(tr);
    }
  }
}
function addCustom() {
  let selectedCustomization = [];
  let inputs = $('.check');
  $('.check').each((i) => {
    if (inputs[i].checked) {
      selectedCustomization.push(inputs[i].value);
    }
  });
  localStorage.setItem(
    'selectedCustomizationValues',
    JSON.stringify(selectedCustomization)
  );
  client.invoke('destroy');
}
function checkAll(source) {
  let checkboxes = document.querySelectorAll('input[type="checkbox"]');
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i] != source) checkboxes[i].checked = source.checked;
  }
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
