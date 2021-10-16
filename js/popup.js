const isEqualQuestionsArray = (obj1, obj2) => {
  if (obj1.length !== obj2.length)
    return false;

  for (let i =0; i < obj1.length; i++){
    if (!isEqualQuestion(obj1[i], obj2[i]))
      return false;
  }

  return true;
};

const isEqualQuestion = (obj1, obj2) => {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length != obj2Keys.length)
    return false;

  for (let objKey of obj1Keys){
    if (obj1[objKey] !== obj2[objKey])
      return false;
  }

  return true;
};

const CURRENT_STACK = "currentStack";
const SAVED_STACKS = "savedStacks";
const SECOND_INTERVAL = "secondInterval";
const MINUTE_INTERVAL = "minuteInterval";

/*
Things saved in chrome memory

secondInterval
minuteInterval
savedStacks
quizQuestions
 */


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
  let sec = document.getElementById("secInterval").value;

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
  //console.log(inputs);
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
  console.log("emptying the current questions");

  let list = document.getElementById("studierDeck");

  list.innerHTML = "";

  console.log("adding quiz questions");
  console.log(quiz);
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

let addPriorContents = (stackName) => {
  chrome.storage.sync.get([MINUTE_INTERVAL], (result) => {
    if (result && result[MINUTE_INTERVAL]){
      document.getElementById("minInterval").value = result[MINUTE_INTERVAL];
    }
  });

  chrome.storage.sync.get([SECOND_INTERVAL], (result) => {
    if (result && result[SECOND_INTERVAL]){
      document.getElementById("secInterval").value = result[SECOND_INTERVAL];
    }
  });

  // fill the old data into the form
  console.log("current stack is " + stackName);
  document.getElementById("deckName").value = stackName;
  chrome.storage.sync.get([stackName], function(result) {
    console.log("Filling the page with:");
    console.log(result);
    console.log(result[stackName]);
    if (result && result[stackName] && result[stackName].questions){
      fillQuestionInput(result[stackName].questions);
    } else {
      console.log("adding empty row");
      addInputRow();
    }
  });

};

let saveOnDeckNameChange = () => {

  let deckName = document.getElementById("deckName").value;
  if (deckName === ""){
    document.getElementById("deckName").value = "unnamedDeck";
    deckName = "unnamedDeck";
  }
  let allDecks = {
    savedStacks: [deckName]
  };
  chrome.storage.sync.set({CURRENT_STACK : deckName});
  let currentDeck = getQuestionsAnswers();
  chrome.storage.sync.set({deckName: currentDeck}, () => {
    chrome.storage.sync.get([SAVED_STACKS], (result) => {
      if (result[SAVED_STACKS]){
        result[SAVED_STACKS].forEach((stack) => {
          // check if it's the same and delete if it is
          chrome.storage.sync.get(stack.name, (result) => {
            console.log(result[stack.name]);
            console.log(currentDeck);
            if (result && (deckName != stack.name) && isEqualQuestionsArray(result[stack.name].questions, currentDeck.questions)) {
              chrome.storage.sync.remove(stack.name, () => {});
              console.log("We got a copier, they were removed");
            } else {
              allDecks[SAVED_STACKS].push(stack.name);
            }
            chrome.storage.sync.set({savedStacks: allDecks[SAVED_STACKS]}, () => {
              addDropDownItems();
            });
          });
          //console.log("Saved stacks should have printed");
        });
      } else {
        //console.log("saved stacks not found");
      }
    });
  });
}

let saveQuestionsOnKeyUp = () => {
  let deckName = document.getElementById("deckName").value;
  if (deckName === "") {
    document.getElementById("deckName").value = "unnamedDeck";
    deckName = "unnamedDeck";
  }
  let currentDeck = getQuestionsAnswers();
  chrome.storage.sync.set({deckName: currentDeck}, function () {});
  chrome.storage.sync.set({CURRENT_STACK : deckName});
}

let openStackByName = (event) => {
  if (event.target.value == "dummy")
    return;

  let test = event.target.value;

  if (test !== "testingHere")
    console.log("ya");

  chrome.storage.sync.set({CURRENT_STACK: event.target.value})

  // chrome.storage.sync.get([CURRENT_STACK], (result) => {
  //   console.log(result);
  //   if (result){
  //     console.log("The current stack exists");
  //     addPriorContents(result[CURRENT_STACK]);
  //   } else {
  //     console.log("No current stack");
  //     addInputRow();
  //   }
  // })

  //console.log(event);
  // set the current contents to the contents saved with event.target.value as the key
  let selectElement = document.getElementById("selectDeck");
  //let clicked = document.getElementsByLav(event.target.value);
  if (event.target.value) {
    //console.log(event.target.value);
    addPriorContents(event.target.value);
  }
}

let addDropDownItems = () => {
//<option value = "1">one</option>

  let selectElement = document.getElementById("selectDeck");

  selectElement.innerHTML = "";

  selectElement.onclick = openStackByName;

//<option value="dummy">Change Stack</option>
//
//   let dummy = document.createElement("option");
//   dummy.value = "dummy";
//   dummy.label = "dummy";
//   dummy.innerHTML = "Change Stack";
//
//   selectElement.appendChild(dummy);

  chrome.storage.sync.get([SAVED_STACKS], (result) => {
    if (result){
      //console.log(result);
      result[SAVED_STACKS].forEach((stack) => {
        let opt = document.createElement("option");
        opt.value = stack.name;
        //console.log("opt.value is " + stack.name);
        opt.innerHTML = stack.name;
        opt.label = stack.name;
        //console.log(opt);
        selectElement.appendChild(opt);
      });

      selectElement.selectedIndex = 0;
    }
  });
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

let addFakeStack = () => {
    chrome.storage.sync.set({SAVED_STACKS: [{name: "testingHere"}, {name: "AnotherStack!"}]});
    //console.log("Below are the questions that should be saved at testing here");
    //console.log(getQuestionsAnswers());

  chrome.storage.sync.get(["test"], function(result) {
    console.log("Fake stack is: ");
    console.log(result);
    if (result){
      chrome.storage.sync.set({"testingHere": {
        questions: [
          {question: "test question", answer: "test answer"},
          {question: "test question2", answer: "test answer2"}
        ]
        }});
      chrome.storage.sync.set({"AnotherStack!": {
          questions: [
            {question: "new test", answer: "new test"},
            {question: "new test2", answer: "new test2"}
          ]
        }});
    }
  });
}

let saveOnKeyUpStacks = () => {
  let currentDeck = getQuestionsAnswers();

  chrome.storage.sync.set({"quizQuestions": currentDeck}, function(){
    //console.log(currentDeck);
  });
}

window.addEventListener('load', () => {

  // Fills the form with the prior contents
  console.log(CURRENT_STACK);

  chrome.storage.sync.set({CURRENT_STACK: "testingHere"});

  addFakeStack();

  chrome.storage.sync.get([CURRENT_STACK], (result) => {
      if (result){
        console.log("The current stack exists");
        addPriorContents(result[CURRENT_STACK]);
      } else {
        console.log("No current stack");
        addInputRow();
      }
  });

  //addPriorContents();
  addDropDownItems();

  // This services the add input button. Creating key-value pair input
  document.getElementById("AddInput").addEventListener('click', addInputRow);
  // Should there just be save button
  document.getElementById("studierDeck").addEventListener('keyup', saveQuestionsOnKeyUp);
  document.getElementById("deckName").addEventListener('keyup', saveOnDeckNameChange);
  document.getElementById("minInterval").addEventListener('keyup', (press) => {
    chrome.storage.sync.set({MINUTE_INTERVAL: press.target.value});
  });
  document.getElementById("secInterval").addEventListener('keyup', (press) => {
    chrome.storage.sync.set({SECOND_INTERVAL: press.target.value});
  });
  document.getElementById("start").addEventListener('click', fufillStart);
  document.getElementById("stop").addEventListener('click', quitOperation);
});
