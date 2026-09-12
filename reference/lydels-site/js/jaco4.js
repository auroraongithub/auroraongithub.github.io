menuClicked('aboutB');

factsquesalieron = new Array();
lastIndex = -1;

function menuClicked(selection){
    
    //variables que no van a cambiar

    //menuItems: variable que hago yo aca en js
    //ahi se guarda todo el div menu 

    const menuItems = document.getElementById('menuP');
    const containers = document.getElementById('main');
    
    // menuArray: variable que hago yo aca en js
    // es un array donde se guardan todos los divs que tienen clase menuItem
    
    let menuArray = menuItems.getElementsByClassName('boton');
    let containersArray = containers.getElementsByClassName('javascript');
    

    for (let i = 0; i < menuArray.length; i++) {
        const element = menuArray[i];  
        const elementC = containersArray[i]; // estos son todos los id de los containers (about, live, etc)

        if(element.getAttribute('id') == selection){
            element.classList.add('selected');   
        }else{
            element.classList.remove('selected');  
        }

        if(elementC.getAttribute('id') == selection.slice(0,-1)){
            elementC.classList.remove('closed');   
            elementC.classList.add('open');   
        }else{
            elementC.classList.add('closed');  
            elementC.classList.remove('open');  
        }
    }
}

var facts = [
    'the band hasn\'t ever changed members since it was formed, but since around 2006 they also have a drummer that joins them on tours and recording sessions.',
    'the two guitarrists of the band (branco and chris) are brothers, with branco being the oldest (as well as the oldest of the band).',
    'none of the full names they go by are their real full names, except for chris\'.',
    'one of the members (branco) was briefly in a band with the members of daft punk around 1992. it was called darlin\'.',
    'they never released any collaborations with other artists until \'tonight\' with ezra koenig in 2022, being the only original phoenix collab ever released so far.',
    'one of the members (thomas) is married to movie director sofia coppola.',
    'thomas (main vocalist) was originally a drummer at the very begginings of the band, and he still does the drum patterns in a lot of phoenix songs.',
    'they all grew up in the same town as the members of the band Air, but didn\'t meet until a lot later on.',
    'phoenix was Air\'s backing band for a few shows in the 90\'s.',
    'they all managed to avoid military service when they were young, funniest cases being chris changing his nationality and thomas pretending he was completely insane in order to do so LOL',
    'at the time of recording \'run run run\' the studio was full of crickets because of a storm, but they decided to record anyway. that\'s the background noise you can hear in the intro...',
    'their main inspiration when making \'alphabetical\' was d\'angelo\'s \'voodoo\'.',
    'for a lot of the \'ti amo\' tour shows, they had a HUGE mirror on stage on top of their heads at 45 degrees that reflected the whole stage. fortunately no injuries lol',
    'they performed at the olympics\' closing ceremony in 2025.',
    'deck and branco are the bassist and guitarrist of the band respectively, but they also play keys on stage, switching between both.',
    'the band has two guitarrists (branco and chris) and they\'ve said there is no \'main\' guitarrist. they also don\'t like doing guitar solos and they think they are lame lol.',
    'whenever asked, they\'ve said that they aren\'t interested in pursuing solo careers, as \"they\'re not so good musicians on their own, but pretty good musicians when they\'re together\".',
    'a lot of their music is made with cheap synths and instruments, but for the making of \'bankrupt\' they bought the console \'thriller\' was made on.'
];

function newFact() {
  let randomNumber = generateNumber();                          // genero el numerito random y lo guardo en randomnumber
  let fact = facts[randomNumber];                               // con el numerito selecciono el fact que sale
  let huborepeticion = true;                                    // para tirar el for de nuevo si un numero se repite

  if (factsquesalieron.length == facts.length){                 // antes que todo chequeo si el array ta lleno
    factsquesalieron.length = 0;                                // si está lo vacío
  }

  if (factsquesalieron.length != 0){                            // si es la primera vez q entra no pasa x aca
    while (huborepeticion == true) {                            // si es la primera vez, o mientras se siga repitiendo en el chequeo sigue chequeando
        for (var i = 0; i < factsquesalieron.length; i++) {     
            huborepeticion = false;                             // inicialmente pongo repeticion como falso
            while(factsquesalieron[i] == randomNumber){         
                huborepeticion = true;                          // si se repite le pongo true
                randomNumber = generateNumber();
            }
        }
    }
    fact = facts[randomNumber];
  }

  factsquesalieron.push(randomNumber);
  document.getElementById("factsDisplay").innerHTML = fact;
}

function generateNumber(){
    return Math.floor(Math.random() * (facts.length));
}