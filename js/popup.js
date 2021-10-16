import {isEqualQuestion, isEqualQuestionsArray} from "./questionHelperFunctions.js";
import { addInputRow,
    getQuestionsAnswers,
    addPriorContents,
    fillQuestionInput,
    setStartButton
 } from "./UIHelper.js";

import { CURRENT_STACK,
    SAVED_STACKS,
    SECOND_INTERVAL,
    MINUTE_INTERVAL,
    QUIZ_STATE
  } from "./constants.js";
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

let fulfillStart = async () => {
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

  chrome.storage.sync.set({[QUIZ_STATE] : true});

  chrome.runtime.sendMessage({
      min: min,
      sec: sec,
      quizContent: getQuestionsAnswers(),
      abort: 0
    }, (response) => {
      chrome.storage.sync.set({[QUIZ_STATE] : false});
      setStartButton(false);
    // console.log(response);
  });
};

let quitOperation = () => {
  chrome.runtime.sendMessage({abort: 1}, (response) => {
    //console.log(reponse);
  });
};

let startButtonPress = async (buttonPress) => {

  chrome.storage.sync.get([QUIZ_STATE], async (result) => {

    let currentState = result[QUIZ_STATE];

    if (currentState === undefined){
      chrome.storage.sync.set({[QUIZ_STATE] : true});
    } else {
      let futureState = !currentState;

      document.getElementById("startstop").innerHTML = setStartButton(futureState);

      futureState ? fulfillStart() : quitOperation();

    }
  });
};

let saveOnDeckNameChange = () => {

  let deckName = document.getElementById("deckName").value;
  if (deckName === ""){
    deckName = "Select Deck";
  }
  let allDecks = {
    savedStacks: [deckName]
  };

  chrome.storage.sync.set({[CURRENT_STACK] : deckName});
  let currentDeck = getQuestionsAnswers();
  chrome.storage.sync.set({[deckName]: currentDeck}, () => {
    chrome.storage.sync.get([SAVED_STACKS], (result) => {
        console.log(result[SAVED_STACKS]);
      if (result[SAVED_STACKS] !== undefined){
        result[SAVED_STACKS].forEach((stack) => {
          // check if it's the same and delete if it is
          chrome.storage.sync.get([stack.name], (result) => {
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

let saveDeck = async () => {

    let deckName = document.getElementById("deckName").value;

    if (deckName === "") {
      document.getElementById("deckName").value = "Untitled";
      deckName = "Untitled";
    }

    let currentSavedStacks = [];

    await chrome.storage.sync.get([SAVED_STACKS], (result) => {
        if (result[SAVED_STACKS]){
            console.log("currently saved stacks");
            console.log(result[SAVED_STACKS]);
            currentSavedStacks = result[SAVED_STACKS];
            for( let s1 in result[SAVED_STACKS]){
                if ( s1 === deckName ){
                    throw "Duplicate Study Deck Name";
                }
            }
        }
    });

    currentSavedStacks.push(deckName);
    console.log(currentSavedStacks);

    let currentDeck = getQuestionsAnswers();
    await chrome.storage.sync.set({[deckName]: currentDeck}, function () {});
    await chrome.storage.sync.set({[CURRENT_STACK] : deckName});
    await chrome.storage.sync.set({[SAVED_STACKS] : currentSavedStacks});

     await chrome.storage.sync.get([SAVED_STACKS], (result) => {
         console.log(result[SAVED_STACKS]);
        if (result[SAVED_STACKS]){
            console.log(result[SAVED_STACKS]);
        }
    });

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
    if (result[SAVED_STACKS]){
        console.log("Saved stacks are currently");
      console.log(result[SAVED_STACKS]);
      result[SAVED_STACKS].forEach((stack) => {
          console.log(stack);
        let opt = document.createElement("option");
        opt.value = stack;
        //console.log("opt.value is " + stack.name);
        opt.innerHTML = stack;
        opt.label = stack;
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



  //chrome.storage.sync.set({CURRENT_STACK: undefined});

  //addFakeStack();

  chrome.storage.sync.get([CURRENT_STACK], (result) => {
      if (result[CURRENT_STACK] != undefined ){
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
  //document.getElementById("studierDeck").addEventListener('keyup', saveQuestionsOnKeyUp);
  //document.getElementById("deckName").addEventListener('keyup', saveOnDeckNameChange);


  document.getElementById("minInterval").addEventListener('keyup', (press) => {
    chrome.storage.sync.set({MINUTE_INTERVAL: press.target.value});
  });
  document.getElementById("secInterval").addEventListener('keyup', (press) => {
    chrome.storage.sync.set({SECOND_INTERVAL: press.target.value});
  });

  document.getElementById("startstop").addEventListener('click', startButtonPress);
  //document.getElementById("stop").addEventListener('click', quitOperation);
  chrome.storage.sync.get([QUIZ_STATE], (result) => {
      setStartButton(result[QUIZ_STATE]);
    });
  document.getElementById("save").addEventListener('click', saveDeck);

});
