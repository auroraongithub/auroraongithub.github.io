albumClicked('idneverlietoyou');

function albumClicked(album){
    
    //variables que no van a cambiar
    const albumContent = document.getElementById('albumsContainer');
    let albumsArray = albumContent.getElementsByClassName('content');
    
    for (let i = 0; i < albumsArray.length; i++) {
        const element = albumsArray[i];           

        if(element.getAttribute('id') == album){
            element.classList.remove('displayNone');   
             
        }else{
            element.classList.add('displayNone');
        }
    }
}