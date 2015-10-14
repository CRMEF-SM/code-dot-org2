var gmap;
var gmap_loc;

$(function() {
  selectize = $('#volunteer-search-facets select').selectize({
    plugins: ['fast_click']
  });

  $("#location").geocomplete()
    .bind("geocode:result", function(event, result){
      var loc = result.geometry.location;
      gmap_loc = loc.lat() + ',' + loc.lng();
      resetFacets();
      submitForm();
    });

  // Make the map sticky.
  $("#gmap").sticky({topSpacing:0});

  // Trigger query when a facet is changed.
  $('#volunteer-search-facets').find('select').change(function() {
    submitForm();
  });
});

function submitForm() {
  var form_data = $('#volunteer-search-form').serializeArray();

  // Clear the location details.
  $('#location-details').html('');

  // If we still don't have coordinates, display an error.
  if (!gmap_loc) {
    displayQueryError();
    return;
  }

  var params = getParams(form_data);
  sendQuery(params);
}

function getLatLng(address) {
  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var loc;
      loc = results[0].geometry.location;
      gmap_loc = loc.d + ',' + loc.e;
    } else {
      displayQueryError();
    }
  });
}

function getParams(form_data) {
  var params = [];

  params.push({
    name: 'coordinates',
    value: gmap_loc
  });

  $.each(form_data, function(key, field) {
    if (field.value !== '' && field.name != 'location') {
      params.push(field);
    }
  });

  return params;
}

function sendQuery(params) {
  $.post('/forms/VolunteerEngineerSubmission2015/query', $.param(params), function(response){
    var results = JSON.parse(response); // Convert the JSON string to a JavaScript object.
    var locations = getLocations(results);
    updateResults(locations);
    updateFacets(results);
  }).fail(displayQueryError);
}

function updateResults(locations) {
  if (locations.length > 0) {
    $('#volunteer-search-facets').show();
    $('#controls').html('');
  } else {
    displayNoResults();
  }
  $('#volunteer-search-results').show();

  loadMap(locations);
}

function getLocations(results) {
  var locations = [];

  if(results.response){
    var volunteers = results.response.docs; // The actual volunteers that were returned by Solr.
    var volunteers_count = volunteers.length;

    for(var i = 0; i < volunteers_count; i++){
      var index = i;
      var coordinates = volunteers[i].location_p.split(',');
      var lat = coordinates[0];
      var lon = coordinates[1];
      var title = volunteers[i].name_s;
      var html = compileHTML(index, volunteers[i]);
      var contact_title = compileContact(index, volunteers[i]);
      var contact_link = '<a id="contact-trigger-' + index + '" class="contact-trigger" onclick="return contactVolunteers()">Contact</a>';

      var location = {
        lat: lat,
        lon: lon,
        title: title,
        contact_title: contact_title,
        html: html + contact_link,
        zoom: 10
      };

      locations.push(location);
    }
  }

  return locations;
}

function resetFacets() {
  $.each(selectize, function(key, select) {
    select.selectize.clear();
    select.selectize.refreshOptions(false);
  });
}

function updateFacets(results) {
  var facet_fields = results.facet_counts.facet_fields;
}

function displayNoResults() {
  $('#controls').html('<p>No results were found.</p>');

  // Hide the facets by default.
  $('#volunteer-search-facets').hide();

  // If a facet has a value, show the facets.
  var form_data = $('#volunteer-search-form').serializeArray();
  $.each(form_data, function(key, field) {
    if (field.name != 'location' && field.value) {
      $('#volunteer-search-facets').show();
    }
  });
}

function displayQueryError() {
  $('#volunteer-search-facets').hide();
  $('#volunteer-search-results').hide();
  $('#volunteer-search-error').html('<p>An error occurred. Please try your search again.</p>').show();
}

function loadMap(locations) {
  var coordinates = gmap_loc.split(',');
  var lat = coordinates[0];
  var lng = coordinates[1];

  // Reset the map.
  $('#gmap').html('');
  gmap = new Maplace;

  var map_options = {
    map_options: {
      set_center: [lat, lng],
      zoom: 12
    },
    controls_type: 'list',
    controls_on_map: false
  };

  if (locations.length > 0) {
    map_options.force_generate_controls = true;
    map_options.locations = locations;
    map_options.afterOpenInfowindow = function(index, location, marker) {
      setContactTrigger(index, location, marker);
    };
  }

  gmap.Load(map_options);
}

function compileHTML(index, location) {
  var lines = [];
  var line;

  // Compile HTML.
  var html = '<h3>' + location.name_s + '</h3>';

  if (location.company_s) {
    line = location.company_s;
    lines.push(line);
  }

  if (location.experience_s) {
    line = '<strong>Experience: </strong>' + i18n(location.experience_s);
    lines.push(line);
  }

  if (location.location_flexibility_ss) {
    $.each(location.location_flexibility_ss, function(key, field) {
      location.location_flexibility_ss[key] = i18n('location_' + field);
    });

    line = '<strong>How I can help: </strong>' + location.location_flexibility_ss.join(', ');
    lines.push(line);
  }

  if (location.description_s) {
    line = '<strong>About me: </strong>' + location.description_s;
    lines.push(line);
  }

  if (location.linkedin_s) {
    if (!location.linkedin_s.match(/^https?:\/\//i)) {
      location.linkedin_s = 'http://' + location.linkedin_s;
    }

    line = '<a href="' + location.linkedin_s + '" target="_blank">LinkedIn profile</a>';
    lines.push(line);
  }

  if (location.facebook_s) {
    if (!location.facebook_s.match(/^https?:\/\//i)) {
      location.facebook_s = 'http://' + location.facebook_s;
    }

    line = '<a href="' + location.facebook_s + '" target="_blank">Facebook profile</a>';
    lines.push(line);
  }

  $.each(lines, function(key, field) {
    html+= '<div>' + field + '</div>';
  });

  return html;
}

function compileContact(index, location)
{
  var details = '<li>' + location.name_s + ' (' + i18n(location.experience_s) + ')' + '</li>';
  var html = '<div id="addressee-details-' + index + '">' + details + '</div>';
  
  return html;
}

function setContactTrigger(index, location, marker) {
  var contact_trigger = '.contact-trigger';
  $('#gmap').on('click', contact_trigger, function() {
    $('#names').append(location.contact_title);
  });
}

function contactVolunteers()
{
  $('#volunteer-map').hide();
  $('#volunteer-contact').show();

  return false;
}

function sendEmail(data)
{
  $("#contact-submit-btn").attr('disabled','disabled');
  $("#contact-submit-btn").removeClass("button_enabled").addClass("button_disabled");

  $('#volunteer-contact-form').hide();
  $('#before-contact').hide();
  $('#after-contact').show();

  return false;
}


function i18n(token) {
  var labels = {
    'unspecified': 'Unspecified',
    'university_student_or_researcher': 'University Computer Science Student',
    'software_professional': 'Software Professional',
    'location_onsite': 'Classroom visit',
    'location_remote': 'Remotely'
  };

  return labels[token];
}
