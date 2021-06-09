// Initialise Apps framework client. See also:
// https://developer.zendesk.com/apps/docs/developer-guide/getting_started

console.log('Comienza el script');
//VARIABLES
let bundles = [];
let existingCustom = {};
let existingProp = {};

let name, scriptid, bundleid, type, from, to;
let resultado;
localStorage.setItem('ProposedCustomization', JSON.stringify([]));
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

  let btn2 = document.getElementById('ventana2');
  btn2.addEventListener('click', () => {
    popModal('assets/modal.html', '410');
  });
  let btn3 = document.getElementById('ventana1');
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
  let bundleList = document.querySelector('.bundle-lista');
  bundleList.innerHTML = '';
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
    bundleList.appendChild(li);
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
  let bundleList = document.querySelector('.lookup-lista');
  bundleList.innerHTML = '';
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
    bundleList.appendChild(li);
    i++;
  });
}
function clickDeleteLookup(name) {
  let selectedCustomizationValues = JSON.parse(
    localStorage.getItem('selectedCustomizationValues')
  );
  selectedCustomizationValues.forEach((bundle, i) => {
    if (bundle === `${name}`) {
      selectedCustomizationValues.splice(i, 1);
      return;
    }
  });
  localStorage.setItem(
    'selectedCustomizationValues',
    JSON.stringify(selectedCustomizationValues)
  );
  renderlookup();
}
//Proposed Customization
function renderProposed() {
  let bundleList = document.querySelector('.proposed-lista');
  bundleList.innerHTML = '';
  let ProposedCustomization = JSON.parse(
    localStorage.getItem('ProposedCustomization')
  );
  console.log('esto es lo q tengo q ver');
  let i = 0;
  // ProposedCustomization.forEach((item) => {
  //   const li = document.createElement('li');
  //   li.className = 'bundle-li';
  //   li.innerHTML = `
  //     <span class="w-75 ps-2">${item}</span>
  //     <div class="btn-group dropdown w-25">
  //       <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
  //       <ul class="dropdown-menu">
  //         <li><button class="dropdown-item" onclick="clickDeletePoposed('${item}')" data-value="${i}" id="bundle-delete">Remove</button></li>
  //     </div>`;
  //   bundleList.appendChild(li);
  //   i++;
  // });
}
function clickDeletePoposed(name) {
  let ProposedCustomization = JSON.parse(
    localStorage.getItem('ProposedCustomization')
  );
  ProposedCustomization.forEach((bundle, i) => {
    if (bundle === `${name}`) {
      ProposedCustomization.splice(i, 1);
      return;
    }
  });
  localStorage.setItem(
    'ProposedCustomization',
    JSON.stringify(ProposedCustomization)
  );
  renderProposed();
}

function requestTicketInfo(client, data) {
  let settings = {
    url: '/api/v2/tickets/' + data.ticket.id + '.json',
    type: 'GET',
    dataType: 'json',
  };
  let user = data.ticket.requester.name;

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
        console.log('The modal has been closed.');
      });
    });
}
