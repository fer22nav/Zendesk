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

  let btn2 = document.getElementById('lookup');
  console.log(btn2);

  btn2.addEventListener('click', () => {
    console.log('object');
    popModal('assets/modal.html', '410');
  });
  let btn3 = document.getElementById('proposed');
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
  let bundleLista = document.querySelector('.lookup-lista');
  bundleLista.innerHTML = '';
  let selectedCustomizationValues = JSON.parse(
    localStorage.getItem('selectedCustomizationValues')
  );

  let i = 0;
  selectedCustomizationValues.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'bundle-li';
    li.innerHTML = `      
      <span class="w-75 ps-2">${item}</span>
      <div class="btn-group dropdown w-25">
        <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item" onclick="clickDeleteLookup('${item}')" data-value="${i}" id="bundle-delete">Remove</button></li>
          <li><button class="dropdown-item" data-value="${i}" id="ver-erd">ERD</button></li>
      </div>`;
    bundleLista.appendChild(li);
    i++;
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
    localStorage.setItem(
      'selectedCustomizationValues',
      JSON.stringify(results.custNames)
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
function clickDeleteLookup(name) {
  removeExistingCustomization(name, '205513');
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
  console.log('crear modal');
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
