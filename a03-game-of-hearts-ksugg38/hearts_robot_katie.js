export class HeartsRobotKatie {
    #model;
    #controller;
    #position;

    constructor(model, controller, position) {
        this.#model = model;
        this.#controller = controller;
        this.#position = position;

        this.#model.addEventListener('stateupdate', () => {
            let state = this.#model.getState();
            //Will pass the highest value cards
            if ((state == 'passing') && (this.#model.getPassing() != 'none')) {
                let hand = this.#model.getHand(this.#position);

                let yourCards = hand.getCards().sort((a, b) => b.getRank() - a.getRank());
                let cards_to_pass = [yourCards[0], yourCards[1], yourCards[2]]


                this.#controller.passCards(this.#position, cards_to_pass);  
            } 
        });
        
        this.#model.addEventListener('trickstart', () => {
            setInterval(this.#playCard(), 1000);
        });
            
        this.#model.addEventListener('trickplay', () => {
            setInterval(this.#playCard(), 1000);
        });
    }

    #playCard() {
        if (this.#model.getCurrentTrick().nextToPlay() == this.#position) {
            let playable_cards = this.#model.getHand(this.#position)
                                            .getCards()
                                            .filter(c => this.#controller.isPlayable(this.#position, c));
            if (playable_cards.length > 0) {
                let card = playable_cards.map(c => [c, Math.random()])
                                          .sort((a,b) => a[1] - b[1])[0][0];
                this.#controller.playCard(this.#position, card);
            } else {
                // This should never happen.
                console.log(`${this.#position} has no playable cards`);
            }
        }
    }
}