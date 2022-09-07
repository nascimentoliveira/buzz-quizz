let quizzesUser = [];
let quizzesOtherUsers = [];
let idCurrentQuiz = 0;

function HomeButton() {
  location.reload();
}

// SCREEN 1

function searchQuizzes() {
  const response = axios.get("https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes");
  response.then(responseQuizzes);
  response.catch((error) => console.log(`erro: ${error.response.data}`));
}

function separateQuizzes(quizzes) {
  let userQuizzesStorage = localStorage.getItem("quizzes");
  if (userQuizzesStorage !== null) {
    userQuizzesStorage = JSON.parse(userQuizzesStorage);
    quizzesUser = quizzes.filter(quizze => Object.keys(userQuizzesStorage).includes(quizze.id + ''));
    quizzesOtherUsers = quizzes.filter(quizze => !(Object.keys(userQuizzesStorage).includes(quizze.id + '')));
  } else {
    quizzesOtherUsers = quizzes;
  }
}

function responseQuizzes(response) {
  separateQuizzes(response.data);
  renderQuizzes();
}

function insertQuizzes(quizzes, type) {
  let quizzesLI = "";
  quizzes.forEach((quizz) => {
    if (type === "user") {
      quizzesLI += `
        <li data-identifier="quizz-card" class="quizz" onclick="searchQuizz(${quizz.id})">
          <div class="edit-delet">
            <div onclick="editQuizz(this, ${quizz.id})">
              <img src="../assets/images/edit.svg" />
            </div>    
            <div onclick="deleteQuizz(this, ${quizz.id})">
              <img src="./assets/images/trash.svg" />
            </div>
          </div>
      `;
    } else {
      quizzesLI += `
      <li data-identifier="quizz-card" class="quizz" onclick="searchQuizz(${quizz.id})">
      `;
    }
    quizzesLI += `
          <div class="overlay">
            <h1>${quizz.title}</h1>
          </div>
          <img src="${quizz.image}" alt="${quizz.title}"></img>
      </li>
    `;
  });
  return quizzesLI;
}

function renderQuizzes() {
  const main = document.querySelector("main");
  if (quizzesUser.length === 0) {
    main.innerHTML = `
            <section class="creating-quizz">
                <p>Você não criou nenhum <br> quizz ainda :(</p>
                <button data-identifier="create-quizz" onclick="addQuizzInfo()">Criar Quizz</button>
            </section>
        `;
  } else {
    main.innerHTML = `
    <section data-identifier="user-quizzes" class="user-quizzes">
      <div>
          <h1>Seus Quizzes</h1>
          <span data-identifier="create-quizz" onclick="addQuizzInfo()"><ion-icon name="add-circle-sharp"></ion-icon><span>
      </div>
      <ul>${insertQuizzes(quizzesUser, "user")}</ul>
    </section>
`;
  }

  main.innerHTML += `
    <section data-identifier="general-quizzes" class="other-user-quizzes">
        <div>
            <h1>Todos os Quizzes</h1>
        </div>
        <ul>${insertQuizzes(quizzesOtherUsers, "otherUsers")}</ul>
    </section>
    `;
}

searchQuizzes();

// SCREEN 2

function searchQuizz(id) {
  const response = axios.get(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${id}`);
  response.then(responseQuizz);
  response.catch((error) => console.log(`erro: ${error.response.data}`));
  const main = document.querySelector("main");
  main.innerHTML = '<img src="./assets/images/Rolling-1s-150px.gif" alt="loading screen" class="loading">';
}

function responseQuizz(response) {
  renderQuizz(response.data);
  endOfQuizz(response.data.levels);
}

function insertAnswers(answers) {
  let answersLI = "";
  answers.sort(() => Math.random() - 0.5).forEach((answer) => {
    answersLI += `
      <li data-identifier="answer" class="answer ${answer.isCorrectAnswer}" onclick="selectedAnswer(this)">
        <img class="black-text" src="${answer.image}" alt="${answer.text}"></img>
        <h1 class="black-text">${answer.text}</h1>
      </li>
    `;
  });
  return answersLI;
}

function insertQuestions(questions) {
  let questionsLI = "";
  questions.forEach((question) => {
    questionsLI += `
      <li data-identifier="question"  class="question">
          <div class="content">
              <div class="question-title" style="background-color: ${question.color};">
                  <h1>${question.title}</h1>
              </div>
              <div class="answers">
                  <ul>${insertAnswers(question.answers)}</ul>
              </div>
          </div>
      </li>
    `;
  });
  return questionsLI;
}

function renderQuizz(quizz) {
  idCurrentQuiz = quizz.id;
  const container = document.querySelector("container");
  container.innerHTML = `
    <header onclick="HomeButton()">BuzzQuizz</header>
        <section class="header-quizz">
            <div class="overlay">
                <h1>${quizz.title}</h1>
            </div>
            <img src="${quizz.image}" alt="${quizz.title}"></img>
        </section>
    <main class="main-screen2">
        <section class="questions">
            <ul>${insertQuestions(quizz.questions)}</ul>
        </section>
    </main>
  `;
  scrollWithOrder();
}

let counter = 0;
let correctAnswers = 0;

function selectedAnswer(selector) {
  const chosenAnswer = selector.parentNode;
  let answers = chosenAnswer.querySelectorAll('.answer');
  counter++;
  for (i = 0; i < answers.length; i++) {
    answers[i].children[1].classList.remove('black-text');
    answers[i].classList.add('non-clickable');
    if (answers[i] !== selector) {
        answers[i].classList.add('non-chosen-answers');
    }
  }

  if (selector.classList.contains('true')) {
    correctAnswers++;
  }
  endOfQuizz(quizzData);
  setTimeout(scrollWithOrder, 2000);
}

function scrollWithOrder() {
  const question = document.querySelectorAll('.question');
  const overlay = document.querySelector('.overlay');
  if (counter === 0) {
      overlay.scrollIntoView();
  } else {
      question[counter].scrollIntoView({ behavior: 'smooth', block: "center" });
  }
}

let quizzData = [];
function endOfQuizz(value) {
  quizzData = value;
  const question = document.querySelectorAll('.question');
  const questions = document.querySelector('.questions ul');
  const differentLevels = [];
  if (counter === question.length) {

    for (let i = 0; i < value.length; i++) {
        differentLevels.push(value[i].minValue);
    }
    const sortedArray = differentLevels.sort();
    const percent = Math.round((correctAnswers / question.length) * 100);
    const lowestValues = sortedArray.filter((minvalue) => { return (minvalue <= percent) });
    const highestUnderPercent = lowestValues[(lowestValues.length - 1)];
    let index = 0;
    for (let i = 0; i < value.length; i++) {
      if (highestUnderPercent === value[i].minValue) {
        index = i;
      }
    }
    questions.innerHTML += `
      <li data-identifier="quizz-result" class="question">
        <div class="feedback-content">
          <div class="feedback-header">
            <h1>${percent}% de acerto: ${value[index].title}</h1>
          </div>
          <div class="feedback-main"">
            <img src="${value[index].image}"> </img>
            <div class="paragraph"> <p> ${value[index].text} </p> </div>
          </div>
          <div class="feedback-buttons">
            <button class="re-start" onclick="searchQuizz(idCurrentQuiz)" > Reiniciar Quizz </button>
            <button onclick="location.reload()" class="back-home"> Voltar para home </button>
          </div>
        </div>
      </li>
        `;
  const feedback = document.querySelector('.feedback-content');
  feedback?.scrollIntoView({ behavior: 'smooth' });
  const restartButton = document.querySelector('.re-start')
  restartButton.addEventListener("click", (() => counter = 0));
  restartButton.addEventListener("click", (() => correctAnswers = 0));
  }
}

// SCREEN 3 --> (1) QUIZZ INFO

let quizzTitle = "";
let quizzUrlImage = "";
let quizzQtty = 0;
let nQuizzLvls = 0;
let quizzQuestions = [];
let quizzLVLs = []
let currentQuizzEditing;
const testHex = /^#[0-9A-Fa-f]{6}/g; // Regular Expression para verificar se é Hexadecimal

function addQuizzInfo() {
  scroll(0, 0);
  const main = document.querySelector("main");
  main.innerHTML = `
    <div class="creation-screen">
      <h1>Comece pelo começo</h1>
      <div class="box">
        <ul>
          <li>
            <input class="input-title" placeholder="Título do seu quizz" type="text"> </input>
            <p class="p1start"> </p>
          </li>
          <li>
            <input class="input-url" placeholder="URL da imagem do seu quizz" type="text"> </input>
            <p class="p2start"> </p>
          </li>
          <li>
            <input class="input-question-qtty" placeholder="Quantidade de perguntas do quizz" type="text"> </input>
            <p class="p3start"> </p>
          </li>
          <li>
            <input class="input-lvl-qtty" placeholder="Quantidade de níveis do quizz" type="text"> </input>
            <p class="p4start"> </p>
          </li>
        </ul>
      </div>
      <button onclick="addQuizzQuestions()">Prosseguir para criar perguntas</button>
    </div>
    `;
  if (currentQuizzEditing !== undefined) {
    main.querySelector("button").innerHTML = "Prosseguir para editar perguntas";
    putQuizzInfo(main.querySelector("ul"));
  }
}

function getQuizzInfo() {
  quizzTitle = document.querySelector(".input-title").value;
  quizzUrlImage = document.querySelector(".input-url").value;
  quizzQtty = document.querySelector(".input-question-qtty").value;
  nQuizzLvls = document.querySelector(".input-lvl-qtty").value;
}

function putQuizzInfo(element) {
  element.querySelector(".input-title").value = currentQuizzEditing.title;
  element.querySelector(".input-url").value = currentQuizzEditing.image;
  element.querySelector(".input-question-qtty").value = currentQuizzEditing.questions.length;
  element.querySelector(".input-lvl-qtty").value = currentQuizzEditing.levels.length;
}

// SCREEN 3 --> (2) QUIZZ QUESTIONS

function addQuizzQuestions() {
  getQuizzInfo();
  if (validateQuizzInfo(quizzTitle, quizzUrlImage, quizzQtty, nQuizzLvls) === 0) {
    creationScreen = document.querySelector(".creation-screen");
    creationScreen.innerHTML = `<h1>Crie suas perguntas</h1>`;
    for (let i = 0; i < quizzQtty; i++) {
      creationScreen.innerHTML += ` 
        <div data-identifier="question-form" class="box pergunta${i}">
          <h2>Pergunta ${i + 1} <span data-identifier="expand" onclick="collapse(this)"> <ion-icon name="create-outline"></ion-icon> </span> </h2>
          <ul class="the-one-who-colapses">
            <li>
              <input class="input-q-text" placeholder="Texto da pergunta" type="text">
              <p class="p1-question-${i}"> </p>
            </li>
            <li>
              <div class="color-picker-row">
                <input class="color-picker" type="color" value="#000001" onchange="changeColor(this)" />
                <input class="input-q-bgcolor" placeholder="Cor de fundo da pergunta" type="text" onchange="changeColor(this)" />
              </div>
                <p class="p2-backgroundcolor-${i}"> </p>
            </li>
            <h2>Resposta correta</h2>
            <li>
              <input class="input-correct-text" placeholder="Resposta correta" type="text">
              <p class="p3-correct-answer-${i}"> </p>
            </li>
            <li>
              <input class="input-correct-url" placeholder="URL da imagem" type="text">
              <p class="p4-image-url-${i}"> </p>
            </li>
            <h2>Respostas incorretas</h2>
            <li>
              <input class="input-wrong-text1" placeholder="Resposta incorreta 1" type="text">
              <p class="p5-wrong-text1-${i}"> </p>
            </li>
            <li>
              <input class="input-wrong-url1" placeholder="URL da imagem 1" type="text">
              <p class="p6-wrong-url1-${i}"> </p>
            </li>
            <br>
            <li>
              <input class="input-wrong-text2" placeholder="Resposta incorreta 2" type="text">
              <p class="p7-wrong-text2-${i}"> </p>
            </li>
            <li>
              <input class="input-wrong-url2" placeholder="URL da imagem 2" type="text">
              <p class="p8-wrong-url2-${i}"> </p>
            </li>
            <br>
            <li>
              <input class="input-wrong-text3" placeholder="Resposta incorreta 3" type="text">
              <p class="p9-wrong-text3-${i}"> </p>
            </li>
            <li>
              <input class="input-wrong-url3" placeholder="URL da imagem 3" type="text">
              <p class="p10-wrong-url3-${i}"> </p>
            </li>
          </ul>
        </div>
        `;
    }
    creationScreen.innerHTML += `<button onclick="addQuizzLevels()">Prosseguir para criar níveis</button>`;
    if (currentQuizzEditing !== undefined) {
      putQuizzQuestions(creationScreen, currentQuizzEditing.questions);
      creationScreen.querySelector("button").innerHTML = "Prosseguir para editar níveis";
    }
  }
}

function changeColor(input) {
  const value = input.value;
  const parent = input.parentNode;
  parent.querySelectorAll("input").forEach(element => element.value = value.toUpperCase());
}

function validateQuizzInfo(quizzTitle, quizzUrlImage, quizzQtty, nQuizzLvls) {
  const startTitleP = document.querySelector('.p1start')
  const startUrlP = document.querySelector('.p2start')
  const startQuestionsP = document.querySelector('.p3start')
  const startLevelsP = document.querySelector('.p4start')
  let errors = 0;
  if (quizzTitle.length < 20 || quizzTitle.length > 65) {
    startTitleP.innerHTML = `O título do Quizz deve ter entre 20 e 65 caracteres`;
    errors++;
  } else {
    startTitleP.innerHTML = ""
  }
  if (!validURL(quizzUrlImage)) {
    startUrlP.innerHTML = `A imagem do Quizz deve ser uma url`;
    errors++;
  } else {
    startUrlP.innerHTML = ""
  }
  if (quizzQtty < 3) {
    startQuestionsP.innerHTML = `O Quizz deve ter pelo menos 3 perguntas`;
    errors++;
  } else {
    startQuestionsP.innerHTML = ""
  }
  if (nQuizzLvls < 2) {
    startLevelsP.innerHTML = `O Quizz deve ter pelo menos 2 níveis`;
    errors++;
  } else {
    startLevelsP.innerHTML = ""
  }
  return errors;
}

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}

function getQuizzQuestion(creationScreen, nthQuestion) {
  question = {
    "text": creationScreen.querySelector(`.pergunta${nthQuestion} .input-q-text`).value,
    "bgColor": creationScreen.querySelector(`.pergunta${nthQuestion} .input-q-bgcolor`).value,
    "answerCorrectText": creationScreen.querySelector(`.pergunta${nthQuestion} .input-correct-text`).value,
    "answerCorrectUrl": creationScreen.querySelector(`.pergunta${nthQuestion} .input-correct-url`).value,
    "incorretAnswers": [{
      "answerIncorrectText": creationScreen.querySelector(`.pergunta${nthQuestion} .input-wrong-text1`).value,
      "answerIncorrectUrl": creationScreen.querySelector(`.pergunta${nthQuestion} .input-wrong-url1`).value
    }]
  }
  if (creationScreen.querySelector(`.pergunta${nthQuestion} .input-wrong-text2`).value !== "") {
    question.incorretAnswers.push({
      "answerIncorrectText": creationScreen.querySelector(`.pergunta${nthQuestion} .input-wrong-text2`).value,
      "answerIncorrectUrl": creationScreen.querySelector(`.pergunta${nthQuestion} .input-wrong-url2`).value
    });
  }
  if (creationScreen.querySelector(`.pergunta${nthQuestion} .input-wrong-text3`).value !== "") {
    question.incorretAnswers.push({
      "answerIncorrectText": creationScreen.querySelector(`.pergunta${nthQuestion} .input-wrong-text3`).value,
      "answerIncorrectUrl": creationScreen.querySelector(`.pergunta${nthQuestion} .input-wrong-url3`).value
    });
  }
  return question;
}

function putQuizzQuestions(creationScreen, questions) {
  let correctAswer = [];
  let incorretAnswers = [];
  for (let i = 0; (i < quizzQtty || i < questions.length); i++) {
    correctAswer = questions[i].answers.filter(answer => answer.isCorrectAnswer)[0];
    incorretAnswers = questions[i].answers.filter(answer => !answer.isCorrectAnswer);
    creationScreen.querySelector(`.pergunta${i} .input-q-text`).value = questions[i].title;
    creationScreen.querySelector(`.pergunta${i} .input-q-bgcolor`).value = questions[i].color;
    creationScreen.querySelector(`.pergunta${i} .color-picker`).value = questions[i].color;
    creationScreen.querySelector(`.pergunta${i} .input-correct-text`).value = correctAswer.text;
    creationScreen.querySelector(`.pergunta${i} .input-correct-url`).value = correctAswer.image;
    for (let j = 0; j < incorretAnswers.length; j++) {
      creationScreen.querySelector(`.pergunta${i} .input-wrong-text${j + 1}`).value = incorretAnswers[j].text;
      creationScreen.querySelector(`.pergunta${i} .input-wrong-url${j + 1}`).value = incorretAnswers[j].image;
    }
  }
}

function validateQuestions(creationScreen) {
  let errors = 0;
  let question = {};
  for (let i = 0; i < quizzQtty; i++) {
    question = getQuizzQuestion(creationScreen, i);
    let questionsText = document.querySelector(`.p1-question-${i}`)
    let backgroundcolor = document.querySelector(`.p2-backgroundcolor-${i}`)
    let correctAnswer = document.querySelector(`.p3-correct-answer-${i}`)
    let imageUrl = document.querySelector(`.p4-image-url-${i}`)
    let wrongText1 = document.querySelector(`.p5-wrong-text1-${i}`)
    let wrongUrl1 = document.querySelector(`.p6-wrong-url1-${i}`)
    let wrongText2 = document.querySelector(`.p7-wrong-text2-${i}`)
    let wrongUrl2 = document.querySelector(`.p8-wrong-url2-${i}`)
    let wrongText3 = document.querySelector(`.p9-wrong-text3-${i}`)
    let wrongUrl3 = document.querySelector(`.p10-wrong-url3-${i}`)

    if (question.text.length < 20) {
      questionsText.innerHTML = `O título da pergunta ${i + 1} deve ter pelo menos 20 caracteres`;
      errors++;
    } else {
      questionsText.innerHTML = "";
    }
    if (!testHex.test(question.bgColor)) {
      backgroundcolor.innerHTML = `A cor da pergunta ${i + 1} deve ser hexadecimal com #`;
      errors++;
    } else {
      backgroundcolor.innerHTML = "";
    }
    if (question.answerCorrectText === '') {
      correctAnswer.innerHTML = `o texto da pergunta ${i + 1} não pode ser vazio`;
      errors++;
    } else {
      correctAnswer.innerHTML = "";
    }
    if (!validURL(question.answerCorrectUrl)) {
      imageUrl.innerHTML = `A url da pergunta ${i + 1} deve ser uma url`;
      errors++;
    } else {
      imageUrl.innerHTML = ""
    }
    if (question.incorretAnswers[0].answerIncorrectText == '') {
      wrongText1.innerHTML = `o texto da resposta incorreta 1 não pode ser vazio`;
      errors++;
    } else {
      wrongText1.innerHTML = ""
    }
    if (question.incorretAnswers.length > 1) {
      if (question.incorretAnswers[1].answerIncorrectText == '') {
        wrongText2.innerHTML = `o texto da resposta incorreta 2 não pode ser vazio`;
        errors++;
      } else {
        wrongText2.innerHTML = ""
      }
    }
    if (question.incorretAnswers.length > 2) {
      if (question.incorretAnswers[2].answerIncorrectText == '') {
        wrongText3.innerHTML = `o texto da resposta incorreta 3 não pode ser vazio`;
        errors++;
      } else {
        wrongText3.innerHTML = ""
      }
    }
    if (!validURL(question.incorretAnswers[0].answerIncorrectUrl)) {
      wrongUrl1.innerHTML = `A url da resposta incorreta 1 deve ser uma url`;
      errors++;
    } else {
      wrongUrl1.innerHTML = ""
    }
    if (question.incorretAnswers.length > 1) {
      if (!validURL(question.incorretAnswers[1].answerIncorrectUrl)) {
        wrongUrl2.innerHTML = `A url da resposta incorreta 2 deve ser uma url`;
        errors++;
      } else {
        wrongUrl2.innerHTML = ""
      }
    }
    if (question.incorretAnswers.length > 2) {
      if (!validURL(question.incorretAnswers[2].answerIncorrectUrl)) {
        wrongUrl3.innerHTML = `A url da resposta incorreta 3 deve ser uma url`;
        errors++;
      } else {
        wrongUrl3.innerHTML = ""
      }
    }
    testHex.lastIndex = 0;
  }
  return errors;
}

// SCREEN 3 --> (3) QUIZZ LEVELS

function addQuizzLevels() {
  creationScreen = document.querySelector(".creation-screen");
  scroll(0, 0);
  let question = {};
  if (validateQuestions(creationScreen) === 0) {
    for (let i = 0; i < quizzQtty; i++) {
      let answers = [];
      question = getQuizzQuestion(creationScreen, i);
      answers.push({
        text: question.answerCorrectText,
        image: question.answerCorrectUrl,
        isCorrectAnswer: true,
      });
      for (let j = 0; j < question.incorretAnswers.length; j++) {
        answers.push({
          text: question.incorretAnswers[j].answerIncorrectText,
          image: question.incorretAnswers[j].answerIncorrectUrl,
          isCorrectAnswer: false,
        });
      }
      quizzQuestions.push({
        title: question.text,
        color: question.bgColor,
        answers: answers,
      });
    }
    creationScreen.innerHTML = `<h1>Agora, decida os níveis</h1>`;
    for (let i = 0; i < nQuizzLvls; i++) {
      creationScreen.innerHTML += ` 
        <div data-identifier="level" class="box level${i}">
            <h2>Nível ${i + 1} <span data-identifier="expand" onclick="collapse(this)"> <ion-icon name="create-outline"></ion-icon> </span> </h2>
          <ul class="the-one-who-colapses">
            <li>
              <input class="input-lvl-title" placeholder="Título do nível" type="text">
              <p class="p1-input-lvl-title-${i}"> </p>
            </li>
            <li>
              <input class="input-lvl-percent" placeholder="% de acerto mínima" type="text">
              <p class="p2-input-lvl-percent-${i}">  </p>
            </li>
            <li>
              <input class="input-lvl-url" placeholder="URL da imagem do nível" type="text">
              <p class="p3-input-lvl-url-${i}"> </p>
            </li>
            <li>
              <input class="input-lvl-text" placeholder="Descrição do nível" type="text">
              <p class="p4-input-lvl-text-${i}"> </p>
            </li>
          </ul>
        </div>
          `;
    }
    creationScreen.innerHTML += `<button onclick="addQuizzFinal()">Finalizar Quizz</button>`;
    if (currentQuizzEditing !== undefined) {
      putQuizzLevels(creationScreen, currentQuizzEditing.levels);
      creationScreen.querySelector("button").innerHTML = "Salvar alterações";
    }
  }
}

function collapse(selector) {
  const h2 = selector.parentNode;
  const questionBlock = h2.parentNode;
  const ul = questionBlock.children[1];

  if (ul.style.maxHeight) {
    ul.style.maxHeight = null;
  } else {
    ul.style.maxHeight = 800 + "px";
  }
}

function putQuizzLevels(creationScreen, levels) {
  for (let i = 0; (i < nQuizzLvls || i < levels.length); i++) {
    creationScreen.querySelector(`.level${i} .input-lvl-title`).value = levels[i].title;
    creationScreen.querySelector(`.level${i} .input-lvl-percent`).value = levels[i].minValue;
    creationScreen.querySelector(`.level${i} .input-lvl-url`).value = levels[i].image;
    creationScreen.querySelector(`.level${i} .input-lvl-text`).value = levels[i].text;
  }
}

function validateLevels() {
  const levelPercents = [];
  let errors = 0;
  for (let i = 0; i < nQuizzLvls; i++) {
    const lvlTitle = document.querySelector(`.level${i} .input-lvl-title`).value;
    const lvlPercent = Number(document.querySelector(`.level${i} .input-lvl-percent`).value);
    const lvlImgUrl = document.querySelector(`.level${i} .input-lvl-url`).value;
    const lvlText = document.querySelector(`.level${i} .input-lvl-text`).value;
    const lvlPercentString = document.querySelector(`.level${i} .input-lvl-percent`).value;
    let p1Title = document.querySelector(`.p1-input-lvl-title-${i}`);
    let p2Percent = document.querySelector(`.p2-input-lvl-percent-${i}`);
    let p3Url = document.querySelector(`.p3-input-lvl-url-${i}`);
    let p4Text = document.querySelector(`.p4-input-lvl-text-${i}`);
    if (lvlTitle.length < 10) {
      p1Title.innerHTML = `O título do nível ${i + 1} deve ter pelo menos 10 caracteres`;
      errors++;
    } else {
      p1Title.innerHTML = "";
    }
    if (lvlPercent < 0 || lvlPercent > 100 || lvlPercentString === '') {
      p2Percent.innerHTML = `O percentual do nível ${i + 1} deve ser um número entre 0 e 100`;
      errors++;
    } else {
      p2Percent.innerHTML = "";
    }
    if (!validURL(lvlImgUrl)) {
      p3Url.innerHTML = `A url do nível ${i + 1} deve ser uma url`;
      errors++;
    } else {
      p3Url.innerHTML = "";
    }
    if (lvlText < 30) {
      p4Text.innerHTML = `A descrição do nível ${i + 1} deve ter pelo menos 30 caracteres`;
      errors++;
    } else {
      p4Text.innerHTML = ""
    }
    levelPercents.push(lvlPercent);
  }
  if (!levelPercents.includes(0)) {
    alert('É obrigatório existir pelo menos 1 nível cuja % de acerto mínima seja 0%');
    errors++;
  }
  return errors;
}

// SCREEN 3 --> FINAL

function addQuizzFinal() {
  if (validateLevels() === 0) {
    scroll(0, 0);
    for (let i = 0; i < nQuizzLvls; i++) {
      const lvlTitle = document.querySelector(`.level${i} .input-lvl-title`).value;
      const lvlPercent = Number(document.querySelector(`.level${i} .input-lvl-percent`).value);
      const lvlImgUrl = document.querySelector(`.level${i} .input-lvl-url`).value;
      const lvlText = document.querySelector(`.level${i} .input-lvl-text`).value;
      quizzLVLs.push({
        title: lvlTitle,
        image: lvlImgUrl,
        text: lvlText,
        minValue: lvlPercent
      });
    }
    if (currentQuizzEditing !== undefined) {
      editQuizzSend(createObject(), currentQuizzEditing.id);
      const main = document.querySelector("main");
      main.innerHTML = '<img src="./assets/images/Rolling-1s-150px.gif" alt="loading screen" class="loading">';
    } else {
      addQuizSend(createObject());
    }
  }
}

function createObject() {
  return {
    title: quizzTitle,
    image: quizzUrlImage,
    questions: quizzQuestions,
    levels: quizzLVLs
  };
}

function addQuizSend(quizzObject) {
  creationScreen = document.querySelector(".creation-screen");
  creationScreen.innerHTML = '<img src="./assets/images/Rolling-1s-150px.gif" alt="loading screen" class="loading">';
  const response = axios.post('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes', quizzObject);
  response.catch((error) => console.log(`erro: ${error.response.data}`));
  response.then(addQuizzSuccess);
}

function addQuizzSuccess(quizz) {
  storeUserQuizz(quizz.data.id, quizz.data.key);
  creationScreen = document.querySelector(".creation-screen");
  creationScreen.innerHTML = `
    <h1>Seu quizz está pronto!</h1>
    <ul>
      <li class="quizz" onclick="searchQuizz(${quizz.data.id})">
          <div class="overlay">
              <h1>${quizz.data.title}</h1>
          </div>
          <img src="${quizz.data.image}" alt="${quizz.data.title}"></img>
      </li>
    </ul>
    <button onclick="searchQuizz(${quizz.data.id})">Acessar Quizz</button>
    <button class="back-home" onclick="location.reload()">Voltar para home</button>
    `;
}

function storeUserQuizz(id, key) {
  let userQuizzesStorage = localStorage.getItem("quizzes");
  if (userQuizzesStorage !== null) {
    userQuizzesStorage = JSON.parse(userQuizzesStorage);
  } else {
    userQuizzesStorage = {};
  }
  userQuizzesStorage[id] = key;
  localStorage.setItem("quizzes", JSON.stringify(userQuizzesStorage));
}

// BONUS - DELETE QUIZZ

function getSecretKey(id) {
  return JSON.parse(localStorage.getItem("quizzes"))[id];
}

function deleteQuizz(element, id) {
  element.parentNode.parentNode.removeAttribute("onclick");
  if (window.confirm("Você realmente deseja apagar este quiz?")) {
    axios.delete(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${id}`, { headers: { "Secret-Key": getSecretKey(id) } })
      .then(() => {
        location.reload();
      })
      .catch(error => {
        alert("Ocorreu um erro!")
        console.log("Erro: ", error);
        location.reload();
      });
  }
}

// BONUS - EDIT QUIZZ

function editQuizz(element, id) {
  element.parentNode.parentNode.removeAttribute("onclick");
  quizz = quizzesUser.filter(quizz => (quizz.id === id));
  currentQuizzEditing = quizz[0];
  addQuizzInfo();
}

function editQuizzSend(quizzObject, id) {
  axios.put(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${id}`, quizzObject, { headers: { "Secret-Key": getSecretKey(id) } })
    .then(() => {
      location.reload();
    })
    .catch(error => {
      alert("Ocorreu um erro!")
      console.log("Erro: ", error);
      location.reload();
    });
}