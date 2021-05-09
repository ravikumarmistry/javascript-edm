import { Edm } from "./edm";


describe("Edm Constructor test", () => {
    test('it should create a valid edm document if no parameters is passed.', () => {
        var edm = new Edm();
        var doc = edm.getEdmDocument();
        // console.log(doc);
        // expect(doc).toBe('');

    });
});

