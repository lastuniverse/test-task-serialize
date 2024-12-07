export class ASCIISerializer {
	#offset = 32;
	#amountOfASCIIСontrolСharacters = 33;
	#amountOfСontrolСharacters = 2;
	#amountOfPrintableСharacters = 128 - this.#amountOfASCIIСontrolСharacters - this.#amountOfСontrolСharacters;
	#digitCode = 0;
	#duplicateCode = 1;

	/**
	 * Сериализует массив натуральных чисел в ASCII строку, состоящую из печатгых символов
	 * @param {Array<number>} list 
	 * @returns {string}
	 */
	serialize(list) {
		list = list.toSorted(this.#compareNumbers)
		list = this.#prepareList(list);
		list = this.#compressList(list);

		return list.reduce((acc, value) => {
			acc += String.fromCharCode(this.#offset + value);
			return acc;
		}, "");
	}

	/**
	 * Десериализует строку в массив
	 * @param {string} text 
	 * @returns {Array<number>}
	 */
	deserialize(text) {
		let result = [];
		let digit = 0;

		for (let i = 0; i < text.length; i++) {
			let value = text.charCodeAt(i) - this.#offset;

			if (value === this.#digitCode) {
				digit++;
				continue;
			}

			if (value === this.#duplicateCode) {
				let value = text.charCodeAt(i + 1) - this.#offset - this.#amountOfСontrolСharacters + digit * this.#amountOfPrintableСharacters;
				let count = text.charCodeAt(i + 2) - this.#offset;
				const values = new Array(count).fill(value);
				result.push(...values);
				i += 2;
				continue;
			}

			result.push(value - this.#amountOfСontrolСharacters + digit * this.#amountOfPrintableСharacters);
		}
		return result;
	}

	/**
	 * Преобразует массив чисел в массив кодов печатных ASCII символов
	 * @param {Array<number>} list 
	 * @returns {Array<number>}
	 */
	#prepareList(list) {
		let digit = 0;
		return list.reduce((acc, value) => {
			const digitOfNumber = Math.floor(value / this.#amountOfPrintableСharacters);
			if (digitOfNumber != digit) {
				const deltaDigit = digitOfNumber - digit;
				const values = new Array(deltaDigit).fill(this.#digitCode);
				acc.push(...values);
				digit = digitOfNumber;
			}
			acc.push(this.#amountOfСontrolСharacters + (value % this.#amountOfPrintableСharacters));
			return acc;
		}, []);
	}

	/**
	 * Пакует дубли, заменяя их на инвормацию о дублтруемых символах и их количестве 
	 * @param {Array<number>} list 
	 * @returns {Array<number>}
	 */
	#compressList(list) {
		const result = [];
		let count = 1;
		let parentValue;

		const insertValues = () => {
			if (count > 2) {
				result.push(this.#duplicateCode, parentValue, count);
			} else if (Number.isInteger(parentValue)) {
				const values = new Array(count).fill(parentValue);
				result.push(...values);
			}
			count = 1;
		};

		list.forEach((value, index) => {
			if (value > 1 && value === parentValue && count < this.#amountOfPrintableСharacters) {
				count++;
			} else {
				insertValues();
			}

			parentValue = value;
		});

		insertValues();
		return result;
	}

	/**
	 * вспомогательный метод для сортировки чисел
	 * @param {number} a 
	 * @param {number} b 
	 * @returns {number} (-n,0,n)
	 */
	#compareNumbers(a, b) {
		return a - b;
	}
}