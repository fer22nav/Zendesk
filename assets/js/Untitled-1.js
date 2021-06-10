/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/runtime', 'N/url'], function (
  search,
  record,
  runtime,
  urlMod
) {
  var SSN_SETTINGS = null;
  var SSN_BASE_URL = null;
  var MAX_SEARCH_RESULTS = 50;

  /**
   * Function called upon sending a GET request to the RESTlet.
   *
   * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
   * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
   * @since 2015.1
   */
  function doGet(requestParams) {
    SSN_SETTINGS = getSNCredentials();
    SSN_BASE_URL =
      SSN_SETTINGS.baseURL + 'nav_to.do?uri=/change_request.do?sys_id=';
    log.debug({title: 'requestParams', details: requestParams});
    switch (requestParams.action) {
      case 'addCustomizations':
        var cr = searchCR('ExternalMatch', requestParams.ticketID, null, true);
        var crId = cr.internalid;
        var existing = requestParams.existing || null;
        var proposed = requestParams.proposed || null;
        var result = addCustomizationsToCR(crId, {
          existing: existing,
          proposed: proposed,
        });
        log.debug('add result', result);
        if (result.status == 'success') {
          cr = record.load({type: 'customrecord_flo_change_request', id: crId});
          result.custNames =
            cr.getText({fieldId: 'custrecord_flo_cust_change'}) || null;
          result.proposedCusts =
            cr.getValue({fieldId: 'custrecord_flo_cr_proposed_cust'}) || '';
          result.affectedBundleID = cr.getValue({
            fieldId: 'custrecord_flo_affected_bundle_id',
          });
          result.inactive = cr.getValue({fieldId: 'isinactive'});
          result.approvalStatus = cr.getText({
            fieldId: 'custrecord_flo_approval_status',
          });
          result.completionStatus = cr.getText({
            fieldId: 'custrecord_flo_completion_status',
          });
          result.clReq = cr.getText({fieldId: 'custrecord_flo_cl_reqd'});
          result.policyApplied = cr.getText({
            fieldId: 'custrecord_flo_approval_path',
          });
          result.link = resolveChangeURL(crId);
        }
        if (result.status == 'failed') {
          result = {status: 'failed'};
          result.message =
            "Can't add Customizations to an Approved Strongpoint Change Request.";
        }
        return result;
      case 'createCR':
        var cr = searchCR('ExternalMatch', requestParams.ticketID, null, true);
        //var cr = searchCR('ExternalMatch', requestParams.changeNum, null, true);
        // NS-2129
        // NS-2337
        // Start NS-2407 - Replace '-' to whitespace: TBA issue
        /*var description = requestParams.description;
                description = description.replace(/-/g, ' ');*/
        return activateAndApproveCR(
          cr.internalid,
          requestParams.changeNum,
          requestParams.description,
          requestParams.bundleId,
          requestParams.state
        );
      // End NS-2407

      case 'getCRData':
        var cr = searchCR('ExternalMatch', requestParams.ticketID, null, false);
        var result = {status: 'failed'};
        if (cr.status == 'success') {
          result.status = 'success';
          cr = record.load({
            type: 'customrecord_flo_change_request',
            id: cr.internalid,
          });
          result = {status: 'success'};
          result.custNames =
            cr.getText({fieldId: 'custrecord_flo_cust_change'}) || null;
          result.custIds =
            cr.getValue({fieldId: 'custrecord_flo_cust_change'}) || null;
          result.proposedCusts =
            cr.getValue({fieldId: 'custrecord_flo_cr_proposed_cust'}) || '';
          result.affectedBundleID = cr.getValue({
            fieldId: 'custrecord_flo_affected_bundle_id',
          });
          result.inactive = cr.getValue({fieldId: 'isinactive'});
          result.approvalStatus = cr.getText({
            fieldId: 'custrecord_flo_approval_status',
          });
          result.completionStatus = cr.getText({
            fieldId: 'custrecord_flo_completion_status',
          });
          result.clReq = cr.getText({fieldId: 'custrecord_flo_cl_reqd'});
          result.policyApplied = cr.getText({
            fieldId: 'custrecord_flo_approval_path',
          });
          result.link = resolveChangeURL(cr.id);
        }
        return result;
      case 'removeCustomization':
        var cr = searchCR('ExternalMatch', requestParams.ticketID, null, true);
        var crId = cr.internalid;
        var isExisting = requestParams.isExisting;
        var cust = requestParams.existing;
        if (isExisting) {
          cust = cust.replace(/_/g, ' ');
        }
        var result = removeCustomzationFromCr(crId, cust, isExisting);
        if (result.status == 'success') {
          var changeReq = record.load({
            type: 'customrecord_flo_change_request',
            id: crId,
          });
          result = {status: 'success'};
          result.removedCust = requestParams.custUiId;
          result.isExisting = isExisting;
          result.custNames =
            changeReq.getText({fieldId: 'custrecord_flo_cust_change'}) || null;
          result.proposedCusts =
            changeReq.getValue({fieldId: 'custrecord_flo_cr_proposed_cust'}) ||
            '';
          result.policyApplied = changeReq.getText({
            fieldId: 'custrecord_flo_approval_path',
          });
          result.message = 'Customization Removed.';
        } else {
          result = {status: 'failed'};
          result.message =
            'Removing customization failed. Change Request is already Approved.';
        }
        return result;
      case 'search':
      case 'getFieldValue':
      case 'getRecord':
      default:
        return searchCR(requestParams.type, requestParams.lookup, null, false);
        break;
    }
  }

  function doPost(requestParameters) {
    log.debug('POST Request', requestParameters);
    return doGet(requestParameters);
  }

  return {
    get: doGet,
    post: doPost,
  };

  // Start NS-2353
  function removeCustomzationFromCr(crID, cust, isExisting) {
    var r = record.load({type: 'customrecord_flo_change_request', id: crID});
    var isApproved = r.getText({fieldId: 'custrecord_flo_approval_status'});
    if (isApproved == 'Approved') {
      return {status: 'failed'};
    } else {
      if (isExisting) {
        var custId = searchCustomizationByName(cust);
        log.debug({
          title: 'removeCustomzationFromCr Existing Customization ID',
          details: custId,
        });
        var existingCusts = r.getValue({fieldId: 'custrecord_flo_cust_change'});
        if (Array.isArray(existingCusts)) {
          existingCusts = existingCusts.filter(function (e) {
            return e !== custId;
          });
        } else {
          if (existingCusts == custId) {
            existingCusts = '';
          }
        }
        log.debug({
          title: 'removeCustomzationFromCr Updated Existing Customizations',
          details: existingCusts,
        });
        r.setValue({
          fieldId: 'custrecord_flo_cust_change',
          value: existingCusts,
        });
      } else {
        var proposedCusts = r.getValue({
          fieldId: 'custrecord_flo_cr_proposed_cust',
        });
        proposedCusts = proposedCusts.split(',');
        for (var i = 0; i < proposedCusts.length; i++) {
          if (proposedCusts[i] == cust) {
            proposedCusts.splice(i, 1);
            break;
          }
        }
        log.debug({
          title: 'removeCustomzationFromCr Updated Proposed Customizations',
          details: proposedCusts.join(','),
        });
        r.setValue({
          fieldId: 'custrecord_flo_cr_proposed_cust',
          value: proposedCusts.join(','),
        });
      }
      r.save({enableSourcing: false, ignoreMandatoryFields: true});
      return {status: 'success'};
    }
  }

  function searchCustomizationByName(cust) {
    try {
      log.debug({title: 'searchCustomizationByName cust', details: cust});
      var mySearch = search.create({
        type: 'customrecord_flo_customization',
        filters: [['name', 'is', cust], 'AND', ['isinactive', 'is', 'F']],
        columns: [
          // search.createColumn({ name: 'internalid', sort: search.Sort.ASC })
        ],
      });
      var searchResult = mySearch.run().getRange({
        start: 0,
        end: 1,
      });

      return searchResult[0].id;
    } catch (e) {
      log.debug({
        title: 'ERROR Fetching Customization to Delete',
        details: e,
      });
    }
  }
  // End NS-2352

  function searchCR(matchMode, lookupValue, columns, createNonExisting) {
    var searchColumns =
      columns != null
        ? columns
        : [
            search.createColumn({name: 'internalid'}),
            search.createColumn({name: 'isinactive'}),
          ];
    var crSearch = search.create({
      type: 'customrecord_flo_change_request',
      columns: searchColumns,
      filters: getChangeRequestMatchFilter(matchMode, [lookupValue]),
    });

    var res = crSearch.run().getRange({
      start: 0,
      end: 1,
    });

    if (res != null && res.length) {
      var responseBody = {
        status: 'success',
        internalid: res[0].getValue('internalid'),
        isinactive: res[0].getValue('isinactive'),
      };
      log.debug({title: 'success', details: responseBody});
      return responseBody;
    } else {
      if (matchMode == 'ExternalMatch' && createNonExisting) {
        var crId = createGhostCRFromExternalSource(lookupValue);
      }
      var responseBody = {
        status: 'success',
        internalid: crId,
        isinactive: true,
      };
      return responseBody;
    }
    log.debug({title: 'nothing', details: ''});
    return {status: 'failed', message: 'No matching CR found in the account'};
  }

  function getChangeRequestMatchFilter(matchMode, values) {
    var filter = {
      name: null,
      operator: null,
      values: values,
    };
    switch (matchMode) {
      case 'ExternalMatch':
        // NS-2272
        //filter.name= 'custrecord_flo_ext_change_num';
        filter.name = 'custrecord_servicenow_sys_id';
        filter.operator = search.Operator.IS;
        break;
      case 'ID':
      default:
        filter.name = 'internalid';
        filter.operator = search.Operator.IS;
        break;
    }
    return filter;
  }

  function createGhostCRFromExternalSource(lookupValue) {
    var crRec = record.create({
      type: 'customrecord_flo_change_request',
      isDynamic: true,
    });
    crRec.setValue({
      fieldId: 'custrecord_flo_ext_change_num',
      value: lookupValue,
    });
    // NS-2272
    crRec.setValue({
      fieldId: 'custrecord_servicenow_sys_id',
      value: lookupValue,
    });
    crRec.setValue({fieldId: 'isinactive', value: true});
    crRec.setValue({fieldId: 'custrecord_flo_change_type', value: 17});
    var newCRId = crRec.save({
      enableSourcing: false,
      ignoreMandatoryFields: true,
    });
    return newCRId;
  }

  function addCustomizationsToCR(crID, custs) {
    log.debug('addCusts', custs);
    log.debug('toCR', crID);
    var r = record.load({type: 'customrecord_flo_change_request', id: crID});
    // Start NS-2340
    var isApproved = r.getText({fieldId: 'custrecord_flo_approval_status'});
    if (isApproved == 'Approved') {
      return {status: 'failed'};
    } else {
      if (
        /^.+$/.test(custs.proposed) &&
        custs.proposed != null &&
        custs.proposed.length > 0
      ) {
        return addProposedCustomizationsToCR(r, custs.proposed);
      }
      if (
        /^.+$/.test(custs.existing) &&
        custs.existing != null &&
        custs.existing.length > 0
      ) {
        return addExistingCustomizationsToCR(r, custs.existing.split(','));
      }
    }
    // End NS-2340
    return {status: 'failed'};
  }

  function addExistingCustomizationsToCR(cr, custs) {
    log.debug('adding existing custs', cr.id + ' - ' + custs);
    var custsInCR = cr.getValue({fieldId: 'custrecord_flo_cust_change'});
    try {
      if (custsInCR.length < 1) {
        custsInCR = custs;
      } else {
        custsInCR = custsInCR.concat(custs);
      }
      log.debug('custs in cr 1', custsInCR);
      custsInCR = uniq_fast(custsInCR);
      log.debug('custs in cr', custsInCR);
      cr.setValue({fieldId: 'custrecord_flo_cust_change', value: custsInCR});
      cr.save({enableSourcing: false, ignoreMandatoryFields: true});
      log.debug('save 1');
      return {status: 'success'};
    } catch (e) {
      log.debug("couldn't add customizations", e.message);
      return {status: 'failed', error: e.name, message: e.message};
    }
  }

  function addProposedCustomizationsToCR(cr, proposed) {
    log.debug('adding proposed custs', cr + ' - ' + proposed);
    var proposedInCR = cr.getValue({
      fieldId: 'custrecord_flo_cr_proposed_cust',
    });
    try {
      if (
        proposedInCR != null &&
        proposedInCR.length > 0 &&
        /[^\s\r\n\t]$/.test(proposedInCR)
      ) {
        proposedList = proposedInCR.split(',');
        log.debug('proposedList');
        var found = false;
        for (var i = 0; i < proposedList.length && !found; i++) {
          if (proposedList[i] == proposed) {
            found = true;
          }
        }
        if (!found) {
          var newProposed = (proposedInCR += ',' + proposed);
          cr.setValue({
            fieldId: 'custrecord_flo_cr_proposed_cust',
            value: newProposed,
          });
          cr.save({enableSourcing: false, ignoreMandatoryFields: true});
          log.debug('save 1');
        } else {
          //already in proposed
          log.debug('already prop');
        }
      } else {
        cr.setValue({
          fieldId: 'custrecord_flo_cr_proposed_cust',
          value: proposed,
        });
        cr.save({enableSourcing: false, ignoreMandatoryFields: true});
        log.debug('save 2');
      }
      return {status: 'success'};
    } catch (e) {
      log.debug('e', e.name + ' ' + e.message);
      return {status: 'failed', error: e.name, message: e.message};
    }
  }

  function activateAndApproveCR(crId, changeNum, changeDesc, bundleId, state) {
    cr = record.load({type: 'customrecord_flo_change_request', id: crId});
    try {
      //var ssnTicketID = cr.getValue({fieldId: 'custrecord_flo_ext_change_num'});
      var ssnTicketID = cr.getValue({fieldId: 'custrecord_servicenow_sys_id'});
      // NS-2340
      var isApproved = cr.getText({fieldId: 'custrecord_flo_approval_status'});
      log.debug('e', changeNum + ' ' + isApproved);
      cr.setValue({fieldId: 'isinactive', value: false});
      log.debug('incoming data', changeDesc, changeNum);
      cr.setValue({fieldId: 'name', value: changeNum});
      cr.setValue({
        fieldId: 'custrecord_flo_change_description',
        value: changeDesc,
      });
      cr.setValue({
        fieldId: 'custrecord_flo_ext_link',
        value: SSN_BASE_URL + ssnTicketID,
      });
      // Start NS-2337
      log.debug('SSN CR State', changeNum + ' ' + state);
      if (state == 'Closed') {
        cr.setValue({fieldId: 'custrecord_flo_approval_status', value: 2});
        cr.setValue({fieldId: 'custrecord_flo_completion_status', value: 8}); // Completion Status is Complete
        cr.setValue({fieldId: 'custrecord_flo_statusbar_state', value: 6}); // Status Bar is Completed
      } else if (state == 'Canceled') {
        cr.setValue({fieldId: 'custrecord_flo_approval_status', value: 11}); // Approval Status is Open
        cr.setValue({fieldId: 'custrecord_flo_completion_status', value: 9}); // Completion Status is Not Started
        cr.setValue({fieldId: 'custrecord_flo_statusbar_state', value: 7}); // Status Bar is Cancelled
      } else {
        cr.setValue({fieldId: 'custrecord_flo_approval_status', value: 2});
      }
      // End NS-2337
      // Start NS-2272
      cr.setValue({
        fieldId: 'custrecord_integration_created_by',
        value: 'Set by Service Now',
      });
      cr.setValue({fieldId: 'custrecord_flo_ext_change_num', value: changeNum});
      cr.setValue({
        fieldId: 'custrecord_servicenow_sys_id',
        value: ssnTicketID,
      });
      // End NS-2272
      // Start NS-2129
      if (bundleId) {
        cr.setValue({
          fieldId: 'custrecord_flo_affected_bundle_id',
          value: bundleId,
        });
      }
      // End NS-2129
      var id = cr.save({enableSourcing: false, ignoreMandatoryFields: true});
      cr = record.load({type: 'customrecord_flo_change_request', id: id});
      // Start NS-2340
      log.debug('isApproved', isApproved);
      // NS-2337
      var isState =
        isApproved == 'Approved' && (state != 'Closed' || state != 'Canceled');
      log.debug('isState', isState);
      log.debug(
        'completion status',
        cr.getText({fieldId: 'custrecord_flo_completion_status'})
      );
      if (isApproved == 'Approved') {
        log.debug('state 2', state);
        if (state == 'Closed' || state == 'Canceled') {
          result = {status: 'success'};
          result.custNames =
            cr.getText({fieldId: 'custrecord_flo_cust_change'}) || null;
          result.proposedCusts =
            cr.getValue({fieldId: 'custrecord_flo_cr_proposed_cust'}) || '';
          result.affectedBundleID = cr.getValue({
            fieldId: 'custrecord_flo_affected_bundle_id',
          });
          result.inactive = cr.getValue({fieldId: 'isinactive'});
          result.approvalStatus = cr.getText({
            fieldId: 'custrecord_flo_approval_status',
          });
          result.completionStatus = cr.getText({
            fieldId: 'custrecord_flo_completion_status',
          });
          result.clReq = cr.getText({fieldId: 'custrecord_flo_cl_reqd'});
          result.policyApplied = cr.getText({
            fieldId: 'custrecord_flo_approval_path',
          });
          result.link = resolveChangeURL(cr.id);
        } else {
          result = {status: 'failed'};
          result.message =
            'Update failed! Strongpoint Change Request is already Approved.';
          result.inactive = cr.getValue({fieldId: 'isinactive'});
          result.affectedBundleID = cr.getValue({
            fieldId: 'custrecord_flo_affected_bundle_id',
          });
          result.approvalStatus = cr.getText({
            fieldId: 'custrecord_flo_approval_status',
          });
          result.completionStatus = cr.getText({
            fieldId: 'custrecord_flo_completion_status',
          });
          result.clReq = cr.getText({fieldId: 'custrecord_flo_cl_reqd'});
          result.policyApplied = cr.getText({
            fieldId: 'custrecord_flo_approval_path',
          });
          result.link = resolveChangeURL(cr.id);
        }
      } else {
        result = {status: 'success'};
        result.custNames =
          cr.getText({fieldId: 'custrecord_flo_cust_change'}) || null;
        result.proposedCusts =
          cr.getValue({fieldId: 'custrecord_flo_cr_proposed_cust'}) || '';
        result.affectedBundleID = cr.getValue({
          fieldId: 'custrecord_flo_affected_bundle_id',
        });
        result.inactive = cr.getValue({fieldId: 'isinactive'});
        result.approvalStatus = cr.getText({
          fieldId: 'custrecord_flo_approval_status',
        });
        result.completionStatus = cr.getText({
          fieldId: 'custrecord_flo_completion_status',
        });
        result.clReq = cr.getText({fieldId: 'custrecord_flo_cl_reqd'});
        result.policyApplied = cr.getText({
          fieldId: 'custrecord_flo_approval_path',
        });
        result.link = resolveChangeURL(cr.id);
      }
      // End NS-2340
      return result;
    } catch (e) {
      log.debug('e activateAndApprove', e.name + ' ' + e.message);
      return {status: 'failed', error: e.name, message: e.message};
    }
  }

  function resolveChangeURL(crId) {
    var scheme = 'https://';
    var host = urlMod.resolveDomain({
      hostType: urlMod.HostType.APPLICATION,
    });
    var urlCR = urlMod.resolveRecord({
      recordType: 'customrecord_flo_change_request',
      recordId: crId,
      isEditMode: false,
    });
    return scheme + host + urlCR;
  }

  function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for (var i = 0; a[i] != null; i++) {
      var item = a[i];
      if (seen[item] !== 1) {
        seen[item] = 1;
        out[j++] = item;
      }
    }
    return out;
  }

  function getSNCredentials() {
    //User and Pass fields removed from record and therefore from this script for NS-2439
    var serviceNowUrl = getSNFieldValue('custrecord_servicenow_url');
    log.debug({
      title: 'SSN connection data ',
      details: 'URL' + serviceNowUrl,
    });
    return {
      baseURL: serviceNowUrl,
    };
  }

  function getSNFieldValue(field) {
    try {
      var rec = getConfigAndStatsRecord();
      var serviceNowFieldValue = rec.getValue({fieldId: field});

      return serviceNowFieldValue;
    } catch (e) {
      log.debug({
        title: 'ERROR Fetching Service Now Field: ' + field,
        details: e,
      });
    }
  }

  function getConfigAndStatsRecord() {
    try {
      var mySearch = search.create({
        type: 'customrecord_flo_spider_configuration',
        filters: [],
        columns: [
          // search.createColumn({ name: 'internalid', sort: search.Sort.ASC })
        ],
      });
      var searchResult = mySearch.run().getRange({
        start: 0,
        end: 1,
      });

      var rec = record.load({
        type: 'customrecord_flo_spider_configuration',
        id: searchResult[0].id,
        isDynamic: true,
      });

      return rec;
    } catch (e) {
      log.debug({
        title: 'ERROR Fetching Configuration and Stats Record',
        details: e,
      });
    }
  }
});
