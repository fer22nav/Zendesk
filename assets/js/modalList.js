//INICIA EL CLIENTE
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
  const resultado = obtenerDatos();
  localStorage.setItem('ProposedCustomization', JSON.stringify(resultado));
}
$('#inp-type').change(function () {
  var prefix = $(this).val();
  if (prefix != '99999') {
    document.getElementById('inp-scriptid').value = $(this).val() + '_';
  } else {
    document.getElementById('inp-scriptid').value = '';
  }
});
// function obtenerDatos() {
//     type = document.getElementById("inp-type").value;
//     scriptid = document.getElementById("inp-scriptid").value;
//     let r = []
//     if (scriptid !== '') {
//         r.push(scriptid)
//     }
//     if (type !== '') {
//         r.push(type)
//     }
//     return r;
// }
