
document.addEventListener('DOMContentLoaded', function () {
  const rb2c = document.getElementById('b2c');
  const rb2b = document.getElementById('b2b');
  const companyNameLabel = document.getElementById('nmlb');
  const companyName = document.getElementById('name');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const regionList = document.getElementById('region');
  const taxIDLabel = document.getElementById('taxID-label');
  const taxID = document.getElementById('taxID');
  const taxInfo = document.getElementById('tax-field');
  const enAlert = document.getElementById('en-alert');

  //shipping address
  const shippingName = document.getElementById('sn');
  const shpstr = document.getElementById('shipping-street1');
  const shpstr2 = document.getElementById('shipping-street2');
  const shpct = document.getElementById('shipping-city');
  const shpst = document.getElementById('shipping-state');
  const shpz = document.getElementById('shipping-zip');
  const shpc = document.getElementById('shipping-country');

  //billing Addres
  const bdiv = document.getElementById('billing-div');
  const sameShippAdd = document.getElementById('billing-checkbox');
  const bst1 = document.getElementById('billing-street1');
  const bst2 = document.getElementById('billing-street2');
  const bct = document.getElementById('billing-city');
  const bst = document.getElementById('billing-state');
  const bz = document.getElementById('billing-zip');
  const bc = document.getElementById('billing-country');

  // text area
  const additionalInfo = document.getElementById('textarea');
  const t1 = document.getElementById('terms1');
  const t2 = document.getElementById('terms2');
  const nw = document.getElementById('news');

  const checkoutButton = document.getElementById('checkout-stripe');

  // Tax-related variables
  // let taxed = false;
  // let vat = true;

  if (taxInfo) {
    taxInfo.style.display = "none";
  }


    if (regionList) {
      regionList.options[0].disabled = true; // Disable the first option

      regionList.addEventListener("focus", function () {
        regionList.options[0].style.display = "none"; // Hide placeholder when opening
      });

      regionList.addEventListener("blur", function () {
        // Show placeholder again if nothing is selected
        if (!regionList.value) {
          regionList.options[0].style.display = "block";
        }
      });
    }

  cart.loadCart();
  populateCart("order-summary", "order-price", true);

  console.log('load2');

  if (rb2b) {
    rb2b.checked = true;
    console.log('rb2b is checked:', rb2b.checked);
  } else {
    console.log('rb2b not found');
  }

  const formInputs = [companyName, email, phone, regionList, taxID];
  const shippingInputs = [
    shippingName,
    shpstr,
    shpstr2,
    shpct,
    shpst,
    shpz,
    shpc,
  ];
  const billingAddress = [sameShippAdd, bst1, bst2, bct, bst, bz];
  const termsConditions = [t1, t2, additionalInfo, nw];

  const formState = {
    customerType: 'b2b',
    name: '',
    email: '',
    phone: '',
    region: '',
    'billing-checkbox': false,
    textarea: '',
    terms1: false,
    terms2: false,
    news: false,
    taxIDValid: false,
    taxed: false,
    vat: true,
    taxID: ""
  };

  // Function to check if shipping country is not in EU
  function notEU() {
    if (!shpc) return true;
    
    const euCountries = ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES", 
                         "FI", "FR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", 
                         "NL", "PL", "PT", "RO", "SE", "SI", "SK", "XI"];
    
    return !euCountries.includes(shpc.value);
  }

  function updateTaxDisplay() {
    // Update tax amount display if element exists
    const orderTaxed = document.getElementById('order-taxed');
    if (orderTaxed) {
      orderTaxed.textContent = "€" + (formState.taxed ? (cart.totalPrice * 1.23).toFixed(2) : cart.totalPrice.toFixed(2));
    }
  }

  function updateState(event) {
    const {id, value, checked, type} = event.target;

    if (type === 'checkbox') {
      formState[id] = checked;
      handleBillingAddress();
    } else if (type === 'radio' && checked) {
      formState.customerType = value;
      handleCustomerTypeChange();
    } else {
      formState[id] = value;
    }
    
    console.log('Updated formState:', formState);
    validateForm();
  }

  function handleCustomerTypeChange() {
    if (formState.customerType === 'b2b') {
      companyNameLabel.textContent = 'Company Name *';
      companyName.placeholder = 'Company Name';
      
      formState.vat = false;
      formState.taxed = false;
      
      if (taxInfo) {
        taxInfo.style.display = "none";
      }
      
      if (enAlert) {
        enAlert.style.display = "";
      }
      
      // Handle tax display based on region
      if (formState.region === 'EN') {
        taxIDLabel.textContent = 'EORI NUMBER *';
        taxID.placeholder = 'GB123456789000';
        if (!notEU()) {
          formState.taxed = true;
          if (taxInfo) taxInfo.style.display = "";
        }
      } else if (formState.region === 'rest') {
        taxIDLabel.textContent = 'TAX NUMBER';
        taxID.placeholder = 'Tax number...';
        formState.vat = true;
        if (!notEU()) {
          formState.taxed = true;
          if (taxInfo) taxInfo.style.display = "";
        }
      } else {
        taxIDLabel.textContent = 'TAX NUMBER *';
        taxID.placeholder = 'PT123456789';
        if (formState.region === 'PT') {
          if (taxInfo) taxInfo.style.display = "";
          formState.taxed = true;
        }
      }
      
      // Reset tax ID validation
      formState.taxIDValid = false;
      if (taxID.value.trim() !== '') {
        validateVAT();
      }
    } else if (formState.customerType === 'b2c') {
      companyNameLabel.textContent = 'Full Name *';
      companyName.placeholder = 'Enter Full Name';
      
      // formState.vat = true;

      taxIDLabel.textContent = "TAX NUMBER";
      taxID.placeholder = "Tax number...";
      
      if (enAlert) {
        enAlert.style.display = "";
      }
      
      if (formState.region === 'PT') {
         taxInfo.style.display = "";
        formState.taxed = true;
      } else if ( formState.region === 'EU-NI'){
        if(notEU()) {
          formState.taxed = false;
          taxInfo.style.display = "none";
        } else {
           formState.taxed = true;
          taxInfo.style.display = "block";
        }
      }
      else  if(formState.region === "EN") {
        if(notEU()) {
          formState.taxed = false;
          taxInfo.style.display = "none";
        }else {

          taxInfo.style.display ="block"
          formState.taxed = true;
        }

      } else if (formState.region ==="rest") {
          if(notEU()) {
          formState.taxed = false;
          taxInfo.style.display = "none";
        } else {
           formState.taxed = true;
          taxInfo.style.display = "block";
        }
      }else {
        if (formState.region === 'EN' && cart.totalPrice < 180) {
          if (enAlert) enAlert.style.display = "block";
        }
        
        if (notEU()) {
          if (taxInfo) taxInfo.style.display = "hidden";
          formState.taxed = false;
        } else {
          if (taxInfo) taxInfo.style.display = "";
          formState.taxed = true;
        }
      }
      
      // For b2c, tax ID validation is not required
      formState.taxIDValid = true;
    }
    
    updateTaxDisplay();
  }

  function validateForm() {
    console.log('Validating form... Customer type:', formState.customerType);
    
   const requiredFields = [
  ...formInputs.filter(input => {
    // Exclude taxID if it's b2c
    if (input === taxID && formState.customerType === 'b2c') {
      return false;
    }
    // Exclude taxID if it's b2b and empty
    if (input === taxID && formState.region ==="rest" && (!formState.taxID || formState.taxID.trim() === "")) {

      return false;
    }
    return true;
  }),
  ...[shippingName, shpstr, shpct, shpz],
  ...(sameShippAdd.checked ? [] : [bst1, bct, bst, bz]),
  ...[t1, t2],
].filter(Boolean);

// console.log(requiredFields)


      const allFilled = requiredFields.every((field) => {
      if (field.type === 'checkbox') {
        return field.checked; // Ensure checkboxes are checked
      }
      return field.value.trim() !== ''; // Ensure text fields are not empty
    });

    const termsChecked = t1.checked && t2.checked;
    
    let formIsValid;
    
    // Different validation logic based on customer type
    if (formState.customerType === 'b2c') {
      const isEnWithMinimum = formState.region === 'EN' && cart.totalPrice >= 180;
      const isNotEN = formState.region !== 'EN';
      formIsValid = allFilled && termsChecked && (isEnWithMinimum || isNotEN);
      console.log('B2C validation:', {allFilled, termsChecked, cartPrice: cart.totalPrice, formIsValid});
    } else { // b2b
      const isEN = formState.region === 'EN';

        if(formState.region !== "rest") {
          formIsValid = allFilled && termsChecked && formState.taxIDValid && (isEN ? formState.vat : true);
          console.log("FormISValid",formState)
        }  else {
          formIsValid = allFilled && termsChecked
        }

      
      console.log('B2B validation:', {allFilled, termsChecked, taxIDValid: formState.taxIDValid, vat: formState.vat, formIsValid});
    }

    if (formIsValid) {
      checkoutButton.classList.remove('disabledbtn');
      checkoutButton.disabled = false;
    } else {
      checkoutButton.classList.add('disabledbtn');
      checkoutButton.disabled = true;
    }
    
    updateTaxDisplay();
  }

  // Add event listeners
  if (rb2b) rb2b.addEventListener('change', updateState);
  if (rb2c) rb2c.addEventListener('change', updateState);

  formInputs.forEach((input) => {
    if (input) {
      if (input === regionList) {
        input.addEventListener('change', function(event) {
          updateState(event);
          handleCustomerTypeChange(); // Update tax fields when region changes
        });
      } else {
        input.addEventListener('input', updateState);
      }
    }
  });

  shippingInputs.forEach((input) => {
    if (input) {
      if (input === shpc) {
        input.addEventListener('change', function(event) {
          updateState(event);
          handleCustomerTypeChange(); // Update tax fields when shipping country changes
        });
      } else {
        input.addEventListener('input', updateState);
      }
    }
  });
  
  termsConditions.forEach((input) => {
    if (input) input.addEventListener('input', updateState);
  });
  
  billingAddress.forEach((input) => {
    if (input) {
      if (input === sameShippAdd) {
        input.addEventListener('change', updateState);
      } else {
        input.addEventListener('input', updateState);
      }
    }
  });

  if (taxID) taxID.addEventListener('input', validateVAT);

  function handleBillingAddress() {
    if (formState['billing-checkbox']) {
      // If checked, copy shipping to billing and hide billing fields
      if (bst1) bst1.value = shpstr ? shpstr.value : '';
      if (bst2) bst2.value = shpstr2 ? shpstr2.value : '';
      if (bct) bct.value = shpct ? shpct.value : '';
      if (bst) bst.value = shpst ? shpst.value : '';
      if (bz) bz.value = shpz ? shpz.value : '';
      if (bc && shpc) bc.value = shpc.value;
      if (bdiv) bdiv.style.display = "none";
    } else {
      // Show billing fields when unchecked
      if (bdiv) bdiv.style.display = "block";
      if (bst1) bst1.value = '';
      if (bst2) bst2.value = '';
      if (bct) bct.value = '';
      if (bst) bst.value = '';
      if (bz) bz.value = '';
    }
    validateForm();
  }

  async function validateEORI() {
    console.log('Validating EORI...');
    const v = taxID.value.trim();
    
    // Skip validation if empty
    if (v === '') {
      taxIDLabel.textContent = "EORI NUMBER *";
      formState.vat = false;
      formState.taxIDValid = false;
      validateForm();
      return;
    }
    
    const rqD = {eoris: [v]};

    // Disable checkout button while validating
    checkoutButton.disabled = true;
    checkoutButton.classList.add('disabledbtn');

    try {
      taxIDLabel.textContent = 'Verifying...';
      const rp = await axios.post(
        'https://fluidinovabackend-production.up.railway.app/validate-eori',
        rqD,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

       console.log(
      "v", v,
      "rqd",rqD,
      "rp", rp
    )

      if (rp.status === 200 && rp.data.message === 'EORI - Success!') {
        taxIDLabel.textContent = 'Valid EORI ✅';
        formState.taxed = false;
        formState.vat = true;
        formState.taxIDValid = true;
      } else {
        taxIDLabel.textContent = 'Invalid EORI ❌';
        formState.vat = false;
        formState.taxed = false;
        formState.taxIDValid = false;
      }
    } catch (error) {
      taxIDLabel.textContent = 'Error ❌';
      formState.vat = false;
      // formState.taxed = true;
      formState.taxIDValid = false;
      console.error('EORI validation error:', error);
    }

    // Revalidate the form and enable button accordingly
    validateForm();
  }
  
  async function validateEUVAT() {
    console.log('Validating EU VAT...');
    const v = taxID.value.trim();
    
    // Skip validation if empty
    if (v === '') {
      taxIDLabel.textContent = "TAX NUMBER *";
      formState.vat = false;
      formState.taxIDValid = false;
      validateForm();
      return;
    }
    const formData = {
      countryCode: v.substring(0, 2),
      vatNumber: v.substring(2),
      requesterMemberStateCode: 'PT',
      requesterNumber: '507439384'
    };

    // Disable checkout button while validating
    checkoutButton.disabled = true;
    checkoutButton.classList.add('disabledbtn');

    try {
      taxIDLabel.textContent = 'Verifying...';
      const response = await fetch('https://fluidinovabackend-production.up.railway.app/api/check-vat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      switch (result.code) {
        case 'SUCCESS':
          taxIDLabel.textContent = "VAT Valid ✅";
          formState.vat = true;
          formState.taxIDValid = true;
          formData.taxed = formState.region === "PT" ? true : false
          taxInfo.style.display = formData.countryCode === "PT" ? "block": "hidden"
          break;
        case 'ERR_INVALID_VAT':
          taxIDLabel.textContent = "VAT is Invalid ❌";
          formState.vat = false;
          formState.taxed = true;
          formState.taxIDValid = true;
          taxInfo.style.display ="block"
          break;
        case 'ERR_MISSING_FIELDS':
          taxIDLabel.textContent = "Missing required fields ❌";
          formState.vat = false;
          formState.taxed = true;
          formState.taxIDValid = false;
          taxInfo.style.display ="block"

          break;
        case 'ERR_INTERNAL_SERVER_ERROR':
          taxIDLabel.textContent = "Error connecting to API. Please try again later ❌";
          formState.vat = false;
          formState.taxed = true;
          formState.taxIDValid = false;
          taxInfo.style.display ="block"

          break;
        default:
          taxIDLabel.textContent = 'Unknown error occurred ❌';
          formState.vat = false;
          formState.taxed = true;
          formState.taxIDValid = false;
                   taxInfo.style.display ="block"

      }
    } catch (error) {
      taxIDLabel.textContent = "Error checking VAT ❌";
      formState.vat = false;
      formState.taxed = true;
      formState.taxIDValid = false;
      console.error('An error occurred:', error);
    }

    // Revalidate the form and enable button accordingly
    validateForm();
  }
  
  function validateVAT() {
    console.log("validateVAT");
    const v = taxID.value.trim();
    
    // Skip validation if empty
    if (v === '') {
      if (formState.customerType === 'b2b') {
        taxIDLabel.textContent = formState.region === 'EN' ? "EORI NUMBER *" : "TAX NUMBER *";
        formState.vat = false;
        formState.taxIDValid = false;
      } else {
        taxIDLabel.textContent = "TAX NUMBER";
        formState.vat = true;
        formState.taxIDValid = true;
      }
      validateForm();
      return;
    }
    
    if (formState.customerType === 'b2b') {
      if (formState.region === 'EN') {
        validateEORI();
      } else if (formState.region === 'EU-NI' || formState.region === 'PT') {

        validateEUVAT();
      } else {
        // For other regions, consider tax ID valid without validation
        formState.taxIDValid = true;
        validateForm();
      }
    } else {
      // For B2C, tax ID is optional so always valid
      formState.taxIDValid = true;
      validateForm();
    }
  }
  
  // If we have a shipping country dropdown, remove banned countries
  if (shpc) {
    const bannedCountries = [
      "YE", "GN", "KP", "RU", "KM", "CU", "FK", "IR", "JT", "KI", "YE", 
      "SY", "SL", "GW", "GQ", "CF", "KP", "YT", "MM", "NR", "NU", "SH", 
      "PM", "ST", "SB", "SO", "SD", "TJ", "TK", "TV", "WK", "UA", "BY"
    ];
    
    bannedCountries.forEach(country => {
      // Remove banned countries
      const options = shpc.getElementsByTagName('option');
      for (let i = 0; i < options.length; i++) {
        if (options[i].value === country) {
          shpc.removeChild(options[i]);
          break;
        }
      }
    });
    
    // Set default countries if needed
    const shAF = shpc.querySelector('option[value="AF"]');
    if (shAF) {
      shAF.selected = true;
    }
  }
  
  if (bc) {
    const bAF = bc.querySelector('option[value="AF"]');
    if (bAF) {
      bAF.selected = true;
    }
  }
  
  // Set up checkout button click handler
  if (checkoutButton) {
    checkoutButton.addEventListener('click', async function() {
      if (checkoutButton.disabled) return;
      
      var stripe = Stripe('pk_live_51J7eDfI6TgsJpVaUs8fdodVwwRerEbuvWPMxzTEVAVInPT83aUSm99O6GewdprrTryPZ1MAdAKyFd78LqOueltEt00eL3neK8f');
      
      const customer = {
        name: companyName.value,
        email: email.value,
        taxID: taxID.value,
        phone: phone.value,
        reg: regionList.options[regionList.selectedIndex].textContent,
      };
      
      const shpAd = {
        fullName: shippingName.value,
        str1: shpstr.value,
        str2: shpstr2.value,
        c: shpct.value,
        ct: shpc.value,
        z: shpz.value,
        s: shpst.value,
      };
      
      const bilAd = {
        fullName: shippingName.value,
        str1: bst1.value,
        str2: bst2.value,
        c: bct.value,
        ct: bc.value,
        z: bz.value,
        s: bst.value,
      };
      
      const cartItems = cart.items.map(item => ({
        name: item.name,
        weight: item.weight,
        quantity: item.quantity,
        price_num: item.price,
        price: item.priceId,
      }));
      
      const formData = {
        customer: customer,
        shpAd: shpAd,
        bilAd: (sameShippAdd.checked ? shpAd : bilAd),
        cartItems: cartItems,
        tx: additionalInfo.value,
        b2c: rb2c.checked,
        t: formState.taxed,
        news: nw.checked
      };
      
      checkoutButton.textContent = 'Loading...';
      console.log("Cart Items:", cartItems);
      
      try {
        const response = await fetch('https://fluidinovabackend-production.up.railway.app/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const session = await response.json();
        if (response.status === 500) {
          window.location.href = 'https://www.fluidinova.com/cancel';
        } else {
          window.location.href = session.url;
        }
      } catch (error) {
        console.error('Error creating checkout session:', error);
        checkoutButton.textContent = 'Checkout';
      }
    });
  }
  
  // Initialize form validation
  handleCustomerTypeChange();
  validateForm();
});




// independent professional
//  uk =>180
//  EU - NI  -> sempre tax  
//  res -> nenhuma tax 
//  PT -> sempre tax

//  corporate
//  uk -> eorio valido + isento de tax
//  eu -> validar tax number no serviço da eu  caso, erro -> avança mas cobra vat
// PT -> sempre tax + vat sem validação mas required;
//  res ->  sem validação, no required + no tax;



//  pre stripe -> email com dados da encomenda
//  pos pagamento -> email do stripe;



// . billing address + billing info = resto do mundo + shipping address = europa/north irland (não inclui PT) --> paga IVA
// . billing address + billing info = wales, Scotland, england + shipping address = europa/north irland (não inclui PT) --> paga IVA


//  Region === ''res'  &&  billinginfo ===