/* PostRender */
var myPostRender = function(vals) {
  (function ($) {
  $("body.has-main-image article figure.main-image").prependTo("body.has-main-image article section.at-inner"); // Move the main image down on header image themed forms   
  if ($(".ContributionInformation")[0]){
      $("body").addClass("contribution-theme");
      $("footer.theme-footer .footer-container.upper").prependTo("article .at.ngp-form section.at-inner footer.FooterHtml"); // Move footer-container upper if it is a contribution form
  }
  $('.ContributionInformation > legend.at-legend').text('Gift Information');
  
    // Enable the "Read More" option if it's chosen in the Theme
    if ($('body.form-layout-read_more').length) {
    console.log("Read more!");
      // Function to instantiate the "Read More" if there is more than one child of the HeaderHtml element
      var bodyContentElements = $('article .at.ngp-form header.HeaderHtml').children().length; // Check on the number of children inside the header.HeaderHtml
      if (bodyContentElements >= 2) { // If it's 2 or more
        $('<span class="show-full-body">Read More</span>').appendTo('article .at.ngp-form header.HeaderHtml'); // Add a "Read More"
        $('span.show-full-body').click(function() { // If that Read More is clicked
          $(this).parent('header').toggleClass('show-all'); // Update the class of the header.HeaderHtml
        });
      }  
  } // End of if statement for Read More logic
  
  //  $('article .at.ngp-form .at-row.on-behalf-of-textfield').hide(); // Hide that field by default, for the purposes of the show/hide logic below
  //  $("article .at.ngp-form .at-row[class*='MappedCustomFormFieldQuestion_66']").addClass("premium-opt-out").appendTo("article .at.ngp-form .ContributionInformation .at-fields"); // Move the premium opt-out checkbox to the end of the Contribution fieldset
 
    $("article .at.ngp-form section.premium-content-container").prependTo("article .at.ngp-form .premium-opt-out"); // Move the premium content description inside the wrapper for the opt-out checkbox
    $("article .at.ngp-form .at-row[class*='MappedCustomFormFieldQuestion_6']").addClass("partner-orgs").appendTo("article .at.ngp-form .ContactInformation .at-fields"); // Move the Corporate Partner Loyalty ID field to the end of the Contact fieldset  

 
  // If there's nothing left in the Additional Information fieldset, add a class to the fieldset
  if ($('article .at.ngp-form fieldset.AdditionalInformation .at-fields').children().length == 0) {
      $('article .at.ngp-form fieldset.AdditionalInformation').addClass('hide-additional-information');
  }

  // Move the main image down on header image themed forms
  $("body.has-main-image article figure.main-image").prependTo("body.has-main-image article section.at-inner"); 

    // Contribution specific stuff
    if ($("body").hasClass("contribution-theme")){  

      // Check to see if it's a recurring only form; if it is (forced recurring) then add a class to the fieldset for later CSS manipulation
      // This will cause problems with forms without this structure, so stick it inside a try/catch
    try {
      var recurringObject = nvtag.tags[0].formviews.current.subviews.ContributionInformation.subviews.IsRecurring.def;
      if (recurringObject.name === "IsRecurring" && recurringObject.type === "hidden" && recurringObject.value === true) {
          $("article .at.ngp-form .ContributionInformation").addClass("forced-recurring");
        } else {};
    } catch {}  
      // Add disclaimer
      $('<div class="at-row"><div class="at-markup donatesecurely"><label style="display:inline;"><input type="checkbox" name="updateMyProfile" checked="checked"><span><span class="text">Your Donation will be securely processed.</span></span></label></div></div>').appendTo('fieldset.PaymentInformation .at-fields');

      // Check to see if an Ecard exists. If it does, move it around per the design      
      if ( $("article .at.ngp-form fieldset.RecipientInformation .at-row.Ecard").length ) {
      
      $("body article").addClass("has-ecard"); // Give the article a "has-ecard" class, just to make things easier.
      $("article.has-ecard .at.ngp-form fieldset.RecipientInformation .form-unit-radio.form-item-ecard").addClass("ecards-container"); // Move the actual ecard piece up to the top of the form
      $("article.has-ecard .at.ngp-form fieldset.TributeGift .ecards-container:first-of-type").append("<p class='ecard-image-heading'>Your e-card</p><figure class='ecard-image-container'><img src='' alt='' /></figure>"); // add some pieces and scaffolding, per the design
      $("article.has-ecard .at.ngp-form .at-recipient-msg label.at-date").addClass("far fa-calendar-alt"); // add the calendar icon to the send date
        
        // Create a function to grab the value of the image currently chosen, and pull it up above the array of options
        function updateEcardImage() {
          setTimeout(function() { // give it a hundredth of a second, since it seems to need a slight delay to be accurate
            var ecardSrc = $("div.at-ecard.selected img").attr("src"); // get the src of the image for the currently chosen card
            var ecardAlt = $("div.at-ecard.selected img").attr("alt"); // and the alt text
            $("article.has-ecard .at.ngp-form figure.ecard-image-container img").attr("src", ecardSrc).attr("alt", ecardAlt); // update the <img> above with these values
          }, 10);
        }
        
        // When someone clicks on an ecard, run the updateEcardImage function
        $('.at.ngp-form .ecards-container .at-ecards').on("click", "div.at-ecard", function() {updateEcardImage();});
        
        // Also, run the updateEcardImage function a half second after page load, to capture the defaulted amount
        setTimeout(function() {updateEcardImage();}, 500);

      } // End of if statement for Ecard logic

    } // End of if statement for Contribution logic    

    // When the form is loaded or the toggle is clicked, make sure the chosen option has the "selected" class so you can apply the necessary CSS
    /// Also, run the getCurrentAmount function to recalculate the explainer
    $(".at.ngp-form .form-item-selectedfrequency .radios label input:checked").closest("label").addClass("selected");
    $(".at.ngp-form .form-item-selectedfrequency .radios label input").change(function() {
    $(".at.ngp-form .form-item-selectedfrequency .radios label.selected").closest("label").removeClass("selected");
    $(this).closest("label").addClass("selected");
    isOtherAmount = "false"; // unset this value if the toggle changes; it'll otherwise cause complications with the calculation
    getCurrentAmount();
    });
    // giving this Select treament to Gifts as well
    $( ".at.ngp-form .at-gift input" ).toggle(
      function() {
        $( this ).addClass( "selected" );
      }, function() {
        $( this ).removeClass( "selected" );
      }
    );

    // Check to see if the Progress Meter exists. If it does, replace the iframe's meter with constructed progress meter.
    if ( $("article .at.ngp-form header.MeterHtml").length ) {
      
      // Use a function to make properly formatted versions of the Progress Meter's numbers
      function numberWithCommas(number) {
        var parts = number.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      }

      var progressMeterID = $("main article header.MeterHtml iframe").attr("src").split("/").pop(); // Grab the ID of the progress meter from the iframe
      jsonURL = "https://secure.everyaction.com/v2/forms/" + progressMeterID + "/progress"; // grab the URL of the form we're getting the data from
      $.getJSON(jsonURL, function( data ) { // grab the data from the .json file
        meterProgressType = data.progressType; // figure out which type of progress meter it is - Submission or Contribution?
        meterProgress = data.progressOutOfOneHundred; // set a value for the progress on the meter
        meterShowAllProgress = data.showAllProgress;
        meterProgressAmount = "$" + numberWithCommas(parseFloat(data.totalContributionProgress)); // set a value for the amount raised, with the appropriate separators
        meterSubmissions = data.totalSubmissionProgress; // create a variable for the number of submissions
        if (meterProgressType == "Contribution") { // if it's a contribution progress meter
          if (meterShowAllProgress == true) { // and the "Also display the count of submissions" is checked
            meterSubmittersDetails = "Amount Raised: <strong>" + meterProgressAmount + " (" + meterSubmissions + "&nbsp;supporters)</strong>"; // provide the amount raised and the number of supporters
          } else { // if the "Also display the count of submissions" isn't checked
            meterSubmittersDetails = "Amount Raised: <strong>" + meterProgressAmount + "</strong>"; // provide just the amount raised
          }
          meterTarget = "$" + numberWithCommas(parseFloat(data.targetAmount)); // and set a value for the goal, with the appropriate separators
        } else { // if it's a submissions progress meter
          if (meterShowAllProgress == false) { // and it's not a contribution progress meter, or the "Also display the contribution amount" isn't checked
            meterSubmittersDetails = "Current Supporters: <strong>" + meterSubmissions + "</strong>"; // provide the number of supporters
          } else { // it's a contribution progress meter, and the "Also display the contribution amount" is checked
            meterSubmittersDetails = "Current Supporters: <strong>" + meterSubmissions + " (" + meterProgressAmount + ")</strong>"; // provide the number of supporters, but also the amount raised
          }
          meterTarget = numberWithCommas(parseFloat(data.targetAmount)); // set a value for the goal, with the appropriate separators
        }
        $("article .at.ngp-form header.MeterHtml").append('<figure class="progress-meter"><progress class="progress-bar-display" max="100" value="' + meterProgress + '"></progress><p class="progress-meter-details"><span class="progress-meter-submitters">' + meterSubmittersDetails + '</span><span class="progress-meter-goal">Goal: <strong>' + meterTarget +'</strong></span></p></figure>'); // Inject the progress meter into the form
      });     
    } // End of if statement for Progress Meter logic

  }(jQuery));
};

/* FormAlter */

var myAlterFormDefinition = function(vals) {
  (function ($) {

    if (vals.form_definition.metadata.layoutStyle == "multistep") { // make sure the form is multistep
      var name_index = 0; var child_index = 0; // set these variables
      _.each(vals.form_definition.form_elements, function(child) { // iterate through each step
        name_index++;
        if (child.name === 'Interests') { // Find the "Interests" one, which is the fourth step if there's a fourth step
          vals.form_definition.form_elements[(name_index - 1)].step = 2; // Set it to (human-readable) Step 3
        }
      });
    }

  return vals;
  }(jQuery));
};


var nvtag_callbacks = nvtag_callbacks || {};
nvtag_callbacks.postRender = nvtag_callbacks.postRender || [];
nvtag_callbacks.postRender.push(myPostRender);
nvtag_callbacks.alterFormDefinition = nvtag_callbacks.alterFormDefinition || [];
nvtag_callbacks.alterFormDefinition.push(myAlterFormDefinition);