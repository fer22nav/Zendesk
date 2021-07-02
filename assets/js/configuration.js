


let groupsRequestAppropve = []
let groupsApprove = []
let client = ZAFClient.init();


//carga las variables con los datos del manifest
//y ejecuta los renders de cada grupo
client.metadata().then(metadata => {
    if (metadata.settings.requestApproveGroups !== 'null') {
        let group1 = metadata.settings.requestApproveGroups
        group1 = group1.split(',')
        group1.forEach(e => {
            groupsRequestAppropve.push(e)
        })
        rendergroup(group1)
    }
    if (metadata.settings.approveGroups !== 'null') {
        let group2 = metadata.settings.approveGroups
        group2 = group2.split(',')
        group2.forEach(e => {
            groupsApprove.push(e)
        })
        rendergroup2(group2)
    }
})








//obtiene los datos de cuenta netsuite
$('.btn-acount').click(async function () {
    //variables
    let accountId
    let consumerKey
    let consumerSecret
    let tokenId
    let tokenSecret
    //selecciona elementos del dom
    event.preventDefault();
    accountId = document.getElementById('accountId').value;
    consumerKey = document.getElementById('consumerKey').value;
    consumerSecret = document.getElementById('consumerSecret').value;
    tokenId = document.getElementById('tokenId').value;
    tokenSecret = document.getElementById('tokenSecret').value;
    //guarga las crdenciales en el manifest
    await setNsCredentials(accountId, consumerKey, consumerSecret, tokenId, tokenSecret)

})

function setNsCredentials(accountId, consumerKey, consumerSecret, tokenId, tokenSecret) {

    client.metadata().then(metadata => {
        let id = metadata.appId === 0 ? 500882 : metadata.appId
        let settings2 = {
            url: '/api/v2/apps/installations.json?include=app',
            type: 'GET',
            dataType: 'json'
        };
        client.request(settings2).then(
            function (data) {
                data.installations.forEach(e => {
                    if (e.app_id === id) {
                        let settings = {
                            url: `/api/v2/apps/installations/${e.id}`,
                            type: 'PUT',
                            data: {
                                "settings": {
                                    "AccountId": accountId,
                                    "ConsumerKey": consumerKey,
                                    "ConsumerSecret": consumerSecret,
                                    "TokenId": tokenId,
                                    "TokenSecret": tokenSecret
                                }
                            },
                            dataType: 'json'
                        }
                        client.request(settings).then(
                            function (data) {
                                // console.log(data)
                            },
                            function (response) {
                                console.log(response)
                            }
                        )
                    }
                })
            },
            function (response) {
                console.log(response)
            }
        )
    })
}














// agrega los grupos al manifest
function addGroup() {
    let groupsRequest = document.getElementById('select-groups').value;
    if (!groupsRequestAppropve.includes(groupsRequest)) {
        groupsRequestAppropve.push(groupsRequest)
    }
    rendergroup(groupsRequestAppropve)
    setgroup(groupsRequestAppropve.join())
}
function addGroup2() {
    let groupsRequest = document.getElementById('select-groups-2').value;
    if (!groupsApprove.includes(groupsRequest)) {
        groupsApprove.push(groupsRequest)
    }
    rendergroup2(groupsApprove)
    setgroup2(groupsApprove.join())

}
//renders
function rendergroup(groupsRequestAppropve) {
    const groupsList = document.querySelector('.groups-request-list');
    groupsList.innerHTML = '';
    let i = 0;
    groupsRequestAppropve.forEach((group) => {
        const li = document.createElement('li');
        li.className = 'bundle-li';
        li.innerHTML = `
        <span class="w-75 pt-0 os-14 ps-2">${group}</span>
        <div class="btn-group dropdown w-25">
          <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
          <ul class="dropdown-menu">
            <li><button class=" os-14 dropdown-item" onclick="removeGroupsRequestAppropve('${group}','${i}')" data-value="${i}" id="bundle-delete">Remove</button></li>
        </div>`;
        groupsList.appendChild(li);
        i++;
    });
}
function rendergroup2(groupsApprove) {
    const groupsList = document.querySelector('.groups-approval-list');
    groupsList.innerHTML = '';
    let i = 0;
    groupsApprove.forEach((group) => {
        const li = document.createElement('li');
        li.className = 'bundle-li';
        li.innerHTML = `
        <span class="w-75 os-14 pt-o ps-2">${group}</span>
        <div class="btn-group dropdown w-25">
          <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
          <ul class="dropdown-menu">
            <li><button class="os-14 dropdown-item" onclick="removeGroupsAppropve('${group}','${i}')" data-value="${i}" id="bundle-delete">Remove</button></li>
        </div>`;
        groupsList.appendChild(li);
        i++;
    });
}
//elimina de los grupos
function removeGroupsRequestAppropve(name, i) {
    groupsRequestAppropve.splice(i, 1)
    setgroup(groupsRequestAppropve.join())
    rendergroup(groupsRequestAppropve)

}
function removeGroupsAppropve(name, i) {
    groupsApprove.splice(i, 1)
    setgroup2(groupsApprove.join())
    rendergroup2(groupsApprove)
}
//setea en el manifest los grupos
function setgroup(requestApproveGroups) {
    if (requestApproveGroups.length === 0) {
        requestApproveGroups = 'null'
    }
    client.metadata().then(metadata => {
        let id = metadata.appId === 0 ? 500882 : metadata.appId
        let settings2 = {
            url: '/api/v2/apps/installations.json?include=app',
            type: 'GET',
            dataType: 'json'
        };
        client.request(settings2).then(
            function (data) {
                data.installations.forEach(e => {
                    if (e.app_id === id) {
                        let settings = {
                            url: `/api/v2/apps/installations/${e.id}`,
                            type: 'PUT',
                            data: {
                                "settings": {
                                    "requestApproveGroups": requestApproveGroups
                                }
                            },
                            dataType: 'json'
                        }
                        client.request(settings).then(
                            function (data) {
                                console.log(data)
                            },
                            function (response) {
                                console.log(response)
                            }
                        )
                    }
                })
            },
            function (response) {
                console.log(response)
            }
        )
    })
}
function setgroup2(approveGroups) {
    if (approveGroups.length === 0) {
        approveGroups = 'null'
    }
    client.metadata().then(metadata => {
        let id = metadata.appId === 0 ? 500882 : metadata.appId
        let settings2 = {
            url: '/api/v2/apps/installations.json?include=app',
            type: 'GET',
            dataType: 'json'
        };
        client.request(settings2).then(
            function (data) {
                data.installations.forEach(e => {
                    if (e.app_id === id) {
                        let settings = {
                            url: `/api/v2/apps/installations/${e.id}`,
                            type: 'PUT',
                            data: {
                                "settings": {
                                    "approveGroups": approveGroups
                                }
                            },
                            dataType: 'json'
                        }
                        client.request(settings).then(
                            function (data) {
                                console.log(data)
                            },
                            function (response) {
                                console.log(response)
                            }
                        )
                    }
                })
            },
            function (response) {
                console.log(response)
            }
        )
    })

}
// muestra los botones seun el rol de usuario
client.get('currentUser').then(async function (data) {
    if (data['currentUser'].role === 'admin') {

    } else {
        $('#pills-credentials').addClass('hid')
        $('#pills-group').addClass('hid')
    }
});
let settings = {
    url: ' /api/v2/groups',
    type: 'GET',
    dataType: 'json',
};
client.request(settings).then(
    function (data) {
        data.groups.forEach(e => {
            const option = document.createElement('option');
            const option2 = document.createElement('option');
            option2.value = e.name
            option2.innerHTML = e.name
            option.value = e.name
            option.innerHTML = e.name
            document.querySelector('#select-groups').appendChild(option)
            document.querySelector('#select-groups-2').appendChild(option2)
        });
    }
);

function setapprovalProcess(approvalProcess) {
    client.metadata().then(metadata => {
        let id = metadata.appId === 0 ? 500882 : metadata.appId
        let settings2 = {
            url: '/api/v2/apps/installations.json?include=app',
            type: 'GET',
            dataType: 'json'
        };
        client.request(settings2).then(
            function (data) {
                data.installations.forEach(e => {
                    if (e.app_id === id) {
                        let settings = {
                            url: `/api/v2/apps/installations/${e.id}`,
                            type: 'PUT',
                            data: {
                                "settings": {
                                    "approvalProcess": approvalProcess
                                }
                            },
                            dataType: 'json'
                        }
                        client.request(settings).then(
                            function (data) {
                                console.log(data)
                            },
                            function (response) {
                                console.log(response)
                            }
                        )
                    }
                })
            },
            function (response) {
                console.log(response)
            }
        )
    })

}

function select(selectedValues) {
    document.querySelector('.custom-select__trigger span').textContent = selectedValues
}


document.querySelector('.custom-select-wrapper').addEventListener('click', function () {
    this.querySelector('.custom-select').classList.toggle('open');
})
for (const option of document.querySelectorAll(".custom-option")) {
    option.addEventListener('click', function () {
        if (!this.classList.contains('selected')) {
            this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
            this.classList.add('selected');
            this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = this.textContent;
            console.log(this.textContent)
            setapprovalProcess(this.textContent)
        }
    })
}
window.addEventListener('click', function (e) {
    const select = document.querySelector('.custom-select')
    if (!select.contains(e.target)) {
        select.classList.remove('open');
    }
});





$('#select-groups-proces').change(function () {

    console.log($(this)[0].value)






})