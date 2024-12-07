import { ASCIISerializer } from "../src/index.js";
import { startTestCase } from "./tools/testingUtiltes.js";

const serializer = new ASCIISerializer();

// простейшие короткие
startTestCase(serializer, {
	name: "simple short",
	iterations: 30,
	amount: { min: 1, max: 20 },
	range: { min: 1, max: 9 },
});


// случайные - 50 чисел
startTestCase(serializer, {
	name: "random 50",
	iterations: 10,
	amount: 50,
	range: { min: 1, max: 300 },
});


// случайные - 100 чисел
startTestCase(serializer, {
	name: "random 100",
	iterations: 10,
	amount: 100,
	range: { min: 1, max: 300 },
});


// случайные - 500 чисел
startTestCase(serializer, {
	name: "random 500",
	iterations: 10,
	amount: 500,
	ranges: { min: 1, max: 300 },
});


// случайные - 1000 чисел
startTestCase(serializer, {
	name: "random 1000",
	iterations: 10,
	amount: 1000,
	ranges: { min: 1, max: 300, },
});

// граничные - все числа из 1 знака
startTestCase(serializer, {
	name: "all of 1 digits",
	iterations: 1,
	list: [1, 2, 3, 4, 5, 6, 7, 8, 9]
});

// граничные - все числа из 2х знаков
startTestCase(serializer, {
	name: "all of 2 digits",
	iterations: 1,
	list: new Array(90).fill(null).map((_, index) => index + 10)
});

// граничные - все числа из 3х знаков
startTestCase(serializer, {
	name: "all of 3 digits",
	iterations: 1,
	list: new Array(300).fill(null).map((_, index) => index + 10)
});

// граничные - каждого числа по 3 - всего чисел 900.
startTestCase(serializer, {
	name: "all numbers 3 times",
	iterations: 1,
	list: new Array(900).fill(null).map((_, index) => 1 + Math.floor(index / 3))
});
