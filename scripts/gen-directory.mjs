import { writeFileSync, mkdirSync } from "node:fs";

const FIRST = [
  "Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Ayaan","Krishna","Ishaan",
  "Shaurya","Atharv","Advik","Pranav","Kabir","Ananya","Diya","Aadhya","Myra","Sara",
  "Anika","Navya","Kiara","Aanya","Pari","Saanvi","Avni","Meera","Riya","Isha",
  "Aisha","Zoya","Inaya","Fatima","Aaliya","Neha","Pooja","Priya","Kavya","Lakshmi",
  "Divya","Sneha","Anjali","Nandini","Shreya","Tanvi","Ishita","Aditi","Rohit","Amit",
  "Rahul","Vikram","Suresh","Ramesh","Deepak","Karan","Nikhil","Manish","Sanjay","Ajay",
  "Rajesh","Harish","Gaurav","Abhishek","Mohit","Varun","Kunal","Yash","Dev","Arnav",
  "Aryan","Harsh","Rudra","Dhruv","Kartik","Om","Tejas","Rohan","Siddharth","Akash",
  "Pooja","Swati","Ritu","Pallavi","Bhavna","Sonia","Rekha","Geeta","Sunita","Anita",
  "Kiran","Nisha","Rashmi","Shweta","Madhuri","Asha","Lata","Usha","Seema","Komal",
  "Imran","Farhan","Zaid","Ayaan","Rehan","Sameer","Faisal","Arif","Nadeem","Salman",
  "Ayesha","Hina","Sana","Maryam","Noor","Alina","Zara","Amira","Laila","Samira",
  "Gurpreet","Harpreet","Jaspreet","Simran","Navjot","Manpreet","Amarjit","Baljit","Kuldeep","Sukhdeep",
  "Arun","Bala","Karthik","Vignesh","Surya","Murugan","Lakshman","Selvam","Anbu","Prakash",
  "Meenakshi","Kavitha","Deepa","Revathi","Janani","Nithya","Sowmya","Harini","Divya","Abinaya",
];

const LAST = [
  "Sharma","Verma","Gupta","Singh","Kumar","Patel","Shah","Mehta","Joshi","Desai",
  "Reddy","Nair","Iyer","Menon","Pillai","Rao","Naidu","Chowdary","Krishnan","Subramanian",
  "Banerjee","Chatterjee","Mukherjee","Das","Ghosh","Bose","Sen","Roy","Dutta","Sarkar",
  "Khan","Ansari","Qureshi","Siddiqui","Shaikh","Pathan","Malik","Hussain","Ahmed","Ali",
  "Kaur","Gill","Sandhu","Dhillon","Brar","Sidhu","Bedi","Kapoor","Malhotra","Chopra",
  "Agarwal","Bansal","Goel","Mittal","Jain","Saxena","Tiwari","Mishra","Pandey","Yadav",
  "Patil","Kulkarni","Deshmukh","Jadhav","More","Shinde","Pawar","Gaikwad","Naik","Sawant",
  "Fernandes","D'Souza","Pereira","Rodrigues","Costa","Lobo","Pinto","Gomes","Alvares","Menezes",
  "Thomas","Joseph","Mathew","George","Abraham","Varghese","Kurian","Chacko","Philip","Jacob",
  "Hegde","Shetty","Pai","Kamath","Bhat","Kini","Nayak","Gowda","Acharya","Udupa",
];

const CITIES = [
  ["Bengaluru","Karnataka",560001],
  ["Mumbai","Maharashtra",400001],
  ["Delhi","Delhi",110001],
  ["Hyderabad","Telangana",500001],
  ["Chennai","Tamil Nadu",600001],
  ["Kolkata","West Bengal",700001],
  ["Pune","Maharashtra",411001],
  ["Ahmedabad","Gujarat",380001],
  ["Jaipur","Rajasthan",302001],
  ["Lucknow","Uttar Pradesh",226001],
  ["Kochi","Kerala",682001],
  ["Chandigarh","Chandigarh",160001],
  ["Indore","Madhya Pradesh",452001],
  ["Bhopal","Madhya Pradesh",462001],
  ["Nagpur","Maharashtra",440001],
  ["Surat","Gujarat",395001],
  ["Vadodara","Gujarat",390001],
  ["Coimbatore","Tamil Nadu",641001],
  ["Visakhapatnam","Andhra Pradesh",530001],
  ["Patna","Bihar",800001],
  ["Bhubaneswar","Odisha",751001],
  ["Guwahati","Assam",781001],
  ["Thiruvananthapuram","Kerala",695001],
  ["Mysuru","Karnataka",570001],
  ["Nashik","Maharashtra",422001],
];

const STREETS = [
  "MG Road","Station Road","Church Street","Lake View","Residency Road","Brigade Road",
  "Park Street","Linking Road","FC Road","Anna Salai","Mount Road","Civil Lines",
  "Ashok Nagar","Gandhi Nagar","Nehru Nagar","Shastri Nagar","Indira Nagar","Koramangala",
  "Banjara Hills","Jubilee Hills","Andheri West","Powai","Whitefield","HSR Layout",
  "Salt Lake","Ballygunge","Alwarpet","T Nagar","Kothrud","Viman Nagar",
];

const LANES = ["Lane","Cross","Main","Extension","Colony","Layout"];

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = 12000;
const rng = mulberry32(0x5eed);
const people = [];
const seen = new Set();

let i = 0;
while (people.length < N) {
  const f = FIRST[i % FIRST.length];
  const l = LAST[Math.floor(i / FIRST.length) % LAST.length];
  const extra = Math.floor(i / (FIRST.length * LAST.length));
  const name = extra === 0 ? `${f} ${l}` : `${f} ${String.fromCharCode(65 + (extra % 26))} ${l}`;
  i++;
  if (seen.has(name)) continue;
  seen.add(name);
  const n = people.length;
  const city = CITIES[n % CITIES.length];
  const street = STREETS[Math.floor(rng() * STREETS.length)];
  const lane = LANES[Math.floor(rng() * LANES.length)];
  const house = 12 + Math.floor(rng() * 480);
  const pin = city[2] + (n % 80);
  const phone = "9" + String(700000000 + ((n * 7919) % 100000000)).padStart(9, "0");
  const serial = (n + 10421).toString(36).toUpperCase().padStart(5, "0");
  const id = `ID-${serial}${String.fromCharCode(65 + (n % 26))}`;
  people.push({
    id,
    name,
    phone,
    line: `${house}, ${street} ${lane}`,
    city: city[0],
    state: city[1],
    pin: String(pin),
  });
}

mkdirSync("public", { recursive: true });
writeFileSync("public/directory.json", JSON.stringify(people));
console.log("wrote", people.length, "records");
