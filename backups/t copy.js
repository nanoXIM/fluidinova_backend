
   const name = document.getElementById("name");
   const email = document.getElementById("email");
   const phone = document.getElementById("phone");
   const sn = document.getElementById("sn");
   const shpstr = document.getElementById("shipping-street1");
   const shpstr2 = document.getElementById("shipping-street2");
   const shpct = document.getElementById("shipping-city");
   const shpst = document.getElementById("shipping-state");
   const shpz = document.getElementById("shipping-zip");
   const regionList = document.getElementById("region");
   const shpc = document.getElementById("shipping-country");
   const rbtn = document.getElementById("radioButtons");
   const rb2c = document.getElementById('b2c');
   const rb2b = document.getElementById('b2b');
   const bchk = document.getElementById('billing-checkbox');
   const cbtn = document.getElementById("checkout-stripe");
   const bnLabel = document.getElementById("nmlb"); 
   const bst1 = document.getElementById("billing-street1");
   const bst2 = document.getElementById("billing-street2");
   const bct = document.getElementById("billing-city");
   const bst = document.getElementById("billing-state");
   const bz = document.getElementById("billing-zip");
   const bdiv = document.getElementById("billing-div");
   const bc = document.getElementById("billing-country");
   const taxInfo = document.getElementById("tax-field");
   const taxID = document.getElementById("taxID");
   const taxIDl = document.getElementById("taxID-label");
   const enAlert = document.getElementById("en-alert");
   const t1 = document.getElementById("terms1");
   const t2 = document.getElementById("terms2");
   const nw = document.getElementById("news");
   const tx = document.getElementById("textarea");
   var taxed;
   var vat;
document.addEventListener('DOMContentLoaded', function() {
 taxInfo.style.display = "none";
 taxed = false;
 vat = true;
//  valida se os campos foram preenchidos
 function fldf() {
 const a = ["name", "email", "sn", "phone", "shipping-country", "shipping-street1", "shipping-city", "shipping-zip"];
 let b = true;
 for (const field of a) {
  const i = document.getElementById(field);
  if (!i.value.trim()) b = false;
  }
  return b;
}
// billing info
function bfil() {
 const c = ["billing-street1", "billing-city", "billing-zip", "billing-country"];
 let d = true;
 for (const field of c) {
  const fieldElement = document.getElementById(field);
  if (!fieldElement.value.trim() && !bchk.checked) d = false;
 }
 return d;
}

// region dropdown
function lstsl() {
 const s = regionList.options[regionList.selectedIndex].value;
 const c = shpc.options[shpc.selectedIndex].value;
 if (s === "" || c === "" || (rb2c.checked == false && rb2b.checked == false)) return false;
return true;
}
function upBtn() {
 const h = fldf();
 const j = lstsl();
 const k = bfil();
 if (!t1.checked || !t2.checked || !h || !j || (!bchk.checked && !k) || (rb2b.checked && !vat && !regionList.value === "rest") || (regionList.value === "EN" && cart.totalPrice < 180) || regionList.value === "r") {
 cbtn.classList.add("disabledbtn");
 cbtn.disabled = true;
} else {
 cbtn.classList.remove("disabledbtn"); 
 cbtn.disabled = false;
}
}

function handleRch() {
enAlert.style.display = "";
 if (rb2c.checked) {
 vat = true;
 taxIDl.textContent = "TAX NUMBER";
 taxID.placeholder = "Tax number..."
 bnLabel.textContent = "Full Name *"; 
 if (regionList.value === "PT" || regionList.value === "EU-NI") {
  taxInfo.style.display = "";
  taxed = true;
 } else {
  if (regionList.value === "EN" && cart.totalPrice < 180) enAlert.style.display = "block";
	if (notEU()) {
   taxInfo.style.display = "none";
   taxed = false;
  }
  else
  {
   taxInfo.style.display = "";
   taxed = true;
  }
 }
}
if (rb2b.checked){
 vat = false;
 taxed = false;
 taxInfo.style.display = "none";  
 bnLabel.textContent = "Company Name *"; 
 if (regionList.value === "EN") {
  taxIDl.textContent = "EORI NUMBER *";
  taxID.placeholder = "GB123456789000";
  if (!notEU()) { 
   taxed = true;
   taxInfo.style.display = "";
  }
 } 
 else if (regionList.value ==="rest") {
  taxIDl.textContent = "TAX NUMBER";
  taxID.placeholder = "Tax number...";
  vat = true;
  if (!notEU()) { 
   taxed = true;
   taxInfo.style.display = "";
  }
 }
else {
 taxIDl.textContent = "TAX NUMBER *";
 taxID.placeholder = "PT123456789";
 if (regionList.value === "PT") {
   taxInfo.style.display = "";  
   taxed = true;
  }
 }
}
if (bchk.checked) {
 bdiv.style.display = "none";
 } else {
  bdiv.style.display = "";
 }
upBtn();
document.getElementById("order-taxed").textContent = "€" + (taxed ? (cart.totalPrice * 1.23).toFixed(2) : cart.totalPrice.toFixed(2));
}
async function validateEORI() {
 const v = taxID.value;
 const rqD = { "eoris": [v] };

 try {
  taxIDl.textContent = "Verifying";
  const rp = await axios.post('https://fluidinovabackend-production.up.railway.app/validate-eori', rqD, {
 headers: {
  'Content-Type': 'application/json'
  }
 });
 console.log("RP",rp);
 if (rp.status === 200) {
  if (rp.data.message === "EORI - Success!") {
  taxIDl.textContent = "Valid EORI ✅";
  vat = true;
  upBtn();
  } else {
  taxIDl.textContent = "Invalid EORI ❌";
  vat = false;
  taxed = true;
  }
 } else if (rp.status === 400) {
 taxIDl.textContent = "EORI bad request ❌";
 vat = false;
 taxed = true;
 }
 else if (rp.status === 500){
 taxIDl.textContent = "EORI API error ❌";
 vat = false; 
 taxed = true;
 }
 else {
 taxIDl.textContent = "EORI unknown error ❌";
 vat = false; 
 taxed = true;
 }
} catch (error) {
 taxIDl.textContent = "Error ❌";
 vat = false;
 taxed = true;
 console.error('e', error);
}
}
async function validateEUVAT() {
 const formData = {
        countryCode: taxID.value.substring(0, 2),
        vatNumber: taxID.value.substring(2),
        requesterMemberStateCode: 'PT',
        requesterNumber:'507439384'
      };
 
	try {
  taxIDl.textContent = "Verifying";
    const response = await fetch('https://fluidinovabackend-production.up.railway.app/check-vat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
          
  const result = await response.json();
  
  switch (result.code) {
      case 'SUCCESS':
        taxIDl.textContent = "VAT Valid ✅";
        vat = true;
   			upBtn();
        break;
      case 'ERR_INVALID_VAT':
        taxIDl.textContent = "VAT is Invalid ❌";
        vat = false;
        taxed = true;
        break;
      case 'ERR_MISSING_FIELDS':
        taxIDl.textContent = "Missing required fields ❌";
        vat = false;
        taxed = true;
        break;
      case 'ERR_INTERNAL_SERVER_ERROR':
        resultField.textContent = "Error connecting to API. Please try again later ❌";
        vat = false;
        taxed = true;
        break;
      default:
        resultField.textContent = 'Unknown error occurred ❌';
        vat = false;
        taxed = true;

    }
  } catch (error) {
    // Handle network or other errors
    taxIDl.textContent = "Error checking VAT ❌";
    console.error('An error occurred:', error);
    vat = false;
    taxed = true;
  }
  /*antigo
  if (!response.ok) {
   throw new Error('Failed to validate VAT');
   vat = false; 
   taxed = true;}
   if (data.checksum_valid && data.format_valid) {
   taxIDl.textContent = "VAT Valid ✅";
   vat = true;
   upBtn();
   } else if (data.format_valid && !data.checksum_valid) {
   taxIDl.textContent = "VAT unknown ❌";
   vat = false;
   taxed = true;
   } else {
   taxIDl.textContent = "VAT invalid ❌";
   vat = false;
   taxed = true;
  }
} catch (error) {
 console.error('Error', error);
 taxIDl.textContent = "Error ❌";
 vat = false;
 taxed = true;
 }*/
}

function validateVAT() {
const patternEN = /^(GB|gb)\d{12}$/;
const patternEU = /^[A-Za-z]{2}\d{9}$/;
 if (taxID.value.trim() && rb2b.checked) {
  if (regionList.value === "EN") validateEORI(); 
  else if (regionList.value === "EU-NI" || regionList.value === "PT") validateEUVAT(); } 
  upBtn();
}
name.addEventListener('blur', upBtn);
email.addEventListener('blur', upBtn);
shpstr.addEventListener('blur', upBtn);
shpct.addEventListener('blur', upBtn);
shpz.addEventListener('blur', upBtn);
sn.addEventListener('blur', upBtn);
phone.addEventListener('blur', upBtn);
bst1.addEventListener('blur', upBtn);
bct.addEventListener('blur', upBtn);
bz.addEventListener('blur', upBtn);
bc.addEventListener('blur', upBtn);
taxID.addEventListener('blur', upBtn);
regionList.addEventListener('change', handleRch);
shpc.addEventListener('change', handleRch);
rb2c.addEventListener('change', handleRch);   
rb2b.addEventListener('change', handleRch);   
bchk.addEventListener('change', handleRch);   
taxID.addEventListener('blur', validateVAT);
t1.addEventListener('change', upBtn);
t2.addEventListener('change', upBtn);
cart.loadCart();
populateCart("order-summary", "order-price", true);
rmOpt(shpc, "YE");
rmOpt(shpc, "GN");
rmOpt(shpc, "KP");
rmOpt(shpc, "RU");
rmOpt(shpc, "KM");
rmOpt(shpc, "CU");
rmOpt(shpc, "FK");
rmOpt(shpc, "IR");
rmOpt(shpc, "JT");
rmOpt(shpc, "KI");
rmOpt(shpc, "YE");
rmOpt(shpc, "SY");
rmOpt(shpc, "SL");
rmOpt(shpc, "GW");
rmOpt(shpc, "GQ");
rmOpt(shpc, "CF");
rmOpt(shpc, "KP");
rmOpt(shpc, "YT");
rmOpt(shpc, "MM");
rmOpt(shpc, "NR");
rmOpt(shpc, "NU");
rmOpt(shpc, "SH");
rmOpt(shpc, "PM");
rmOpt(shpc, "ST");
rmOpt(shpc, "SB");
rmOpt(shpc, "SO");
rmOpt(shpc, "SD");
rmOpt(shpc, "TJ");
rmOpt(shpc, "TK");
rmOpt(shpc, "TV");
rmOpt(shpc, "WK");
rmOpt(shpc, "UA");
rmOpt(shpc, "BY");


const shAF = shpc.querySelector('option[value="AF"]');
 if (shAF) {
  shAF.selected = true; 
}  
const bAF = bc.querySelector('option[value="AF"]');
 if (bAF) {
  bAF.selected = true; 
}
upBtn();
});
cbtn.addEventListener('click', async function() {
  var stripe = Stripe('pk_live_51J7eDfI6TgsJpVaUs8fdodVwwRerEbuvWPMxzTEVAVInPT83aUSm99O6GewdprrTryPZ1MAdAKyFd78LqOueltEt00eL3neK8f');
const customer = {
 name: name.value,
 email: email.value,
 taxID: taxID.value,
 phone: phone.value,
 reg: regionList.options[regionList.selectedIndex].textContent,
};
const shpAd = {
 fullName: sn.value,
 str1: shpstr.value,
 str2: shpstr2.value,
 c: shpct.value,
 ct: shpc.value,
 z: shpz.value,
 s: shpst.value,
};

const bilAd = {
 fullName: sn.value,
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
        bilAd: (bchk.checked ? shpAd : bilAd),
        cartItems: cartItems,
        tx: tx.value,
        b2c: rb2c.checked,
        t: taxed,
        news: nw.checked
    };
if (cbtn.disabled == false) {
	cbtn.textContent = 'Loading...';
  console.log("Cart Items:", cartItems); // Add this line to log cartItems

 try {
  //const response = await fetch('https://fluidinova-backend.adaptable.app/create-checkout-session', {
  const response = await fetch('https://fluidinovabackend-production.up.railway.app/create-checkout-session', {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});
  const session = await response.json();
if (response.status === 500) window.location.href = 'https://www.fluidinova.com/cancel';
  else window.location.href = session.url;
  } catch (error) {
 }
}
});
