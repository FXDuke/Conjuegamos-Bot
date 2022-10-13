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
      var a = document.getElementsByClassName("js-filter-text");
      var __Index = 0;
      for (b of a) {
        final[__Index] = [b.innerHTML.split("\t")[7],b.href,b.href.split("/")[b.href.split("/").length-1]];
        __Index++;
      }
      return final;
   })
    var aab = 0;
    for (ba of vocab_lists) {if (ba[0] == text) {aab = ba[2]}}
    await page.goto("https://conjuguemos.com/vocabulary/print_flashcards/" + aab, {waitUntil: 'networkidle0',})
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
    await page.goto("https://conjuguemos.com/vocabulary/homework/" + aab, {waitUntil: 'networkidle0',})
    var ab = await page.evaluate(() => {return document.getElementsByClassName("btn--start-gp btn")[0].id = "clickmedaddy"})
    await sleep(1000)
    await page.click("#clickmedaddy")
    await sleep(5000)
    var __loopIndex = 0;
    async function loop() {
    var ab2 = await page.evaluate(() => {return document.querySelector("#question-input").innerHTML})
    var ab3 = "";
    for (b of Vocab_List) {if (b[0]==ab2) {ab3=b[1]}}
    await page.type("#answer-input",ab3)
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
