let seenWords = new Set();

let vocabulary = [];

async function loadVocabulary(){

    const response = await fetch("vocabulary.json");

    vocabulary = await response.json();

    console.log("VOCAB LOADED:", vocabulary);

    analyse();
}

window.addEventListener("DOMContentLoaded", loadVocabulary);

document
.getElementById("analyseButton")
.addEventListener("click", analyse);

  function showWord(word){
    document.getElementById("wordInfo").innerHTML = "";

    for (let item of vocabulary) {
        
        if (item.word !== word) continue;

        if (item.type === "noun") {
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Word:</b> " + item.word + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>English:</b> " + item.english + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Article:</b> " + item.article + "</p>";
            document.getElementById("wordInfo").innerHTML +=
               "<p><b>Plural:</b> " + item.plural + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Topics:</b> " + item.topics + "</p>";
        } else if (item.type === "verb") {
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Word:</b> " + item.word + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>English:</b> " + item.english + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Imperfect:</b> " + item.imperfect + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Perfect:</b> " + item.perfect + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Topics:</b> " + item.topics + "</p>";
        } else if (item.type === "adjective") {
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Word:</b> " + item.word + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>English:</b> " + item.english + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Topics:</b> " + item.topics + "</p>";
        } else if (item.type === "adverb") {
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Word:</b> " + item.word + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>English:</b> " + item.english + "</p>";
            document.getElementById("wordInfo").innerHTML +=
                "<p><b>Topics:</b> " + item.topics + "</p>";
        }

        break;
    }
}

function analyse() {
    seenWords = new Set();
    let article = document.getElementById("article").value;
    let highlighted = article;
    let matchesFound = [];

    // 1. Gather all vocabulary matches with their positions in the text
    for (let item of vocabulary) {

    let patterns = [];

    // Base word
    patterns.push(item.word);

    // Plural (for nouns)
    if (item.type === "noun" &&
        item.plural &&
        item.plural !== "no plural") {

        patterns.push(item.plural);
    }

    // Adjective endings
    if (item.type === "adjective") {
        patterns = [
            `${item.word}(e|en|er|em|es|ere|eren|erer|erem|eres)?`
        ];
    }

    if (item.type === "noun") {
    regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "g");
} else {
    regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "gi");
}

    let matches = [...article.matchAll(regex)];

        if (matches.length > 0) {
            // Store the item details alongside the first index where it appears
            matchesFound.push({
                item: item,
                firstIndex: matches[0].index
            });

            // 2. Run your replacement logic for highlighting
            let count = 0;
            highlighted = highlighted.replace(regex, function(match) {
                count++;
                let highlightClass = count === 1 ? "first" : "repeat";
                return `<span class="word ${item.type} ${highlightClass}" onclick="showWord('${item.word}')">${match}</span>`;
            });
        }
    }

    // 3. Sort the found words based on their appearance index in the text
    matchesFound.sort((a, b) => a.firstIndex - b.firstIndex);

    // 4. Generate the HTML for the "Vocabulary Found" box in the correct order
    let foundHTML = "";
    for (let match of matchesFound) {
        let word = match.item.word;
        foundHTML += `<div class="foundWord" onclick="showWord('${word}')">
            ${word} — ${match.item.english}
        </div>`;
    }

    // 5. Update the DOM
    document.getElementById("results").innerHTML = foundHTML;
    document.getElementById("highlighted").innerHTML = highlighted;
}