//VARIABLES
let bundlesList = [];
let existingCustom = {};
let existingProp = {};
let name, scriptid, bundleid, type, from, to;
let ticketNumber;
let ticketSubject;
let ticketDescription;
let ticketStatus;
let statusNS;
let linkCR;
let bundleID = 0;

var client = ZAFClient.init();

let accountId, consumerKey, consumerSecret, tokenId, tokenSecret

//trae los datos de seting
let metadata = getMetadata(client)


 function getMetadata(client) {
    client.metadata().then(function (metadata) {
    return metadata    
  })
}


accountId = /*metadata.settings.accountId ? metadata.settings.accountId :*/
      'TSTDRV1724328'
    consumerKey =/* metadata.settings.consumerKey ? metadata.settings.consumerKey :*/
      '35f13daf104282ea3edfdd67cf3f21f58b8d9b1914305d7ec451aee0888ed112';
    consumerSecret =/* metadata.settings.consumerSecret ? metadata.settings.consumerSecret :*/
      '0a410d4fb4c5b9219b4593ef3abe7fd4efb52ad351ed1199e82e9ad92cf1dfff';
    tokenId =/* metadata.settings.tokenId ? metadata.settings.tokenId :*/
      '580ba69efedcd8f4bdd7ac7bec6bc0324245a56d24a66d52ab061e1c5cf3ab41';
    tokenSecret =/* metadata.settings.tokenSecret ? metadata.settings.tokenSecret :*/
      'ba3426be5d771f1346ef0b66e40c5da6796301ce2413ec0de3a210dfa2d0be5e';



var restDomainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`;
var httpMethod = 'GET';

///Connection with netsuite
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
  callback,
  callbackError
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
      if (prop && prop.trim() !== '')
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
  const elementos = document.querySelectorAll('#infoNs');
  client
    .request(params)
    .then((results) => {
      if (results.status === 'success') {
        removeLoader()
      }
      for (i = 0; i < elementos.length; i++) {
        elementos[i].classList.remove('hid');
        elementos[i].classList.add('vis');
      }
      callback(results);
    })
    .catch((e) => {
      for (i = 0; i < elementos.length; i++) {
        elementos[i].classList.remove('vis')
        elementos[i].classList.add('hid')
      }
      console.log(e);
      if (e.statusText === 'error') {
        removeLoader()

      }


    });
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
function getCustomizations(isOperator, isAdministrator) {

  const scriptDeploy = 'flo_cr_api';
  const action = 'getCRData';
  const ticketId = { ticketID: ticketNumber };
  const callback = (results) => {
    bundlesList =
      results.affectedBundleID === ''
        ? []
        : results.affectedBundleID.split(',');
    linkCR = results.link;
    statusNS = results.statusBarState;

    if (statusNS == '') {
      document.querySelector('#statusNS').textContent = 'N/S';
    } else {

      document.querySelector('#statusNS').textContent = statusNS;
    }
    var element = document.getElementById('linkCR');
    element.href = linkCR;
    let existingList = [];
    results.custIds.forEach((id, idx) => {
      existingList.push({ name: results.custNames[idx], id: id });
    });
    if (
      isOperator &&
      ['', 'Not Started', 'In Progress'].includes(results.statusBarState)
    ) {
      document.getElementById('btn-request').style.display = 'flex';
      document.getElementById('btn-reject').style.display = 'flex';
    }
    if (isAdministrator && results.statusBarState === 'Pending Approval') {
      document.getElementById('btn-approved').style.display = 'flex';
      document.getElementById('btn-reject').style.display = 'flex';
    }
    localStorage.setItem(
      'selectedCustomizationValues',
      JSON.stringify(existingList)
    );
    if (results.proposedCusts != '') {
      localStorage.setItem(
        'ProposedCustomization',
        JSON.stringify(results.proposedCusts.split(','))
      );
    } else {
      localStorage.setItem('ProposedCustomization', JSON.stringify([]));
    }
    renderlookup();
    renderProposed();
    renderBundle();
  };

  const callbackError = (e) => {
    if (isOperator) {
      document.getElementById('btn-request').style.display = 'flex';
      document.getElementById('btn-reject').style.display = 'flex';
    }
    // localStorage.setItem('selectedCustomizationValues', JSON.stringify([]));
    // localStorage.setItem('ProposedCustomization', JSON.stringify([]));
    // renderlookup();
    // renderProposed();
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
    ticketId,
    callback,
    callbackError
  );
}
function updateTicketStatus(newState) {
  const scriptDeploy = 'flo_cr_api';
  const action = 'createCR';
  const params = {
    ticketID: ticketNumber,
    changeNum: ticketSubject,
    description: ticketDescription,
    state: newState,
  };

  const callback = (results) => {
    statusNS = results.statusBarState;
    console.log('Update Ticket Results to:', statusNS);
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
    params,
    callback
  );
}


client.invoke('resize', { width: '100%', height: '900px' });
client.on('pane.activated', function () {
  console.log('hover');
});


/*SHOW INFO */
function showInfo(data, userName) {
  let requester_data = {
    title: data.ticket.raw_subject,
    id: data.ticket.id,
    priority: data.ticket.priority,
    state: data.ticket.status,
    type: data.ticket.type,
    userName: userName,
  };
  //'created_at': formatDate(data.user.created_at),
  let source = $('#info-template').html();
  let template = Handlebars.compile(source);
  let html = template(requester_data);
  $('#info').html(html);
}
/*SHOW HOME */
function showHome(data) {
  let requester_data = {};
  let source = $('#home-template').html();
  let template = Handlebars.compile(source);
  let html = template(requester_data);
  $('#home').html(html);

  let btn2 = document.getElementById('proposed');
  btn2.addEventListener('click', () => {
    popModal('assets/modal.html', '410');
  });
  let btn3 = document.getElementById('lookup');
  btn3.addEventListener('click', () => {
    popModal('assets/modalList.html', '240');
  });
}
/*ERRORES */
function showError(response) {
  let error_data = {
    status: response.status,
    statusText: response.statusText,
  };
  let source = $('#error-template').html();
  let template = Handlebars.compile(source);
  let html = template(error_data);
  $('#content').html(html);
}
function renderlookup() {
  let existingList = document.querySelector('.lookup-list');
  existingList.innerHTML = '';
  let selectedCustomizationValues = JSON.parse(
    localStorage.getItem('selectedCustomizationValues')
  );
  selectedCustomizationValues.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'bundle-li';
    li.innerHTML = `      
    <span class="w-75 ps-2">${item.name}</span>
      <div class="btn-group dropdown w-25">
        <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" onclick="clickDeleteLookup('${item.id}', '${item.name}')" id="bundle-delete">Remove</button></li>
          <li><button class="dropdown-item" id="ver-erd" disabled >ERD</button></li>
          </div>`;
    existingList.appendChild(li);
  });
  localStorage.removeItem('selectedCustomizationValues');
}
//Existing Customizations
function removeExistingCustomization(existingName, existingId) {
  const scriptDeploy = 'flo_cr_api';
  const action = 'removeCustomization';
  const params = {
    ticketID: ticketNumber,
    isExisting: 'true',
    existing: existingName,
    custoInternalId: existingId,
  };
  const callback = async (results) => {
    let existingList = [];
    results.custIds.forEach((id, idx) => {
      existingList.push({ name: results.custNames[idx], id: id });
    });
    await localStorage.setItem(
      'selectedCustomizationValues',
      JSON.stringify(existingList)
    );
    renderlookup();
    $('#existing-customizations.bundle-id-lista #loader').removeClass('loader').trigger("enable");
    $('#existing-customizations.bundle-id-lista #loader-pane').removeClass('loader-pane')
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
    params,
    callback
  );

}
function clickDeleteLookup(id, name) {
  $('#existing-customizations.bundle-id-lista #loader').addClass('loader')
  $('#existing-customizations.bundle-id-lista #loader-pane').addClass('loader-pane')
  const selectedCustomizationValues = JSON.parse(
    localStorage.getItem('selectedCustomizationValues')
  );
  removeExistingCustomization(name, id);
}
//Proposed Customization
function renderProposed() {
  let bundleLista = document.querySelector('.proposed-lista');
  bundleLista.innerHTML = '';
  let ProposedCustomization = JSON.parse(
    localStorage.getItem('ProposedCustomization')
  );
  let i = 0;
  ProposedCustomization.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'bundle-li';
    li.innerHTML = `      
    <span class="w-75 ps-2">${item}</span>
    <div class="btn-group dropdown w-25">
    <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
    <ul class="dropdown-menu">
          <li><button class="dropdown-item" onclick="clickDeleteProposed('${item}')" data-value="${i}" id="bundle-delete">Remove</button></li>
          </div>`;
    bundleLista.appendChild(li);
    i++;
  });
  localStorage.removeItem('ProposedCustomization');
}
function removeProposed(proposedName) {
  $('#proposed-customizations.bundle-id-lista #loader').addClass('loader')
  $('#proposed-customizations.bundle-id-lista #loader-pane').addClass('loader-pane')
  const scriptDeploy = 'flo_cr_api';
  const action = 'removeCustomization';
  const params = {
    ticketID: ticketNumber,
    isExisting: '',
    existing: proposedName,
  };
  const callback = (results) => {
    if (results.proposedCusts != '') {
      localStorage.setItem(
        'ProposedCustomization',
        JSON.stringify(results.proposedCusts.split(','))
      );
    } else {
      localStorage.setItem('ProposedCustomization', JSON.stringify([]));
    }

    renderProposed();
    $(`#proposed-customizations #loader`).removeClass('loader').trigger("enable");
    $('#proposed-customizations #loader-pane').removeClass('loader-pane')

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
    params,
    callback
  );
}
function clickDeleteProposed(name) {
  removeProposed(name);
}
/*BUNDLE*/
function renderBundle() {
  const bundlesRender = document.querySelector('.bundle-list');
  bundlesRender.innerHTML = '';
  let i = 0;
  bundlesList.forEach((bundle) => {
    const li = document.createElement('li');
    li.className = 'bundle-li';
    li.innerHTML = `
      <span class="w-75 ps-2">${bundle}</span>
      <div class="btn-group dropdown w-25">
        <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" onclick="removeBundle('${bundle}')" data-value="${i}" id="bundle-delete">Remove</button></li>
      </div>`;
    bundlesRender.appendChild(li);
    i++;
  });
}
function addBundle() {
  //valida los dats del input 
  //compara si esta vacio
  if ($('#inp-bundle')[0].value !== '') {
    //compara si es un numero
    if (!isNaN($('#inp-bundle')[0].value)) {
      //compara si tiene mas de 6 digitos
      if ($('#inp-bundle')[0].value.length < 7) {
        //activa y desactiva el boton
        $('#bundle-id.bundle-id-lista #loader').addClass('loader')
        $('#bundle-id.bundle-id-lista #loader-pane').addClass('loader-pane')
        $('.btn-plus').prop('disabled', true)
        $('#bundle-id.bundle-id-lista #loader').on('enable', function () { $('.btn-plus').prop('disabled', false) });
        //obtiene el valor
        bundleID = document.getElementById('inp-bundle').value;
        $('#inp-bundle')[0].value = '';
        //scryt de NS
        const params = {
          bundleId: bundleID,
          ticketID: ticketNumber,
        };
        const scriptDeploy = 'flo_cr_api';
        const action = 'addBundleId';
        const callback = async (results) => {
          bundlesList =
            results.affectedBundleID === ''
              ? []
              : results.affectedBundleID.split(',');
          renderBundle();
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
          params,
          callback,
        );
        $('#errorBundle')[0].innerHTML = ''
      } else {
        $('#errorBundle')[0].innerHTML = '<p>You can enter a maximum of six numbers</p>'
      }
    } else {
      $('#errorBundle')[0].innerHTML = '<p>You must enter a number</p>'
    }
  } else {
    $('#errorBundle')[0].innerHTML = '<p>You must enter a bundle ID</p>'
  }
}
function removeBundle(bundleID) {
  $('#bundle-id.bundle-id-lista #loader').addClass('loader')
  $('#bundle-id.bundle-id-lista #loader-pane').addClass('loader-pane')
  const scriptDeploy = 'flo_cr_api';
  const action = 'removeBundleId';
  const params = {
    ticketID: ticketNumber,
    bundleId: bundleID,
  };
  const callback = (results) => {
    if (results.affectedBundleID != '') {
      bundlesList =
        results.affectedBundleID === ''
          ? []
          : results.affectedBundleID.split(',');
      renderBundle();
      console.log('the bundle was deleted');
    } else {
      console.log("don't have a bundleID");
    }
    renderBundle();
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
    params,
    callback
  );
}

//zendesk user data
var userData = '';
var userName = '';
function getCurrentUser() {
  return client.get('currentUser').then(async function (data) {
    return data['currentUser'];
  });
}
/*LOGIN*/
function loginUser(client, id) {
  let settings = {
    url: '/api/v2/tickets',
    type: 'GET',
    dataType: 'json',
  };

  client.request(settings).then(
    function (data) {
      showHome(data);
    },
    function (response) {
      showError(response);
    }
  );
}
try {
  client.get('ticket').then(async function (data) {
    userData = await getCurrentUser();
    userName = userData?.name;
    ticketNumber = data.ticket.id.toString();
    ticketSubject = data.ticket.subject;
    ticketDescription = data.ticket.description;
    ticketStatus = data.ticket.status;

    showInfo(data, userName);
    showHome(data);
    const isOperator =
      userData?.groups.filter((element) => element.name === 'Operators')
        .length > 0;
    const isAdministrator =
      userData?.groups.filter((element) => element.name === 'Administrators')
        .length > 0;
    await getCustomizations(isOperator, isAdministrator);
  });
} catch (error) {
  console.log('error');
}
function popModal(url, h) {
  localStorage.removeItem('zendesk-tiquet-id');
  localStorage.setItem('zendesk-tiquet-id', ticketNumber);
  client
    .invoke('instances.create', {
      location: 'modal',
      url: url,
      size: { width: '750px', height: h },
    })
    .then(function (modalContext) {
      // The modal is on the screen now!
      var modalClient = client.instance(
        modalContext['instances.create'][0].instanceGuid
      );
      client.on('instance.registered', function () { });
      modalClient.on('modal.close', function () {
        if (localStorage.getItem('selectedCustomizationValues')) {
          renderlookup();
        }
        if (localStorage.getItem('ProposedCustomization')) {
          renderProposed();
        }
        // The modal has been closed.
      });
    });
}
function changeStatus(action) {
  switch (action) {
    case 'request':
      updateTicketStatus('PendingApproval');
      break;
    case 'approved':
      updateTicketStatus('Approve');
      break;
    case 'reject':
      updateTicketStatus('Canceled');
      break;

    default:
      console.log('status', action);
      break;
  }
}



function removeLoader() {
  if ($(`#loader`)) {
    $(`#loader`).removeClass('loader').trigger("enable");
    $('#loader-pane').removeClass('loader-pane')
  }

}



/*
//Date format
function formatDate(date) {
  var cdate = new Date(date);
  var options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  date = cdate.toLocaleDateString('es-ar', options);
  return date;
}
 */