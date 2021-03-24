/* PostRender */

var myPostRender = function(vals) {
  (function ($) {
	
    $("article .at.ngp-form form .at-markup.FastAction").prependTo("article .at.ngp-form section.at-inner"); // Move the FastAction block up outside the form
    $("article section.article-content > .validation-logos").prependTo("article .at.ngp-form section.at-inner footer.FooterHtml"); // Move the validation logos that are below the form into the form footer


    // Whenever the "This donation is on behalf of a company or organization" box changes, show/hide the "Company or Organization Name" field
    $(".at-row.on-behalf-of-checkbox input[type=checkbox]").change(function(){
      if ($(".at-row.on-behalf-of-checkbox input[type=checkbox]").prop("checked")) {$(".at-row.on-behalf-of-textfield").show();}
      else {$(".at-row.on-behalf-of-textfield").hide();}
	});

	// If there's nothing left in the Additional Information fieldset, add a class to the fieldset
	if ($('article .at.ngp-form fieldset.AdditionalInformation .at-fields').children().length == 0) {
      $('article .at.ngp-form fieldset.AdditionalInformation').addClass('hide-additional-information');
	}
    
    
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
    
      $("<p id='calc-explainer'></p>").insertAfter("article .at.ngp-form .form-type-radios.form-item-selectamount"); // Add in the element that will get modified by the amount chosen
      isOtherAmount = "false"; // instantiate this, since it's necessary for the getCurrentAmount function
      
      // Create a calculationMultiplier variable, based on the value chosen for corresponding theme field. This will be applied to the calculation
      if ($("article").hasClass("calculation-three")){calculationMultiplier = 30;}
      else if ($("article").hasClass("calculation-two")){calculationMultiplier = 20;}
      else {calculationMultiplier = 10;}
      
      // Create a function for reuse, since this might fire a lot
      function getCurrentAmount() {
        setTimeout(function() { // give it a hundredth of a second, since it seems to need a slight delay to be accurate
          var currentValue = nvtag.tags[0].formviews.current.val(["Amount"]); // This is the current amount chosen
          var chosenFrequency = parseInt(nvtag.tags[0].formviews.current.val(["SelectedFrequency"])); // Parse as an integer the value of the SelectedFrequency, if it's recurring
          var numberOfMeals = (currentValue * calculationMultiplier).toLocaleString("en"); // Add the necessary commas
          // create a replacement variable if it's a monthly contribution
          if (chosenFrequency === 4) { var monthlyReplacement = " each month";}
          else {var monthlyReplacement = "";}
          // change the language out from what it was, and differently if it's the other option that's been chosen
          if (currentValue === "0.00") {isOtherAmount = "true";} else {} // Check to see if the "Other" option is defaulted, because the click logic won't fire on form load
          if (isOtherAmount === "true") {$("p#calc-explainer").text("To help provide as many meals as possible" + monthlyReplacement);}
          else {$("p#calc-explainer").text("Will help provide " + numberOfMeals + " meals" + monthlyReplacement);}	   
        }, 10);
      }
    
      // Run this every time an amount option is clicked. If it's the other option that's clicked, pass that into the function to change the language
      $('.at.ngp-form .form-type-radios').on("click", "label.label-amount", function() {
        var $label = $(this);
        if ($label.hasClass("label-otheramount")) {isOtherAmount = "true";}
        else {isOtherAmount = "false";}
        getCurrentAmount();
      });
    
      // Run this function a half second after page load, to capture the defaulted amount
      setTimeout(function() {getCurrentAmount();}, 500);
      
      // When the form is loaded or the toggle is clicked, make sure the chosen option has the "selected" class so you can apply the necessary CSS
      /// Also, run the getCurrentAmount function to recalculate the explainer
      $(".at.ngp-form .form-item-selectedfrequency .radios label input:checked").closest("label").addClass("selected");
      $(".at.ngp-form .form-item-selectedfrequency .radios label input").change(function() {
	    $(".at.ngp-form .form-item-selectedfrequency .radios label.selected").closest("label").removeClass("selected");
	    $(this).closest("label").addClass("selected");
	    isOtherAmount = "false"; // unset this value if the toggle changes; it'll otherwise cause complications with the calculation
	    getCurrentAmount();
      });
      
      // Check to see if an Ecard exists. If it does, move it around per the design      
      if ( $("article .at.ngp-form fieldset.RecipientInformation .at-row.Ecard").length ) {
	    
	    $("body article").addClass("has-ecard"); // Give the article a "has-ecard" class, just to make things easier.
	    $("article.has-ecard .at.ngp-form .ContributionInformation").insertBefore("article.has-ecard .at.ngp-form .ContactInformation"); // Move the entire Contribution Information section down below the ecard/tribute stuff
	    $("article.has-ecard .at.ngp-form fieldset.RecipientInformation .form-unit-radio.form-item-ecard").addClass("ecards-container").prependTo("article.has-ecard .at.ngp-form fieldset.TributeGift > .at-fields"); // Move the actual ecard piece up to the top of the form
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
