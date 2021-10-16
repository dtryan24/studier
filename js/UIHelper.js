import { CURRENT_STACK,
    SAVED_STACKS,
    SECOND_INTERVAL,
    MINUTE_INTERVAL} from "./constants.js";

/*
 Add input row to the popup screen
 */
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


/*
 Puts quiz conetnts onto the page

 params: quiz
        [
    { question: " ", answer: " " }

    ]
 */
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

/*
 Fill prior information

 Param: string Stack Name
 */
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

/*
 Return stack of quiz questions + answer objects
 */
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

/*
  Toggle start button

  if current state is true, then we want to start the quiz and prompt to stop
*/
let setStartButton = (futureState) => {
  if (futureState === undefined){
    document.getElementById("startstop").innerHTML = "Start Quiz!";
    return "Start Quiz!";
  }
  let buttonText = futureState ? "Stop Quiz!" : "Start Quiz!";
  document.getElementById("startstop").innerHTML = buttonText;
  return buttonText;
}


export { addInputRow,
    getQuestionsAnswers,
    addPriorContents,
    fillQuestionInput,
    setStartButton
};
