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

  // text area
  const additionalInfo = document.getElementById('textarea');
  const t1 = document.getElementById('terms1');
  const t2 = document.getElementById('terms2');
  const nw = document.getElementById('news');

  const taxInfo = document.getElementById('tax-field');

  const enAlert = document.getElementById('en-alert');
  const totalPriceCheckout = document.getElementById('order-taxed');
  const checkoutButton = document.getElementById('checkout-stripe');

  cart.loadCart();
populateCart("order-summary", "order-price", true);

  let taxed,
    vat = false;

  console.log('load2');

  if (rb2b) {
    rb2b.checked = true;
    console.log('rb2b is checked:', rb2b.checked); // Debugging log
  } else {
    console.log('rb2b not found'); // Debugging log
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
  };

  function updateState(event) {
    const {id, value, checked, type} = event.target;

    if (type === 'checkbox') {
      formState[id] = checked;
      handleBillingAddress();
    } else if (type === 'radio' && checked) {
      formState.customerType = value;

      // Update UI based on customer type selection
      if (formState.customerType === 'b2b') {
        companyNameLabel.textContent = 'Company Name';
        companyName.placeholder = 'Company Name';

        if (formState.region === 'rest' || formState.region === 'PT') {
          vat = true;
          taxInfo.style.display = '';
        }

        if (!notEU()) {
          taxed = true;
          taxInfo.style.display = '';
        }
        vat = false;
        taxed = false;
        taxInfo.style.display = 'none';

        // Reset tax ID validation when switching to b2b
        formState.taxIDValid = false;

        if (taxID.value.trim() !== '') {
          validateEORI(); // Revalidate EORI/VAT if a value exists
        }
      } else if (formState.customerType === 'b2c') {
        companyNameLabel.textContent = 'Full Name';
        companyName.placeholder = 'Enter Full Name';
        vat = true;

        if (formState.region === 'PT' || formState.value === 'EU-NI') {
          taxInfo.style.display = '';
          taxed = true;
        }
        if (notEU()) {
          taxInfo.style.display = 'none';
          taxed = false;
        } else {
          taxInfo.style.display = '';
        }
        taxed = true;

        if (formState.region === 'EN' && cart.totalPrice < 180)
          enAlert.style.display = 'block';
        // For b2c, tax ID validation is not required
        formState.taxIDValid = true;
      }
    } else {
      formState[id] = value;
    }

    console.log('Updated formState:', formState);

    // Update region-specific labels
    if (formState.region === 'EN') {
      taxIDLabel.textContent = 'EORI Number';
      taxID.placeholder = 'Eori Number';
    } else if (formState.region === 'PT') {
      taxIDLabel.textContent = 'Tax Number';
      taxID.placeholder = 'PT123456789';
    } else if (formState.region === 'rest' || formState.region === 'EU-NI') {
      taxIDLabel.textContent = 'Tax Number';
      taxID.placeholder = 'Tax Number';
    }

    validateForm();
        totalPriceCheckout.textContent =
    '€' +
    (taxed ? (cart.totalPrice * 1.23).toFixed(2) : cart.totalPrice.toFixed(2));
  }

  function validateForm() {
    const requiredFields = [
      ...formInputs,
      ...[shippingName, shpstr, shpct, shpst, shpz],
      ...(sameShippAdd.checked ? [] : [bst1, bct, bst, bz]),
      ...[t1, t2],
    ].filter(Boolean);

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
      formIsValid = allFilled && termsChecked && cart.totalPrice > 180;
      console.log('B2C validation:', {
        allFilled,
        termsChecked,
        cartPrice: cart.totalPrice,
        formIsValid,
      });
    } else {
      // b2b
      formIsValid = allFilled && termsChecked && formState.taxIDValid;
      console.log('B2B validation:', {
        allFilled,
        termsChecked,
        taxIDValid: formState.taxIDValid,
        formIsValid,
      });
    }

    if (formIsValid) {
      checkoutButton.classList.remove('disabledbtn');
      checkoutButton.disabled = false;
    } else {
      checkoutButton.classList.add('disabledbtn');
      checkoutButton.disabled = true;
    }
  }

  if (rb2b) rb2b.addEventListener('change', updateState);
  if (rb2c) rb2c.addEventListener('change', updateState);

  formInputs.forEach((input) => {
    if (input === 'regionList') {
      input.addEventListener('change', updateState);
    } else {
      input.addEventListener('input', updateState);
    }
  });

  shippingInputs.forEach((input) => {
    input.addEventListener('input', updateState);
  });
  termsConditions.forEach((input) => {
    input.addEventListener('input', updateState);
  });
  billingAddress.forEach((input) => {
    if (input !== 'billing-checkbox') {
      input.addEventListener('input', updateState);
    } else {
      input.addEventListener('change', updateState);
    }
  });

  // taxID.addEventListener('blur', validateEORI);
  taxID.addEventListener('input', validateEORI);

  function handleBillingAddress() {
    if (formState['billing-checkbox']) {
      // If checked, copy shipping to billing and hide billing fields
      bst1.value = shpstr.value;
      bst2.value = shpstr2.value;
      bct.value = shpct.value;
      bst.value = shpst.value;
      bz.value = shpz.value;
      bdiv.style.display = 'none';
    } else {
      // Show billing fields when unchecked
      bdiv.style.display = 'block';
      bst1.value = '';
      bst2.value = '';
      bct.value = '';
      bst.value = '';
      bz.value = '';
    }
  }
  validateForm();

  async function validateEORI() {
    console.log('Validating EORI...');
    const v = taxID.value.trim();

    if (v === '' || formState.customerType === 'b2c') {
      formState.taxIDValid = formState.customerType === 'b2c';
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

      if (rp.status === 200 && rp.data.message === 'EORI - Success!') {
        taxIDLabel.textContent = 'Valid EORI ✅';
        formState.taxIDValid = true;
      } else {
        taxIDLabel.textContent = 'Invalid EORI ❌';
        formState.taxIDValid = false;
      }
    } catch (error) {
      taxIDLabel.textContent = 'Error ❌';
      formState.taxIDValid = false;
      console.error('EORI validation error:', error);
    }

    // Revalidate the form and enable button accordingly
    validateForm();
  }
  validateForm();
});

// eu - ni  -> check-vat
//  PT-> check-vat
// rest of the world
//  england = eori
// en alert



//  sem validações de TAXES




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

  // text area
  const additionalInfo = document.getElementById('textarea');
  const t1 = document.getElementById('terms1');
  const t2 = document.getElementById('terms2');
  const nw = document.getElementById('news');

  const totalPriceCheckout = document.getElementById("order-taxed");
  const checkoutButton = document.getElementById('checkout-stripe');

  cart.loadCart();
  totalPriceCheckout.textContent = "€" + (taxed ? (cart.totalPrice * 1.23).toFixed(2) : cart.totalPrice.toFixed(2))
  console.log('load2'); // Check if this logs to console

  if (rb2b) {
    rb2b.checked = true;
    console.log('rb2b is checked:', rb2b.checked); // Debugging log
  } else {
    console.log('rb2b not found'); // Debugging log
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
  };

  function updateState(event) {
    const {id, value, checked, type} = event.target;

    if (type === 'checkbox') {
      formState[id] = checked;
      handleBillingAddress();
    } else if (type === 'radio' && checked) {
      formState.customerType = value;
      
      // Update UI based on customer type selection
      if (formState.customerType === 'b2b') {
        companyNameLabel.textContent = 'Company Name';
        companyName.placeholder = 'Company Name';
        // Reset tax ID validation when switching to b2b
        formState.taxIDValid = false;
        
        if (taxID.value.trim() !== '') {
          validateEORI(); // Revalidate EORI/VAT if a value exists
        }
      } else if (formState.customerType === 'b2c') {
        companyNameLabel.textContent = 'Full Name';
        companyName.placeholder = 'Enter Full Name';
        // For b2c, tax ID validation is not required
        formState.taxIDValid = true;
      }
    } else {
      formState[id] = value;
    }
    
    console.log('Updated formState:', formState);

    // Update region-specific labels
    if (formState.region === 'EN') {
      taxIDLabel.textContent = 'EORI Number';
      taxID.placeholder = 'Eori Number';
    } else if (formState.region === 'PT') {
      taxIDLabel.textContent = 'Tax Number';
      taxID.placeholder = 'PT123456789';
    } else if (formState.region === 'rest' || formState.region === 'EU-NI') {
      taxIDLabel.textContent = 'Tax Number';
      taxID.placeholder = 'Tax Number';
    }

    validateForm();
  }

  function validateForm() {
    const requiredFields = [
      ...formInputs,
      ...[shippingName, shpstr, shpct, shpst, shpz],
      ...(sameShippAdd.checked ? [] : [bst1, bct, bst, bz]),
      ...[t1, t2],
    ].filter(Boolean);

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
      formIsValid = allFilled && termsChecked && cart.totalPrice > 180;
      console.log('B2C validation:', {allFilled, termsChecked, cartPrice: cart.totalPrice, formIsValid});
    } else { // b2b
      formIsValid = allFilled && termsChecked && formState.taxIDValid;
      console.log('B2B validation:', {allFilled, termsChecked, taxIDValid: formState.taxIDValid, formIsValid});
    }

    if (formIsValid) {
      checkoutButton.classList.remove('disabledbtn');
      checkoutButton.disabled = false;
    } else {
      checkoutButton.classList.add('disabledbtn');
      checkoutButton.disabled = true;
    }
  
  }

   if (rb2b) rb2b.addEventListener('change', updateState);
  if (rb2c) rb2c.addEventListener('change', updateState);

  formInputs.forEach((input) => {
    if (input === 'regionList') {
      input.addEventListener('change', updateState);
    } else {
      input.addEventListener('input', updateState);
    }
  });

  shippingInputs.forEach((input) => {
    input.addEventListener('input', updateState);
  });
  termsConditions.forEach((input) => {
    input.addEventListener('input', updateState);
  });
  billingAddress.forEach((input) => {
    if (input !== 'billing-checkbox') {
      input.addEventListener('input', updateState);
    } else {
      input.addEventListener('change', updateState);
    }
  });

  // taxID.addEventListener('blur', validateEORI);
  taxID.addEventListener('input', validateEORI);

  function handleBillingAddress() {
    if (formState['billing-checkbox']) {
      // If checked, copy shipping to billing and hide billing fields
      bst1.value = shpstr.value;
      bst2.value = shpstr2.value;
      bct.value = shpct.value;
      bst.value = shpst.value;
      bz.value = shpz.value;
      bdiv.style.display = 'none';
    } else {
      // Show billing fields when unchecked
      bdiv.style.display = 'block';
      bst1.value = '';
      bst2.value = '';
      bct.value = '';
      bst.value = '';
      bz.value = '';
    }
  }
  validateForm();

  async function validateEORI() {
    console.log('Validating EORI...');
    const v = taxID.value.trim()

     if (v === '' || formState.customerType === 'b2c') {
      formState.taxIDValid = formState.customerType === 'b2c';
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

      if (rp.status === 200 && rp.data.message === 'EORI - Success!') {
        taxIDLabel.textContent = 'Valid EORI ✅';
        formState.taxIDValid = true;
      } else {
        taxIDLabel.textContent = 'Invalid EORI ❌';
        formState.taxIDValid = false;
      }
    } catch (error) {
      taxIDLabel.textContent = 'Error ❌';
      formState.taxIDValid = false;
      console.error('EORI validation error:', error);
    }

    // Revalidate the form and enable button accordingly
    validateForm();
  }
    validateForm();
});



// eu - ni  -> check-vat
//  PT-> check-vat
// rest of the world
//  england = eori
