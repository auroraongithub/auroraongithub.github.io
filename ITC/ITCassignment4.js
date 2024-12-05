/* ASSIGNMENT 4 */

function ConvertDecimal(v,x)
    {
     let rvalue;
       
       if (isNaN(v)) 
       {
          rvalue = '';
        } else {
           rvalue = v.toFixed(x);
       }
     
     return rvalue;
     }

      function computeNet()
      {
        var x,y,z;
        x = document.getElementById("daysWorked").value*1;
        y = document.getElementById("deduct").value*1

        z = Math.round((x-y)*100)/100;

        console.log(z);

        document.getElementById("totalNet").value = z;
      }

      function initList()
      {
        list=[];
        document.getElementById("employeeNum").value = 0;
        document.getElementById("totalNet").innerHTML='';
      }

      function showList()
      {
        let i,len,listtext,totalNet,ln;
        let tableBody;

       // document.getElementById("tablebody").innerHTML='';
        len = list.length;
        
        for(i=0,totalNet=0,listtext="",tableBody='';i<len;i++)
        {
          ln=i+1;

         tableBody += "<tr>"
        +"<td>"  + ln + "</td>"
        + "<td>" + list[i].employee + "</td>"
        + "<td style='text-align:right'>" + ConvertDecimal(list[i].daysWorked*1,0) + "</td>"
        + "<td style='text-align:right'>" + ConvertDecimal(list[i].dailyRate*1,2) + "</td>"
        + "<td style='text-align:right'>" + ConvertDecimal(list[i].grossPay()*1,2) + "</td>"
        + "<td style='text-align:right'>" + ConvertDecimal(list[i].deductAmount*1,2) + "</td>"
        + "<td style='text-align:right'>" + ConvertDecimal((list[i].grossPay() - list[i].deductAmount)*1,2) + "</td>"
        + "</tr>";

          totalNet = totalNet = (totalNet * 1) + (ConvertDecimal(list[i].netPay() *1, 2) *1);

        }
        document.getElementById("tablebody").innerHTML = tableBody;
      }

      function clearList()
      {
        var clear;

        clear = confirm("Delete all employee(s) from the list?");

        if (clear)
        {
          initList();
        }
      }

      function delSpec()
      {
        var x,y;

        x=document.getElementById("delEmployee").value*1;
        y=document.getElementById("employeeNum").value*1;

        document.getElementById("employeeNum").value = --y;

        --x;

        if (x>=0 && x<list.length) {
        list.splice(x,1);
        showList();
        document.getElementById("delEmployee").value='';
  }

  dlgAreYouSure.close();
      }

      (() => 
      {
        initList();

        const cancel = document.getElementById("cancel");
        const confirm= document.getElementById("confirm");
        const dlgConfirmCancel = document.getElementById("dlgConfirmCancel");
        dlgConfirmCancel.returnValue = "confirm";

        const yes = document.getElementById("yes");
        const no = document.getElementById("no");
        const dlgAreYouSure = document.getElementById("dlgAreYouSure");
        dlgAreYouSure.returnValue = "no";

        const input_daysWorked= document.getElementById('daysWorked');
        input_daysWorked.addEventListener('change', e =>
        {
          e.currentTarget.value = parseFloat(e.currentTarget.value).toFixed(0)
        });

        input_daysWorked.addEventListener("keyup", () => {
          computeNet();
        });

        const input_rate = document.getElementById("dayRate");
        input_rate.addEventListener('change', e => {
         e.currentTarget.value = parseFloat(e.currentTarget.value).toFixed(2)
        });

        input_rate.addEventListener("keyup",
        ()=>{
        computeNet();
        });

        const listEmployee = document.getElementById("employee");
        listEmployee.addEventListener("change", ()=>{
        document.getElementById("daysWorked").value="";
        document.getElementById("dayRate").value="";
        document.getElementById("employeeNum")
        });


        document.getElementById("btndelete").addEventListener("click", () => 
        {
          var x,l;

          l = list.length;

          x=document.getElementById("delEmployee").value*1;

          --x;

        if (x>=0 && x<l) 
        {
          document.getElementById("dlgmsg2").innerHTML="Delete the employee "+(x+1)+": "+list[x].employee+"?";
          dlgAreYouSure.showModal();  
        }
        });

        document.getElementById("yes").addEventListener("click", () => 
        {
          delSpec();
        });

        document.getElementById("btnaddEmployee").addEventListener("click",
        //main                                                         
       ()=>
         {

        var listItem = 
        {
          "employee" : "1", 
          "daysWorked" : "0", 
          "dailyRate" : "1", 
          "grossPay" : function grossPay()
          {
              return Math.round(this.daysWorked*this.dailyRate*100)/100;
          }, 
          "deductAmount" : "0", "netPay" : function netPay()
          {
              return Math.round(this.grossPay - this.deductAmount);
          }
        };

        listItem.employee = document.getElementById("employee").value;
        listItem.daysWorked = ConvertDecimal(document.getElementById("daysWorked").value*1,2);
        listItem.dailyRate = ConvertDecimal(document.getElementById("dayRate").value*1,2);
        listItem.deductAmount = ConvertDecimal(document.getElementById("deduct").value*1,2);

        list.push(listItem);

        document.getElementById("employeeNum").value = list.length;
        showList();
      });
       
        document.getElementById("btnclearList").addEventListener("click", function(){
        document.getElementById("dlgmsg").innerHTML = "Clear the list?";
        dlgConfirmCancel.showModal();
        });

        //clear list
        document.getElementById("confirm").addEventListener("click", () => 
        {
        initList();
        showList();
        dlgConfirmCancel.close();
        });

        document.getElementById("cancel").addEventListener("click", function(){
        dlgConfirmCancel.close();
        });

        btnConfirm.addEventListener("click", () => {
        dlgConfirmCancel.returnValue="confirm";
        dlgConfirmCancel.close("confirm");
        });

      dlgConfirmCancel.addEventListener("close",(e)=>
    {
        var rst= e.target.returnValue;
        var lblmsg = document.getElementById("dlgmsg").innerHTML;
        if (rst=="confirm") {
            if (lblmsg=="Clear the list?" ){ 
               dlgAreYouSure.showModal();
            }  else if (lblmsg.substring(0,15)=="Delete the employee"){
                var x=document.getElementById("delEmployee").value*1 - 1;
                cart.splice(x,1);
                showcart();
                document.getElementById("delEmployee").value='';
            } 
        }
    });

    dlgAreYouSure.addEventListener("close",(e)=>
    {
        var rst= e.target.returnValue;
        var lblmsg = document.getElementById("dlgmsg").innerHTML;
        if (rst=="yes" && lblmsg=="Clear the cart?" )
        {  
            initList();
            showList();
        }
    });

})(); //main end

    var list=[]; //global variable