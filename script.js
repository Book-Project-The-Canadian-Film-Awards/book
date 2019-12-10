/*global PubNub,abs,angleMode,append,background,beginShape,bezier,box,camera,ceil,CENTER,color,cone,cos,createCanvas,createCanvas,createGraphics,curveVertex,cylinder,DEGREES,displayHeight,displayWidth,dist,div,DOWN_ARROW,ellipse,endShape,fill,floor,frameCount,frameRate,height,image,key,keyCode,keyIsDown,keyIsPressed,keyIsPressed,keyPressed,LEFT,LEFT_ARROW,lerpColor,line,loadImage,loadJSON,loadSound,map,mouseIsPressed,mouseX,mouseY,noFill,noLoop,normalMaterial,noStroke,p5,plane,point,pointLight,pop,push,push,RADIANS,radians,random,rect,resizeCanvas,resizeCanvas,RIGHT,RIGHT_ARROW,rotate,rotateX,rotateY,rotateZ,round,round,scale,shuffle,sin,sphere,stroke,strokeWeight,text,textAlign,textFont,textSize,texture,textWidth,torus,translate,triangle,UP_ARROW,WEBGL,width,windowHeight,windowHeight,windowWidth,world */

// server variables for apps to communicate they must use THE SAME KEYS
//get these keys from your PubNub account
//within your group, you will use 1 of your accounts for the project

let hasWon=false;

let winImg;

function preload() {
  winImg = loadImage('https://cdn.glitch.com/00d6cf74-0161-47c4-a5e6-1974b7140b44%2Fcover.jpg?v=1575857974356');
}


$(function() {
  
  
  let dataServer;
  const pubKey = "pub-c-a47315a9-2216-4452-a250-411e09a619b7"; 
  const subKey = "sub-c-5402c1ca-0cbb-11ea-9d22-32c7c2eb6eff";
  const channelName = "terry-trivia";
  
  let maxPlayers = 2;
  let currentPlayers = 0;
  let players = [];
  
  // initialize pubnub
  dataServer = new PubNub({
    publish_key: pubKey, //get these from the pubnub account online
    subscribe_key: subKey,
    ssl: true //enables a secure connection. This option has to be used if using the OCAD webspace
  });

  //attach callbacks to the pubnub object to handle messages and connections
  dataServer.addListener({ message: readIncoming });
  dataServer.subscribe({ channels: [channelName] });
  
  
  
  //when new data comes in it triggers this function,
  //this works becsuse we subscribed to the channel in setup()
  function readIncoming(inMessage) {


    // simple error check to match the incoming to the channelName
    if (inMessage.channel == channelName) {    
      
      switch(inMessage.message.type) {
      case 'new player':
        console.info('New player detected');
        if (currentPlayers <= maxPlayers) {
          
          let responseStr = "";
          
          if (currentPlayers == 0) {
            responseStr = "Purple Terry";
          }
          else if (currentPlayers == 1) {
            responseStr = "Red Terry";
          }
          else if (currentPlayers == 2) {
            responseStr = "Yellow Terry";
          }
          
          players.push({
            "ID": inMessage.message.userID,
            "name": responseStr,
            "score": 0,
            "xPos": 0,
            "questionCount": 0,
            "complete": false
          });
          
          sendUserTerry(inMessage.message.userID, responseStr);
          addNewPlayer(inMessage.message.userID);
          currentPlayers++;
        }
        else {
          console.info("Player max reached. No player was added.");    
        }
        break;
      case "submit correct":
          if (playerExists(inMessage.message.userID)) {
            let playerIndex = getPlayerIndex(inMessage.message.userID);
            let selectorString = "#" + inMessage.message.userID;
            console.info(selectorString);
            
            players[playerIndex].score++;
            players[playerIndex].xPos += width/40; // was 30
            
            let styleString = "left: " + players[playerIndex].xPos.toString() + "px";
            // console.info($(selectorString));
            
            $(selectorString).attr('style', styleString);
            console.info();
            // console.info("Player now has a score of: " + players[playerIndex].score);
          }
        break;
      case "user finished":
          if (playerExists(inMessage.message.userID)) {
            let playerIndex = getPlayerIndex(inMessage.message.userID);
            players[playerIndex].complete = true;
            
            if (players[0].complete == true && players[1].complete == true && players[2].complete == true) {
              determineWinner();
            }
          }
      default:
        console.info("condition not met");
    }

    }
  } 
  
  function sendUserTerry(id, msg) {
    dataServer.publish({
    channel: channelName,
    message: {
       type: "send user terry",
       userID: id,
       msg: msg
    }
    });
  }
  
  function determineWinner() {
    
    let max = 0;
    let winnerID = "";
    let winnerName = "";
    
    for (var i = 0; i <players.length; i++) {
      if (players[i].score > max) {
        max = players[i].score;
        winnerID = players[i].ID;
        winnerName = players[i].name;
      }
    }
    
    $('#winner').html(winnerName + " has won the race!<br>" + winnerName + " is awarded The Canadian Film Award! <br>Tap to congratulate!");
    
    hasWon=true;
    
    dataServer.publish({
    channel: channelName,
    message: {
       type: "send winner",
       userID: winnerID,
       name: winnerName
    }
    });
    
  }
  
  function addNewPlayer(id) {
    if (currentPlayers == 0) {
      $('#racers').append(`
        <img id="${id}" class="racer" src="https://cdn.glitch.com/33380508-0cfe-4e59-b6e0-4a87a854047e%2Fblue%20terry%20fox.png?v=1575421333928"></div>
      `);
    }
    else if (currentPlayers == 1) {
      $('#racers').append(`
        <img id="${id}" class="racer" src="https://cdn.glitch.com/33380508-0cfe-4e59-b6e0-4a87a854047e%2Fred%20terry%20fox.png?v=1575421324279"></div>
    `);
    }
    else if (currentPlayers == 2) {
      $('#racers').append(`
        <img id="${id}" class="racer" src="https://cdn.glitch.com/33380508-0cfe-4e59-b6e0-4a87a854047e%2Fyellow%20terry%20fox.png?v=1575421329144"></div>
      `);
    }
  
  }
  
  function playerExists(id) {
    
    for (var i = 0; i <players.length; i++) {
      if (id == players[i].ID) {
        return true;
      }
    }
    
  }
  
  function getPlayerIndex(id) {
    for (var i = 0; i <players.length; i++) {
      if (id == players[i].ID) {
        return i;
      }
    }
  }
  
});


  let dataServer;
  const pubKey = "pub-c-a47315a9-2216-4452-a250-411e09a619b7"; 
  const subKey = "sub-c-5402c1ca-0cbb-11ea-9d22-32c7c2eb6eff";
  const channelName = "terry-trivia";

let hearts = [];
let which = 0;

var myCanvas;


  
function setup(){
  // initialize pubnub
  dataServer = new PubNub({
    publish_key: pubKey, //get these from the pubnub account online
    subscribe_key: subKey,
    ssl: true //enables a secure connection. This option has to be used if using the OCAD webspace
  });

  //attach callbacks to the pubnub object to handle messages and connections
  dataServer.addListener({ message: readIncoming });
  dataServer.subscribe({ channels: [channelName] });
  
  myCanvas=createCanvas(windowWidth-100, windowHeight-200);

  for (let i = 0; i < 20; i++) {
    hearts.push(new Heart(-50,0));
  }
  
  myCanvas.hide();
  
}

function draw(){
  background(255);
  
  image(winImg,width/3,0,width/3,height);
  
    for (let i = 0; i < hearts.length; i++) {
    hearts[i].move();
    hearts[i].display();
  }

  if(hasWon==true){
    won();
  }
  
}

function won(){
  myCanvas.show();
}

///uses built in mouseClicked function to send the data to the pubnub server
function mouseClicked() {
  // Send Data to the server to draw it in all other canvases
  

  
  dataServer.publish({
    channel: channelName,
    message: {
      x: mouseX,
      y: mouseY
    }
  });
  
  
}
  
  
  //when new data comes in it triggers this function,
  //this works becsuse we subscribed to the channel in setup()
  function readIncoming(inMessage) {


    // simple error check to match the incoming to the channelName
    if (inMessage.channel == channelName) {    
      
       let clickX = inMessage.message.x;
       let clickY = inMessage.message.y;
      
        which++;

        if (which >= 20) {
          which = 0;
        }

        hearts[which] = new Heart(clickX,clickY);
    

    }
  } 
  
class Heart {
  constructor(mX,mY) {
    this.x = mX*9;
    this.y = mY;
    
    //colour is somewhat random
    //will be a shade of red, pink, yellow, orange
    this.tone=random(0,255);
    this.tone2=random(0,255);
  }

  move() {
    this.y=this.y-4;
  }

  display() {
    noStroke();
    
    fill(230,this.tone,this.tone2);

    ellipse(this.x + 10, this.y + 10, 20);
    ellipse(this.x + 30, this.y + 10, 20);

    beginShape();
    vertex(this.x + 0, this.y + 13);
    vertex(this.x + 10, this.y + 10);
    vertex(this.x + 40, this.y + 13);
    vertex(this.x + 20, this.y + 40);
    endShape(CLOSE);
  }
}


