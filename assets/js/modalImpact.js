let client = ZAFClient.init();
console.log('impact ')

impactAnalisis()


async function impactAnalisis() {
    $('#pills-tabContent #loader').addClass('loader')
    $('#pills-tabContent #loader-pane').addClass('loader-pane')
    const scriptDeploy = 'flo_impact_analysis_restlet';
    const ticketId = '21890'        //     { ticketID: ticketNumber };


    const callback = (response) => {
        
        
        let impact_analysis_data = JSON.parse(response);

       
        impact_analysis_data = impact_analysis_data.data
        console.log(impact_analysis_data)

        if (impact_analysis_data === null) {
            $('.impact-analisis').innerHtml =  '<table class="aui" style="size:10px"><tbody><tr><td>No Impact Analysis data</td></tr></tbody></table>';
                console.log('null')
        } else {
            let safe_data = impact_analysis_data.safe;
            let not_safe_data = impact_analysis_data.notSafe;
            let not_active_data = impact_analysis_data.notActive;
            
            console.log(safe_data)
            let pillsSafe =  document.querySelector('#pills-safe')
            let pillsNotsafe =  document.querySelector('#pills-notsafe')
            let pillsInactive =  document.querySelector('#pills-inactive')

           if (safe_data.length !== 0) {
            let dataNotsafe = document.querySelector('.data-safe')
            dataNotsafe.innerHTML = ''

            console.log(not_safe_data)

            not_safe_data.forEach(element => {

                const tr = document.createElement('tr');
                tr.className = 'look-tr';
                tr.innerHTML = `  <td class=" item d-flex w-60">
                                    <p class="os-14 my-auto">${element.object}</p></td>
                                  <td class=" item d-flex w-40 my-auto">
                                      <p class="os-14 my-auto">${element.warning}</p>
                                  </td>
                                  <td class=" item d-flex w-40 my-auto">
                                      <p class="os-14 my-auto">${element.impactedlinks}</p>
                                  </td>
                                  `
                dataNotsafe.appendChild(tr);




                    console.log(element)
            });



           }else{
            pillsSafe.innerHTML = '<p class="os-16 fw-bold mt-5">No information available to display</p>'
           }


        
            if (not_safe_data.length !== 0) {
                let dataNotsafe = document.querySelector('.data-notsafe')
                dataNotsafe.innerHTML = ''

                console.log(not_safe_data)

                not_safe_data.forEach(element => {

                    const tr = document.createElement('tr');
                    tr.className = 'look-tr';
                    tr.innerHTML = `  <td class=" item d-flex w-60">
                                        <p class="os-14 my-auto">${element.object}</p></td>
                                      <td class=" item d-flex w-40 my-auto">
                                          <p class="os-14 my-auto">${element.warning}</p>
                                      </td>
                                      <td class=" item d-flex w-40 my-auto">
                                          <p class="os-14 my-auto">${element.impactedlinks}</p>
                                      </td>
                                      `
                    dataNotsafe.appendChild(tr);




                        console.log(element)
                });
            }else{
                pillsNotsafe.innerHTML = '<p class="os-16 fw-bold mt-5">No information available to display</p>'
            }
        
             if (not_active_data.length != 0) {
                let dataNotsafe = document.querySelector('.data-inactive')
                dataNotsafe.innerHTML = ''

                console.log(not_safe_data)

                not_safe_data.forEach(element => {

                    const tr = document.createElement('tr');
                    tr.className = 'look-tr';
                    tr.innerHTML = `  <td class=" item d-flex w-60">
                                        <p class="os-14 my-auto">${element.object}</p></td>
                                      <td class=" item d-flex w-40 my-auto">
                                          <p class="os-14 my-auto">${element.warning}</p>
                                      </td>
                                      <td class=" item d-flex w-40 my-auto">
                                          <p class="os-14 my-auto">${element.impactedlinks}</p>
                                      </td>
                                      `
                    dataNotsafe.appendChild(tr);




                        console.log(element)
                });

            }else{
                pillsInactive.innerHTML = '<p class="os-16 fw-bold mt-5">No information available to display</p>'
            }
        
            /*
            safe += '</tbody></table>';
            notsafe += '</tbody></table>';
            inactive += '</tbody></table>';
        
            // let tab = '<div class="aui-tabs horizontal-tabs">';
            // tab += '<ul class ="tabs-menu">';
            // tab += '<li class="menu-item active-tab"><a href="#can-be-safely-deleted-or-modified">Safe</a></li>';
            // tab += '<li class="menu-item"><a href="#cannot-be-safely-deleted-or-modified">Not Safe</a></li>'; 
            // tab += '<li class="menu-item"><a href="#inactive-customizations">Inactive</a></li>'; 
            // tab += '</ul>'
            // tab += '<div class="tabs-pane active-pane" id="can-be-safely-deleted-or-modified">'+ safe +'</div>';
            // tab += '<div class="tabs-pane" id="cannot-be-safely-deleted-or-modified">'+ notsafe +'</div>';
            // tab += '<div class="tabs-pane" id="inactive-customizations">'+ inactive +'</div>';
            // tab += '</div>';
            let tab = "";
        
            if (safe_data.length != 0) { tab += safe + '<br><br>'; }
            if (not_safe_data.length != 0) { tab += notsafe + '<br><br>'; }
            if (not_active_data.length != 0) { tab += inactive + '<br><br>'; }
        
            table += tab;
            */
        }





    }
    const callbackError = (e) => {
        console.log(e)
    };
    const params = await client.metadata().then(metadata => {
        accountId = metadata.settings.accountId ? metadata.settings.accountId :
            'TSTDRV1724328'
        consumerKey = metadata.settings.consumerKey ? metadata.settings.consumerKey :
            '35f13daf104282ea3edfdd67cf3f21f58b8d9b1914305d7ec451aee0888ed112';
        consumerSecret = metadata.settings.consumerSecret ? metadata.settings.consumerSecret :
            '0a410d4fb4c5b9219b4593ef3abe7fd4efb52ad351ed1199e82e9ad92cf1dfff';
        tokenId = metadata.settings.tokenId ? metadata.settings.tokenId :
            '580ba69efedcd8f4bdd7ac7bec6bc0324245a56d24a66d52ab061e1c5cf3ab41';
        tokenSecret = metadata.settings.tokenSecret ? metadata.settings.tokenSecret :
            'ba3426be5d771f1346ef0b66e40c5da6796301ce2413ec0de3a210dfa2d0be5e';



        let restDomainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`;
        return serviceNestsuite(
            restDomainBase,
            accountId,
            consumerKey,
            consumerSecret,
            tokenId,
            tokenSecret,
            `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&crId=${ticketId}`
        )
    })
    
    client.request(params).then((results) => {
        let result = JSON.parse(results)
      
        if (result.message === 'success') {
            removeLoader()
        }
        
        callback(results)
    })
    .catch((e) => {
        callbackError(e)
        console.log(e);
        if (e.statusText === 'error') {
            removeLoader()

        }
    })



    /*
  https://tstdrv1724328.restlets.api.netsuite.com
   
  /app/site/hosting/restlet.nl?
  
  script=customscript_flo_impact_analysis_restlet&
  deploy=customdeploy_flo_impact_analysis_restlet&
  crId=21890
  
  
  
  */
}
function removeLoader() {
    if ($(`#loader`)) {
      $(`#loader`).removeClass('loader').trigger("enable");
      $('#loader-pane').removeClass('loader-pane')
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
        let base_url = restDomainBase.split('?')[0];
        let query_params = restDomainBase.split('?')[1];
        let params = query_params.split('&');
        let parameters = {};
        for (let i = 0; i < params.length; i++) {
            parameters[params[i].split('=')[0]] = params[i].split('=')[1];
        }
        let token = {
            key: tokenId,
            secret: tokenSecret,
        };
        let oauth = new OAuth({
            consumer: {
                key: consumerKey,
                secret: consumerSecret,
            },
            signature_method: 'HMAC-SHA256',
            hash_function: function (base_string, key) {
                return CryptoJS.HmacSHA256(base_string, key).toString(
                    CryptoJS.enc.Base64
                );
            },
        });

        let request_data = {
            url: base_url,
            method: httpMethod,
            data: parameters,
        };

        let headerWithRealm = oauth.toHeader(oauth.authorize(request_data, token));
        headerWithRealm.Authorization += ',realm="' + accountId + '"';

        return headerWithRealm;
    }
    let restUrl = domainBase + path;

    //OPTIONS CREATION
    let headerWithRealm = generateTbaHeader(
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