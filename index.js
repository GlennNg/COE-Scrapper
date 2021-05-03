const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');
const trim = require('trim');

//file name
let path = 'scrappeddata.csv';
//Query set to search Mcycle 2A for sale
var queryURL = 'https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/coe-open-bidding.html'

const scrapedData = [];
const tableHeaders = ["Bidding End Date", "Timestamp", "Category", "Category Description", "Current COE Price", "Quota", "Bids Received"];

fetch(queryURL)
    .then(res => res.text())
    .then(body => {
        //console.log(body)
        const $ = cheerio.load(body);

        //bidding Ends
        const biddingEndDate = $(".coe_details p:first").text().substr(20, 18);
        //Bidding Status and date
        const biddingTimestamp = $(".coe_details h2:first").text().substr(21, 18);

        //getting values of the current bid seen
        $("body > div.content_container.app-content > main > div.standard-content > div > div.section.coe_details > div > table > tbody > tr").each((index, element) => {

            if (index === 0) {
                const ths = $(element).find("th");
                $(ths).each((i, element) => {
                    tableHeaders.push(
                        $(element)
                            .text()
                            .toLowerCase()
                    );
                });
                return true;
            }

            const tds = $(element).find("td");
            const tableRow = {};
            tableRow[tableHeaders[0]] = biddingEndDate
            tableRow[tableHeaders[1]] = biddingTimestamp
            $(tds).each((i, element) => {
                tableRow[tableHeaders[i + 2]] = $(element).text();
            });
            scrapedData.push(tableRow);
        });
        const CSV = arrayToCSV(scrapedData);
        console.log(CSV)
        writeToFile(CSV)
    })

function arrayToCSV(data) {
    csv = data.map(row => Object.values(row));
    //csv.unshift(Object.keys(data[0]));
    return `"${csv.join('"\n"').replace(/,/g, '","')}"`;
}
function writeToFile(value) {
    fs.appendFile(path, value + "\n", function (err) {
        if (err) {
            console.log(err)
        };
        console.log('Saved!');
    });
}