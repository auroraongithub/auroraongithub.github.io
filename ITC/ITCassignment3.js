function numberCalculator() {

    const n = parseInt(document.getElementById("numberInput").value);
    const operation = document.getElementById("operation").value;
    let resultText = "";
  
    if (isNaN(n) || n <= 0) {
      resultText = "Please enter a valid positive number.";
    } else {
      switch (operation) {
        case "factorial":
          resultText = `Factorial of ${n}: ${factorial(n)}`;
          break;
        case "sum":
          resultText = `Sum of first ${n} natural numbers: ${sumOfFirstN(n)}`;
          break;
        case "average":
          resultText = `Average of first ${n} natural numbers: ${averageOfFirstN(n).toFixed(2)}`;
          break;
      }
    }
    
    document.getElementById("result").textContent = resultText;
  }
  
  function factorial(n) {
    let factorial = 1;
    for (let i = 1; i <= n; i++) {
      factorial *= i;
    }
    return factorial;
  }
  
  function sumOfFirstN(n) {
    return (n * (n + 1)) / 2;
  }
  
  function averageOfFirstN(n) {
    return sumOfFirstN(n) / n;
  }