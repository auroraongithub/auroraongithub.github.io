function updateConversionFields() {
    const conversionType = document.getElementById('conversionType').value;
    const input = document.getElementById('inputValue');
    
    if (conversionType === "CtoF") {
      input.placeholder = "Enter Celsius";
    } else if (conversionType === "FtoC") {
      input.placeholder = "Enter Fahrenheit";
    } else if (conversionType === "MtoF") {
      input.placeholder = "Enter Meters";
    } else if (conversionType === "FtoM") {
      input.placeholder = "Enter Feet";
    }
    
    document.getElementById('result').innerText = "";
  }
  
  function Conversion() {
    const conversionType = document.getElementById('conversionType').value;
    const inputValue = parseFloat(document.getElementById('inputValue').value);
    let resultText = "";
  
    if (conversionType === "CtoF") {
      const fahrenheit = (inputValue * 9 / 5) + 32;
      resultText = `Fahrenheit: ${fahrenheit.toFixed(2)}°F`;
    } else if (conversionType === "FtoC") {
      const celsius = (inputValue - 32) * 5 / 9;
      resultText = `Celsius: ${celsius.toFixed(2)}°C`;
    } else if (conversionType === "MtoF") {
      const feet = inputValue * 3.28084;
      resultText = `Feet: ${feet.toFixed(2)} ft`;
    } else if (conversionType === "FtoM") {
      const meters = inputValue / 3.28084;
      resultText = `Meters: ${meters.toFixed(2)} m`;
    }
  
    document.getElementById('result').innerText = resultText;
  }
  
  updateConversionFields();