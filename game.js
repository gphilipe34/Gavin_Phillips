"use strict";
const moves = ["rock", "paper", "scissors"];
const urls = {
    rock: "https://zachtsch.github.io/rpsimages/rock.png",
    paper: "https://zachtsch.github.io/rpsimages/paper.png",
    scissors: "https://zachtsch.github.io/rpsimages/scissors.png"
};
let wins = 0;
let losses = 0;
let draws = 0;
function getComputerMove() {
    return moves[Math.floor(Math.random() * moves.length)];
}
function determineWinner(player, computer) {
    if (player === computer)
        return "tie";
    if ((player === "rock" && computer === "scissors") ||
        (player === "paper" && computer === "rock") ||
        (player === "scissors" && computer === "paper"))
        return "win";
    return "lose";
}
function updateStats(result) {
    if (result === "win")
        wins++;
    else if (result === "lose")
        losses++;
    else
        draws++;
    const total = wins + losses + draws;
    const winPercent = total === 0 ? "N/A" : ((wins / total) * 100).toFixed(1) + "%";
    document.getElementById("wins").textContent = wins.toString();
    document.getElementById("losses").textContent = losses.toString();
    document.getElementById("draws").textContent = draws.toString();
    document.getElementById("winPercent").textContent = winPercent;
}
function startGame(playerMove) {
    const countdown = document.getElementById("countdown");
    let count = 3;
    countdown.textContent = "Rock...";
    const interval = setInterval(() => {
        count--;
        if (count === 2)
            countdown.textContent = "Paper...";
        else if (count === 1)
            countdown.textContent = "Scissors...";
        else if (count === 0)
            countdown.textContent = "SHOOT!";
        else {
            clearInterval(interval);
            playRound(playerMove);
        }
    }, 500);
}
function playRound(playerMove) {
    const computerMove = getComputerMove();
    const result = determineWinner(playerMove, computerMove);
    const playerImg = document.getElementById("playerImg");
    const computerImg = document.getElementById("computerImg");
    if (playerImg && computerImg) {
        // Reset animation
        playerImg.classList.remove("pop");
        computerImg.classList.remove("pop");
        // Force reflow (this is the magic trick 🪄)
        void playerImg.offsetWidth;
        void computerImg.offsetWidth;
        // Set images
        playerImg.src = urls[playerMove];
        computerImg.src = urls[computerMove];
        // Trigger animation
        playerImg.classList.add("pop");
        computerImg.classList.add("pop");
    }
    const resultText = document.getElementById("result");
    resultText.className = "";
    if (result === "win") {
        resultText.textContent = "You win!";
        resultText.classList.add("win");
    }
    else if (result === "lose") {
        resultText.textContent = "Computer wins!";
        resultText.classList.add("lose");
    }
    else {
        resultText.textContent = "It's a tie!";
        resultText.classList.add("tie");
    }
    updateStats(result);
}
window.startGame = startGame;
