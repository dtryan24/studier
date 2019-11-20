// START OF GA
var _gaq = [];
_gaq.push(['_setAccount', 'UA-147462993-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    let s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();
// EOF GA

let interval;

let showQuestion = (currentQueryIndex, questions) => {
    let questionPair = questions.questions[currentQueryIndex];
    let answer = prompt(questionPair.question);
    let counter = 1;

    while (!answer || answer.toLowerCase().trim() !== questionPair.answer.toLowerCase().trim()) {
        answer = prompt(questionPair.question + '      -      ' + questionPair.answer.substr(0,counter));
        counter++;
    }
    if (answer && counter === 1) {
        questions.questions.splice(currentQueryIndex, 1);
    }

    _gaq.push(['_trackEvent', 'questionPrompted', `${questionPair.question} - ${questionPair.answer}`]);

    alert(chrome.i18n.getMessage("extCorrect") + questionPair.question + "      -      " + questionPair.answer);
    if (questions.questions.length === 0) {
        alert(chrome.i18n.getMessage("extFinish"));
        clearInterval(interval);
        interval = null;
    }
};

let runInterval = (i, quizContent) => {
    chrome.tabs.query({active: true}, () => { showQuestion(i, quizContent) });
};

let onRequest = (request, sender, sendResponse) => {
  if(request.abort===1) {
      if (interval){
          _gaq.push(['_trackEvent', 'studySessionAbort', 'Study session was aborted']);
      } else {
          _gaq.push(['_trackEvent', 'unnecessarySessionAbort', 'Study session aborted, but no study session was open']);
      }
    clearInterval(interval);
    interval = null;
    sendResponse({response: "Successfully aborted"});
    return;      
  }

  if ((!request.min && !request.sec) || request.quizContent.questions.length === 0){
      alert(chrome.i18n.getMessage("extNotFilled"));
      sendResponse({response: "Not filled"});
      return;
  }
  
  clearInterval(interval);
  interval = null;

  //request.quizContent = shuffle(request.quizContent);

  let index = Math.floor(Math.random() * (request.quizContent.questions.length));

  const setLength = request.quizContent.questions.length;

  runInterval(index, request.quizContent);
  
  if(!interval) {
    //interval =
      interval = setInterval(() => {

          if (request.quizContent.questions.length === 0){
              clearInterval(interval);
              interval = null;
              _gaq.push(['_trackEvent', 'studySessionComplete', `Study set of ${setLength}`]);
          } else {
              index = Math.floor(Math.random() * (request.quizContent.questions.length));

              runInterval(index, request.quizContent);
          }

      }, ((request.min*60000)+(request.sec*1000)+100));
  }
  sendResponse({response: "study session compelete"});
};

let shuffle = (array) => {
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
};

// function execute(id, script) {
//   exec = {code:script};
//   chrome.tabs.executeScript(id, exec);
// }

chrome.runtime.onMessage.addListener(onRequest);