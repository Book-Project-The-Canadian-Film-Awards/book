let hasWon=false;

let winImg;

function preload() {
  winImg = loadImage('https://cdn.glitch.com/4ac2b386-79b6-49a6-a6ad-ce58cd90d1a9%2Fcover.jpg?v=1575785889125');
}


$(function() {
  
  const startButton = document.getElementById('start_btn');
  const nextButton = document.getElementById('next_btn');
  const questionContainerElement = document.getElementById('question-container');
  const questionElement = document.getElementById('question');
  const answerButtonsElement = document.getElementById('answer-buttons');
  const userID = Math.floor(Math.random() * 1000000000).toString();

  let shuffeledQuestions, currentQuestionIndex;
  
  let dataServer;
  const pubKey = 'pub-c-a47315a9-2216-4452-a250-411e09a619b7';
  const subKey = 'sub-c-5402c1ca-0cbb-11ea-9d22-32c7c2eb6eff'; 
  let channelName = "terry-trivia";
   
  dataServer = new PubNub( 
  {
    publish_key   : pubKey,  //get these from the pubnub account online 
    subscribe_key : subKey, 
    ssl: true,  
  });
  
  //attach callbacks to the pubnub object to handle messages and connections
  dataServer.addListener({ message: readIncoming });
  dataServer.subscribe({ channels: [channelName] });
   
  init();
  
  function readIncoming(inMessage) { 
    // simple error check to match the incoming to the channelName
    if (inMessage.channel == channelName) {    
      
      switch(inMessage.message.type) {
        case 'send user terry':
          if (inMessage.message.userID == userID) {
            console.info(inMessage.message.userID);
            $('#username').html("You are " + inMessage.message.msg + "!");
          }
          break;
        case 'send winner':
          $('#result-div').html("Race Complete!");
          $('#result-div').html(inMessage.message.name + " has won the race!<br>" + inMessage.message.name + " is awarded The Canadian Film Award! <br>Tap to congratulate!");
          $("div").remove(".container-fluid");
          $("div").show(".winner-page");
          hasWon=true;
          break;
          
        default:
          break;
      }
    }
  }
  
  function sendNewPlayer() {
    
    dataServer.publish(
      {
        channel: channelName,
        message:
        {
          userID: userID,
          type: "new player"
        }
      });
    
  }
  
  function sendData() {
    // Send Data to the server to draw it in all other canvases
    dataServer.publish(
      {
        channel: channelName,
        message:
        {
          userID: userID,
          type: "submit correct"
        }
      });
  }
  
  function sendQuizComplete() {
    // Send Data to the server to draw it in all other canvases
    dataServer.publish(
      {
        channel: channelName,
        message:
        {
          userID: userID,
          type: "user finished"
        }
      });
  }
  
  
  function init() {
    addEvents();
  }
  
  function addEvents() {
    
    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', ()=>{
      currentQuestionIndex++;
      setNextQuestion();
    });
    
  }
  
  function startGame(){
    console.log('Started');
    startButton.classList.add('hide');

    shuffeledQuestions = questions.sort(() => Math.random() - .5);
    currentQuestionIndex = 0;
    questionContainerElement.classList.remove('hide');
    sendNewPlayer();
    setNextQuestion();
  }

  function setNextQuestion(){
    resetState();
    showQuestion(shuffeledQuestions[currentQuestionIndex]);

  }

  function showQuestion(question){

    questionElement.innerText = question.question;

    question.answers.forEach(answer => {
      const button = document.createElement('button');
      button.innerText =answer.text;
      button.classList.add('btn');

      if(answer.correct){
        button.dataset.correct = answer.correct;
      }

      button.addEventListener('click', selectAnswer);
      answerButtonsElement.appendChild(button);
    })
  }

  function resetState(){
    clearStatusClass(document.body);
    nextButton.classList.add('hide');
    while(answerButtonsElement.firstChild){
      answerButtonsElement.removeChild
      (answerButtonsElement.firstChild)
    }

  }

  function selectAnswer(e){
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct;
    setStatusClass(document.body, correct);
    Array.from(answerButtonsElement.children).forEach(button =>{
      setStatusClass(button, button.dataset.correct);
    })
    if(shuffeledQuestions.length > currentQuestionIndex +1){
        nextButton.classList.remove('hide');
    } else{
      $('#result-div').html("Oh no! You got tired!<br>Waiting for other players to finish...");
      sendQuizComplete();
      // startButton.innerText = "Restart";
      // startButton.classList.remove('hide');
    }


  }

  function setStatusClass(element, correct){
    clearStatusClass(element);
    if(correct){
      
      if (!$(element).hasClass('correct')) {
        sendData();
      }
      element.classList.add('correct');
      
      $('#answer-buttons .btn').prop('disabled', true);
      
      
    }else{
        element.classList.add('wrong');
    }
  }

  function clearStatusClass(element){
    element.classList.remove('correct');
    element.classList.remove('wrong');
  }

const questions =[
  {
    question: 'Which Canadian actress plays a main role in the 2004 film Mean Girls?',
    answers: [
      {text:'Amanda Seyfried', correct: false},
      {text:'Lindsay Lohan', correct: false},
      {text:'Rachel McAdams', correct: true},
      {text:'Shay Mitchell', correct: false}
    ]
  },
  {
    question: 'Which Canadian actor stars in the 1999 film The Matrix?',
    answers: [
      {text:'Simu Liu', correct: false},
      {text:'Keanu Reeves', correct: true},
      {text:'Matthew Perry', correct: false},
      {text:'Laurence Fishburne', correct: false}
    ]
  },
  
   {
    question: 'Who does actress Sandra Oh play on the ABC television show Grey’s Anatomy?',
    answers: [
      {text:'Dr. Meredith Grey', correct: false},
      {text:'Dr. Christina Yang', correct: true},
      {text:'Dr. Callie Torres', correct: false},
      {text:'Dr. Addison Montgomery', correct: false}
    ]
  },
  
  {
    question: 'What is the name of the fictional city that Arthur Fleck from Joker lives in?',
    answers: [
      {text:'Arkham City', correct: false},
      {text:'Metroville', correct: false},
      {text:'St. Canard', correct: false},
      {text:'Gotham City', correct: true}
    ]
  },
  
  {
    question: 'Which superhero is the movie Logan about?',
    answers: [
      {text:'Wolverine', correct: true},
      {text:'Nightcrawler', correct: false},
      {text:'Darwin', correct: false},
      {text:'Thunderbird', correct: false}
    ]
  },
  
  
  {
    question: 'Who voices Dory in the animated film Finding Nemo?',
    answers: [
      {text:'Tara Strong', correct: false},
      {text:'Maaya Sakamoto', correct: false},
      {text:'Ellen Degeneres', correct: true},
      {text:'Athena Karkanis', correct: false}
    ]
  },
  
  
    {
    question: 'What is the name of the little boy in the movie The Jungle Book?',
    answers: [
      {text:'Baloo', correct: false},
      {text:'Shere Khan', correct: false},
      {text:'Mowgli', correct: true},
      {text:'Hathi', correct: false}
    ]
  },
  
  
  {
    question: 'Who plays the father, Bryan Mills, in the movie Taken?',
    answers: [
      {text:'Ben Affleck', correct: false},
      {text:'Matt Damon', correct: false},
      {text:'Robert De Niro', correct: false},
      {text:'Liam Neeson', correct: true}
    ]
  },
  
    {
    question: 'Which actress plays Katniss Everdeen in the trilogy series The Hunger Games?',
    answers: [
      {text:'Jennifer Carpenter', correct: false},
      {text:'Jennifer Lopez', correct: false},
      {text:'Jennifer Lawrence', correct: true},
      {text:'Jennifer Aniston', correct: false}
    ]
  },
  
  
     {
    question: 'Who plays Captain Jack Sparrow in the movie Pirates of The Caribbean?',
    answers: [
      {text:'Johnny Depp', correct: true},
      {text:'Leonardo DiCaprio', correct: false},
      {text:'Brad Pitt', correct: false},
      {text:'Matt Damon', correct: false}
    ]
  },
  
       {
    question: 'Who voices Elsa in the 2013 animated film Frozen?',
    answers: [
      {text:'Demi Lovato', correct: false},
      {text:'Idina Menzel', correct: true},
      {text:'Tress MacNeille', correct: false},
      {text:'Mandy Moore', correct: false}
    ]
  },
  
  
   {
    question: 'Who voices Donkey in the 2001 animated film Shrek?',
    answers: [
      {text:'Eddie Murphy', correct: true},
      {text:'Mike Myers', correct: false},
      {text:'Christopher Knights', correct: false},
      {text:'Chris Miller', correct: false}
    ]
  },
  
  
   {
    question: 'Who plays Rose Dewitt Bukater in the 1997 film Titanic?',
    answers: [
      {text:'Emma Stone', correct: false},
      {text:'Scarlett Johansson', correct: false},
      {text:'Natalie Portman', correct: false},
      {text:'Kate Winslet', correct: true}
    ]
  },
  
  {
    question: 'Which of the following actors stars in the 1999 film The Sixth Sense?',
    answers: [
      {text:'Tom Hanks', correct: false},
      {text:'Bill Murray', correct: false},
      {text:'Bruce Willis', correct: true},
      {text:'Samuel L. Jackson', correct: false}
    ]
  },
  
   {
    question: 'Who plays Peter Parker in the 2002 film Spider-Man?',
    answers: [
      {text:'Chris Pine', correct: false},
      {text:'Tom Holland', correct: false},
      {text:'Tobey Maguire', correct: true},
      {text:'Andrew Garfield', correct: false}
    ]
  },
  
   {
    question: 'Who plays Daryl Dixon in AMC’s television show The Walking Dead?',
    answers: [
      {text:'Norman Reedus', correct: true},
      {text:'Andrew Lincoln', correct: false},
      {text:'Jeffrey Dean Morgan', correct: false},
      {text:'Josh McDermitt', correct: false}
    ]
  },
  
  {
    question: 'Which actor plays Walter White in AMC’s television show Breaking Bad?',
    answers: [
      {text:'Aaron Paul', correct: false},
      {text:'Bryan Cranston', correct: true},
      {text:'Dean Norris', correct: false},
      {text:'RJ Mitte', correct: false}
    ]
  },
  
  
    {
    question: 'What is the real name of “Jenkin the Sorcerer” in Studio Ghibli’s Howl’s Moving Castle?',
    answers: [
      {text:'Calcifer', correct: false},
      {text:'Sophie', correct: false},
      {text:'Kakashi', correct: false},
      {text:'Howl', correct: true}
    ]
  },
  
    {
    question: 'In the 2016 Korean thriller film Train to Busan, who plays the main character Seok-Woo?',
    answers: [
      {text:'Park Hyung-Sik', correct: false},
      {text:'Seo Kang-Joon', correct: false},
      {text:'Lee Don-Wook', correct: false},
      {text:'Gong Yoo', correct: true}
    ]
  },
  
    {
    question: 'In the Netflix original series, Santa Clarita Diet, Sheila Hammond is played by whom?',
    answers: [
      {text:'Nicole Kidman', correct: false},
      {text:'Drew Barrymore', correct: true},
      {text:'Gwyneth Paltrow', correct: false},
      {text:'Jennifer Aniston', correct: false}
    ]
  }
]
  
});

/*global PubNub,abs,angleMode,append,background,beginShape,bezier,box,camera,ceil,CENTER,color,cone,cos,createCanvas,createCanvas,createGraphics,curveVertex,cylinder,DEGREES,displayHeight,displayWidth,dist,div,DOWN_ARROW,ellipse,endShape,fill,floor,frameCount,frameRate,height,image,key,keyCode,keyIsDown,keyIsPressed,keyIsPressed,keyPressed,LEFT,LEFT_ARROW,lerpColor,line,loadImage,loadJSON,loadSound,map,mouseIsPressed,mouseX,mouseY,noFill,noLoop,normalMaterial,noStroke,p5,plane,point,pointLight,pop,push,push,RADIANS,radians,random,rect,resizeCanvas,resizeCanvas,RIGHT,RIGHT_ARROW,rotate,rotateX,rotateY,rotateZ,round,round,scale,shuffle,sin,sphere,stroke,strokeWeight,text,textAlign,textFont,textSize,texture,textWidth,torus,translate,triangle,UP_ARROW,WEBGL,width,windowHeight,windowHeight,windowWidth,world */

// server variables for apps to communicate they must use THE SAME KEYS
//get these keys from your PubNub account
//within your group, you will use 1 of your accounts for the project


  
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
  
  myCanvas=createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 20; i++) {
    hearts.push(new Heart(-50,0));
  }
  
  myCanvas.hide();
  
}

function draw(){
  background(255);
  
  image(winImg,0,0,width,height);
  
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
    this.x = mX;
    this.y = mY;
    
    //colour is somewhat random
    //will be a shade of red, pink, yellow, orange
    this.tone=random(0,255);
    this.tone2=random(0,255);
  }

  move() {
    this.y--;
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

