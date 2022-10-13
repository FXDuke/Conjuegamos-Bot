/* Packages */

const {readFileSync, promises: fsPromises} = require('fs');
const puppeteer = require('puppeteer');

/* Generics */

function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));};

/* Getting Settings Data (temporary until gui is finished) */

var Settings = [];
var settingData = readFileSync('settings.txt','utf-8');
const settingData_Split = settingData.split("\t");

Settings['Username'] = settingData_Split[0];
Settings['Password'] = settingData_Split[1];
Settings['On'] = settingData_Split[2];
Settings['Max'] = settingData_Split[3];

/* Main Function (start) */

async function start(text,time) {

  time = Math.round(time)

  /* Establishing Connection */
  
  var browser = await puppeteer.launch({headless: false});
  var page = await browser.newPage();

  /* Logging in */

  await page.goto("https://conjuguemos.com/auth/login/", {waitUntil: 'networkidle0'});
  await page.type("#identity",Settings['Username']);
  await page.type("#password",Settings['Password'] + "\n");
  await page.goto("https://conjuguemos.com/student/activities", {waitUntil: 'networkidle0'});

  /* Scraping Vocab Lists */

  var vocab_lists = await page.evaluate(() => {
    var final = [];
    var Vocab_lists_index = document.getElementsByClassName("js-filter-text");
    var __Index = 0;
    for (List_data of Vocab_lists_index) {
      final[__Index] = [List_data.innerHTML.split("\t")[7],List_data.href,List_data.href.split("/")[List_data.href.split("/").length-1]];
      __Index++;
    };
    return final;
  });

  /* Finding the List's ID */

  var vocab_list_id = 0;
  for (list of vocab_lists) {if (list[0] == text) {vocab_list_id = list[2]};};

  /* Getting the list's Vocab Answers */

  await page.goto("https://conjuguemos.com/vocabulary/print_flashcards/" + vocab_list_id, {waitUntil: 'networkidle0'});
  var Vocab_List = await page.evaluate(() => { 
    var final2 = [];
    var question = document.getElementsByClassName("qWord");
    var answer = document.getElementsByClassName("qDef");
    var __Index = 0; 
    for (data of question) {
      var check_answer = answer[__Index].innerHTML.split("/")[0] == null ? answer[__Index].innerHTML : answer[__Index].innerHTML.split("/")[0];
      final2[__Index] = [data.innerHTML, check_answer];
      __Index++;
    };
    return final2;
  });

  /* Starting the assignment */
  
  let time_to_wait = 0;
  await page.goto("https://conjuguemos.com/vocabulary/homework/" + vocab_list_id, {waitUntil: 'networkidle0'});
  var temp = await page.evaluate(() => {return document.getElementsByClassName("btn--start-gp btn")[0].id = "botclickme"});
  await sleep(1000);
  await page.click("#set_time_input")
  await page.keyboard.press('Backspace')
  await page.type("#set_time_input", time.toString())
  await page.click("#botclickme");
  await sleep(2000);
  var __loopIndex = 0;
  var __maxwanted = (Settings['Max']!=null) ? Settings['Max']-1 : 10000;
  var old = new Date();

  /* Initializing the bot */

  var current = new Date();
  while (current.getSeconds()-old.getSeconds() < time*60) {
    current = new Date();
    const question_input = await page.evaluate(() => {return document.querySelector("#question-input").innerHTML});
    var final_answer = "";
    for (vocab_data of Vocab_List) {if (vocab_data[0]==question_input) {final_answer=vocab_data[1]};};
    await page.type("#answer-input",final_answer + "\n");
    if (__loopIndex<__maxwanted) {
      __loopIndex++;
    } else {
      time_to_wait = (time*1000*60)-((current.getSeconds()-old.getSeconds())*1000)
      break;
    };
  };

  /* Saving the score */

  await sleep(time_to_wait + 1500)
  var temp2 = await page.evaluate(() => {
    for (button of document.getElementsByClassName("btn")) {
      if (button.innerHTML == "Save") {
        button.id = "newbuttonbotclick"
      };
    };
    return document.getElementById("newbuttonbotclick")
  });
  await page.click("#newbuttonbotclick")

  /* Closing */

  await browser.close()
};

/* Starting */

start(Settings['On'],2.5);
