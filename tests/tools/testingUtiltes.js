/** @typedef { import('./testingUtilitesTypes').TestCaseOptions } TestCaseOptions */
/** @typedef { import('./testingUtilitesTypes').TestCaseRange } TestCaseRange */
/** @typedef { import('../../src/serializerTypes').IntegerSetSerializer } IntegerSetSerializer */

/**
 * запустить тест кейс
 * @param {IntegerSetSerializer} serializer 
 * @param {TestCaseOptions} testCase - объект с параметрами тест кейса:
 */
export function startTestCase(serializer, testCase) {
	const iterations = testCase?.iterations ?? 10;
	const compress = [];
	let isAllEqual = true;

	console.log("\n\n--------------------------------------------------------");
	console.log("test case:", collors.FgGreen, testCase.name, collors.FgWhite);

	for (let i = 0; i < iterations; i++) {
		const list = testCase.list ?? getRandomSet(testCase.amount, testCase.range);
		const text = list.toString();
		const serializeText = serializer.serialize(list);
		const restoreList = serializer.deserialize(serializeText);
		const restoreText = restoreList.toString();
		const isEqual = text === restoreText;
		if (!isEqual) isAllEqual = false;

		console.log("\n\titeration:", collors.FgBlue, `${testCase.name} - ${i}`, collors.FgWhite);
		console.log("\t\tsource text:", collors.FgGray, text, collors.FgWhite);
		// console.log("\t\trestore text:", collors.FgGray, restoreText, collors.FgWhite);
		console.log("\t\tcompressed text:", collors.FgGray, serializeText, collors.FgWhite);
		console.log("\t\tcompare result:", isEqual ? collors.FgGreen + "equal" : collors.FgRed + "not equal", collors.FgWhite);
		console.log("\t\tcompression:", collors.FgYellow, serializeText.length / text.length, collors.FgWhite);
		compress.push(serializeText.length / text.length);
	}

	const average = compress.reduce((acc, value) => acc + value, 0) / compress.length;

	console.log("\n\taverage compression:", collors.FgMagenta, `${average}`, collors.FgWhite);
	console.log("\tcompare result for all:", isAllEqual ? collors.FgGreen + "equal" : collors.FgRed + "not equal", collors.FgWhite);
}

/**
 * сгенерировать множество
 * @param {TestCaseRange|number} amount 
 * @param {TestCaseRange|number} range 
 * @returns {Arrai<number}
 */
function getRandomSet(amount = 100, range = { min: 1, max: 300 }) {
	amount = getNumberFromRange(amount);

	const list = [];

	while (amount >= 0) {
		const value = getNumberFromRange(range)
		list.push(value);
		amount--;
	}

	list.sort(compareNumbers);

	return list;
}

/**
 * возвращает dataOfRange если dataOfRange - число или случайно число заданное диапазоном если dataOfRange - TestCaseRange
 * @param {TestCaseRange|number} dataOfRange 
 * @returns {number}
 */
function getNumberFromRange(dataOfRange) {
	if (Number.isInteger(dataOfRange)) return dataOfRange;
	const min = dataOfRange?.min ?? 1;
	const max = dataOfRange?.max ?? 100;
	const delta = Math.abs(max - min);
	const offset = Math.min(min, max);

	return Math.floor(offset + Math.random() * delta);
}

/**
 * служебный метод для сортировки массивов цифр
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
function compareNumbers(a, b) {
	return a - b;
}

const collors = {
	Reset: "\x1b[0m",
	Bright: "\x1b[1m",
	Dim: "\x1b[2m",
	Underscore: "\x1b[4m",
	Blink: "\x1b[5m",
	Reverse: "\x1b[7m",
	Hidden: "\x1b[8m",
	
	FgBlack: "\x1b[30m",
	FgRed: "\x1b[31m",
	FgGreen: "\x1b[32m",
	FgYellow: "\x1b[33m",
	FgBlue: "\x1b[34m",
	FgMagenta: "\x1b[35m",
	FgCyan: "\x1b[36m",
	FgWhite: "\x1b[37m",
	FgGray: "\x1b[90m",
	
	BgBlack: "\x1b[40m",
	BgRed: "\x1b[41m",
	BgGreen: "\x1b[42m",
	BgYellow: "\x1b[43m",
	BgBlue: "\x1b[44m",
	BgMagenta: "\x1b[45m",
	BgCyan: "\x1b[46m",
	BgWhite: "\x1b[47m",
	BgGray: "\x1b[100m",
};
