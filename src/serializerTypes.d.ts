export interface IntegerSetSerializer {
	serialize(list: Array<number>): string
	deserialize(text: string): Array<number>
}
