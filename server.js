const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

app.get('/', function(req, res) {

    let url = 'http://127.0.0.1:34181/';

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
            var firstDiv = $('#pf1').text().replace(/\s\s+/gim, '');
            // console.log(firstDiv);

            var testTitle = firstDiv.match(/.*\wpaper \d|English .* paper \d/gim);
            json.title = testTitle;

            var instructions = firstDiv.replace(/(Instructions)/gim, '\n$1').match(/Instructions .*/gim);
            json.instructions = instructions;

            var testDuration = firstDiv.match(/(\d hour \d\d minutes)|(\d hour)|(\d\d minutes)/gim);
            json.duration = testDuration;

            var testDate = firstDiv.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) \d+ \w+ \d+/gim);
            json.date = testDate;


            var removeFirstDiv = $('#pf1').nextAll().text();
            // console.log(removeFirstDiv);

            var removeSpace = removeFirstDiv.replace(/\s\s+/gim, '  ');

            var removeDots = removeSpace.replace(/\.\.\.*/gim, ' ');
            // console.log(removeDots);

            var addLine = removeDots.replace(/\D(\d\. |\d\d\. |[A-Z]\d\.)/gm, '\n$1');
            // console.log(addLine);

            // var removeGibberish = addLine.replace(/\[\d\]|\[\d|Option .+|– \d.+|\(This question .+/gim, '');
            var removeGibberish = addLine.replace(/\[\d\]|\[\d|Option .+/gim, '');

            // console.log(removeGibberish);

            var res = removeGibberish.match(/((\d|\d\d|[A-Z]\d)\. .*)/gim);
            console.log(res);

            if (res && res.length > 0) {
                for (var i = 0; i < res.length; i++) {
                    question_temp.index = i;

                    var subParts = res[i].replace(/(  \([a-z]\)|[A-D]\. |\(a\))/gm, '\n$1');
                    // console.log(subParts);

                    var removeSubPartsGibberish = subParts.replace(/(– \d.+|\(This question .+)/gm, '');
                    // console.log(removeSubPartsGibberish);

                    question_temp.content = removeSubPartsGibberish.match(/((\d|\d\d|[A-Z]\d)\. .*)/gim)[0];
                    // console.log(question_temp.content);

                    var subPartsArray = [];

                    subPartsArray = removeSubPartsGibberish.match(/\([a-z]\).*|[A-D]\. .*/gim);
                    // console.log(subPartsArray);

                    if (subPartsArray && subPartsArray.length > 0) {

                        var question_temp1 = {
                            index: '',
                            content: '',
                            parts: [],
                        }

                        for (var j = 0; j < subPartsArray.length; j++) {

                            question_temp1.index = j;

                            var nestedSubParts = [];

                            // adding line before every (i), (ii) and (iii)
                            var newI = subPartsArray[j].replace(/\(i\)|\(ii\)|\(iii\)/gim, '\n$&');

                            var ss = newI.match(/(\([a-f]\) .*|[A-D]\. .*)/g);
                            // console.log(ss);
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
                                    parts: [],
                                }

                                for (var z = 0; z < nestedSubParts.length; z++) {
                                    question_temp2.index = z;
                                    question_temp2.content = nestedSubParts[z];
                                    question_temp1.parts.push(question_temp2);
                                    question_temp2 = {
                                        index: '',
                                        content: '',
                                        parts: [],
                                    }
                                }
                            }

                            question_temp.parts.push(question_temp1);
                            // console.log(question_temp1);
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
                }
            }

        }

        fs.writeFile('output.json', JSON.stringify(json, null), function(err) {
            console.log('File written successfully.')
        })
    })
    res.send('Check your console');

})

app.listen(3131);
console.log('Magic happens on port 3131');

exports = module.exports = app;