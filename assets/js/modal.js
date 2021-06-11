//client init
var client = ZAFClient.init();
localStorage.setItem('filter1', '[]');

document
  .querySelector('#modal')
  .addEventListener('submit', this.onModalSubmit.bind());

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
//SELECT MODIFY BY
function getModifyBy() {
  const selectOptions = {value: 'customer'};
  const scriptDeploy = 'flo_customization_api';
  const action = 'allEmployees';
  const callback = (results) => {
    objectResp = JSON.parse(results);
    const impmodif = document.querySelector('#inp-modif');
    impmodif.innerHTML = objectResp.results;
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
    selectOptions,
    callback
  );
}
getModifyBy();

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
  const filter = obtData();
  const scriptDeploy = 'flo_customization_api';
  const action = 'search';
  const callback = (results) => {
    objectResp = JSON.parse(results);
    objectResp = objectResp.results;
    renderlook(objectResp);
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
    filter,
    callback
  );
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
    //console.log(res[i].id);
    if (res[i] !== '') {
      const tr = document.createElement('tr');
      tr.className = 'look-tr';
      tr.innerHTML = `
                        <td headers="name" class="d-flex w-60">
                            <input type="checkbox" class="lookupSelectedCusts my-auto check" name="lookupSelectedCusts" value="${res[i].values.name}" data-id="${res[i].id}">
                            <span class="my-auto os-12">${res[i].values.name}</span>                            
                        </td>
                        <td class="look-th d-flex w-40">
                            <p class="os-12"><strong>Record Type</strong>:<i>${res[i].recordType}</i></p>
                        </td>`;
      resultList.appendChild(tr);
    }
  }
}
// /app/site/hosting/restlet.nl?script=customscript_flo_cr_api&deploy=customdeploy_flo_cr_api&action=addCustomizations&existing=207519,205513,205514
function addCustom() {
  let existingId = '';
  let newValues = [];
  let inputs = $('.check');
  $('.check').each((i) => {
    if (inputs[i].checked) {
      // selectedCustomization.push(inputs[i].dataset.id);
      existingId += `${existingId.length > 0 ? ',' : ''}${
        inputs[i].dataset.id
      }`;
      newValues.push({id: inputs[i].dataset.id, name: inputs[i].dataset.value});
    }
  });
  //addCostumization existing NS
  const selectedCustom = {
    existing: existingId,
    ticketID: localStorage.getItem('zendesk-tiquet-id'),
  };
  const scriptDeploy = 'flo_cr_api';
  const action = 'addCustomizations';
  const callback = (results) => {
    // let existingList = [];
    // results.custIds.forEach((id, idx) => {
    //   existingList.push({name: results.custNames[idx], id: id});
    // });
    // localStorage.setItem(
    //   'selectedCustomizationValues',
    //   JSON.stringify(existingList)
    // );
    localStorage.setItem(
      'selectedCustomizationValues',
      JSON.stringify(
        localStorage.getItem('selectedCustomizationValues').concat(newValues)
      )
    );
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
    selectedCustom,
    callback
  );
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
