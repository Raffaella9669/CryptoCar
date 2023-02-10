App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load .
    $.getJSON('../cars.json', function(data) {
      var autoRow = $('#autoRow');
      var autoTemplate = $('#autoTemplate');

      for (i = 0; i < data.length; i ++) {
        autoTemplate.find('.panel-title').text(data[i].name);
        autoTemplate.find('img').attr('src', data[i].picture);
        autoTemplate.find('.auto-age').text(data[i].age_production);
        autoTemplate.find('.auto-model').text(data[i].modello);
        autoTemplate.find('.auto-price').text(data[i].prezzo);
        autoTemplate.find('.auto-mot').text(data[i].motorizzazione);
        autoTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        autoTemplate.find('.btn').attr('data-id', data[i].id);
        autoRow.append(autoTemplate.html());
      }
    });
    return await App.initWeb3();
  },

  initWeb3: async function() {
    /*
     * Replace me...
     */

    return App.initContract();
  },

  initContract: function() {
    /*
     * Replace me...
     */

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    /*
     * Replace me...
     */
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
