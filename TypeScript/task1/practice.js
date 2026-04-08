"use strict";
// =========================
// 1. Primitive Types & Annotations
// =========================
// explicit primitive types
let userName = "john";
let userAge = 25;
let isLoggedIn = true;
// any vs unknown (fixed to avoid runtime crash)
let anything = "hello";
anything = 10;
// guard before using
if (typeof anything === "string") {
    console.log(anything.toUpperCase());
}
else {
    console.log("anything is not a string, value:", anything);
}
let unknownValue = "world";
if (typeof unknownValue === "string") {
    console.log(unknownValue.toUpperCase()); // safe
}
// typed array
let numbers = [1, 2, 3];
// readonly array
let readonlyNumbers = [1, 2, 3];
// readonlyNumbers.push(4) 
// tuple with optional element
let userTuple = ["john", 25];
// as const + union type
const roles = ["admin", "user", "guest"];
let currentRole = "admin";
console.log("current role:", currentRole);
const admin = {
    id: 1,
    name: "alice",
    role: "superadmin"
};
console.log("admin:", admin);
const admin2 = {
    id: 2,
    name: "bob",
    role: "admin"
};
console.log("admin2:", admin2);
let requestStatus = "loading";
console.log("status:", requestStatus);
const translations = {
    en: "hello",
    fr: "bonjour"
};
console.log("translations:", translations);
const item = {
    id: 1,
    name: "laptop"
};
console.log("product:", item);
