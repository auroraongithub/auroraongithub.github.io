function calculateTax() {

    let ti, basictax, totaltax;
    
      ti = document.getElementById("taxableincome").value * 1;
    
      if (ti <= 250000) {
          basictax = 0;
      } else if (ti > 250000 && ti <= 400000) {
          totaltax = (ti-250000) * 0.20;
      } else if (ti > 400000 && ti <= 800000) {
          totaltax = 30000 + ((ti-400000) * 0.25);
      } else if (ti > 800000 && ti <= 2000000) {
          totaltax = 130000 + ((ti-800000) * 0.30);
      } else if (ti > 2000000 && ti <= 8000000) {
          totaltax = 490000 + ((ti-2000000) * 0.32);
      } else {
          totaltax = 2410000 + ((ti-8000000) * 0.35);
      }
    
      totaltax = totaltax.toFixed(2);
      document.getElementById("incometax").textContent = `Income Tax: ${totaltax}`; 
    }