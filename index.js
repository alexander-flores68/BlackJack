
let message = ""
let deckId = ""
const players = [{
    name: "Alex",
    chips: 200,
    sum: 0,
    hasBlackJack: false,
    hasBust: false,
    playerEl: document.getElementById("player-one"),
    tokensEl: document.getElementById("player-one-tokens"),
    sumEl: document.getElementById("player-one-sum"),
    cardsEl: document.getElementById("player-one-cards")
},
{
    name: "Dealer",
    chips: 8000,
    sum: 0,
    hasBlackJack: false,
    hasBust: false,
    playerEl: document.getElementById("player-two"),
    tokensEl: document.getElementById("player-two-tokens"),
    sumEl: document.getElementById("player-two-sum"),
    cardsEl: document.getElementById("player-two-cards")
}]
const messageEl = document.getElementById("message")
const startGameBtn = document.getElementById("start-btn")
const drawBtn = document.getElementById("draw-btn")
const stayBtn = document.getElementById("stay-btn")
const newGameBtn = document.getElementById("new-btn")
const remainingEl = document.getElementById("remaining")
const cardValues = {
    "2" :2,
    "3" :3,
    "4" :4,
    "5" :5,
    "6" :6,
    "7" :7,
    "8" :8,
    "9" :9,
    "10" :10,
    "JACK" :10,
    "QUEEN" :10,
    "KING" :10,
    "ACE" : 11
}
drawBtn.style.display = "none"
stayBtn.style.display = "none"
newGameBtn.style.display = "none"

players.forEach((p) => {
    p.playerEl.textContent = p.name
    p.tokensEl.textContent = p.chips
})

startGameBtn.addEventListener("click", () => {
    newGame()
    startGameBtn.style.display = "none"
    drawBtn.style.display = "inline"
    stayBtn.style.display = "inline"
})

async function newGame() {
    const res = await fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    const data = await res.json()
    remainingEl.textContent = `Remaining cards: ${data.remaining}`
    deckId = data.deck_id
    players.forEach((p) => {
        p.chips -= 10
        p.tokensEl.textContent = `Tokens: ${p.chips}`
    })
    initialDraws()
}

drawBtn.addEventListener("click", function() {
    hitMe(players[0])
})

async function hitMe(p) {
    const res = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
    const data = await res.json()
    remainingEl.textContent = `Remaining cards: ${data.remaining}`
    if (p.cardsEl.children[2].innerHTML && !p.cardsEl.children[3].innerHTML) {
        p.cardsEl.children[3].innerHTML = `<img src="${data.cards[0].image}" class="card" />`
    }
    else if (!p.cardsEl.children[2].innerHTML && !p.cardsEl.children[3].innerHTML) {
        p.cardsEl.children[2].innerHTML = `<img src="${data.cards[0].image}" class="card" />`
    }
    p.sum += cardValues[data.cards[0].value]
    p.sumEl.textContent = p.sum
    checkForBlackJack(p)
    checkForGameOver(p)
}


stayBtn.addEventListener("click", () => {
    drawBtn.style.display = "none"
    if (players[1].sum <= 16) {
        hitMe(players[1])
        if (players[1].sum >= 22) {
            messageEl.textContent = `${players[1].name} got a bust!`
            players[0].chips += 20
            newGameBtn.style.display = "inline"
        }
    }
    else if (players[1].sum >= 17) {
        if (players[1].sum > players[0].sum) {
            messageEl.textContent = `${players[1].name} wins!`
            stayBtn.style.display = "none"
            newGameBtn.style.display = "inline"
        }
        else if (players[1].sum < players[0].sum) {
            players[1].chips += 20
            messageEl.textContent = `${players[0].name} wins!`
            stayBtn.style.display = "none"
            newGameBtn.style.display = "inline"
        }
        else {
            messageEl.textContent = "It's a draw!"
            stayBtn.style.display = "none"
            newGameBtn.style.display = "inline"
        }
    }
})


newGameBtn.addEventListener("click", () => {
    if (players[0].chips <= 9) {
        message = `Sorry, ${players[0].name}, you don't have any more chips to play the game!`
        drawBtn.style.display = "none"
        stayBtn.style.display = "none"
        newGameBtn.style.display = "none"
    }
    else if (players[0].chips >= 10) {
        newGameBtn.style.display = "none"
        drawBtn.style.display = "inline"
        stayBtn.style.display = "inline"
        newGame()
        players.forEach(p => {
            for (let i = 0; i < Array.from(p.cardsEl.children).length; i++) {
                p.cardsEl.children[i].innerHTML = ""
            }
        }) 
    }
})

async function initialDraws() {
    players.forEach(async (p) => {
        const res = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        const data = await res.json()
        remainingEl.textContent = `Remaining cards: ${data.remaining}`
        data.cards.forEach((card, i) => {
            p.cardsEl.children[i].innerHTML = `
                <img src="${card.image}" class="card" />
            `
            p.cardsEl.children[i].value = cardValues[card.value]
        })
        const playerCards = Array.from(p.cardsEl.children)
        p.sum = playerCards.reduce((total, current) => total +(current.value ? current.value : 0),0)
        p.sumEl.textContent = p.sum
        checkForBlackJack(p)
        checkForGameOver(p)
    })
}

function checkForBlackJack(player) {
    if (player.sum <= 20) {
        message = `${player.name}, do you want to draw another card?`
    }
    else if (player.sum === 21) {
        message = `${player.name} got a Blackjack!`
        player.hasBlackJack = true
        newGameBtn.style.display = "inline"
        drawBtn.style.display = "none"
        stayBtn.style.display = "none"
        player.chips += 15
        player.tokensEl.textContent = player.chips
    }
    else {
        message = `Sorry, ${player.name}, you got a bust...`
        player.hasBust = true
        newGameBtn.style.display = "inline"
        drawBtn.style.display = "none"
        stayBtn.style.display = "none"
    }
    messageEl.textContent = message
}