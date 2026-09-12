

var colour="pink"; // "random" can be replaced with any valid colour ie: "red"...
var sparkles=0;// increase of decrease for number of sparkles falling

var x=ox=400;
var y=oy=300;
var swide=800;
var shigh=600;
var sleft=sdown=0;
var tiny=new Array();
var star=new Array();
var starv=new Array();
var starx=new Array();
var stary=new Array();
var tinyx=new Array();
var tinyy=new Array();
var tinyv=new Array();

colours=new Array('#1e1b47','#294966','#ffffff','#0f68bb','#294966','#715c65','#543c53','#1e1b47','#ffffff')

n = 10;
y = 0;
x = 0;
n6=(document.getElementById&&!document.all);
ns=(document.layers);
ie=(document.all);
d=(ns||ie)?'document.':'document.getElementById("';
a=(ns||n6)?'':'all.';
n6r=(n6)?'")':'';
s=(ns)?'':'.style';

if (ns){
	for (i = 0; i < n; i++)
		document.write('<layer name="dots'+i+'" top=0 left=0 width='+i/2+' height='+i/2+' bgcolor=#ff0000></layer>');
}

if (ie)
	document.write('<div id="con" style="position:absolute;top:0px;left:0px"><div style="position:relative">');

if (ie||n6){
	for (i = 0; i < n; i++)
		document.write('<div id="dots'+i+'" style="pointer-events:none;position:absolute;top:0px;left:0px;width:'+i/2+'px;height:'+i/2+'px;background:#ff0000;font-size:'+i/2+'"></div>');
}

if (ie)
	document.write('</div></div>');
(ns||n6)?window.captureEvents(Event.MOUSEMOVE):0;

function Mouse(evnt){

	y = (ns||n6)?evnt.pageY+4 - window.pageYOffset:event.y+4;
	x = (ns||n6)?evnt.pageX+1:event.x+1;
}

(ns)?window.onMouseMove=Mouse:document.onmousemove=Mouse;

function animate(){

	o=(ns||n6)?window.pageYOffset:0;

	if (ie)con.style.top=document.body.scrollTop + 'px';

	for (i = 0; i < n; i++){

		var temp1 = eval(d+a+"dots"+i+n6r+s);

		randcolours = colours[Math.floor(Math.random()*colours.length)];

		(ns)?temp1.bgColor = randcolours:temp1.background = randcolours; 

		if (i < n-1){

			var temp2 = eval(d+a+"dots"+(i+1)+n6r+s);
			temp1.top = parseInt(temp2.top) + 'px';
			temp1.left = parseInt(temp2.left) + 'px';

		} 
		else{

			temp1.top = y+o + 'px';
			temp1.left = x + 'px';
		}
	}

	setTimeout("animate()",10);
}

animate();

window.onload=function() { if (document.getElementById) {
	var i, rats, rlef, rdow;
	for (var i=0; i<sparkles; i++) {
		var rats=createDiv(3, 3);
		rats.style.visibility="hidden";
		rats.style.zIndex="999";
		document.body.appendChild(tiny[i]=rats);
		starv[i]=0;
		tinyv[i]=0;
		var rats=createDiv(5, 5);
		rats.style.backgroundColor="transparent";
		rats.style.visibility="hidden";
		rats.style.zIndex="999";
		var rlef=createDiv(1, 5);
		var rdow=createDiv(5, 1);
		rats.appendChild(rlef);
		rats.appendChild(rdow);
		rlef.style.top="2px";
		rlef.style.left="0px";
		rdow.style.top="0px";
		rdow.style.left="2px";
		document.body.appendChild(star[i]=rats);
	}
	set_width();
	sparkle();
}}
