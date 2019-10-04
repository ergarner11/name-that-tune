'use strict';

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
recognition.grammars = speechRecognitionList;
//recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.error');

recognition.onresult = function(event) {
  // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
  // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
  // It has a getter so it can be accessed like an array
  // The [last] returns the SpeechRecognitionResult at the last position.
  // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
  // These also have getters so they can be accessed like arrays.
  // The [0] returns the SpeechRecognitionAlternative at position 0.
  // We then return the transcript property of the SpeechRecognitionAlternative object

  let last = event.results.length - 1;
  currentGuess = event.results[last][0].transcript;

  console.log('Result received: ' + currentGuess + '.');
  console.log('Confidence: ' + event.results[0][0].confidence);

  let formContentsHtmlString;

  if( currentSong.title.toLowerCase().replace(/[^a-zA-Z ]/g, "") === currentGuess.toLowerCase()){
    /*let playerHtmlString = '';

    for(let i = 0; i < players.length; i++){
        playerHtmlString += `<input type="radio" name="player" value="${players[i].name}">${players[i].name}`;
    }

    formContentsHtmlString = `<p>That's Correct!</p>
                              <p>Who gets the point?</p>
                              ${playerHtmlString}`;*/
    formContentsHtmlString = `<p>That's Correct!</p>`;
  }
  else{
    formContentsHtmlString = `<p>Your guess '${currentGuess}' is wrong!</p>
                              <input class="js-try-again" type="button" value="Try Again">`;
  }

  let htmlString = `<form class="js-guess-result">
                        ${formContentsHtmlString}
                        <input class="js-next-song" type="button" value="Next">
                    </form>`;

  $('main').html(htmlString);
}

recognition.onspeechend = function() {
  recognition.stop();
}

recognition.onnomatch = function(event) {
  diagnostic.textContent = "I didn't recognize that response.";
}

recognition.onerror = function(event) {
  diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}

const apiKey = '61e39a1290msh674ad3e303e1309p14ed9djsn5882ba774c66';
const baseURL = 'https://deezerdevs-deezer.p.rapidapi.com/track/';

let players = [];
let currentPlayer = 1;

let songIds = [142986206,576431,13141170,3133738,540175,13111370,917717,562487,3157972,90944585,17612995,451670682,15078235,
    20191621,4603408,1025659,5404527,1079668,625643,964603,5404529,2525864,114422238,2303727,17135111,904732,568115892,766957152,
    2505668,14333215,3156285,3156285,7634915,920082,4188437,15413797,768443672,755759872,145434430,768543942,79875064,92734438,
    17449225,70403437,391360542,116348642,857994,92719900,68414397,755727712,92872156,7216935,79845486,3402413,70054782,56725581,
    563683852,845909,768263442,768299712,70079770,5404540,347363311,88902741,538660022,924615,17608116,5606967,15565659,2397026,
    626123,91335818,549238572,3120266,102364674,3091966,1030221,921154,71828722,17479920,561876462];
let currentSong;
let currentGuess = 0;

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getSong(){
    const params = {
      q: "pasta"
    };
    const queryString = formatQueryParams(params)
    const url = baseURL + songIds[Math.floor(Math.random() * songIds.length)];

    console.log(url);
  
    const options = {
        headers: new Headers({
          "X-RapidApi-Key": apiKey
        })
      };;

    fetch(url ,options)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        currentSong = {title: responseJson.title, preview: responseJson.preview};
        playSong();
    })
    .catch(error => {
        $('.js-song').html(`<p>Something went wrong: ${error.message}</p>`);
    });                
}

function playSong(){
    let htmlString = `<form class="js-song">
                        <audio id="blah" controls autoplay><source src="${currentSong.preview}" type="audio/mp3"></audio>
                        <input type="submit" value="Guess">
                      </form>`;

    $('main').html(htmlString);
}

function getCurrentPlayerHtmlString(){
    return `<label for="p${currentPlayer}Name">Player ${currentPlayer}</label>
    <input type="text" id="p${currentPlayer}Name" required>`
}

function addPlayer(){
    let playerName = $(`#p${currentPlayer}Name`).val();
    players.push({name: playerName, score: 0});
}

function handleSetupGame(){
    $('main').on('submit','.js-start',function(event){
        event.preventDefault();   

        /*let htmlString = `<form class="js-setup">
                      ${getCurrentPlayerHtmlString()}
                      <input class="js-add-player" type="button" value="Add Player">
                      <input class="js-start-game" type="submit" value="Start Game">
                    </form>`;
                    
        $('main').html(htmlString);*/
        getSong();
    });
}

function handleAddPlayer(){   
    $('main').on('click','.js-add-player', function(event){
        event.preventDefault(); 
        addPlayer();
        currentPlayer++;
        $('.js-setup').find('.js-add-player').before(getCurrentPlayerHtmlString());
    });
}

function handleStartGame(){
    $('main').on('submit','.js-setup',function(event){
        event.preventDefault(); 
        addPlayer();  
        console.log(players);
        getSong();
    });
}

function handleSearch(){
    $('.js-search').submit(function(event){
        event.preventDefault();            
        getSong();
    });
}

function handleNext(){
    $('.js-next').submit(function(event){
        event.preventDefault();          
        currentRecipeBatch.shift();

        $('.js-results').find('.strike').each(function(){
            excludedIngredients.push($(this).text());
        }).val();

        cleanseRecipeBatch();
        selectAndDisplayNextRecipe();
    });
}

function handleGuess(){
    $('main').on('submit','.js-song',function(event){      
        event.preventDefault();
        $('#blah').trigger('pause');         
        recognition.start();        
        console.log('Ready to receive a guess.');
    });
}

function handleTryAgain(){
    $('main').on('click','.js-try-again',function(event){      
        event.preventDefault();
        playSong();
    });
}

function handleNextSong(){
    $('main').on('click','.js-next-song',function(event){      
        event.preventDefault();
        getSong();
    });
}

function setup(){
    handleSetupGame();
    handleAddPlayer();
    handleStartGame();
    handleSearch();
    handleNext();
    handleGuess();
    handleTryAgain();
    handleNextSong();
}

$(setup());