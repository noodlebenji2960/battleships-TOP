import { Ship } from '../logic.js';

describe('Ship functions', () => {
    let testShip;
	beforeEach(() => {
		testShip = new Ship("patrolboat", "p1")
	});

	it('updates ship when hit', () => {
        testShip.hit()
		expect(testShip.hits).toEqual(1);
	});
	it('updates ship when sunk', () => {
        testShip.hit()
        testShip.hit()
		expect(testShip.sunk).toEqual(true);
	});
})
