var entro = false;

function menuClicked(selection){
    
    //variables que no van a cambiar

    //menuItems: variable que hago yo aca en js
    //ahi se guarda todo el div menu 

    const menuItems = document.getElementById('menu');
    const containers = document.getElementById('containers');

    // menuArray: variable que hago yo aca en js
    // es un array donde se guardan todos los divs que tienen clase menuItem
    
    let menuArray = menuItems.getElementsByClassName('clickable');
    let containersArray = containers.getElementsByClassName('container');

    for (let i = 0; i < menuArray.length; i++) {
        const element = menuArray[i];
        const elementC = containersArray[i]; // estos son todos los id de los containers (about, live, etc)

        if(element.getAttribute('id') == selection){
            element.classList.add('menuSelected');   
        }else{
            element.classList.remove('menuSelected');  
        }

    }

    if(entro == false){
        containersArray[0].removeAttribute('id');
        containersArray[0].setAttribute('id','home');
        entro == true;
    }
}
