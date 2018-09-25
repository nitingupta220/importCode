const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

app.get('/', function(req, res) {

    let url = 'http://127.0.0.1:8080/';

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
                parts: [],
            }
            var firstDiv = $('#pf1').text();
            var testTitle = firstDiv.match(/.*\wpaper \d|English .* paper \d/gim);
            json.title = testTitle;
            var instructions = firstDiv.replace(/(Instructions)/gim, '\n$1').match(/Instructions .*/gim);
            json.instructions = instructions;
            var testDuration = firstDiv.match(/(\d hour \d\d minutes)|(\d hour)/gim);
            json.duration = testDuration;
            var testDate = firstDiv.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) \d+ \w+ \d+/gim);
            json.date = testDate;

            var removeFirstDiv = $('#pf1').nextAll().text();
            // console.log(removeFirstDiv);

            var removeSpace = removeFirstDiv.replace(/\s\s+/gim, '  ');
            // console.log(removeSpace);

            var removeDots = removeSpace.replace(/\.\.\.*/gim, ' ');
            // console.log(removeDots);

            var addLine = removeDots.replace(/\D(\d\. |\d\d\. |[A-Z]\d\.)/gm, '\n$1');

            // var addLine = removeDots.replace(/\D(\d\. |\d\d\. |[A-Z]\d\.|\([a-f]\) |\([h-z]\) |\W\(i\)|\(ii\)|\(iii\))/gm, '\n$1');
            // console.log(addLine);

            var removeGibberish = addLine.replace(/\[\d\]|\[\d|Option .+|– \d.+|\(This question .+/gim, '');
            // console.log(removeGibberish);



            // var number = removeDots.match(/(\d\. |\d\d\. |[A-Z]\d\. .+)/);
            // // console.log(number[0]);

            // var questionsNumber = removeGibberish.match(/(\d|\d\d)\. /gim);
            // // console.log(questionsNumber);

            // var questionPartNumber = removeGibberish.match(/(\([a-g])\)/gim);

            var res = removeGibberish.match(/((\d|\d\d|[A-Z]\d)\. .*)/gim);
            // console.log(res);



            // var subQuestions = removeGibberish.match(/\([a-z]\).*/gim);
            // console.log(subQuestions);

            // var subparts = removeGibberish.match(/\(i\).*|\(ii\).*|\(iii\).*/gim);
            // console.log(subparts);

            // console.log(subparts);
            // json.questions.parts.content;
            // console.log(json);

            for (var i = 0; i < res.length; i++) {
                question_temp.index = i;
                var print = res[i].replace(/(\([a-h]\))/g, '\n$1');
                // console.log(print);
                question_temp.content = print.match(/((\d|\d\d|[A-Z]\d)\. .*)/gim)[0];
                var x = [];
                x = print.match(/\([a-h]\).*/gim);
                // json.questions.push(question_temp);
                if (x && x.length > 0) {
                    var question_temp1 = {
                        index: '',
                        content: '',
                        parts: [],
                    }
                    for (var j = 0; j < x.length; j++) {
                        // console.log(x[j]);
                        question_temp1.index = j;
                        // console.log(question_temp1);
                        var y = [];
                        var newI = x[j].replace(/\(i\)|\(ii\)|\(iii\)/gim, '\n$&');
                        var ss = newI.match(/(\([a-h]\) .*)/g);
                        if(ss == null){
                            question_temp1.content = ss;
                        }
                        else{
                            question_temp1.content = ss[0];
                        }
                        y = newI.match(/\(i\).*|\(ii\).*|\(iii\).*/gim);
                        if (y && y.length > 0) {
                            var question_temp2 = {
                                index: '',
                                content: '',
                                parts: [],
                            }
                            // console.log(y.length);
                            for (var z = 0; z < y.length; z++) {
                                question_temp2.index = z;
                                question_temp2.content = y[z];
                                // console.log(question_temp2);
                                question_temp1.parts.push(question_temp2);
                                question_temp2 = {
                                    index: '',
                                    content: '',
                                    parts: [],
                                }
                            }
                        }
                        question_temp.parts.push(question_temp1);
                        question_temp1 = {
                            index: '',
                            content: '',
                            parts: [],
                        }
                    }

                }

                json.questions.push(question_temp);

                question_temp = {
                    index: '',
                    content: '',
                    parts: [],
                }
                // console.log(json.questions);
            }
        }

        fs.writeFile('output.json', JSON.stringify(json, null), function(err) {
            console.log('File written successfully.')
        })
    })
    res.send('Check your console');

})

app.listen(8091);
console.log('Magic happens on port 8091');

exports = module.exports = app;