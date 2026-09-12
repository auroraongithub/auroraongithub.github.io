// onionring.js is made up of four files - onionring-widget.js, onionring-index.js, onionring-variables.js (this one!), and onionring.css
// it's licensed under the cooperative non-violent license (CNPL) v4+ (https://thufie.lain.haus/NPL.html)
// it was originally made by joey + mord of allium house, last updated 2020-11-24

// === ONIONRING-VARIABLES ===
//this file contains the stuff you edit to set up your specific webring

//the full URLs of all the sites in the ring
var sites = [
    'https://lydels.neocities.org/',
    'https://xsolimini.fr',
    'https://leizy8499.neocities.org/',
    'https://isobelsweb.com',
    'https://johndavid.neocities.org/',
    'https://willascool.neocities.org',
    'https://juneflip.neocities.org',
    'https://conallia.cc/',
    'https://brooklynights.nekoweb.org',
    'https://kimt1nez.neocities.org',
    'https://atomicbolts.nekoweb.org',
    'https://dequake.neocities.org/',
    'https://alleycat.fyi/',
    'https://jevi.neocities.org/',
    'https://14-4ml.net/',
    'https://smorb.neocities.org/',
    'https://caminus.quest/',
    'https://yieiori.neocities.org/',
    'https://kerchunkleknoughts.github.io/',
    'https://milkyway.moe/',
    'https://steelwhisper.neocities.org/',
    'https://nyanyanparadise.neocities.org/',
    'https://lyer-online.neocities.org/',
    'https://upsidedownhourglass.neocities.org/',
    'https://encounters-ltd.neocities.org/',
    'https://saphi.nekoweb.org/home.html',
    'https://keyjay.neocities.org/',
    'https://elkster.neocities.org/',
    'https://zoxolotl.neocities.org',
    'https://bailey.lockheart.love/',
    'https://addisonannihilation.neocities.org/',
    'https://nogbadthebad.neocities.org/',
    'https://vaporphage.neocities.org/',
    'https://www.redtail.works/',
    'https://vanyara.neocities.org',
    'https://creamblast.neocities.org/',
    'https://www.ledaheavyindustry.com/',
    'https://your-living-illusion.neocities.org',
    'https://samswaggedout.neocities.org/',
    'https://horseychobunso.neocities.org/',
    'https://claranguyen.me',
    'https://kungfuarchermaster.neocities.org',
    'https://termotanquedeleche.neocities.org/',
    'https://stylrtechnologies.com/',
    'https://spaceyboiis.neocities.org/',
    'https://cyanidedansen.neocities.org/',
    'https://downhill2k01.neocities.org/',
    'https://your-hands.neocities.org/',
    'https://guest1013.neocities.org/',
    'https://theonlylivinggirlinpa.neocities.org/',
    'https://cherrycomet.neocities.org',
    'https://greenteabitches.neocities.org',
    'https://www.milk-tea.email',
    'https://rose.arceus.day/',
    'https://lysurps.neocities.org/',
    'https://badgraph1csghost.neocities.org/',
    'https://scythewalker.neocities.org/',
    'https://elioffline.neocities.org/',
    'https://nekokittygirl2010.neocities.org/',
    'https://tab87.neocities.org/',
    'https://d60010.com/',
    'https://weollex.neocities.org/',
    'https://dogystuff.neocities.org/',
    'https://dustbunnybedroom.neocities.org/',
    'https://www.retri.space/',
    'https://fourtwo2k.neocities.org/',
    'https://ihatetehbsod.neocities.org',
    'https://ofeliafirelight.neocities.org',
    'https://elliotwren.com/',
    'https://mysweetluna.neocities.org/',
    'https://lycentropy.com',
    'https://technoangel.neocities.org/',
    'https://und3adpr0ductions.nekoweb.org/',
    'https://kittyboyluv.neocities.org/',
    'https://midnight-channel.neocities.org/'
    ];
    
    //the name of the ring
    var ringName = 'musicians webring';
    
    /* the unique ID of the widget. two things to note:
     1) make sure there are no spaces in it - use dashes or underscores if you must
     2) remember to change 'webringid' in the widget code you give out and all instances of '#webringid' in the css file to match this value!*/
    var ringID = 'musicians-ring';
    
    //should the widget include a link to an index page?
    var useIndex = false;
    //the full URL of the index page. if you're not using one, you don't have to specify anything here
    var indexPage = 'https://lydels.neocities.org/musicianswebring/webring';
    
    //should the widget include a random button?
    var useRandom = false;
