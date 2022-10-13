const {readFileSync, promises: fsPromises} = require('fs');
const puppeteer = require('puppeteer');

function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

var Settings = [];
var settingData = readFileSync('settings.txt','utf-8');
const settingData_Split = settingData.split("\t");

Settings['Username'] = settingData_Split[0];
Settings['Password'] = settingData_Split[1];
Settings['On'] = settingData_Split[2];
Settings['Max'] = settingData_Split[3];

async function start(text) {
    var browser = await puppeteer.launch({headless: false});
    var page = await browser.newPage();
    await page.goto("https://conjuguemos.com/auth/login/", {waitUntil: 'networkidle0',});
    await page.type("#identity",Settings['Username']);
    await page.type("#password",Settings['Password']);
    await page.type("#password","\n");
    await page.goto("https://conjuguemos.com/student/activities", {waitUntil: 'networkidle0',});
    var vocab_lists = await page.evaluate(() => {
      var final = [];
      var Vocab_lists_index = document.getElementsByClassName("js-filter-text");
      var __Index = 0;
      for (List_data of Vocab_lists_index) {
        final[__Index] = [List_data.innerHTML.split("\t")[7],List_data.href,List_data.href.split("/")[List_data.href.split("/").length-1]];
        __Index++;
      }
      return final;
   })
    var vocab_list_id = 0;
    for (list of vocab_lists) {if (list[0] == text) {vocab_list_id = list[2]}}
    await page.goto("https://conjuguemos.com/vocabulary/print_flashcards/" + vocab_list_id, {waitUntil: 'networkidle0',})
    var Vocab_List = await page.evaluate(() => { 
    var final2 = [];
    var question = document.getElementsByClassName("qWord")
    var answer = document.getElementsByClassName("qDef")
    var __Index = 0; 
    for (data of question) {
      var check_answer = answer[__Index].innerHTML.split("/")[0] == null ? answer[__Index].innerHTML : answer[__Index].innerHTML.split("/")[0]
      final2[__Index] = [data.innerHTML, check_answer]
      __Index++;
    }
    return final2;
   })
    await page.goto("https://conjuguemos.com/vocabulary/homework/" + vocab_list_id, {waitUntil: 'networkidle0',})
    var temp = await page.evaluate(() => {return document.getElementsByClassName("btn--start-gp btn")[0].id = "botclickme"})
    await sleep(1000)
    await page.click("#botclickme")
    await sleep(3000)
    var __loopIndex = 0;
    async function loop() {
    var question_input = await page.evaluate(() => {return document.querySelector("#question-input").innerHTML})
    var final_answer = "";
    for (vocab_data of Vocab_List) {if (vocab_data[0]==question_input) {final_answer=vocab_data[1]}}
    await page.type("#answer-input",final_answer)
    await page.type("#answer-input","\n")
    var maxwanted_2 = (Settings['Max']!=null) ? Settings['Max']-1 : __loopIndex + 1
    if (__loopIndex<maxwanted_2) {
      loop()
      __loopIndex++
    }
  }
  loop()
};
start(Settings['On']);
/*lol 69 lines */
