// START OF GA    
let _gaq = [];
_gaq.push(['_setAccount', 'UA-147462993-1']);
_gaq.push(['_trackPageview']);

(function() {
  let ga = document.createElement('script');
  ga.className = "ga";
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  let s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();   
// EOF GA

let fufillStart = async () => {
  let min = document.getElementById("minInterval").value;
  // let min;
  // await chrome.storage.sync.get(["minuteInterval"], (result) => {
  //   if (result && result.minuteInterval){
  //     min = result.minuteInterval;
  //   }
  // });

  let sec = document.getElementById("secInterval").value;
  // let sec;
  // await chrome.storage.sync.get(["secondInterval"], (result) => {
  //   if (result && result.secondInterval){
  //     sec = result.secondInterval;
  //   }
  // });

  if(isNaN(min)) {
    alert(chrome.i18n.getMessage("extErrNaN"));
    return;
  }
  if(isNaN(sec)) {
    alert(chrome.i18n.getMessage("extErrNaN"));
    return;
  }

  chrome.runtime.sendMessage({
      min: min,
      sec: sec,
      quizContent: getQuestionsAnswers(),
      abort: 0
    }, (response) => {
    // console.log(response);
  });
};

let quitOperation = () => {
  chrome.runtime.sendMessage({abort: 1}, (response) => {
    //console.log(reponse);
  });
};

let addInputRow = () => {
  let list = document.getElementById("studierDeck");

  let li = document.createElement("li");
  li.setAttribute("class", "StudierQuery");
  let q = document.createElement("input");
  q.setAttribute("type", "text");
  q.setAttribute("placeHolder", "Question");
  li.appendChild(q);
  let a = document.createElement("input");
  a.setAttribute("type", "text");
  a.setAttribute("placeHolder", "Answer");
  li.appendChild(a);

  list.appendChild(li);

  //list.insertBefore(li, document.getElementById("AddInput"));
};

let getQuestionsAnswers = () => {
  let quiz = {
    questions: []
  };

  let inputs = document.getElementsByClassName("StudierQuery");
  for (let item of inputs) {
    if (item.firstChild.value && item.lastChild.value){
      quiz.questions.push({
        question: item.firstChild.value,
        answer: item.lastChild.value
      });
    }
  }

  return quiz;
};

let fillQuestionInput = (quiz) => {

  let list = document.getElementById("studierDeck");
  //console.log(quiz);

  quiz.forEach((flashCard) => {
    let li = document.createElement("li");
    li.setAttribute("class", "StudierQuery");
    let q = document.createElement("input");
    q.setAttribute("type", "text");
    q.setAttribute("placeHolder", "Question");
    q.value = flashCard.question;
    li.appendChild(q);
    let a = document.createElement("input");
    a.setAttribute("type", "text");
    a.setAttribute("placeHolder", "Answer");
    a.value = flashCard.answer;
    li.appendChild(a);
    list.appendChild(li);
    //list.insertBefore(li, document.getElementById("AddInput"));
  });
};

let addPriorContents = () => {
  chrome.storage.sync.get(["minuteInterval"], (result) => {
    if (result && result.minuteInterval){
      document.getElementById("minInterval").value = result.minuteInterval;
    }
  });

  chrome.storage.sync.get(["secondInterval"], (result) => {
    if (result && result.secondInterval){
      document.getElementById("secInterval").value = result.secondInterval;
    }
  });

  // fill the old data into the form
  chrome.storage.sync.get(["quizQuestions"], function(result) {
    if (result && result.quizQuestions && result.quizQuestions.questions){
      fillQuestionInput(result.quizQuestions.questions);
    } else {
      addInputRow();
    }
  });

};


let saveOnKeyUp = () => {
    let currentDeck = getQuestionsAnswers();
    chrome.storage.sync.set({"quizQuestions": currentDeck}, function(){
      //console.log(currentDeck);
    });
}

let addDropDownItems = () => {
//<option value = "1">one</option>

  let selectElement = document.getElementById("selectDeck");

  let opt = document.createElement("option");
  opt.value = "testing";
  opt.innerHTML = "testing";

  selectElement.appendChild(opt);
}

// let connect = () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const port = chrome.tabs.connect(tabs[0].id);
//     port.postMessage({ function: 'html' });
//     port.onMessage.addListener((response) => {
//       html = response.html;
//       title = response.title;
//       description = response.description;
//     });
//   });
// };

window.addEventListener('load', () => {

  // Fills the form with the prior contents
  addPriorContents();
  addDropDownItems();

  // This services the add input button. Creating key-value pair input
  document.getElementById("AddInput").addEventListener('click', addInputRow);
  // Should there just be save button
  document.getElementById("studierDeck").addEventListener('keyup', saveOnKeyUp);
  document.getElementById("minInterval").addEventListener('keyup', (press) => {
    chrome.storage.sync.set({"minuteInterval": press.target.value});
  });
  document.getElementById("secInterval").addEventListener('keyup', (press) => {
    chrome.storage.sync.set({"secondInterval": press.target.value});
  });
  document.getElementById("start").addEventListener('click', fufillStart);
  document.getElementById("stop").addEventListener('click', quitOperation);
});
