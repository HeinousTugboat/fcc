/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ({

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(5);


/***/ }),

/***/ 5:
/***/ (function(module, exports) {

let quoteEl;
const corsProxy = 'https://cors-anywhere.herokuapp.com/'

// const quoteURL = 'https://talaikis.com/api/quotes/random/';
// const quoteURL = 'http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1';
const quoteURL = 'http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en';
// const quoteURL = 'http://quotes.stormconsultancy.co.uk/quotes/1.json';

const twitterPre = 'https://twitter.com/intent/tweet?text=';

const quoteContainer = document.getElementById('quotes');
const newQuoteBtn = document.getElementById('newQuote');
const shareBtn = document.getElementById('share');
const loadIndEl = document.getElementById('loadIndicator');

function newQuote() {
  loadIndEl.classList.add('loading');
  quoteEl = document.querySelector('blockquote');
  newQuoteEl = document.createElement('blockquote');
  fetch(corsProxy+quoteURL)
    .then(x=>x.json())
    .then(x=>{
      // newQuoteEl.innerHTML = JSON.stringify(x)
      newQuoteEl.innerHTML = x.quoteText + '<cite>' + (x.quoteAuthor?x.quoteAuthor:'unknown') + '</cite>';
      shareBtn.href = twitterPre + encodeURIComponent(x.quoteText+' ―'+x.quoteAuthor);
    }).then(()=>{
      quoteContainer.insertBefore(newQuoteEl, quoteEl);
      quoteEl.classList.add('wipe');
      window.setTimeout(()=>quoteEl.remove(), 2000);
      loadIndEl.classList.remove('loading');
    }).catch(err=>newQuote.innerHTML = 'Oops! '+err);
}

newQuoteBtn.addEventListener('click', newQuote);
// document.addEventListener('DOMContentLoaded', newQuote);


/***/ })

/******/ });