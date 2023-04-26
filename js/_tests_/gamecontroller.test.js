import { GameController } from '../logic.js';

describe('Gameboard functions', () => {
	let testBoard;
	beforeEach(() => {
		testBoard = new GameController();
		testBoard.initialize("human")
	});
	//other tests
	it('initializes a gameboard with the appropriate amount of cells', () => {
		const arr = [];
        for(let x=0;x<=9;x++){
            for(let y=0;y<=9;y++){
                arr.push({X:x, Y:y, p1Ship:null, p1Hit:false, p1Miss:false, p2Ship:null, p2Hit:false, p2Miss:false});
            }
        }
		expect(testBoard.board).toEqual(arr);
	});
	it('updates turn number', () => {
		testBoard.nextTurn()
		expect(testBoard.turn).toBe(1);
	});
	//test attacking
	it('updates a cell when a miss', () => {
		testBoard.recieveAttack("enemy00", "p1")
		expect(testBoard.board[0].p2Miss).toBe(true);
	});
	it('updates a cell when a hit', () => {
		testBoard.placeShip("enemy00", "carrier", false, "p1")
		testBoard.recieveAttack("enemy00", "p2")
		expect(testBoard.board[0].p1Hit).toBe(true);
	});
	//test boat placement
	it('rejects ship placement that collides with other ships', () => {
		testBoard.placeShip("enemy00", "carrier", false, "p1")
		expect(testBoard.placeShip("enemy00", "battleship", false, "p1")).toBe(false);
	});
	it('placeship function returns false on ship placement that runs through map edge on y axis', () => {
		testBoard.placeShip("enemy00", "carrier", true, "p1")
		expect(testBoard.placeShip("enemy00", "battleship", true, "p1")).toBe(false);
	});
	it('does not update cell when ship placement runs through map edge on y axis', () => {
		testBoard.placeShip("enemy00", "carrier", true, "p1")
		expect(testBoard.board[0].p1Ship).toBe(null);
	});
	it('placeship function returns false on ship placement that runs through map edge on x axis', () => {
		testBoard.placeShip("enemy90", "carrier", false, "p1")
		expect(testBoard.placeShip("enemy90", "battleship", false, "p1")).toBe(false);
	});
	it('does not update cell when ship placement runs through map edge on x axis', () => {
		testBoard.placeShip("enemy00", "carrier", false, "p1")
		expect(testBoard.board[90].p1Ship).toBe(null);
	});

})
