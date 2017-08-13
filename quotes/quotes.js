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
