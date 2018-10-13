const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();
app.get('/', function(req, res) {
    let url = 'http://127.0.0.1:39349/';
    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var text = ($.text());
            // console.log(text);
            var json = {
                title: '',
                duration: '',
                date: '',
                instructions: '',
                questions: [],
            }
            var question_temp = {
                index: '',
                content: '',
                marks: '',
                parts: [],
            }
            var firstDiv = $('#pf1').text().replace(/\s\s+/gim, '');

            var testTitle = firstDiv.match(/.*\wpaper \d|English .* paper \d/gim);
            json.title = testTitle;

            var instructions = firstDiv.replace(/(Instructions)/gim, '\n$1').match(/Instructions .*/gim);
            json.instructions = instructions;

            var testDuration = firstDiv.match(/(\d hour \d\d minutes)|(\d hour)|(\d\d minutes)/gim);
            json.duration = testDuration;

            var testDate = firstDiv.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) \d+ \w+ \d+|(Jan(uary)?|Feb(ruary)?|Mar(ch)?|Apr(il)?|May|Jun(e)?|Jul(y)?|Aug(ust)?|Sep(tember)?|Oct(ober)?|Nov(ember)?|Dec(ember)?) \d+/gim);
            // var testDate = firstDiv.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) \d+ \w+ \d+/gim);
            json.date = testDate;

            var removeFirstDiv = $('#pf1').nextAll().text();
            // console.log(removeFirstDiv);

            var removeSpace = removeFirstDiv.replace(/\s\s+/gim, '   ');
            // console.log(removeSpace);

            var removeDots = removeSpace.replace(/\.\.\.*/gim, ' ');
            // console.log(removeDots);

            var addLine = removeDots.replace(/(\D([^+]\d\. |\d\d\. |\d\. |[A-Z]\d\.)|(\d\. ))/gm, '\n$1');
            // console.log(addLine);

            var removeGibberish = addLine.replace(/\Option \w .+(?=\[\d\])/gim, '');
            // var removeGibberish = addLine.replace(/\[\d\]|\[\d|Option .+|– \d.+|\(This question .+/gim, '');
            // console.log(removeGibberish);

            var marksList = removeGibberish.match(/\[\d\]/gim);
            // console.log(marksList);

            var prevMark = removeGibberish.match(/^   \[\d\]/gim);
            // console.log(firstMark);

            var res = removeGibberish.match(/((\d\. |\d\d\. |\d\. |[A-Z]\d\. ).*)/gim);
            // console.log(res[0]);

            if (res && res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    // console.log(res[i]);
                    

                    question_temp.index = i;

                    // adding a new line before every parts
                    // var subParts = res[i].replace(/(\([a-h]\))/g, '\n$1');
                    var subParts = res[i].replace(/(  \([a-h]\)  \w|[A-D]\. |[A-D]\. |\(a\) |\(c\) [^t]|\(b\) [^a]|\(d\) |\(e\) |\(f\) |\(h\) )/gm, '\n$1');
                    // console.log(subParts);

                    // removing the gibberish which includes in the subParts
                    var removeSubPartsGibberish = subParts.replace(/(– \d.+(?=\[\d\]   \[\d\])|– \d\d.+(?=\[\d\]   \[\d\])|– \d.+(?=\[\d\])|\(This question .+(?=\[\d\]   \[\d\])|\(This question .+(?=\[\d\])|– \d.+)/gm, '');
                    // console.log(removeSubPartsGibberish);

                    // question_temp.content = subParts.match(/((\d|\d\d|[A-Z]\d)\. .*)/gim)[0];
                    question_temp.content = removeSubPartsGibberish.match(/((\d\. |\d\d\. |\d\. |[A-Z]\d\. ).*)/gim)[0];

                    var subPartsArray = [];
                    subPartsArray = removeSubPartsGibberish.match(/  \([a-h]\)  \w.*|\([a-h]\) \w.*|\([a-h]\)   \w.*|\([a-h]\)  “\w.*|[A-D]\. .*|[A-D]\. .*/gm);
                    // console.log(subPartsArray);

                    if (subPartsArray && subPartsArray.length > 0) {
                        var question_temp1 = {
                            index: '',
                            content: '',
                            marks: '',
                            parts: [],
                        }
                        for (var j = 0; j < subPartsArray.length; j++) {
                            question_temp1.index = j;

                            var nestedSubParts = [];

                            var newI = subPartsArray[j].replace(/\(i\)|\(ii\)|\(iii\)/g, '\n$&');
                            // console.log(newI);

                            // var ss = newI.match(/(\([a-h]\) .*)/g);
                            var ss = newI.match(/(\([a-f]\) .*|[A-D]\. .*|[A-D]\. .*)/g);
                            // console.log(ss[0]);

                            if (ss == null) {
                                question_temp1.content = ss;
                            } else {
                                question_temp1.content = ss[0];
                            }
                            nestedSubParts = newI.match(/\(i\).*|\(ii\).*|\(iii\).*/gim);
                            

                            if (nestedSubParts && nestedSubParts.length > 0) {
                                var question_temp2 = {
                                    index: '',
                                    content: '',
                                    marks: '',
                                    parts: [],
                                }
                                for (var z = 0; z < nestedSubParts.length; z++) {
                                    question_temp2.index = z;
                                    question_temp2.content = nestedSubParts[z];
                                    // console.log(z+"--> "+prevMark);

                                    if(prevMark == null){
                                        prevMark = question_temp1.content.match(/\[\d\]/gim);    
                                        if(prevMark == null){
                                            prevMark = question_temp.content.match(/\[\d\]/gim);
                                            // if(prevMark == null){
                                            //     prevMark = prevMark[1];
                                            // }
                                        }
                                    }
                                    var prevMarkList = JSON.stringify(prevMark).split(',');
                                    
                                    if(prevMarkList.length>1){
                                        console.log("before--> "+prevMarkList[0]);
                                        prevMark = prevMarkList[0].replace(/\["|\"/g, '');
                                        
                                    }
                                    console.log("after--> "+prevMark);
                                    question_temp2.marks = prevMark;
                                    prevMark = question_temp2.content.match(/\[\d\]/gim);

                                    // console.log(prevMark);
                                    question_temp1.parts.push(question_temp2);
                                    question_temp2 = {
                                        index: '',
                                        content: '',
                                        marks: '',
                                        parts: [],
                                    }
                                }
                            
                            }
                            else {
                                // console.log('topMost2');
                                // console.log('question_temp1', question_temp1);
                                if(prevMark == null){
                                    prevMark = question_temp.content.match(/\[\d\]/gim);    
                                }
                                question_temp1.marks = prevMark;
                                prevMark = question_temp1.content.match(/\[\d\]/gim);

                                // console.log(prevMark);
                            }
                            // console.log(question_temp1);
                            // prevMark = question_temp2.content.match(/\[\d\]/gim);

                            question_temp.parts.push(question_temp1);
                            question_temp1 = {
                                index: '',
                                content: '',
                                marks: '',
                                parts: [],
                            }
                        }
                    }
                    else{
                        // console.log('topMost');
                        question_temp.marks = prevMark;
                        prevMark = question_temp.content.match(/\[\d\]/gim);
                        // console.log(prevMark);
                    }
                    // console.log(question_temp);
                    json.questions.push(question_temp);
                    question_temp = {
                        index: '',
                        content: '',
                        marks: '',
                        parts: [],
                    }
                }
            }
        }
        fs.writeFile('output.json', JSON.stringify(json, null), function(err) {
            console.log('File written successfully.')
        })
    })
    res.send('Check your console');
})
app.listen(3139);
console.log('Magic happens on port 3139');
exports = module.exports = app;