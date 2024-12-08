/** @typedef { import('./ASCIISerializerTupes').RangeData } RangeData */
/** @typedef { import('./ASCIISerializerTupes').PartRangeData } PartRangeData */

export class ASCIISerializerWithLZ {
	#offset = 32;
	#amountOfASCIIСontrolСharacters = 33;
	#amountOfСontrolСharacters = 4;
	#amountOfPrintableСharacters = 128 - this.#amountOfASCIIСontrolСharacters - this.#amountOfСontrolСharacters;
	#digitCode = 0;
	#duplicateCode = 1;
	#repeatsTemplateCode = 2;
	#repeatsCode = 3;

	/**
	 * Сериализует массив натуральных чисел в ASCII строку, состоящую из печатгых символов
	 * @param {Array<number>} list 
	 * @returns {string}
	 */
	serialize(list) {
		list = list.toSorted(this.#compareNumbers)
		list = this.#prepareList(list);
		list = this.#compressList(list);
		list = this.#compressListWithLZImplementation(list);

		const text = list.reduce((acc, value) => {
			acc += this.#getCharFromCode(value);
			return acc;
		}, "");

		return text;
	}

	/**
	 * Десериализует строку в массив
	 * @param {string} text 
	 * @returns {Array<number>}
	 */
	deserialize(text) {
		let result = [];
		let digit = 0;

		text = this.#extractStringWithLZCompression(text);

		for (let i = 0; i < text.length; i++) {
			let value = this.#getValueCodeFromChar(text[i]);

			if (value === this.#digitCode) {
				digit++;
				continue;
			}

			if (value === this.#duplicateCode) {
				let value = this.#getValueFromChar(text[i + 1], digit);
				let count = this.#getValueFromChar(text[i + 2]);
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
	 * 
	 * @param {string} text 
	 * @returns {string}
	 */
	#extractStringWithLZCompression(text) {
		const repeats = [];
		let restoredText = "";

		for (let i = 0; i < text.length; i++) {
			let value = this.#getValueCodeFromChar(text[i]);

			if (value === this.#repeatsTemplateCode) {
				const length = this.#getValueFromChar(text[i + 1]);;
				const string = text.substring(i + 2, i + 2 + length);
				repeats.push(string);
				i += 2 + length - 1;
				continue;
			}

			if (value === this.#repeatsCode) {
				const index = this.#getValueFromChar(text[i + 1]);
				const length = this.#getValueFromChar(text[i + 2]);
				const currenrtText = repeats[index].substring(0, length);
				restoredText += currenrtText;
				i += 2;
				continue;
			}

			restoredText += text[i];
		}

		return restoredText;
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
			acc.push(this.#getCodeFromValue(value));
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
				result.push(this.#duplicateCode, parentValue, this.#getCodeFromValue(count));
			} else if (Number.isInteger(parentValue)) {
				const values = new Array(count).fill(parentValue);
				result.push(...values);
			}
			count = 1;
		};

		list.forEach(value => {
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
	 * реализует упрощенную версию алгоритма сждатия из семейства LZ
	 * @param {Array<number>} list 
	 * @returns {Array<number>}
	 */
	#compressListWithLZImplementation(list) {
		const result = [];
		const parts = this.#findRepeatParts(list);

		if (parts.length === 0) return list;

		parts.forEach((part, index) => {
			part.repeats.forEach(repeat => repeat.partIndex = index);
			result.push(
				this.#repeatsTemplateCode,
				this.#getCodeFromValue(part.length),
				...list.slice(part.start, part.start + part.length) //!!!
			);
		});

		for (let i = 0; i < list.length; i++) {
			const repeat = this.#getRepeatDataForPosition(parts, i);
			if (repeat) {
				result.push(
					this.#repeatsCode,
					this.#getCodeFromValue(repeat.partIndex),
					this.#getCodeFromValue(repeat.length)
				);
				i += repeat.length - 1;
			} else {
				result.push(list[i]);
			}
		}

		return result;
	}

	/**
	 * производит поиск диапазона, начало которого соответствует индексу
	 * @param {Array<PartRangeData>} parts 
	 * @param {number} index 
	 * @returns {RangeData|undefined}
	 */
	#getRepeatDataForPosition(parts, index) {
		let findedRepeat;

		parts.some(part => {
			return part.repeats.some(repeat => {
				if (index !== repeat.start) return false;
				findedRepeat = repeat;
				return true;
			});
		});

		return findedRepeat;
	}

	/**
	 * производит поиск повторяющихся частей данных
	 * @param {Array<number>} list 
	 * @returns {Array<PartRangeData>}
	 */
	#findRepeatParts(list) {
		const parts = [];

		let cursor = 0;
		let currentPart;

		while (cursor < list.length) {
			currentPart = {
				start: cursor,
				length: 0,
				repeats: []
			};

			let offset = cursor + 1;
			let count = 0;

			for (let i = cursor + 1; i < list.length; i++) {
				var srcValue = list[cursor + count];
				var matchValue = list[cursor + offset + count];

				if (srcValue === matchValue && count < this.#amountOfPrintableСharacters - 1) {
					count++;
				} else {
					if (count > 4) {
						currentPart.repeats.push({
							start: cursor + offset,
							length: count
						});
					}

					offset += count + 1;
					count = 0;
				}
			}

			if (currentPart.repeats.length > 0) {
				currentPart.repeats = this.#removeExtraRanges(currentPart.repeats, false);
				const lengths = currentPart.repeats.map(repeat => repeat.length);
				currentPart.length = Math.max(...lengths);
				currentPart.size = lengths.reduce((acc, length) => acc + length, 0);
				currentPart.repeats.unshift({
					start: currentPart.start,
					length: currentPart.length
				});

				parts.push(currentPart);
			}

			cursor++;
		}

		return this.#removeExtraRanges(parts);
	}

	/**
	 * проверяет диапазоны на пересечение и из пересекающихся удаляет меньший
	 * @param {Array<RangeData|PartRangeData>} list 
	 * @returns {Array<RangeData|PartRangeData>}
	 */
	#removeExtraRanges(list, isLengthIgnore = true) {
		for (let i = 0; i < list.length; i++) {
			const rangeData1 = list[i];
			if (rangeData1.mustRemove) continue;

			for (let j = i + 1; j < list.length; j++) {
				const rangeData2 = list[j];
				if (rangeData2.mustRemove) continue;

				if (this.#checkCollisions(rangeData1, rangeData2)) {
					if (isLengthIgnore) {
						rangeData2.mustRemove = true;
						continue;
					}

					if (rangeData1.length > rangeData2.length) {
						rangeData2.mustRemove = true;
					} else {
						rangeData1.mustRemove = true;
					}
				}
			}
		}

		return list.filter(repeat => !repeat.mustRemove);
	}

	/**
	 * проверяет пересечение диапазонов
	 * @param {PartRangeData|RangeData} data1 
	 * @param {PartRangeData|RangeData} data2 
	 * @returns {boolean}
	 */
	#checkCollisions(data1, data2) {
		if (data1.start >= data2.start && data1.start < data2.start + data2.length) return true;
		if (data2.start >= data1.start && data2.start < data1.start + data1.length) return true;
		if (!data1.repeats || !data2.repeats) return false;

		return data1.repeats.some(repeat1 => {
			return data2.repeats.some(repeat2 => this.#checkCollisions(repeat1, repeat2));
		});
	}

	/**
	 * преобразует печатный ASCII символ в числовое значение из допустимого диаразона [0:90].
	 * если задан digit то значение числа будет увеличино на величину, равную digit * #amountOfPrintableСharacters
	 * @param {string} char 
	 * @param {number} digit - количество сдвигов числа на величину #amountOfPrintableСharacters
	 * @returns {number}
	 */

	#getValueFromChar(char, digit = 0) {
		return this.#getValueCodeFromChar(char) - this.#amountOfСontrolСharacters + digit * this.#amountOfPrintableСharacters;
	}

	/**
	 * преобразует печатный ASCII символ в числовое значение из допустимого диаразона [4:94], сдвинутое на количество спецсимволов
	 * @param {string} char 
	 * @returns {number}
	 */
	#getValueCodeFromChar(char) {
		return char.charCodeAt(0) - this.#offset;
	}

	/**
	 * преобразует числовое значение из допустимого диаразона [0:90] в код, сдвинутый на количество спецсимволов
	 * @param {number} value 
	 * @returns {number}
	 */
	#getCodeFromValue(value) {
		return this.#amountOfСontrolСharacters + (value % this.#amountOfPrintableСharacters);
	}

	/**
	 * преобразует числовое значение из допустимого диаразона [0:94] в печатный ASCII символ
	 * @param {number} value 
	 * @returns {string}
	 */
	#getCharFromCode(value) {
		return String.fromCharCode(this.#offset + value);
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