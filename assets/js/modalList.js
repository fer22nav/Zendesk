//init client
var client = ZAFClient.init();
document
  .querySelector('#modal')
  .addEventListener('submit', this.onModalSubmit.bind());
//SUBMIT
function onModalSubmit() {
  event.preventDefault();
  submitData();
  client.invoke('destroy');
}

function submitData() {
  const result = getFormData();
  const localData = JSON.parse(localStorage.getItem('ProposedCustomization'));
  localData.push(result);
  localStorage.setItem('ProposedCustomization', JSON.stringify(localData));
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
