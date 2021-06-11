//VARIABLES
let bundles = [];
let existingCustom = {};
let existingProp = {};
let name, scriptid, bundleid, type, from, to;
let resultado;

var client = ZAFClient.init();
client.invoke('resize', {width: '100%', height: '900px'});

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

/*SHOW INFO */
function showInfo(data, user) {
  let requester_data = {
    titulo: data.ticket.raw_subject,
    id: data.ticket.id,
    prioridad: data.ticket.priority,
    estado: data.ticket.status,
    tipo: data.ticket.type,
    user: user,
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
/*BUNDLE*/
function clickDelete(name) {
  bundles.forEach((bundle, i) => {
    if (bundle === `${name}`) {
      bundles.splice(i, 1);
      return;
    }
  });
  localStorage.setItem('bundle-id', JSON.stringify(bundles));
  renderBundle(bundles);
}
function renderBundle() {
  let bundleLista = document.querySelector('.bundle-lista');
  bundleLista.innerHTML = '';
  let i = 0;
  let bundles = JSON.parse(localStorage.getItem('bundle-id'));
  bundles.forEach((bundle) => {
    const li = document.createElement('li');
    li.className = 'bundle-li';
    li.innerHTML = `      
      <span class="w-75 ps-2">${bundle}</span>
      <div class="btn-group dropdown w-25">
        <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" onclick="clickDelete('${bundle}')" data-value="${i}" id="bundle-delete">Remove</button></li>
      </div>`;
    bundleLista.appendChild(li);
    i++;
  });
}
function addBundle() {
  $('.btn-plus').click(() => {
    if ($('#inp-bundle')[0].value !== '') {
      bundles.push($('#inp-bundle')[0].value);
      localStorage.setItem('bundle-id', JSON.stringify(bundles));
      $('#inp-bundle')[0].value = '';
      renderBundle();
    }
  });
}
//Existing Customizations
function renderlookup() {
  let existingLista = document.querySelector('.lookup-lista');
  existingLista.innerHTML = '';
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
          <li><button class="dropdown-item" onclick="clickDeleteLookup('${item.id}')" id="bundle-delete">Remove</button></li>
          <li><button class="dropdown-item" id="ver-erd" disabled >ERD</button></li>
      </div>`;
    existingLista.appendChild(li);
  });
}

function removeExistingCustomization(existingName, existingId) {
  const scriptDeploy = 'flo_cr_api';
  const action = 'removeCustomization';
  const params = {
    ticketID: localStorage.getItem('zendesk-tiquet-id'),
    isExisting: 'true',
    existing: existingName,
    custoInternalId: existingId,
  };
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
        JSON.parse(localStorage.getItem('selectedCustomizationValues')).filter(
          (element) => element.id !== existingId
        )
      )
    );

    renderlookup();
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
function clickDeleteLookup(id) {
  const selectedCustomizationValues = JSON.parse(
    localStorage.getItem('selectedCustomizationValues')
  );
  const name = selectedCustomizationValues.filter((item) => item.id === id)[0]
    .name;

  removeExistingCustomization(name, id);
  // let selectedCustomizationValues = JSON.parse(
  //   localStorage.getItem('selectedCustomizationValues')
  // );
  // selectedCustomizationValues.forEach((bundle, i) => {
  //   if (bundle === `${name}`) {
  //     selectedCustomizationValues.splice(i, 1);
  //     return;
  //   }
  // });
  // localStorage.setItem(
  //   'selectedCustomizationValues',
  //   JSON.stringify(selectedCustomizationValues)
  // );
  // renderlookup();
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
}
function removeProposed(proposedName) {
  const scriptDeploy = 'flo_cr_api';
  const action = 'removeCustomization';
  const params = {
    ticketID: localStorage.getItem('zendesk-tiquet-id'),
    isExisting: 'false',
    existing: proposedName,
  };
  const callback = (results) => {
    localStorage.setItem(
      'ProposedCustomization',
      JSON.stringify(results.proposedCusts.split(','))
    );
    renderProposed();
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
  // let ProposedCustomization = JSON.parse(
  //   localStorage.getItem('ProposedCustomization')
  // );
  // ProposedCustomization.forEach((bundle, i) => {
  //   if (bundle === `${name}`) {
  //     ProposedCustomization.splice(i, 1);
  //     return;
  //   }
  // });
  removeProposed(name);
  // localStorage.setItem(
  //   'ProposedCustomization',
  //   JSON.stringify(ProposedCustomization)
  // );
  // renderProposed();
}

function requestTicketInfo(client, data) {
  let settings = {
    url: '/api/v2/tickets/' + data.ticket.id + '.json',
    type: 'GET',
    dataType: 'json',
  };
  let user = data.ticket.requester.name;
  localStorage.setItem('zendesk-tiquet-id', data.ticket.id);

  client.request(settings).then(
    function (data) {
      showInfo(data, user);
      showHome(data);
      addBundle();
      //crearModal(client)
    },
    function (response) {
      showError(response);
    }
  );
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
function crearModal(client) {
  function init(location) {
    location === 'modal' ? new ModalApp() : new TicketApp();
  }

  function mainEl() {
    return document.querySelector('.ventana');
  }

  function replaceLineBreaks(str) {
    return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
  }

  var TicketApp = function () {
    var text = localStorage.getItem('modalText') || '';
    this.render(replaceLineBreaks(text));
  };
  TicketApp.prototype = {
    render: function (text) {
      if (!this.inDOM) {
        mainEl().innerHTML =
          '<button class="edit c-btn btn-op" id="ventana">Edit</button>';
        document
          .querySelector('.edit')
          .addEventListener('click', this.openModal.bind(this));
        this.inDOM = true;
      } else {
        //document.querySelector('#text').innerText = text;
      }
    },

    openModal: function () {
      var self = this;
      return client
        .invoke('instances.create', {
          location: 'modal',
          url: 'assets/iframe.html',
        })
        .then(function (data) {
          var instanceGuid = data['instances.create'][0].instanceGuid;
          var modalClient = client.instance(instanceGuid);
          modalClient.on('modal.save', function (data) {
            self.render(data.text);
          });
        });
    },
  };

  var ModalApp = function () {
    this.render(localStorage.getItem('modalText') || '');
  };

  ModalApp.prototype = {
    render: function (text) {
      var text = localStorage.getItem('modalText') || '';
      mainEl().innerHTML = `

      <div class="mod-body mx-auto">
      <div class="mod-head">
          <h2 class="os-20 fw-bold px-0 py-2">Lookup Customization</h2>
      </div>
      <div class="mod-inner">
          <form class="form-modal" id="modal">
              <div class="form-group has-success mb-2 ">
                  <label class="os-14 pb-2" for="">Name</label>
                  <input class="m-16" type="text" name="name" placeholder="" id="inp-name" />
                  <span id="error" class="help-block"></span>
              </div>
              <div class="form-group has-success mb-2 ">
                  <label class="os-14 pb-2" for="">Script ID</label>
                  <input class="m-16" type="text" name="scriptid" placeholder="" id="inp-scriptid" />
                  <span id="error" class="help-block"></span>
              </div>
              <div class="form-group has-success mb-2 ">
                  <label class="os-14 pb-2" for="">Bundle ID</label>
                  <input class="m-16" type="text" name="bundleid" placeholder="" id="inp-bundleid" />
                  <span id="error" class="help-block"></span>
              </div>
              <div class="form-group has-success mb-2 ">
                  <label class="os-14 pb-2" for="">Type</label>
                  <select class="m-16" name="type" id="inp-type">
                      <option>Select Type</option>
                      <option>Bill of Materials</option>
                  </select>
                  <span id="error" class="help-block"></span>
              </div>
              <div class="form-group has-success mb-2 ">
                  <label class="os-14 pb-2" for="">From</label>
                  <input type="date">
                  <span id="error" class="help-block"></span>
              </div>
              <div class="form-group has-success mb-2 ">
                  <label class="os-14 pb-2" for="">To</label>
                  <input type="date">
                  <span id="error" class="help-block"></span>
              </div>

              <button class="c-btn btn-form-close os-14" type="submit">Lookupo</button>
             <!-- <textarea class="c-txt__input c-txt__input--area"></textarea><br>-->
          </form>
      </div>
  </div>


      `;
      document
        .querySelector('#modal')
        .addEventListener('submit', this.onModalSubmit.bind(this));
    },

    onModalSubmit: function (evt) {
      let name = evt.target.querySelector('#inp-name').value;
      var textareaValue = evt.target.querySelector('textarea').value;
      evt.preventDefault();
      localStorage.setItem('modalText', textareaValue);
      client.trigger('modal.save', {text: textareaValue});
      client.invoke('destroy');
    },
  };

  client.on('app.registered', function (data) {
    init(data.context.location);
  });
}
try {
  client.get('ticket').then(function (data) {
    requestTicketInfo(client, data);
    //requestUserInfo(client, user_id);
    //loginUser(client, user_id)
    //requestTicketInfo(client, id)
  });
} catch (error) {
  console.log('erro');
}
function popModal(url, h) {
  console.log('Open modal');
  client
    .invoke('instances.create', {
      location: 'modal',
      url: url,
      size: {width: '750px', height: h},
    })
    .then(function (modalContext) {
      // The modal is on the screen now!
      var modalClient = client.instance(
        modalContext['instances.create'][0].instanceGuid
      );
      client.on('instance.registered', function () {});
      modalClient.on('modal.close', function () {
        renderlookup();
        renderProposed();
        // The modal has been closed.
      });
    });
}
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

function getCustomizations() {
  const scriptDeploy = 'flo_cr_api';
  const action = 'getCRData';
  const ticketId = {ticketID: localStorage.getItem('zendesk-tiquet-id')};

  const callback = (results) => {
    let existingList = [];
    results.custIds.forEach((id, idx) => {
      existingList.push({name: results.custNames[idx], id: id});
    });
    localStorage.setItem(
      'selectedCustomizationValues',
      JSON.stringify(existingList)
    );
    localStorage.setItem(
      'ProposedCustomization',
      JSON.stringify(results.proposedCusts.split(','))
    );
    renderlookup();
    renderProposed();
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
    callback
  );
}
getCustomizations();

function updateTicketStatus(newState) {
  const scriptDeploy = 'flo_cr_api';
  const action = 'createCR';
  const params = {
    ticketID: localStorage.getItem('zendesk-tiquet-id'),
    changeNum: localStorage.getItem('zendesk-tiquet-name'),
    description: localStorage.getItem('zendesk-tiquet-description'),
    state: newState,
    // bundleId: bundleId,
  };

  const callback = (results) => {
    console.log('Update Ticket Results', results);
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
