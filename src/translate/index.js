// // const request = require('request');

// const translatorApi = module.exports;

// translatorApi.translate = async function (postData) {
// 	// Edit the translator URL below
// 	const TRANSLATOR_API = 'https://codebb-translator-service.azurewebsites.net/';
// 	const response = await fetch(`${TRANSLATOR_API}/?content=${postData.content}`);
// 	const data = await response.json();
// 	return [data.is_english, data.translated_content];
// };

var request = require('request');

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
    // Edit the translator URL below
    const TRANSLATOR_API = "https://nodebb-f24-translator.azurewebsites.net/"
    const response = await fetch(TRANSLATOR_API+'/?content='+postData.content);
    const data = await response.json();
    return [data["is_english"], data["translated_content"]]
}
