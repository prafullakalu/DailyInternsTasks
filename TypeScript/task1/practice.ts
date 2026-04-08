// =========================
// 1. Primitive Types & Annotations
// =========================

// explicit primitive types
let userName: string = "john"
let userAge: number = 25
let isLoggedIn: boolean = true

// any vs unknown (fixed to avoid runtime crash)
let anything: any = "hello"


// guard before using
if (typeof anything === "string") {
  console.log(anything.toUpperCase())
} else {
  console.log("anything is not a string, value:", anything)
}

let unknownValue: unknown;

unknownValue = "hello"; 
unknownValue = 10;      
unknownValue = true;    



// if (typeof unknownValue === "string") {
//   console.log(unknownValue.toUpperCase()) // safe
// }

// typed array
let numbers: number[] = [1, 2, 3]

// readonly array
let readonlyNumbers: ReadonlyArray<number> = [1, 2, 3]
// readonlyNumbers.push(4) 

// tuple with optional element
let userTuple: [string, number, boolean?] = ["john", 25]

// as const + union type
const roles = ["admin", "user", "guest"] as const

type roleType = typeof roles[number]

let currentRole: roleType = "admin"
console.log("current role:", currentRole)

// =========================
// 2. Interfaces
// =========================

interface user {
  readonly id: number
  name: string
  email?: string
}

// extending interface
interface adminUser extends user {
  role: string
}

const admin: adminUser = {
  id: 1,
  name: "alice",
  role: "superadmin"
}

console.log("admin:", admin)

// =========================
// 3. Type Aliases & Intersection Types
// =========================

type userType = {
  id: number
  name: string
}

type roleInfo = {
  role: string
}

// intersection type

type adminType = userType & roleInfo

const admin2: adminType = {
  id: 2,
  name: "bob",
  role: "admin"
}

console.log("admin2:", admin2)

// =========================
// 4. Union & Literal Types
// =========================

type status = "success" | "error" | "loading"

let requestStatus: status = "loading"
console.log("status:", requestStatus)

// =========================
// 5. Index Signatures
// =========================

interface stringMap {
  [key: string]: string | number
  new :number;  
}


// const translations: stringMap = {
//   en: "hello",
//   fr: "bonjour"
// }

// console.log("translations:", translations)

// =========================
// 6. Declaration Merging
// =========================

interface product {
  id: number
}

interface product {
  name: string
}

const item: product = {
  id: 1,
  name: "laptop"
}

console.log("product:", item)


