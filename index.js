'use strict';

const apiKeyDeezer = '61e39a1290msh674ad3e303e1309p14ed9djsn5882ba774c66';
const baseUrlDeezer = 'https://deezerdevs-deezer.p.rapidapi.com/';

const apiKeyLastFm = '918a4709ebab63b494e0afe28c0785d9';
const baseUrlLastFm = 'https://ws.audioscrobbler.com/2.0/';

let songTitles = [];
let currentSong;
let currentGuess = 0;

let mode;

const NUM_QUESTIONS = 15;
let currentQuestion;
let currentScore; 

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getPopularSongs(){
    const params = {
        method: "chart.gettoptracks",
        format: "json",
        api_key: apiKeyLastFm
    };
    const queryString = formatQueryParams(params)
    const url = baseUrlLastFm + '?' + queryString;

    console.log(url);
  
    fetch(url)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        for(let i = 0; i<responseJson.tracks.track.length;i++){
            songTitles.push(responseJson.tracks.track[i].name);
        }
        getSong();
    })
    .catch(error => {
        $('main').append(`<p>Something went wrong: ${error.message}</p>`);
    });                
}

function getSong(){
    const params = {
      q: songTitles[Math.floor(Math.random() * songTitles.length)]
    };
    const queryString = formatQueryParams(params)
    const url = baseUrlDeezer + 'search/?' + queryString;

    console.log(url);
  
    const options = {
        headers: new Headers({
          "X-RapidApi-Key": apiKeyDeezer
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
        if(responseJson.data.length > 0){
            currentSong = {title: responseJson.data[0].title_short, preview: responseJson.data[0].preview};
            playSong();
        }
        else{
            getSong();
        }
    })
    .catch(error => {
        $('main').append(`<p>Something went wrong: ${error.message}</p>`);
    });                
}

function playSong(){
    let htmlString = `<form class="js-song" role="form">
                        <audio controls autoplay><source src="${currentSong.preview}" type="audio/mp3"></audio>
                        <label for="js-guess">Type the name of a song title</label>
                        <input type="text" id="js-guess">
                        <input type="submit" value="Guess">
                      </form>`;

    $('main').html(htmlString);
}

function displayPlayModes(){
    let htmlString = `<form class="js-modes" role="form">
                        <label>Select a mode of play</label>
                        <label><input type="radio" name="mode" value="casual" checked="checked">Casual (just for fun)</label>
                        <label><input type="radio" name="mode" value="challenge">Challenge (you'll be scored)</label>
                        <input type="submit" value="Submit">
                      </form>`;

    $('main').html(htmlString);
}

function displayHomeScreen(){
    let headerHtmlString = `<h1>Name that tune!</h1>`;

    $('header').html(headerHtmlString);  

    let mainHtmlString = `<form class="js-start" role="form">
                        <p>See how many of today's top hits you can recognize!</p>
                        <input type="submit" value="Play">
                    </form>`;

    $('main').html(mainHtmlString);    
}

function handleSetupGame(){
    $('main').on('submit','.js-start',function(event){
        event.preventDefault();   
        displayPlayModes();
    });
}

function handleMode(){
    $('main').on('submit','.js-modes',function(event){
        event.preventDefault();
        
        mode = $('input[name=mode]:checked').val();

        if( mode === 'challenge'){            
            currentQuestion = 1;
            currentScore = 0;

            $('header').html(`<span class="js-question-tracker"></span>
                            <span class="js-score-tracker"></span>`)
            updateQuestionTracker();
            updateScoreTracker();
        }

        getPopularSongs();
    });
}

function updateQuestionTracker(){
    $('.js-question-tracker').html(`Question: ${currentQuestion}/${NUM_QUESTIONS}`);
}

function updateScoreTracker(){
    $('.js-score-tracker').html(`Current Score: ${currentScore}`);
}

function displayResults(){
    $('header').html('<h1>Name That Tune!</h1>');

    let newHtmlString = `<form id="js-results" role="form">
                            <p>Congratulations! Your score is ${currentScore}/${NUM_QUESTIONS}</p>
                            <button type="submit">Try Again</button>
                        </form>`
    $('main').html(newHtmlString);
}

function handleGuess(){
    $('main').on('submit','.js-song',function(event){      
        event.preventDefault();   
        let currentGuess = $('#js-guess').val();
        let correctResponse = (currentSong.title.toLowerCase().replace(/[^a-zA-Z ]/g, "") === currentGuess.toLowerCase());

        if(mode === 'challenge'){
            if(correctResponse){
                currentScore++;
            }
    
            updateScoreTracker();
        }

        renderResults(correctResponse);
    });
}

function renderResults(correctResponse){
    let newHtmlString = getResultsHtml(correctResponse)
    $('main').html(newHtmlString);
}

function getResultsHtml(correctResponse){    
    let formContentsHtmlString;     

    if( correctResponse){
        formContentsHtmlString = `<p>That's Correct!</p>`;
    }
    else{        
        formContentsHtmlString = `<p>Sorry, that's incorrect!</p>
        <p>The correct answer is '${currentSong.title}'</p>`;
    }

    let hidden = (mode === 'challenge') ? 'hidden' : '';

    return `<form class="js-guess-result" role="form">
                ${formContentsHtmlString}
                <div>
                    <input class="js-done ${hidden}" type="button" value="I'm Done">
                    <input class="js-next-song" type="button" value="Next">
                </div>
            </form>`;
}

function handleNextSong(){
    $('main').on('click','.js-next-song',function(event){      
        event.preventDefault();

        if(mode === 'challenge'){
            currentQuestion++;

            if( currentQuestion <= NUM_QUESTIONS ){
                updateQuestionTracker();
                getSong();
            }
            else{
                displayResults();
            }
        }
        else{
            getSong();
        }
    });
}

function handleDone(){
    $('main').on('click','.js-done',function(event){      
        event.preventDefault();
        displayHomeScreen();
    });
}

function setup(){
    handleSetupGame();
    handleMode();
    handleGuess();
    handleNextSong();
    handleDone();
    displayHomeScreen();
}

$(setup());