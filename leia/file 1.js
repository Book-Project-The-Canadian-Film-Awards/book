

let moonImage;

function preload(){
moonImage = loadImage("img/moonboy.jpg");
}

function setup(){
createCanvas(windowWidth,windowHeight);
image(moonImage,0,0);
}

function draw(){
fill(0);
textSize(30);
text(rotationZ,0,height/2);

}
