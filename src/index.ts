import { Edm } from "./core/edm";

var edm = new Edm();
var doc = edm.getEdmDocument(true);
console.clear();
console.log("===================================================XML===================================================");
console.log(doc);
console.log("==================================================XML END================================================");