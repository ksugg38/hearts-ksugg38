import {HU} from "./hearts_utils.js";
import { HeartsRobotKatie } from "./hearts_robot_katie.js";

export class HeartsView {

    #model
    #controller
    #flag

    constructor(model, controller) {
        this.#model = model;
        this.#controller = controller;
        this.#flag = false;
    }

    render(render_div) {
        window.scrollTo(0, document.body.scrollHeight);
        let input = document.createElement('input');
        input.className = "myText";
        input.style.display = "flex";
        input.style.width = '1200px';
        input.style.height = "50px";
        input.style.alignSelf = "center";
        input.id = "input";
        input.setAttribute('type', 'text');
        input.style.fontFamily = "supermario";
        input.placeholder = "Type name here and press start";
        
        let button = document.createElement("button");
        button.style.width = "75px";
        button.style.height = "30px";
        button.innerHTML = `Start`;
        button.classList.add("start_button");
        render_div.append(button)

        render_div.append(document.createElement('br'));
        const title = document.createElement("h1");
        title.id = "title";
        title.style.alignSelf = "center";
        const newContent = document.createTextNode("Hearts");

        // add the text node to the newly created div
        title.appendChild(newContent);
        // add the newly created element and its content into the DOM
        const main = document.getElementById("main");
        //main.classList.add("main");
        main.id = "main";
        document.body.insertBefore(title, main);
        render_div.append(input);

        button.addEventListener("click", () => {
            const name = input.value;
            if(input.value.length > 0 & !this.#flag){
                let west_robot = new HeartsRobotKatie(this.#model, this.#controller, 'west');
                let north_robot = new HeartsRobotKatie(this.#model, this.#controller, 'north');
                let east_robot = new HeartsRobotKatie(this.#model, this.#controller, 'east');
                //Call the controller to start game
                this.#controller.startGame('Mario', 'Peach', name, 'Luigi');
                let audio = new Audio("sm64_mario_lets_go.mp3");
                audio.play();
                input.style.visibility = "hidden";
                button.style.visibility = "hidden";
            }else if(this.#flag){
                location.reload();
                this.#flag = false;
            }
        });
    
        //Start of Main text area
        let out_ta = document.createElement('textarea');
        out_ta.style.width = '1200px';
        out_ta.style.height = '150px';
        out_ta.style.display = "flex";
        out_ta.readOnly = true;
        out_ta.id = "out_ta";
        out_ta.style.alignSelf = "center";
        out_ta.classList.add("out_ta");
        let br = document.createElement("br");
        render_div.append(br);
        out_ta.append(br);


        render_div.append(out_ta);

        let out_ta2 = document.createElement('textarea');
        out_ta2.style.width = '1200px';
        out_ta2.style.height = '150px';
        out_ta2.style.display = "flex";
        out_ta2.readOnly = true;
        out_ta2.id = "out_ta2";
        out_ta.style.alignSelf = "center";
        out_ta2.classList.add("scoreboard")
        render_div.append(br);
        out_ta2.append();
        render_div.append(out_ta2);



        let cards = document.createElement("div");
        cards.style.display="flex";
        cards.style.flexDirection="row";
        cards.id = "cards";
        render_div.append(cards);

        render_div.append(br);

        let trick = document.createElement("div");
        trick.style.display="grid";
        trick.style.gridTemplateColumns ="100px 100px 100px";
        trick.id = "trick";
        render_div.append(trick);
        
        this.#model.addEventListener('stateupdate', () => {
            if (this.#model.getState() == 'passing') {
                out_ta.innerHTML = `Passing: ${this.#model.getPassing()}\n`;
                this.displayCards(cards);

                if (this.#model.getPassing() != 'none') {
                    out_ta.append("Click 3 cards to pass\n");
                }
                
            } else if (this.#model.getState() == 'playing') {
                out_ta.append(`Passes complete, game starting.\n`);

            } else if (this.#model.getState() == 'complete') {
                let winner = null;
                let winning_score = 200;
                HU.positions.forEach(p => {
                    if (this.#model.getScore(p) < winning_score) {
                        winning_score = this.#model.getScore(p);
                        winner = p;
                    }
                });
                out_ta.innerHTML = ``;
                let br = document.createElement("br");
                out_ta.append(br);
                out_ta.append(`Match over, ${this.#model.getPlayerName(winner)} wins!\n`);
                button.style.visibility = "visible";
                button.style.width = "200px";
                button.innerHTML = `Click to Play Again`;
                input.value = "";
                this.#flag = true;
            }
        })

        this.#model.addEventListener('trickstart', () => {
            out_ta.innerHTML = `Trick started\n`;
            this.displayTrick(trick);

            if (this.#model.getCurrentTrick().nextToPlay() == 'south') {
                out_ta.append("Your turn to play. Click one card to play.\n");
                this.displayCards(cards);
            }
        });

        this.#model.addEventListener('trickplay', (e) => {
            out_ta.append(this.#model.getPlayerName(e.detail.position) + " played the " + e.detail.card.toString() + "\n");
            
            this.displayTrick(trick);
            if (this.#model.getCurrentTrick().nextToPlay() == 'south') {
                out_ta.append("Your turn to play. Click one card to play.\n");
                this.displayCards(cards);
            }
        });

        this.#model.addEventListener('trickcollected', (e) => {
            let audio = new Audio("01-power-up-mario.mp3");
            audio.play();
            out_ta2.innerHTML = ("Trick won by " + this.#model.getPlayerName(e.detail.position) +"\n");
        });




        this.#model.addEventListener('scoreupdate', (e) => {
            if (e.detail.moonshooter != null) {
                alert(this.#model.getPlayerName(e.detail.moonshooter) + " shot the moon!");
            }
            out_ta2.innerHTML = `Score update: 
  ${this.#model.getPlayerName('north')}: ${e.detail.entry.north}
  ${this.#model.getPlayerName('east')} : ${e.detail.entry.east}
  ${this.#model.getPlayerName('south')}: ${e.detail.entry.south}
  ${this.#model.getPlayerName('west')} : ${e.detail.entry.west}\n`;
            out_ta2.append(`Current totals: 
  ${this.#model.getPlayerName('north')}: ${this.#model.getScore('north')}
  ${this.#model.getPlayerName('east')} : ${this.#model.getScore('east')}
  ${this.#model.getPlayerName('south')}: ${this.#model.getScore('south')}
  ${this.#model.getPlayerName('west')} : ${this.#model.getScore('west')}\n`);
        });
    }

    displayCards(render_div){
                render_div.innerHTML = ``;
                let yourHand = this.#model.getHand("south");
                let yourCards = this.orderCards(yourHand.getCards());
            
                let passingCards = [];

                let smallTitle = document.createElement("div");
                smallTitle.innerHTML = `Your Hand`;
                smallTitle.style.display = "flex";
                smallTitle.style.alignSelf = "center";
                smallTitle.style.backgroundColor = "beige"
                smallTitle.style.marginRight = "5px";
                smallTitle.style.fontFamily = "supermario";
                smallTitle.style.padding = "5px 5px 5px 5px";
                render_div.append(smallTitle);
                
             
                //Create card divs
                for(let i = 0; i< yourCards.length; i++){
                    let card = this.createCardButton();
                    card.innerHTML = `<p style='display:flex; align-self:center' ></p>`;
                    card.id = i;
                    this.selectBackground(yourCards[i], card);

                    if(this.#model.getState() == 'passing'){
                        this.passCardsEvent(card, passingCards, yourCards);
                    }else if(this.#model.getState() == 'playing'){
                        this.playCardsEvent(card, yourCards);
                    }

                    let space = document.createElement("div");
                    space.style.padding= "5px";
                    render_div.append(space);
                    render_div.append(card);
                    render_div.append(space);
                }
    
    }
    displayTrick(render_div){
        render_div.innerHTML = ``;
        let currentTrick = this.#model.getCurrentTrick();

        //Grid 1
        let cardSpace1 = this.createCardButton();
        cardSpace1.style.visibility = "hidden";
        cardSpace1.style.opacity = "0";
        render_div.appendChild(cardSpace1);
       
        //Grid 2
        if(currentTrick.getCard("north") != null){
            let cardN = this.createCardButton();
            this.selectBackground(currentTrick.getCard("north"), cardN);
            cardN.disabled = true;
            render_div.appendChild(cardN);
            this.sleep(200);
        }else{
            let cardSpace2 = this.createCardButton();
            cardSpace2.style.visibility = "hidden";
            cardSpace2.style.opacity = "0";
            render_div.appendChild(cardSpace2);
        }

        //Grid 3
        let cardSpace3 = this.createCardButton();
        cardSpace3.style.visibility = "hidden";
        cardSpace3.style.opacity = "0";
        render_div.appendChild(cardSpace3);

        //Grid 4
        if(currentTrick.getCard("west") != null){
            let cardW = this.createCardButton();
            this.selectBackground(currentTrick.getCard("west"), cardW);
            cardW.disabled = true;
            render_div.appendChild(cardW);
            this.sleep(200);
        }else{
            let cardSpace4 = this.createCardButton();
            cardSpace4.style.visibility = "hidden";
            cardSpace4.style.opacity = "0";
            render_div.appendChild(cardSpace4);
            
        }

        //Grid 5
        let cardSpace5 = this.createCardButton();
        cardSpace5.style.visibility = "hidden";
        cardSpace5.style.opacity = "0";
        render_div.appendChild(cardSpace5);


        //Grid 6
        if(currentTrick.getCard("east") != null){
            let cardE = this.createCardButton();
            this.selectBackground(currentTrick.getCard("east"), cardE);
            cardE.disabled = true;
            render_div.appendChild(cardE);
            this.sleep(200);
        }else{
            let cardSpace6 = this.createCardButton();
            cardSpace6.style.visibility = "hidden";
            cardSpace6.style.opacity = "0";
            render_div.appendChild(cardSpace6);
        }

        //Grid 7
        let cardSpace7 = this.createCardButton();
        cardSpace7.style.visibility = "hidden";
        cardSpace7.style.opacity = "0";
        render_div.appendChild(cardSpace7);

        //Grid 8
        if(currentTrick.getCard("south") != null){
            let cardS = this.createCardButton();
            this.selectBackground(currentTrick.getCard("south"), cardS);
            cardS.disabled = true;
            render_div.appendChild(cardS);
            this.sleep(200);
        }else{
            let cardSpace8 = this.createCardButton();
            cardSpace8.style.visibility = "hidden";
            cardSpace8.style.opacity = "0";
            render_div.appendChild(cardSpace8);
        }

        //Grid 9
        let cardSpace9 = this.createCardButton();
        cardSpace9.style.visibility = "hidden";
        cardSpace9.style.opacity = "0";
        render_div.appendChild(cardSpace9);
    }

    passCardsEvent(card, passingCards, yourCards){
        card.addEventListener("click",  () => {
            let card_to_pass = yourCards[card.id];

            if(!passingCards.includes(card_to_pass)){
                card.style.border = "5px solid red";
                passingCards.push(card_to_pass)
            }else{
                passingCards.pop(card_to_pass);
                card.style.border = "5px solid black";
            }
            if(passingCards.length == 3){
                this.#controller.passCards('south', passingCards);
            }
        });

    }
    playCardsEvent(card, yourCards){
        card.addEventListener("click",  () => {
            let card_to_pass = yourCards[card.id]
            if(this.#controller.isPlayable('south', card_to_pass)){
                card.style.border = "5px solid red";
                for(let i = 0; i < yourCards.length; i++){
                    let card = document.getElementById(`${i}`);
                    card.disabled = true;
                }
                this.#controller.playCard('south', card_to_pass);
            }
        });
    }


    createCardButton(){
        let card = document.createElement("button");
        card.style.display = "flex";
        card.style.width="80px";
        card.style.height= "110px";
        card.style.border = "5px solid black";
        card.style.borderRadius ="10px";
        card.style.backgroundColor = "white";
        card.style.backgroundSize = "contain";
        card.innerHTML = `<p style='display:flex; align-self:center' ></p>`;
        return card
    }

    selectBackground(Card, cardButton){
        let number = Card.getRankName();
        if(Card.getSuit() == "clubs"){
            cardButton.style.backgroundImage = "url(cardImgs/"+number+"_of_clubs.png)"
        }else if (Card.getSuit() == "spades"){
            cardButton.style.backgroundImage = "url(cardImgs/"+number+"_of_spades.png)"
        }else if (Card.getSuit() == "diamonds"){
            cardButton.style.backgroundImage = "url(cardImgs/"+number+"_of_diamonds.png)"
        }else if (Card.getSuit() == "hearts"){
            cardButton.style.backgroundImage = "url(cardImgs/"+number+"_of_hearts.png)"
        }  
    }

    orderCards(list){
        let hearts = [];
        let spades = [];
        let diamonds = [];
        let clubs =[];
        for(let i = 0; i<list.length; i++){
            if(list[i].getSuit() == "hearts"){
                hearts.push(list[i]);
            }else if(list[i].getSuit() == "spades"){
                spades.push(list[i]);
            }else if (list[i].getSuit() == "diamonds"){
                diamonds.push(list[i]);
            }else if(list[i].getSuit() == "clubs"){
                clubs.push(list[i]);
            }
        }

        hearts.sort((a, b) => a.getRank() - b.getRank());
        spades.sort((a, b) => a.getRank() - b.getRank());
        diamonds.sort((a, b) => a.getRank() - b.getRank());
        clubs.sort((a, b) => a.getRank() - b.getRank());
        
        let returnList = [].concat(hearts, spades, diamonds, clubs);
        return returnList
    }

    sleep(miliseconds) {
        let currentTime = new Date().getTime();
        while (currentTime + miliseconds >= new Date().getTime()) {
        }
     }
}
