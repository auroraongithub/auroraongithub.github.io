menuClicked('mixesTab');

function menuClicked(selection){
    
    //variables que no van a cambiar

    //menuItems: variable que hago yo aca en js
    //ahi se guarda todo el div menu 

    const menuItems = document.getElementById('tabselection');

    // menuArray: variable que hago yo aca en js
    // es un array donde se guardan todos los divs que tienen clase menuItem
    
    let menuArray = menuItems.getElementsByClassName('tab');

    for (let i = 0; i < menuArray.length; i++) {
        const element = menuArray[i];  

        if(element.getAttribute('id') == selection){
            element.classList.add('tabSelected');   
        }else{
            element.classList.remove('tabSelected');  
        }
    }
}