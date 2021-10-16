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

export {isEqualQuestion, isEqualQuestionsArray};
