let vocabularyMap = {};

let seenWords = new Set();

let vocabulary = [];

let tooltip =
document.getElementById("tooltip");

function showTooltip(event,word){

let item=vocabularyMap[word.toLowerCase()];

if(!item) return;

tooltip.innerHTML=`
<b>${item.word}</b><br>
${item.english}<br>
${item.type}
`;

tooltip.style.display="block";

tooltip.style.left=
(event.pageX+15)+"px";

tooltip.style.top=
(event.pageY+15)+"px";

}

function hideTooltip(){

tooltip.style.display="none";

}

let studyList =
JSON.parse(localStorage.getItem("studyList")) || [];

async function loadVocabulary(){

    const response = await fetch("vocabulary.json");

    vocabulary = await response.json();

    let duplicates = new Set();

vocabulary.forEach(item => {

    if(
        vocabulary.filter(v => v.word === item.word).length > 1
    ){
        duplicates.add(item.word);
    }

});

console.log([...duplicates]);

    let topics = new Set();

vocabulary.forEach(item => {

    if(Array.isArray(item.topics)){

        item.topics.forEach(topic => {
            topics.add(topic.trim());
        });

    }

});

let filter = document.getElementById("topicFilter");

[...topics].sort().forEach(topic => {

    filter.innerHTML +=
        `<option value="${topic}">${topic}</option>`;

});

    vocabularyMap = {};

    vocabulary.forEach(item=>{
    vocabularyMap[item.word.toLowerCase()] = item;
    });

    console.log("VOCAB LOADED:", vocabulary);

    updateStudyList();

    analyse();
}

window.addEventListener("DOMContentLoaded", loadVocabulary);

document
.getElementById("analyseButton")
.addEventListener("click", analyse);

function selectWord(word){

    // Remove old highlights
    document.querySelectorAll(".selected").forEach(function(el){
        el.classList.remove("selected");
    });

    // Highlight every occurrence
    document.querySelectorAll(`[data-word="${word}"]`).forEach(function(el){
        el.classList.add("selected");
    });

    // Show the information panel
    showWord(word);
}

function scrollToWord(word){

    let first = document.getElementById(`${word}-1`);

    if(first){
        first.scrollIntoView({
            behavior:"smooth",
            block:"center"
        });
    }

    showWord(word);

}

  function showWord(word){
    let html = "";

    let item = vocabularyMap[word.toLowerCase()];

    if(!item) return;

        if (item.type === "noun") {
            html +=
                "<p><b>Word:</b> " + item.word + "</p>";
            html +=
                "<p><b>English:</b> " + item.english + "</p>";
            html +=
                "<p><b>Article:</b> " + item.article + "</p>";
            html +=
               "<p><b>Plural:</b> " + item.plural + "</p>";
            html +=
                "<p><b>Topics:</b> " + item.topics + "</p>";
        } else if (item.type === "verb") {
            html +=
                "<p><b>Word:</b> " + item.word + "</p>";
            html +=
                "<p><b>English:</b> " + item.english + "</p>";
            html +=
                "<p><b>Imperfect:</b> " + item.imperfect + "</p>";
            html +=
                "<p><b>Perfect:</b> " + item.perfect + "</p>";
            html +=
                "<p><b>Topics:</b> " + item.topics + "</p>";
        } else if (item.type === "adjective") {
            html +=
                "<p><b>Word:</b> " + item.word + "</p>";
            html +=
                "<p><b>English:</b> " + item.english + "</p>";
            html +=
                "<p><b>Topics:</b> " + item.topics + "</p>";
        } else if (item.type === "adverb") {
            html +=
                "<p><b>Word:</b> " + item.word + "</p>";
            html +=
                "<p><b>English:</b> " + item.english + "</p>";
            html +=
                "<p><b>Topics:</b> " + item.topics + "</p>";
        }

        if(studyList.some(w=>w.word===item.word)){

            html += `
            <button disabled>
                ✓ Already Saved
            </button>
            `;

        }else{

            html += `
            <button onclick="saveWord('${item.word}')">
                Add to Study List
            </button>
            `;

        }
        
        document.getElementById("wordInfo").innerHTML = html;
    }

function saveWord(word){

    // Find the vocabulary item
    let item = vocabulary.find(v => v.word === word);

    if(!item) return;

    // Don't save duplicates
    if(!studyList.some(w => w.word === word)){

        studyList.push({
            word: item.word,
            english: item.english
        });

        localStorage.setItem(
            "studyList",
            JSON.stringify(studyList)
        );

        updateStudyList();
    }
}

function removeWord(word){

    studyList =
    studyList.filter(item => item.word !== word);

    localStorage.setItem(
        "studyList",
        JSON.stringify(studyList)
    );

    updateStudyList();

}

function updateStudyList(){

    let html = "";

    studyList.forEach(function(item){

        html += `
        <div class="studyWord">

            <span
                class="studyWordText"
                onclick="showWord('${item.word}')">

                <strong>${item.word}</strong><br>
                <span class="translation">${item.english}</span>

            </span>

            <button
                class="removeButton"
                onclick="removeWord('${item.word}')">

                ✕

            </button>

        </div>
        `;

    });

    if(html === ""){
        html = "No saved words.";
    }

    document.getElementById("studyList").innerHTML = html;

    document.getElementById("studyListHeading").textContent =
    `Study List (${studyList.length})`;
}

function escapeRegex(text){
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function analyse() {
    seenWords = new Set();
    let article = document.getElementById("article").value;
    let highlighted = article;
    let matchesFound = [];

    let selectedTopic =
document.getElementById("topicFilter").value;

    // 1. Gather all vocabulary matches with their positions in the text
    for (let item of vocabulary) {

        if(
    selectedTopic !== "all" &&
    (
        !item.topics ||
        !item.topics.some(topic => topic.trim() === selectedTopic)
    )
){
    continue;
}

    let patterns = [];

    // Base word
    patterns.push(escapeRegex(item.word));

    // Plural (for nouns)
    if (item.type === "noun" &&
        item.plural &&
        item.plural !== "no plural") {

        patterns.push(escapeRegex(item.plural));
    }

    // Adjective endings
    if (item.type === "adjective") {
        patterns = [
    `${escapeRegex(item.word)}(e|en|er|em|es|ere|eren|erer|erem|eres)?`
];
    }

    let regex;

if(item.type === "noun"){
    regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "g");
}else{
    regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "gi");
}

let matches = [...article.matchAll(regex)];

        if (matches.length > 0) {
        
            // Store the item details alongside the first index where it appears
            matchesFound.push({
                item: item,
                firstIndex: matches[0].index,
                count: matches.length
            });

            // 2. Run your replacement logic for highlighting
            let count = 0;
            highlighted = highlighted.replace(regex, function(match) {
                count++;
                let highlightClass = count === 1 ? "first" : "repeat";
                return `<span
                class="word ${item.type} ${highlightClass}"
                data-word="${item.word}"
                id="${item.word}-${count}"
                onmouseover="showTooltip(event,'${item.word}')"
                onmouseout="hideTooltip()"
                onclick="selectWord('${item.word}')">${match}</span>`;
            });
        }
    }

    // 3. Sort the found words based on their appearance index in the text
    matchesFound.sort((a, b) => a.firstIndex - b.firstIndex);

    // 4. Generate the HTML for the "Vocabulary Found" box in the correct order
    let foundHTML = "";
    for (let match of matchesFound) {
        let word = match.item.word;
        foundHTML += `<div class="foundWord" onclick="scrollToWord('${word}')">
            ${word} (${match.count}) - ${match.item.english}
        </div>`;
    }

    // 5. Update the DOM
    document.getElementById("results").innerHTML = foundHTML;
    document.getElementById("highlighted").innerHTML = highlighted;
}

document.getElementById("searchBox").addEventListener("input", function(){

    let search = this.value.toLowerCase();

    document.querySelectorAll(".foundWord").forEach(function(word){

        word.style.display =
            word.innerText.toLowerCase().includes(search)
            ? ""
            : "none";

    });

});

document.getElementById("clearList")
.addEventListener("click",function(){

    studyList=[];

    localStorage.removeItem("studyList");

    updateStudyList();

});

document.getElementById("copyList")
.addEventListener("click",function(){

    navigator.clipboard.writeText(
        studyList
.map(item => `${item.word} - ${item.english}`)
.join("\n")
    );

    alert("Study list copied.");

});

document
.getElementById("topicFilter")
.addEventListener("change", analyse);